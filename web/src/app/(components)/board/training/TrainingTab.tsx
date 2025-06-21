"use client";
import { CgSpinnerTwoAlt as SpinnerIcon } from "react-icons/cg";
import { getConfig } from "~/util/board.util";
import { startTraining, downloadFile } from "~/util/board.util";
import { useBoardStore } from "~/state/boardStore";
import { useTrainingStore } from "~/state/trainingStore";
import { DEFAULT_TRAINING_CONFIG } from "~/configs/training";

import {
  validateTrainingConfig,
  validateUILayers,
  formatValidationErrors,
} from "~/utils/validation";
import SharedTrainingConfig from "./SharedTrainingConfig";
import HistoryItem from "./HistoryItem";

import ValidationDisplay from "../../ValidationDisplay";

interface TrainingTabProps {
  selectedDataset: string;
}

const TrainingTab: React.FC<TrainingTabProps> = ({ selectedDataset }) => {
  const { canvasBlocks, layerValidationErrors, layersValid } = useBoardStore();

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

    // Validation state
    validationErrors,
    isValid,

    // Training state
    isTraining,
    trainingHistory,
    openHistoryItemIdx,
    setIsTraining,
    addTrainingResult,
    setOpenHistoryItem,
    clearHistory,
  } = useTrainingStore();

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
              validationErrors={validationErrors}
              variant="full"
            />

            {/* Validation Display */}
            <div className="mt-4">
              <ValidationDisplay
                errors={[...validationErrors, ...layerValidationErrors]}
                isValid={isValid && layersValid}
                showSuccess={false}
                className="text-xs"
              />
            </div>

            {/* Train Button */}
            <div
              className={`m-2 ${isTraining && "mt-8"} flex justify-center transition-transform duration-300`}
            >
              <button
                disabled={isTraining || !isValid || !layersValid}
                className={`rounded-2xl px-6 py-2 text-lg ring-indigo-500 transition-colors duration-300 ease-in-out ${
                  isTraining
                    ? "bg-zinc-700 px-9 ring-2 ring-zinc-600"
                    : !isValid || !layersValid
                      ? "cursor-not-allowed bg-zinc-600 opacity-50"
                      : "bg-zinc-700 hover:bg-indigo-600 active:bg-indigo-500"
                }`}
                onClick={async () => {
                  // Validate UI layers first
                  const layerErrors = validateUILayers(canvasBlocks);
                  if (layerErrors.length > 0) {
                    console.error(
                      "Validation failed:",
                      formatValidationErrors(layerErrors),
                    );
                    return;
                  }

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

                    // Validate the final config
                    const configErrors = validateTrainingConfig(config);
                    if (configErrors.length > 0) {
                      throw new Error(formatValidationErrors(configErrors));
                    }

                    const data = await startTraining(config);
                    const results = data.RESULTS;

                    addTrainingResult({
                      avg_train_loss: results.avg_train_loss,
                      avg_train_acc: results.avg_train_acc,
                      avg_test_loss: results.avg_test_loss,
                      avg_test_acc: results.avg_test_acc,
                      train_losses: results.train_losses,
                      test_losses: results.test_losses,
                      trainingConfig: config,
                    });
                  } catch (error) {
                    console.error("Training failed:", error);
                  } finally {
                    setIsTraining(false);
                  }
                }}
              >
                {isTraining ? (
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
