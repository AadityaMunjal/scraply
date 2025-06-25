import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startTransformerTraining, transformerTest } from "~/util/board.util";
import { ResponsiveLine } from "@nivo/line";
import { LossFunction, OptimizerType } from "~/types";
import { DEFAULT_TRAINING_CONFIG } from "~/configs/training";
import SharedTrainingConfig from "../training/SharedTrainingConfig";

interface Decoder {
  title: string;
  ffLinearLayers: number;
  saHiddenDim: number;
  saAttentionHeads: number;
}

interface DecoderProps extends Decoder {
  setFfLinearLayers: (value: number) => void;
  setsaHiddenDim: (value: number) => void;
  setSaAttentionHeads: (value: number) => void;
}

const Decoder: React.FC<DecoderProps> = ({
  title,
  ffLinearLayers,
  saHiddenDim,
  saAttentionHeads,
  setFfLinearLayers,
  setsaHiddenDim,
  setSaAttentionHeads,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="my-4 w-2/3"
    >
      <div className="bg-zinc-900 p-2 text-center text-2xl text-zinc-500">
        {title}
      </div>
      <div className="rounded-2xl p-2 ring ring-zinc-800">
        <div className="my-1 flex flex-col items-center rounded-2xl bg-zinc-800 p-3">
          <div>Self Attention</div>
          <div className="flex items-center">
            <div>Embedding Dim: </div>
            <input
              type="number"
              className="mx-2 w-10 rounded-md text-center text-zinc-900"
              value={saHiddenDim}
              onChange={(e) => setsaHiddenDim(parseInt(e.target.value))}
            />
            <div>Attention Heads: </div>
            <input
              type="number"
              className="mx-2 w-10 rounded-md text-center text-zinc-900"
              value={saAttentionHeads}
              onChange={(e) => setSaAttentionHeads(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div className="my-1 flex flex-col items-center rounded-xl bg-zinc-900 p-1 ring-2 ring-zinc-800">
          <div>Layer Norm</div>
        </div>
        <div className="my-1 flex flex-col items-center rounded-2xl bg-zinc-800 p-3">
          <div>Feed Forward</div>
          <div className="flex items-center">
            <div>Hidden dim: </div>
            <input
              type="number"
              className="mx-2 w-10 rounded-md text-center text-zinc-900"
              value={ffLinearLayers}
              onChange={(e) => setFfLinearLayers(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div className="my-1 flex flex-col items-center rounded-xl bg-zinc-900 p-1 ring-2 ring-zinc-800">
          <div>Layer Norm</div>
        </div>
      </div>
    </motion.div>
  );
};

const TrainConfig: React.FC<{
  decoders: Decoder[];
  dropout: number;
  selectedDataset: string;
}> = ({ decoders, dropout, selectedDataset }) => {
  const [loss, setLoss] = useState<LossFunction>(DEFAULT_TRAINING_CONFIG.loss);
  const [optimizer, setOptimizer] = useState<OptimizerType>(
    DEFAULT_TRAINING_CONFIG.optimizer,
  );
  const [learningRate, setLearningRate] = useState(
    DEFAULT_TRAINING_CONFIG.learningRate,
  );
  const [epochs, setEpochs] = useState(DEFAULT_TRAINING_CONFIG.epochs);
  const [batchSize, setBatchSize] = useState(DEFAULT_TRAINING_CONFIG.batchSize);

  const [isTraining, setIsTraining] = useState(false);
  const [results, setResults] = useState<{ train_loss: number[] } | null>(null);
  const [graphData, setGraphData] = useState<
    | {
        id: string;
        data: { x: number; y: number }[];
      }[]
    | null
  >(null);

  const [isTestLoading, setIsTestLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.1);
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");

  return (
    <div className="my-4 w-2/3">
      <div className="bg-zinc-900 p-2 text-center text-2xl text-zinc-500">
        Train
      </div>
      <div className="rounded-lg bg-zinc-800 p-1 px-2 py-1 text-sm">
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
          />
          <div
            className={`m-2 ${isTraining && "mt-8"} flex justify-center transition-all duration-300`}
          >
            <button
              disabled={isTraining}
              className={`rounded-2xl bg-zinc-700 px-6 py-2 text-lg transition-all ease-in-out ${
                !isTraining &&
                "hover:bg-indigo-600 hover:px-8 hover:ring-2 active:bg-indigo-500 active:px-9"
              } ring-indigo-500 duration-300 ${
                isTraining && "animate-bounce px-9 ring-2 ring-zinc-600"
              }`}
              onClick={() => {
                setIsTraining(true);
                const l = decoders.map((decoder) => {
                  return {
                    kind: "Decoder",
                    args: [
                      decoder.saHiddenDim,
                      decoder.saAttentionHeads,
                      decoder.ffLinearLayers,
                    ],
                  };
                });
                l.push({
                  kind: "Output",
                  args: [dropout],
                });
                startTransformerTraining({
                  loss,
                  optimizer: {
                    kind: optimizer,
                    lr: learningRate,
                  },
                  epoch: epochs,
                  batch_size: batchSize,
                  input: selectedDataset,
                  layers: l,
                })
                  .then((data: any) => {
                    console.log(data);
                    setResults(data.RESULTS);
                    setGraphData([
                      {
                        id: "train_loss",
                        data: data.RESULTS.train_loss.map(
                          (loss: number, i: number) => ({
                            x: i,
                            y: loss,
                          }),
                        ),
                      },
                    ]);
                  })
                  .finally(() => {
                    setIsTraining(false);
                    // showNotification(
                    //   "Training Complete!",
                    //   "Your model has been trained successfully.",
                    // );
                  });
              }}
            >
              {isTraining ? (
                <div className="flex items-center">
                  <div>Training...</div>{" "}
                  {/* <img src="dino-running.gif" className="w-14" /> */}
                </div>
              ) : (
                "Train"
              )}
            </button>
          </div>
          {graphData && (
            <div className="mt-2 h-72 w-72 rounded-md bg-zinc-50 text-center">
              <ResponsiveLine
                data={graphData}
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
          )}
        </div>
      </div>
      <div className="bg-zinc-900 p-2 text-center text-2xl text-zinc-500">
        Test
      </div>
      <div className="rounded-lg bg-zinc-800 p-1 px-2 py-1 text-sm">
        <div>
          <div className="my-1 flex">
            Temperature:{" "}
            <input
              type="range"
              name="Temperature"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              min={0.1}
              max={1}
              step={0.01}
            />
            <input
              type="number"
              className="mx-1 w-14 rounded bg-zinc-700 py-1 outline-none"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
          </div>
          <div className="my-1">
            Prompt:{" "}
            <input
              className="mx-1 rounded bg-zinc-700 py-1 outline-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="my-1">
            Generated:{" "}
            <div className="rounded-lg bg-zinc-700 p-2 text-white">
              {generatedText ? (
                <div className="rounded-lg bg-zinc-700 p-2">
                  {generatedText}
                </div>
              ) : (
                <div className="rounded-lg bg-zinc-700 p-2">
                  No text generated
                </div>
              )}
            </div>
          </div>
          <div className="m-2 flex justify-center">
            <button
              disabled={isTestLoading}
              className={`rounded-2xl bg-zinc-700 px-6 py-2 text-lg transition-all ease-in-out ${
                !isTestLoading &&
                "hover:bg-indigo-600 hover:px-8 hover:ring-2 active:bg-indigo-500 active:px-9"
              } ring-indigo-500 duration-300 ${
                isTestLoading && "animate-bounce px-9 ring-2 ring-zinc-600"
              }`}
              onClick={() => {
                setIsTestLoading(true);
                transformerTest(temperature, prompt)
                  .then((data) => {
                    setGeneratedText(data.text);
                  })
                  .finally(() => {
                    setIsTestLoading(false);
                  });
              }}
            >
              Predict
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TransformersProps {
  selectedDataset: string;
}

const TransformersBoard = ({ selectedDataset }: TransformersProps) => {
  const [decoders, setDecoders] = useState<Decoder[]>([]);
  const [dropout, setDropout] = useState(0.01);

  const handleAppendDecoder = () => {
    setDecoders((prev) => [
      ...prev,
      {
        title: `Decoder #${prev.length + 1}`,
        ffLinearLayers: 3,
        saHiddenDim: 64,
        saAttentionHeads: 6,
      },
    ]);
  };

  return (
    <div className="flex">
      <div className="w-2/3">
        <div className="my-4 flex flex-col items-center">
          <div className="w-2/3 bg-zinc-900 p-2 text-2xl text-zinc-500">
            Canvas
          </div>
          <AnimatePresence>
            {decoders.map((encoder, i) => (
              <Decoder
                key={i}
                title={encoder.title}
                setFfLinearLayers={(value) =>
                  setDecoders((prev) => {
                    const newDecoder = [...prev];
                    if (newDecoder[i]) {
                      newDecoder[i].ffLinearLayers = value;
                    }
                    return newDecoder;
                  })
                }
                setsaHiddenDim={(value) =>
                  setDecoders((prev) => {
                    const newDecoder = [...prev];
                    if (newDecoder[i]) {
                      newDecoder[i].saHiddenDim = value;
                    }
                    return newDecoder;
                  })
                }
                setSaAttentionHeads={(value) =>
                  setDecoders((prev) => {
                    const newDecoder = [...prev];
                    if (newDecoder[i]) {
                      newDecoder[i].saAttentionHeads = value;
                    }
                    return newDecoder;
                  })
                }
                ffLinearLayers={encoder.ffLinearLayers}
                saHiddenDim={encoder.saHiddenDim}
                saAttentionHeads={encoder.saAttentionHeads}
              />
            ))}
          </AnimatePresence>
          <div className="flex w-full justify-center">
            <button
              onClick={handleAppendDecoder}
              className="m-2 w-2/3 rounded-2xl border-2 border-dashed border-zinc-800 p-2 text-3xl text-zinc-800 transition-colors duration-75 hover:border-zinc-700 hover:text-zinc-700"
            >
              +
            </button>
          </div>
          {decoders.length > 0 && (
            <div className="flex w-full justify-center">
              <div className="my-4 w-2/3">
                <div className="rounded-xl bg-zinc-900 p-2 text-center text-2xl text-zinc-500">
                  Output
                </div>
                <div className="rounded-3xl p-2 ring ring-zinc-800">
                  <div className="my-1 flex flex-col items-center rounded-2xl bg-zinc-800 p-3">
                    <div>Dropout</div>
                    <div className="flex items-center">
                      <input
                        step={0.01}
                        type="number"
                        className="mx-2 w-14 rounded-md text-center text-zinc-900 outline-none"
                        value={dropout}
                        onChange={(e) => setDropout(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="my-1 flex flex-col items-center rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-800">
                    <div>Linear</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-1/3">
        <TrainConfig
          decoders={decoders}
          dropout={dropout}
          selectedDataset={selectedDataset}
        />
      </div>
    </div>
  );
};

export default TransformersBoard;
