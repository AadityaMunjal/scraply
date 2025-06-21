"use client";
import { CgSpinnerTwoAlt as SpinnerIcon } from "react-icons/cg";
import { getConfig } from "~/util/board.util";
import { startTraining, downloadFile } from "~/util/board.util";
import { useBoardStore } from "~/state/boardStore";
import { useTrainingStore } from "~/state/trainingStore";
import TrainingConfigItem from "./TrainingConfigItem";
import HistoryItem from "./HistoryItem";

interface TrainingTabProps {
  selectedDataset: string;
}

const TrainingTab: React.FC<TrainingTabProps> = ({ selectedDataset }) => {
  const { canvasBlocks } = useBoardStore();
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
    setOpenHistoryItem,
    clearHistory,
  } = useTrainingStore();

  return (
    <div className="mx-auto flex h-full items-center justify-center p-4">
      <div className="mx-10 w-1/3 self-start rounded-lg p-1 px-2 py-1 text-sm">
        <div>
          <div className="text-2xl text-zinc-700">Model</div>
          <TrainingConfigItem title="Loss" onReset={() => setLoss("BCE")}>
            <select
              className="mx-1 cursor-pointer rounded bg-zinc-700 px-4 py-2 text-sm text-white outline-none"
              value={loss}
              onChange={(e) => setLoss(e.target.value)}
            >
              <option value="BCE">BCE</option>
              <option value="CrossEntropy">CrossEntropy</option>
            </select>
          </TrainingConfigItem>
          <TrainingConfigItem
            title="Optimizer"
            onReset={() => setOptimizer("Adam")}
          >
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
          <TrainingConfigItem
            title="Learning Rate"
            onReset={() => setLearningRate(0.001)}
          >
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
          <TrainingConfigItem title="Epochs" onReset={() => setEpochs(100)}>
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
          <TrainingConfigItem
            title="Batch Size"
            onReset={() => setBatchSize(10)}
          >
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
                    addTrainingResult({
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
                    });
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
  );
};

export default TrainingTab;
