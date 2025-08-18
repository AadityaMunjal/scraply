"use client";
import { CgSpinnerTwoAlt as SpinnerIcon } from "react-icons/cg";
import { HiTrash } from "react-icons/hi2";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { ResponsiveLine } from "@nivo/line";
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
    isTrainingPaused: socketTrainingPaused,
    trainingCompleted,
    trainingError,
    startTraining: startSocketTraining,
    pauseTraining,
    resumeTraining,
    stopTraining,
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
    runName,
    setLoss,
    setOptimizer,
    setLearningRate,
    setEpochs,
    setBatchSize,
    setRunName,
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
    isTrainingPaused: liveTrainingPaused,
    setCurrentProgress,
    setIsLiveTraining,
    setIsTrainingPaused,
  } = useTrainingStore();

  // Handle live training progress updates
  useEffect(() => {
    if (trainingProgress) {
      setCurrentProgress(trainingProgress);
    }
  }, [trainingProgress, setCurrentProgress]);

  // Handle training pause state updates from socket
  useEffect(() => {
    setIsTrainingPaused(socketTrainingPaused);
  }, [socketTrainingPaused, setIsTrainingPaused]);

  // Handle training stop events
  useEffect(() => {
    if (!isTrainingActive && isLiveTraining) {
      // Training was stopped from backend
      setIsLiveTraining(false);
      setIsTraining(false);
      setIsTrainingPaused(false);
      setCurrentProgress(null);
    }
  }, [
    isTrainingActive,
    isLiveTraining,
    setIsLiveTraining,
    setIsTraining,
    setIsTrainingPaused,
    setCurrentProgress,
  ]);

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
        run_name: runName,
      });

      // Reset live training state
      setCurrentProgress(null);
      setIsLiveTraining(false);
      setIsTraining(false); // Reset the main training state

      // Clear the run name for the next training
      setRunName("");

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
        runName,
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

  const handlePauseResume = () => {
    if (liveTrainingPaused) {
      resumeTraining();
    } else {
      pauseTraining();
    }
  };

  const handleStopTraining = () => {
    stopTraining();

    setIsTraining(false);
    setIsLiveTraining(false);
    setIsTrainingPaused(false);
    setCurrentProgress(null);
    resetTraining();
  };

  const isTrainingInProgress =
    isTraining || startTrainingMutation.isPending || isLiveTraining;

  return (
    <div className="h-full p-3">
      <div className="mx-auto mb-5 max-w-7xl">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-3">
            {!isLiveTraining && (
              <button
                disabled={isTrainingInProgress}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 ${
                  isTrainingInProgress
                    ? "cursor-not-allowed bg-zinc-800 text-zinc-500 shadow-none"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95"
                }`}
                onClick={handleTrain}
              >
                {isTrainingInProgress ? (
                  <>
                    <SpinnerIcon className="h-4 w-4 animate-spin" />
                    <span>Training...</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="h-4 w-4" />
                    <span>Start Training</span>
                  </>
                )}
              </button>
            )}

            {/* Pause/Resume Button - Only show during training */}
            {isLiveTraining && (
              <button
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 ${
                  liveTrainingPaused
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
                onClick={handlePauseResume}
              >
                {liveTrainingPaused ? (
                  <>
                    <FaPlay className="h-4 w-4" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <FaPause className="h-4 w-4" />
                    <span>Pause</span>
                  </>
                )}
              </button>
            )}

            {/* Stop Training Button - Only show during training */}
            {isLiveTraining && (
              <button
                className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md active:scale-95"
                onClick={handleStopTraining}
              >
                <FaStop className="h-4 w-4" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Training Configuration Section */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-zinc-100">
              Training Configuration
            </h2>

            <SharedTrainingConfig
              loss={loss}
              optimizer={optimizer}
              learningRate={learningRate}
              epochs={epochs}
              batchSize={batchSize}
              runName={runName}
              setLoss={setLoss}
              setOptimizer={setOptimizer}
              setLearningRate={setLearningRate}
              setEpochs={setEpochs}
              setBatchSize={setBatchSize}
              setRunName={setRunName}
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
              onResetRunName={() => setRunName(DEFAULT_TRAINING_CONFIG.runName)}
            />
          </div>

          {/* Error Display */}
          {(startTrainingMutation.error || trainingError) && (
            <div className="rounded-lg border border-red-800 bg-red-950 p-3">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-900">
                    <span className="text-xs text-red-400">!</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-red-200">
                    Training Failed
                  </h3>
                  <p className="mt-1 text-xs text-red-300">
                    {trainingError || String(startTrainingMutation.error)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Training History Section */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">
                Training History
              </h2>
              {trainingHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="group flex items-center space-x-1 rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  <HiTrash className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Live Training Progress */}
              {isLiveTraining && (
                <div className="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-zinc-800 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-blue-400/30 hover:shadow-xl">
                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          {liveTrainingPaused ? (
                            <svg
                              className="h-4 w-4 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M5.5 3.5A1.5 1.5 0 017 2h6a1.5 1.5 0 011.5 1.5v13a1.5 1.5 0 01-1.5 1.5H7a1.5 1.5 0 01-1.5-1.5v-13z" />
                            </svg>
                          ) : (
                            <>
                              <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20" />
                              <SpinnerIcon className="relative h-4 w-4 animate-spin text-blue-400" />
                            </>
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-blue-100">
                            {liveTrainingPaused
                              ? "Training Paused"
                              : "Training in Progress"}
                          </span>
                          {currentProgress && (
                            <div className="mt-0.5 text-xs font-medium text-blue-300/80">
                              Epoch {currentProgress.epoch} of{" "}
                              {currentProgress.total_epochs}
                              {liveTrainingPaused && (
                                <span className="ml-1 rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs text-yellow-300">
                                  PAUSED
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {currentProgress && (
                        <div className="text-right">
                          <div className="text-base font-bold text-blue-100">
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
                        <div className="mb-4">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-blue-950/50 shadow-inner">
                            <div
                              className="h-full rounded-full bg-blue-500 shadow-sm transition-all duration-500 ease-out"
                              style={{ width: `${currentProgress.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Live Loss Graph */}
                        {currentProgress.train_losses &&
                          currentProgress.train_losses.length > 0 && (
                            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                              <h4 className="mb-3 text-sm font-medium text-blue-200/90">
                                Training Loss Progress
                              </h4>
                              <div className="h-48 rounded-lg bg-blue-950/30 p-2">
                                <ResponsiveLine
                                  data={[
                                    {
                                      id: "train_loss",
                                      data: currentProgress.train_losses,
                                    },
                                  ]}
                                  margin={{
                                    top: 10,
                                    right: 20,
                                    bottom: 30,
                                    left: 40,
                                  }}
                                  enableGridX={false}
                                  enableGridY={true}
                                  gridYValues={3}
                                  xScale={{ type: "point" }}
                                  yScale={{
                                    type: "linear",
                                    min: 0,
                                    max: "auto",
                                    stacked: false,
                                    reverse: false,
                                  }}
                                  colors={["#10b981"]}
                                  theme={{
                                    background: "transparent",
                                    text: {
                                      fontSize: 10,
                                      fill: "#93c5fd",
                                      outlineWidth: 0,
                                      outlineColor: "transparent",
                                    },
                                    tooltip: {
                                      container: {
                                        background: "#1e3a8a",
                                        color: "#dbeafe",
                                        fontSize: 11,
                                        borderRadius: "6px",
                                        boxShadow:
                                          "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                                        border: "1px solid #3b82f6",
                                      },
                                    },
                                    axis: {
                                      domain: {
                                        line: {
                                          stroke: "#3b82f6",
                                          strokeWidth: 1,
                                        },
                                      },
                                      legend: {
                                        text: {
                                          fontSize: 10,
                                          fill: "#dbeafe",
                                        },
                                      },
                                      ticks: {
                                        line: {
                                          stroke: "#3b82f6",
                                          strokeWidth: 1,
                                        },
                                        text: {
                                          fontSize: 9,
                                          fill: "#93c5fd",
                                        },
                                      },
                                    },
                                    grid: {
                                      line: {
                                        stroke: "#3b82f6",
                                        strokeWidth: 1,
                                        strokeOpacity: 0.2,
                                      },
                                    },
                                    crosshair: {
                                      line: {
                                        stroke: "#93c5fd",
                                        strokeWidth: 1,
                                        strokeOpacity: 0.75,
                                      },
                                    },
                                  }}
                                  axisTop={null}
                                  axisRight={null}
                                  axisBottom={{
                                    tickSize: 3,
                                    tickPadding: 3,
                                    tickRotation: 0,
                                    legend: "Epoch",
                                    legendOffset: 25,
                                    legendPosition: "middle",
                                    tickValues:
                                      currentProgress.train_losses.length > 15
                                        ? Array.from(
                                            {
                                              length: Math.min(
                                                8,
                                                currentProgress.train_losses
                                                  .length,
                                              ),
                                            },
                                            (_, i) =>
                                              Math.floor(
                                                (i *
                                                  (currentProgress.train_losses
                                                    .length -
                                                    1)) /
                                                  (Math.min(
                                                    8,
                                                    currentProgress.train_losses
                                                      .length,
                                                  ) -
                                                    1),
                                              ),
                                          )
                                        : undefined,
                                  }}
                                  axisLeft={{
                                    tickSize: 3,
                                    tickPadding: 3,
                                    tickRotation: 0,
                                    legend: "Loss",
                                    legendOffset: -35,
                                    legendPosition: "middle",
                                  }}
                                  pointSize={3}
                                  pointColor="#10b981"
                                  pointBorderWidth={1}
                                  pointBorderColor="#ffffff"
                                  pointLabelYOffset={-12}
                                  useMesh={true}
                                  curve="monotoneX"
                                  lineWidth={2}
                                  enableArea={true}
                                  areaOpacity={0.15}
                                  legends={[]}
                                  animate={true}
                                  motionConfig="gentle"
                                />
                              </div>
                            </div>
                          )}

                        {/* Metrics Stack */}
                        <div className="space-y-2">
                          {/* Train Accuracy */}
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-medium text-blue-200/90">
                                Train Accuracy
                              </span>
                              <span className="text-sm font-bold text-blue-100">
                                {Math.round(currentProgress.train_accuracy)}%
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-blue-900/40 shadow-inner">
                              <div
                                className="h-full rounded-full bg-emerald-500 shadow-sm transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, Math.max(0, currentProgress.train_accuracy))}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Test Accuracy */}
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-medium text-blue-200/90">
                                Test Accuracy
                              </span>
                              <span className="text-sm font-bold text-blue-100">
                                {Math.round(currentProgress.test_accuracy)}%
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-blue-900/40 shadow-inner">
                              <div
                                className="h-full rounded-full bg-zinc-600 shadow-sm transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, Math.max(0, currentProgress.test_accuracy))}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Train Loss */}
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-medium text-blue-200/90">
                                Train Loss
                              </span>
                              <span className="font-mono text-sm font-semibold text-blue-100">
                                {currentProgress.train_loss.toFixed(4)}
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-blue-900/40 shadow-inner">
                              <div
                                className="h-full rounded-full bg-zinc-600 shadow-sm transition-all duration-500"
                                style={{
                                  width: `${Math.max(10, 100 - currentProgress.train_loss * 20)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Test Loss */}
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-medium text-blue-200/90">
                                Test Loss
                              </span>
                              <span className="font-mono text-sm font-semibold text-blue-100">
                                {currentProgress.test_loss.toFixed(4)}
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-blue-900/40 shadow-inner">
                              <div
                                className="h-full rounded-full bg-zinc-600 shadow-sm transition-all duration-500"
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
                    />
                  ))
                : !isLiveTraining && (
                    <div className="rounded-lg bg-zinc-800 p-6 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                        <svg
                          className="h-5 w-5 text-zinc-400"
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
                      <h3 className="mb-2 text-base font-medium text-zinc-100">
                        No Training History
                      </h3>
                      <p className="text-xs text-zinc-400">
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
