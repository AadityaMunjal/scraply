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
    if (diff === 0) return null;
    if (diff > 0) {
      return <span className="text-green-500">+{Math.round(diff)}</span>;
    } else if (diff < 0) {
      return <span className="text-red-500">{Math.round(diff)}</span>;
    }
  };
  return (
    <div className={`my-2 rounded-xl bg-zinc-800 p-1 px-2 py-1`}>
      <ToggleBlock
        title={<div>#{idx}</div>}
        preBody={
          <>
            {Object.keys(TrainingResultFormat).map((key) => {
              const value = trainingRes[key as keyof TrainingResult];
              const format =
                TrainingResultFormat[key as keyof typeof TrainingResultFormat];
              return (
                <div key={key} className="mb-1 flex justify-between">
                  <div>{format.key}</div>
                  <div className="flex items-center">
                    <div className="ml-1">{Math.round(Number(value))}%</div>
                    <div className="ml-2 h-1 w-48 rounded-full bg-zinc-700">
                      <div
                        className="h-1 rounded-full bg-blue-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, Number(value)))}%`,
                        }}
                      />
                    </div>
                    {format.positiveTemperament !== undefined && (
                      <span className="ml-2 text-sm text-zinc-500">
                        {nextTrainingRes &&
                          getDiffUI(
                            Number(value) -
                              Number(
                                nextTrainingRes[key as keyof TrainingResult],
                              ),
                          )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        }
        isOpen={openHistoryItemIdx === idx}
        setIsOpen={() =>
          setOpenHistoryItemIdx(idx === openHistoryItemIdx ? null : idx)
        }
      >
        <div>
          <div className="mb-2 mt-4 flex justify-between text-xl">
            Loss Graph
          </div>
          <div className="rounded-md bg-zinc-700">
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
          <div className="mb-2 mt-4 flex justify-between text-xl">
            Model Config
          </div>
          <div className="rounded-md bg-black">
            {JSON.stringify(trainingRes.trainingConfig, null, 2)}
          </div>
          <div>
            {/* Download Python Notebook */}
            <button
              className="my-2 w-full rounded-md bg-blue-500 px-4 py-2"
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
