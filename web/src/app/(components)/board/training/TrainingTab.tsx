"use client";
import { CgSpinnerTwoAlt as SpinnerIcon } from "react-icons/cg";
import { getConfig } from "~/util/board.util";
import { startTraining, downloadFile } from "~/util/board.util";
import { useBoardStore } from "~/state/boardStore";
import TrainingConfigItem from "./TrainingConfigItem";
import HistoryItem from "./HistoryItem";

interface TrainingTabProps {
  selectedDataset: string;
  lossState: [string, React.Dispatch<React.SetStateAction<string>>];
  optimizerState: [string, React.Dispatch<React.SetStateAction<string>>];
  learningRateState: [number, React.Dispatch<React.SetStateAction<number>>];
  epochState: [number, React.Dispatch<React.SetStateAction<number>>];
  batchSizeState: [number, React.Dispatch<React.SetStateAction<number>>];
  isTrainingState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  trainingResHistoryState: [any[], React.Dispatch<React.SetStateAction<any[]>>];
  openHistoryItemIdxState: [
    number | null,
    React.Dispatch<React.SetStateAction<number | null>>,
  ];
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
  openHistoryItemIdxState,
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
    <div className="mx-auto flex h-full items-center justify-center p-4">
      <div className="mx-10 w-1/3 self-start rounded-lg p-1 px-2 py-1 text-sm">
        <div>
          <div className="text-2xl text-zinc-700">Model</div>
          <TrainingConfigItem title="Loss">
            <select
              className="mx-1 cursor-pointer rounded bg-zinc-700 px-4 py-2 text-sm text-white outline-none"
              value={loss}
              onChange={(e) => setLoss(e.target.value)}
            >
              <option value="BCE">BCE</option>
              <option value="CrossEntropy">CrossEntropy</option>
            </select>
          </TrainingConfigItem>
          <TrainingConfigItem title="Optimizer">
            <select
              className="mx-1 cursor-pointer rounded bg-zinc-700 px-4 py-2 text-sm text-white outline-none"
              value={optimizer}
              onChange={(e) => setOptimizer(e.target.value)}
            >
              <option value="Adam">Adam</option>
              <option value="AdamW">AdamW</option>
              <option value="SGD">SGD</option>
              <option value="RMSprop">RMSprop</option>
            </select>
          </TrainingConfigItem>
          <div className="mt-4 text-2xl text-zinc-700">Training</div>
          <TrainingConfigItem title="Learning Rate">
            <div className="flex items-center">
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
                className="mx-1 w-20 rounded-lg bg-zinc-700 px-2 py-1 text-center outline-none"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              />
            </div>
          </TrainingConfigItem>
          <TrainingConfigItem title="Epochs">
            <input
              type="range"
              name="Epochs"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              min={1}
              max={1000}
            />
            <input
              type="number"
              className="mx-1 w-20 rounded-lg bg-zinc-700 py-1 text-center outline-none"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
            />
          </TrainingConfigItem>
          <TrainingConfigItem title="Batch Size">
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
              className="mx-1 w-20 rounded-lg bg-zinc-700 py-1 text-center outline-none"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
            />
          </TrainingConfigItem>
          {/* Train Button */}
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
                    data = data.RESULTS;
                    setTrainingResHistory([
                      {
                        avg_train_loss: data.avg_train_loss,
                        avg_train_acc: data.avg_train_acc,
                        avg_test_loss: data.avg_test_loss,
                        avg_test_acc: data.avg_test_acc,
                        train_losses: data.train_losses,
                        test_losses: data.test_losses,
                        trainingConfig: getConfig(
                          selectedDataset,
                          canvasBlocks,
                          loss,
                          optimizer,
                          learningRate,
                          epochs,
                          batchSize,
                        ),
                      },
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
        </div>
      </div>
      <div className="mx-10 mt-0 h-1/2 w-1/3 self-start rounded-xl">
        <div className="text-2xl text-zinc-700">History</div>
        {trainingResHistory.length !== 0 ? (
          trainingResHistory.map((trainingRes, idx) => {
            return (
              <HistoryItem
                key={idx}
                idx={trainingResHistory.length - idx}
                trainingRes={trainingRes}
                nextTrainingRes={trainingResHistory[idx + 1]}
                openHistoryItemIdxState={openHistoryItemIdxState}
              />
            );
          })
        ) : (
          <div className="my-auto text-center">
            Train model to view results.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingTab;
