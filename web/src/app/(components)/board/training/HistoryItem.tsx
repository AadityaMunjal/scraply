import { TrainingResult, TrainingResultFormat } from "~/types/index";
import { ResponsiveLine } from "@nivo/line";
import { downloadFile, getConfig } from "~/util/board.util";

interface HistoryItemProps {
  idx: number;
  trainingRes: TrainingResult;
  openHistoryItemIdx: number | null;
  setOpenHistoryItemIdx: (idx: number | null) => void;
  nextTrainingRes?: TrainingResult;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  idx,
  trainingRes,
  openHistoryItemIdx,
  setOpenHistoryItemIdx,
  nextTrainingRes,
}) => {
  const getDiffUI = (diff: number) => {
    const roundedDiff = Math.round(diff);
    if (roundedDiff === 0) return null;
    if (roundedDiff > 0) {
      return <span className="text-sm text-green-400">+{roundedDiff}%</span>;
    } else if (roundedDiff < 0) {
      return <span className="text-sm text-red-400">{roundedDiff}%</span>;
    }
  };

  const isOpen = openHistoryItemIdx === idx;

  return (
    <div className="group my-4 overflow-hidden rounded-2xl border border-slate-700/50 bg-zinc-900 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="px-6 pb-2 pt-5">
        <button
          onClick={() =>
            setOpenHistoryItemIdx(idx === openHistoryItemIdx ? null : idx)
          }
          className="w-full text-left"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-100">
              Training Run {idx}
            </h3>
            <svg
              className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="px-6 pb-4">
        <div className="space-y-4">
          {/* Train Accuracy */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-200">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Train Accuracy
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-slate-100">
                  {Math.round(trainingRes.avg_train_acc)}%
                </span>
                {nextTrainingRes && (
                  <div className="min-w-[60px] text-right">
                    {getDiffUI(
                      trainingRes.avg_train_acc - nextTrainingRes.avg_train_acc,
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-700/50 shadow-inner">
                <div
                  className="h-full rounded-full bg-emerald-500 shadow-sm transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, trainingRes.avg_train_acc))}%`,
                  }}
                />
              </div>
              {nextTrainingRes && (
                <div className="min-w-[60px]">
                  {/* Spacer for diff alignment */}
                </div>
              )}
            </div>
          </div>

          {/* Test Accuracy */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-200">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Test Accuracy
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-slate-100">
                  {Math.round(trainingRes.avg_test_acc)}%
                </span>
                {nextTrainingRes && (
                  <div className="min-w-[60px] text-right">
                    {getDiffUI(
                      trainingRes.avg_test_acc - nextTrainingRes.avg_test_acc,
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-700/50 shadow-inner">
                <div
                  className="h-full rounded-full bg-cyan-500 shadow-sm transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, trainingRes.avg_test_acc))}%`,
                  }}
                />
              </div>
              {nextTrainingRes && (
                <div className="min-w-[60px]">
                  {/* Spacer for diff alignment */}
                </div>
              )}
            </div>
          </div>

          {/* Train Loss */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-200">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Train Loss
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-semibold text-slate-100">
                  {trainingRes.avg_train_loss.toFixed(4)}
                </span>
                {nextTrainingRes && (
                  <div className="min-w-[60px] text-right">
                    {getDiffUI(
                      -(
                        trainingRes.avg_train_loss -
                        nextTrainingRes.avg_train_loss
                      ) * 100,
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-700/50 shadow-inner">
                <div
                  className="h-full rounded-full bg-amber-500 shadow-sm transition-all duration-500"
                  style={{
                    width: `${Math.max(10, 100 - trainingRes.avg_train_loss * 20)}%`,
                  }}
                />
              </div>
              {nextTrainingRes && (
                <div className="min-w-[60px]">
                  {/* Spacer for diff alignment */}
                </div>
              )}
            </div>
          </div>

          {/* Test Loss */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-200">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Test Loss
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-semibold text-slate-100">
                  {trainingRes.avg_test_loss.toFixed(4)}
                </span>
                {nextTrainingRes && (
                  <div className="min-w-[60px] text-right">
                    {getDiffUI(
                      -(
                        trainingRes.avg_test_loss -
                        nextTrainingRes.avg_test_loss
                      ) * 100,
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-700/50 shadow-inner">
                <div
                  className="h-full rounded-full bg-rose-500 shadow-sm transition-all duration-500"
                  style={{
                    width: `${Math.max(10, 100 - trainingRes.avg_test_loss * 20)}%`,
                  }}
                />
              </div>
              {nextTrainingRes && (
                <div className="min-w-[60px]">
                  {/* Spacer for diff alignment */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Details */}
      {isOpen && (
        <div className="space-y-5 p-4">
          {/* Loss Graph Section */}
          <div>
            <h3 className="mb-3 text-lg font-medium text-zinc-200">
              Loss Graph
            </h3>
            <div className="h-80 rounded-lg bg-zinc-900/50 p-3 ring-1 ring-zinc-700/30">
              <ResponsiveLine
                data={[
                  {
                    id: "train_loss",
                    data: trainingRes.train_losses,
                  },
                ]}
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                enableGridX={false}
                enableGridY={true}
                gridYValues={5}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: "auto",
                  max: "auto",
                  stacked: false,
                  reverse: false,
                }}
                colors={["#10b981"]}
                theme={{
                  background: "transparent",
                  text: {
                    fontSize: 12,
                    fill: "#a1a1aa",
                    outlineWidth: 0,
                    outlineColor: "transparent",
                  },
                  tooltip: {
                    container: {
                      background: "#27272a",
                      color: "#e4e4e7",
                      fontSize: 12,
                      borderRadius: "6px",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      border: "1px solid #3f3f46",
                    },
                  },
                  axis: {
                    domain: {
                      line: {
                        stroke: "#52525b",
                        strokeWidth: 1,
                      },
                    },
                    legend: {
                      text: {
                        fontSize: 12,
                        fill: "#e4e4e7",
                      },
                    },
                    ticks: {
                      line: {
                        stroke: "#52525b",
                        strokeWidth: 1,
                      },
                      text: {
                        fontSize: 11,
                        fill: "#a1a1aa",
                      },
                    },
                  },
                  grid: {
                    line: {
                      stroke: "#3f3f46",
                      strokeWidth: 1,
                      strokeOpacity: 0.3,
                    },
                  },
                  crosshair: {
                    line: {
                      stroke: "#a1a1aa",
                      strokeWidth: 1,
                      strokeOpacity: 0.75,
                    },
                  },
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Epoch",
                  legendOffset: 36,
                  legendPosition: "middle",
                  tickValues:
                    trainingRes.train_losses.length > 20
                      ? Array.from(
                          {
                            length: Math.min(
                              10,
                              trainingRes.train_losses.length,
                            ),
                          },
                          (_, i) =>
                            Math.floor(
                              (i * (trainingRes.train_losses.length - 1)) /
                                (Math.min(10, trainingRes.train_losses.length) -
                                  1),
                            ),
                        )
                      : undefined,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Loss",
                  legendOffset: -50,
                  legendPosition: "middle",
                }}
                pointSize={4}
                pointColor="#10b981"
                pointBorderWidth={2}
                pointBorderColor="#ffffff"
                pointLabelYOffset={-12}
                useMesh={true}
                curve="monotoneX"
                lineWidth={2}
                enableArea={true}
                areaOpacity={0.1}
                legends={[]}
              />
            </div>
          </div>

          {/* Model Config Section */}
          <div>
            <h3 className="mb-3 text-lg font-medium text-zinc-200">
              Model Configuration
            </h3>
            <div className="rounded-lg bg-zinc-900/50 p-4 ring-1 ring-zinc-700/30">
              <pre className="overflow-x-auto font-mono text-xs text-zinc-400">
                {JSON.stringify(trainingRes.trainingConfig, null, 2)}
              </pre>
            </div>
          </div>

          {/* Download Section */}
          <div>
            <button
              className="w-full rounded-lg bg-zinc-700 px-4 py-3 font-medium text-zinc-200 transition-colors duration-200 hover:bg-zinc-600"
              // onClick={() => {
              //   downloadFile(
              //     getConfig(
              //   "pima",
              //   canvasBlocks,
              //   loss,
              //   optimizer,
              //   0.001,
              //   100,
              //   10,
              //     ),
              //   );
              // }}
            >
              Download Python Notebook
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryItem;
