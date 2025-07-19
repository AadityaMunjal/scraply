"use client";
import { CgSpinnerTwoAlt as SpinnerIcon } from "react-icons/cg";
import { getConfig } from "~/util/board.util";
import { useStartTraining } from "~/hooks/useApi";
import { useBoardStore } from "~/state/boardStore";
import { useTrainingStore } from "~/state/trainingStore";
import { DEFAULT_TRAINING_CONFIG } from "~/util/trainingConfig";

import SharedTrainingConfig from "./SharedTrainingConfig";
import HistoryItem from "./HistoryItem";
import posthog from "posthog-js";

interface TrainingTabProps {
  selectedDataset: string;
}

const TrainingTab: React.FC<TrainingTabProps> = ({ selectedDataset }) => {
  const { canvasBlocks } = useBoardStore();
  const startTrainingMutation = useStartTraining();

  const {
    // Configuration
    loss,
    optimizer,
    learningRate,
    epochs,
    batchSize,
    setLoss,
    setOptimizer,
    setLearningRate,
    setEpochs,
    setBatchSize,
    resetConfig,

    // Training state
    isTraining,
    trainingHistory,
    openHistoryItemIdx,
    setIsTraining,
    addTrainingResult,
    setCurrentOutput,
    setOpenHistoryItem,
    clearHistory,
  } = useTrainingStore();

  const handleTrain = async () => {
    setIsTraining(true);

    try {
      const config = getConfig(
        selectedDataset,
        canvasBlocks,
        loss,
        optimizer,
        learningRate,
        epochs,
        batchSize,
      );

      posthog.capture("train_started", { config });

      const data = await startTrainingMutation.mutateAsync(config);
      const { training, ...outputs } = data;
      setCurrentOutput(outputs);

      addTrainingResult({
        avg_train_loss: training.avg_train_loss,
        avg_train_acc: training.avg_train_acc,
        avg_test_loss: training.avg_test_loss,
        avg_test_acc: training.avg_test_acc,
        train_losses: training.train_losses,
        test_losses: training.test_losses,
        trainingConfig: config,
      });
    } catch (error) {
      console.error("Training failed:", error);
      posthog.captureException(error);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <>
      <div className="mx-auto flex h-full items-center justify-center p-4">
        <div className="mx-10 w-1/3 self-start rounded-lg p-1 px-2 py-1 text-sm">
          <div>
            <SharedTrainingConfig
              loss={loss}
              optimizer={optimizer}
              learningRate={learningRate}
              epochs={epochs}
              batchSize={batchSize}
              setLoss={setLoss}
              setOptimizer={setOptimizer}
              setLearningRate={setLearningRate}
              setEpochs={setEpochs}
              setBatchSize={setBatchSize}
              onResetLoss={() => setLoss(DEFAULT_TRAINING_CONFIG.loss)}
              onResetOptimizer={() =>
                setOptimizer(DEFAULT_TRAINING_CONFIG.optimizer)
              }
              onResetLearningRate={() =>
                setLearningRate(DEFAULT_TRAINING_CONFIG.learningRate)
              }
              onResetEpochs={() => setEpochs(DEFAULT_TRAINING_CONFIG.epochs)}
              onResetBatchSize={() =>
                setBatchSize(DEFAULT_TRAINING_CONFIG.batchSize)
              }
            />

            {/* Train Button */}
            <div
              className={`m-2 ${isTraining && "mt-8"} flex justify-center transition-transform duration-300`}
            >
              <button
                disabled={isTraining || startTrainingMutation.isPending}
                className={`rounded-2xl px-6 py-2 text-lg ring-indigo-500 transition-colors duration-300 ease-in-out ${
                  isTraining || startTrainingMutation.isPending
                    ? "bg-zinc-700 px-9 ring-2 ring-zinc-600"
                    : "bg-zinc-700 hover:bg-indigo-600 active:bg-indigo-500"
                }`}
                onClick={handleTrain}
              >
                {isTraining || startTrainingMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="flex">
                      <SpinnerIcon className="my-auto mr-2 h-5 animate-spin" />
                      <div>Training...</div>
                    </div>
                  </div>
                ) : (
                  "Train"
                )}
              </button>
            </div>

            {/* Error Display */}
            {startTrainingMutation.error && (
              <div className="mx-2 rounded-lg border border-red-600 bg-red-900/20 p-3 text-sm text-red-300">
                Training failed: {String(startTrainingMutation.error)}
              </div>
            )}
          </div>
        </div>
        <div className="mx-10 mt-0 h-1/2 w-1/3 self-start rounded-xl">
          <div className="flex items-center justify-between">
            <div className="text-2xl text-zinc-700">History</div>
            {trainingHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="rounded-lg bg-zinc-700 px-3 py-1 text-sm text-white hover:bg-zinc-600"
              >
                Clear All
              </button>
            )}
          </div>
          {trainingHistory.length !== 0 ? (
            trainingHistory.map((trainingRes, idx) => {
              return (
                <HistoryItem
                  key={idx}
                  idx={trainingHistory.length - idx}
                  trainingRes={trainingRes}
                  nextTrainingRes={trainingHistory[idx + 1]}
                  openHistoryItemIdx={openHistoryItemIdx}
                  setOpenHistoryItemIdx={setOpenHistoryItem}
                />
              );
            })
          ) : (
            <div className="my-2 rounded-xl bg-zinc-800 p-4 text-center text-zinc-400">
              No training history yet. Start training to see results!
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrainingTab;
