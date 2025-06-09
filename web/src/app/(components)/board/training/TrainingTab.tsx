"use client";
import { CgSpinnerTwoAlt as SpinnerIcon } from "react-icons/cg";
import { getConfig } from "~/util/board.util";
import { startTraining, downloadFile } from "~/util/board.util";
import { useBoardStore } from "~/state/boardStore";

interface TrainingTabProps {
  selectedDataset: string;
  lossState: [string, React.Dispatch<React.SetStateAction<string>>];
  optimizerState: [string, React.Dispatch<React.SetStateAction<string>>];
  learningRateState: [number, React.Dispatch<React.SetStateAction<number>>];
  epochState: [number, React.Dispatch<React.SetStateAction<number>>];
  batchSizeState: [number, React.Dispatch<React.SetStateAction<number>>];
  isTrainingState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  trainingResHistoryState: [any[], React.Dispatch<React.SetStateAction<any[]>>];
}

const TrainingTab: React.FC<TrainingTabProps> = ({
  selectedDataset,
  lossState,
  optimizerState,
  learningRateState,
  epochState,
  batchSizeState,
  isTrainingState,
  trainingResHistoryState,
}) => {
  const { canvasBlocks } = useBoardStore();
  const [loss, setLoss] = lossState;
  const [optimizer, setOptimizer] = optimizerState;
  const [learningRate, setLearningRate] = learningRateState;
  const [epochs, setEpochs] = epochState;
  const [batchSize, setBatchSize] = batchSizeState;
  const [isTraining, setIsTraining] = isTrainingState;
  const [trainingResHistory, setTrainingResHistory] = trainingResHistoryState;

  return (
    <div>
      <div>
        <div className="flex w-full justify-between"></div>
      </div>
      {/* className={`rounded-xl ring ${isTraining ? "ring-2 ring-orange-500" : "ring-zinc-700"}`} */}
      <div className="rounded-lg bg-zinc-800 p-1 px-2 py-1 text-sm">
        <div>
          <div className="my-1 flex">
            Loss:{" "}
            <select
              className="mx-1 cursor-pointer rounded bg-zinc-700 p-1 text-sm text-white outline-none"
              value={loss}
              onChange={(e) => setLoss(e.target.value)}
            >
              <option value="BCE">BCE</option>
              <option value="CrossEntropy">CrossEntropy</option>
            </select>
          </div>
          <div className="my-1 flex">
            Optimizer:{" "}
            <select
              className="mx-1 cursor-pointer rounded bg-zinc-700 p-1 text-sm text-white outline-none"
              value={optimizer}
              onChange={(e) => setOptimizer(e.target.value)}
            >
              <option value="Adam">Adam</option>
              <option value="AdamW">AdamW</option>
              <option value="SGD">SGD</option>
              <option value="RMSprop">RMSprop</option>
            </select>
          </div>
          <div className="my-1 flex">
            Learning Rate:{" "}
            <input
              type="range"
              name="Learning Rate"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              min={0.001}
              max={0.1}
              step={0.001}
            />
            <input
              type="number"
              className="mx-1 w-14 rounded bg-zinc-700 py-1 text-right outline-none"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            />
          </div>
          <div className="my-1 flex">
            Epochs:{" "}
            <input
              type="range"
              name="Batch Size"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              min={1}
              max={1000}
            />
            <input
              type="number"
              className="mx-1 w-14 rounded bg-zinc-700 py-1 text-right outline-none"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
            />
          </div>
          <div className="my-1 flex">
            Batch Size:{" "}
            <input
              type="range"
              name="Batch Size"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              min={1}
              max={100}
            />
            <input
              type="number"
              className="mx-1 w-14 rounded bg-zinc-700 py-1 text-right outline-none"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
            />
          </div>
          <div
            className={`m-2 ${isTraining && "mt-8"} flex justify-center transition-transform duration-300`}
          >
            <button
              disabled={isTraining}
              className={`rounded-2xl bg-zinc-700 px-6 py-2 text-lg transition-colors ease-in-out ${
                !isTraining && "hover:bg-indigo-600 active:bg-indigo-500"
              } ring-indigo-500 duration-300 ${
                isTraining && "px-9 ring-2 ring-zinc-600"
              }`}
              onClick={() => {
                setIsTraining(true);

                startTraining(
                  getConfig(
                    selectedDataset,
                    canvasBlocks,
                    loss,
                    optimizer,
                    learningRate,
                    epochs,
                    batchSize,
                  ),
                )
                  .then((data: any) => {
                    setTrainingResHistory([
                      data.RESULTS,
                      ...trainingResHistory,
                    ]);
                  })
                  .finally(() => {
                    setIsTraining(false);
                  });
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
          <button
            className="my-2 w-full rounded-md bg-blue-500 px-4 py-2"
            onClick={() => {
              downloadFile(
                getConfig(
                  "pima",
                  canvasBlocks,
                  loss,
                  optimizer,
                  0.001,
                  100,
                  10,
                ),
              );
            }}
          >
            Download Python Notebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingTab;
