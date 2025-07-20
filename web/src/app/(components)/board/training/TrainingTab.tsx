"use client";
import { CgSpinnerTwoAlt as SpinnerIcon } from "react-icons/cg";
import { HiTrash } from "react-icons/hi2";
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

  const isTrainingInProgress = isTraining || startTrainingMutation.isPending;

  return (
    <div className="h-full p-6">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Training Configuration Section */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Training Configuration
            </h2>

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
            <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <button
                disabled={isTrainingInProgress}
                className={`w-full rounded-xl px-6 py-3 text-base font-medium transition-all duration-200 ${
                  isTrainingInProgress
                    ? "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 hover:shadow-md active:scale-[0.99]"
                }`}
                onClick={handleTrain}
              >
                {isTrainingInProgress ? (
                  <div className="flex items-center justify-center space-x-3">
                    <SpinnerIcon className="h-5 w-5 animate-spin" />
                    <span>Training Model...</span>
                  </div>
                ) : (
                  <span>Start Training</span>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {startTrainingMutation.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                    <span className="text-sm text-red-600 dark:text-red-400">
                      !
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Training Failed
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {String(startTrainingMutation.error)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Training History Section */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Training History
              </h2>
              {trainingHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="group flex items-center space-x-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <HiTrash className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {trainingHistory.length > 0 ? (
                trainingHistory.map((trainingRes, idx) => (
                  <HistoryItem
                    key={idx}
                    idx={trainingHistory.length - idx}
                    trainingRes={trainingRes}
                    nextTrainingRes={trainingHistory[idx + 1]}
                    openHistoryItemIdx={openHistoryItemIdx}
                    setOpenHistoryItemIdx={setOpenHistoryItem}
                  />
                ))
              ) : (
                <div className="rounded-xl bg-zinc-50 p-8 text-center dark:bg-zinc-800">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <svg
                      className="h-6 w-6 text-zinc-500 dark:text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    No Training History
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Start training your model to see results and metrics here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingTab;
