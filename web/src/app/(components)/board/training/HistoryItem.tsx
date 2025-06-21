import { TrainingResult, TrainingResultFormat } from "~/types";
import ToggleBlock from "../../ToggleBlock";
import { ResponsiveLine } from "@nivo/line";
import { downloadFile, getConfig } from "~/util/board.util";

interface HistoryItemProps {
  idx: number;
  trainingRes: TrainingResult;
  openHistoryItemIdxState: [
    number | null,
    React.Dispatch<React.SetStateAction<number | null>>,
  ];
  nextTrainingRes?: TrainingResult;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  idx,
  trainingRes,
  openHistoryItemIdxState,
  nextTrainingRes,
}) => {
  const [openHistoryItemIdx, setOpenHistoryItemIdx] = openHistoryItemIdxState;

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
            <div className="rounded-lg bg-zinc-900/50 p-3 ring-1 ring-zinc-700/30">
              <ResponsiveLine
                data={[
                  {
                    id: "train_loss",
                    data: trainingRes.train_losses.map(
                      (loss: number, i: number) => ({
                        x: i,
                        y: loss,
                      }),
                    ),
                  },
                ]}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                enableGridX={false}
                enableGridY={false}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: "auto",
                  max: "auto",
                  stacked: true,
                  reverse: false,
                }}
                colors={{ scheme: "accent" }}
                axisTop={null}
                axisRight={null}
                axisBottom={null}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Loss",
                  legendOffset: -40,
                  legendPosition: "middle",
                }}
                pointSize={2}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
                useMesh={true}
                legends={[
                  {
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: "left-to-right",
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: "circle",
                    symbolBorderColor: "rgba(0, 0, 0, .5)",
                  },
                ]}
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
