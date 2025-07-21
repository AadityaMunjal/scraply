"use client";
import { CgSpinnerTwoAlt as SpinnerIcon } from "react-icons/cg";
import { HiTrash } from "react-icons/hi2";
import { getConfig } from "~/util/board.util";
import { useStartTraining } from "~/hooks/useApi";
import { useSocket } from "~/hooks/useSocket";
import { useBoardStore } from "~/state/boardStore";
import { useTrainingStore } from "~/state/trainingStore";
import { DEFAULT_TRAINING_CONFIG } from "~/util/trainingConfig";

import SharedTrainingConfig from "./SharedTrainingConfig";
import HistoryItem from "./HistoryItem";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import { Config } from "~/types/index";

interface TrainingTabProps {
  selectedDataset: string;
}

const TrainingTab: React.FC<TrainingTabProps> = ({ selectedDataset }) => {
  const { canvasBlocks } = useBoardStore();
  const startTrainingMutation = useStartTraining();

  // Store the training config that was used when training started
  const trainingConfigRef = useRef<Config | null>(null);

  // Socket for live training
  const {
    isConnected,
    trainingProgress,
    isTrainingActive,
    trainingCompleted,
    trainingError,
    startTraining: startSocketTraining,
    resetTraining,
    checkTrainingStatus,
  } = useSocket();

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

    // Live training state
    currentProgress,
    isLiveTraining,
    setCurrentProgress,
    setIsLiveTraining,
  } = useTrainingStore();

  // Handle live training progress updates
  useEffect(() => {
    if (trainingProgress) {
      setCurrentProgress(trainingProgress);
    }
  }, [trainingProgress, setCurrentProgress]);

  // Check training status when component mounts or connection is reestablished
  useEffect(() => {
    if (isConnected) {
      // Small delay to ensure socket is fully ready
      const timer = setTimeout(() => {
        checkTrainingStatus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isConnected, checkTrainingStatus]);

  // Only update live training state when socket actually changes state
  // Don't override stored state on initial mount
  useEffect(() => {
    // If socket reports training is active, definitely set it
    if (isTrainingActive) {
      setIsLiveTraining(true);
    }
    // Only set to false if we were previously live training and socket explicitly says not active
    else if (isLiveTraining && !isTrainingActive && isConnected) {
      // Wait a moment to ensure this isn't just a reconnection
      const timer = setTimeout(() => {
        setIsLiveTraining(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTrainingActive, isLiveTraining, isConnected, setIsLiveTraining]);

  // Handle training errors
  useEffect(() => {
    if (trainingError) {
      setIsTraining(false);
      setIsLiveTraining(false);
    }
  }, [trainingError, setIsTraining, setIsLiveTraining]);

  // Handle training completion
  useEffect(() => {
    if (trainingCompleted?.final_results && trainingConfigRef.current) {
      const { training, ...outputs } = trainingCompleted.final_results;
      setCurrentOutput(outputs);

      addTrainingResult({
        avg_train_loss: training.avg_train_loss,
        avg_train_acc: training.avg_train_acc,
        avg_test_loss: training.avg_test_loss,
        avg_test_acc: training.avg_test_acc,
        train_losses: training.train_losses,
        test_losses: training.test_losses,
        trainingConfig: trainingConfigRef.current,
      });

      // Reset live training state
      setCurrentProgress(null);
      setIsLiveTraining(false);
      setIsTraining(false); // Reset the main training state

      // Clear the stored config after using it
      trainingConfigRef.current = null;
    }
  }, [
    trainingCompleted,
    setCurrentOutput,
    addTrainingResult,
    setCurrentProgress,
    setIsLiveTraining,
    setIsTraining,
    trainingConfigRef,
  ]);

  const handleTrain = async () => {
    setIsTraining(true);
    resetTraining(); // Reset any previous socket training state

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

      trainingConfigRef.current = config; // Store the config

      posthog.capture("train_started", { config });

      // Use socket-based live training
      await startSocketTraining(config);
    } catch (error) {
      console.error("Training failed:", error);
      posthog.captureException(error);
      setIsTraining(false);
    }
  };

  const isTrainingInProgress =
    isTraining || startTrainingMutation.isPending || isLiveTraining;

  return (
    <div className="h-full p-6">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Training Configuration Section */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-zinc-100">
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
            <div className="mt-6 border-t border-zinc-700 pt-6">
              <button
                disabled={isTrainingInProgress}
                className={`w-full rounded-xl px-6 py-3 text-base font-medium transition-all duration-200 ${
                  isTrainingInProgress
                    ? "cursor-not-allowed bg-zinc-800 text-zinc-600"
                    : "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-[0.99]"
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
          {(startTrainingMutation.error || trainingError) && (
            <div className="rounded-xl border border-red-800 bg-red-950 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-900">
                    <span className="text-sm text-red-400">!</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-200">
                    Training Failed
                  </h3>
                  <p className="mt-1 text-sm text-red-300">
                    {trainingError || String(startTrainingMutation.error)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Training History Section */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-100">
                Training History
              </h2>
              {trainingHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="group flex items-center space-x-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  <HiTrash className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Live Training Progress */}
              {isLiveTraining && (
                <div className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-zinc-800 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-blue-400/30 hover:shadow-2xl">
                  <div className="relative z-10">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20" />
                          <SpinnerIcon className="relative h-5 w-5 animate-spin text-blue-400" />
                        </div>
                        <div>
                          <span className="text-base font-semibold text-blue-100">
                            Training in Progress
                          </span>
                          {currentProgress && (
                            <div className="mt-0.5 text-xs font-medium text-blue-300/80">
                              Epoch {currentProgress.epoch} of{" "}
                              {currentProgress.total_epochs}
                            </div>
                          )}
                        </div>
                      </div>
                      {currentProgress && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-100">
                            {currentProgress.progress.toFixed(1)}%
                          </div>
                          <div className="text-xs text-blue-300/70">
                            Complete
                          </div>
                        </div>
                      )}
                    </div>

                    {currentProgress && (
                      <>
                        {/* Overall Progress Bar */}
                        <div className="mb-6">
                          <div className="h-3 w-full overflow-hidden rounded-full bg-blue-950/50 shadow-inner">
                            <div
                              className="h-full rounded-full bg-blue-500 shadow-sm transition-all duration-500 ease-out"
                              style={{ width: `${currentProgress.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Metrics Stack */}
                        <div className="space-y-4">
                          {/* Train Accuracy */}
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-200/90">
                                Train Accuracy
                              </span>
                              <span className="text-xl font-bold text-blue-100">
                                {Math.round(currentProgress.train_accuracy)}%
                              </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-blue-900/40 shadow-inner">
                              <div
                                className="h-full rounded-full bg-emerald-500 shadow-sm transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, Math.max(0, currentProgress.train_accuracy))}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Test Accuracy */}
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-200/90">
                                Test Accuracy
                              </span>
                              <span className="text-xl font-bold text-blue-100">
                                {Math.round(currentProgress.test_accuracy)}%
                              </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-blue-900/40 shadow-inner">
                              <div
                                className="h-full rounded-full bg-cyan-500 shadow-sm transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, Math.max(0, currentProgress.test_accuracy))}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Train Loss */}
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-200/90">
                                Train Loss
                              </span>
                              <span className="font-mono text-lg font-semibold text-blue-100">
                                {currentProgress.train_loss.toFixed(4)}
                              </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-blue-900/40 shadow-inner">
                              <div
                                className="h-full rounded-full bg-amber-500 shadow-sm transition-all duration-500"
                                style={{
                                  width: `${Math.max(10, 100 - currentProgress.train_loss * 20)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Test Loss */}
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-200/90">
                                Test Loss
                              </span>
                              <span className="font-mono text-lg font-semibold text-blue-100">
                                {currentProgress.test_loss.toFixed(4)}
                              </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-blue-900/40 shadow-inner">
                              <div
                                className="h-full rounded-full bg-rose-500 shadow-sm transition-all duration-500"
                                style={{
                                  width: `${Math.max(10, 100 - currentProgress.test_loss * 20)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Training History */}
              {trainingHistory.length > 0
                ? trainingHistory.map((trainingRes, idx) => (
                    <HistoryItem
                      key={idx}
                      idx={trainingHistory.length - idx}
                      trainingRes={trainingRes}
                      nextTrainingRes={trainingHistory[idx + 1]}
                      openHistoryItemIdx={openHistoryItemIdx}
                      setOpenHistoryItemIdx={setOpenHistoryItem}
                    />
                  ))
                : !isLiveTraining && (
                    <div className="rounded-xl bg-zinc-800 p-8 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
                        <svg
                          className="h-6 w-6 text-zinc-400"
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
                      <h3 className="mb-2 text-lg font-medium text-zinc-100">
                        No Training History
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Start training your model to see results and metrics
                        here.
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
