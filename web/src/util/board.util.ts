import {
  Config,
  TransformerConfig,
  UILayer,
  LossFunction,
  OptimizerType,
  hasNeurons,
  hasActivationFunction,
  hasParams,
  hasDimension,
} from "~/types/index";

// Import the API functions from the new hooks file
import {
  downloadFileApi,
  startTrainingApi,
  startTransformerTrainingApi,
  transformerTestApi,
} from "~/hooks/useApi";

export const getConfig = (
  input: string,
  blocks: UILayer[],
  loss: LossFunction,
  optimizer: OptimizerType,
  learningRate: number,
  epoch: number,
  batch_size: number,
): Config => {
  const layers = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;

    // Determine the layer kind (label) for backend
    let layerKind = block.label;

    // For Conv layers, change label based on dimension parameter
    if (block.label === "Conv" && hasDimension(block)) {
      layerKind = block.params.dimension === 1 ? "Conv1D" : "Conv2D";
    }

    // Handle layers that have input/output neurons
    if (hasNeurons(block)) {
      const inputNeurons = block.params.inputNeurons;
      const outputNeurons = block.params.outputNeurons;

      // Extract other parameters if they exist (excluding inputNeurons and outputNeurons)
      const otherParamValues = hasParams(block)
        ? Object.entries(block.params)
            .filter(
              ([key]) => key !== "inputNeurons" && key !== "outputNeurons",
            )
            .map(([_, value]) => value)
        : [];

      layers.push({
        kind: layerKind,
        args:
          otherParamValues.length > 0
            ? [inputNeurons, outputNeurons, ...otherParamValues]
            : [inputNeurons, outputNeurons],
      });

      if (hasActivationFunction(block)) {
        layers.push({
          kind: block.activationFunction,
        });
      }
    } else {
      // Handle layers without neurons (like MaxPool, Dropout)
      const otherParamValues = hasParams(block)
        ? Object.values(block.params as Record<string, any>)
        : [];

      layers.push({
        kind: layerKind,
        args: otherParamValues,
      });
    }
  }

  const config = {
    input,
    layers,
    loss,
    optimizer: { kind: optimizer, lr: learningRate },
    epoch,
    batch_size,
    learning_rate: learningRate,
  };

  return config;
};

// Re-export API functions for backward compatibility
export const downloadFile = downloadFileApi;
export const startTraining = startTrainingApi;
export const startTransformerTraining = startTransformerTrainingApi;
export const transformerTest = transformerTestApi;
