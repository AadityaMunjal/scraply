import { TrainingResult, TrainingResultFormat } from "~/types";
import ToggleBlock from "../../ToggleBlock";
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

  return (
    <div className="my-3 rounded-xl bg-zinc-800/90 shadow-lg ring-1 ring-zinc-700/50 backdrop-blur-sm transition-all duration-200 hover:bg-zinc-800 hover:ring-zinc-600/50">
      <ToggleBlock
        title={
          <div className="px-2 pt-2 text-lg font-medium text-zinc-200">
            Training Run {idx}
          </div>
        }
        preBody={
          <div className="space-y-3 p-2">
            {Object.keys(TrainingResultFormat).map((key) => {
              const value = trainingRes[key as keyof TrainingResult];
              const format =
                TrainingResultFormat[key as keyof typeof TrainingResultFormat];
              const percentage = Math.round(Number(value));

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">{format.key}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-medium text-zinc-200">
                        {percentage}%
                      </span>
                      {format.positiveTemperament !== undefined &&
                        nextTrainingRes && (
                          <div className="min-w-[50px] text-right">
                            {getDiffUI(
                              Number(value) -
                                Number(
                                  nextTrainingRes[key as keyof TrainingResult],
                                ),
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-700/60">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          format.positiveTemperament
                            ? "bg-zinc-500"
                            : "bg-zinc-400"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, percentage))}%`,
                        }}
                      />
                    </div>
                    {format.positiveTemperament !== undefined &&
                      nextTrainingRes && (
                        <div className="min-w-[50px]">
                          {/* Spacer for diff alignment */}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        }
        isOpen={openHistoryItemIdx === idx}
        setIsOpen={() =>
          setOpenHistoryItemIdx(idx === openHistoryItemIdx ? null : idx)
        }
      >
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
              <pre className="overflow-x-auto font-mono text-sm text-zinc-400">
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
      </ToggleBlock>
    </div>
  );
};

export default HistoryItem;
