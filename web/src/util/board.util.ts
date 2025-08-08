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
    let layerKind: string = block.label;

    // For Conv layers, change label based on dimension parameter
    if (block.label === "Conv" && hasDimension(block)) {
      layerKind = block.params.dimension === 1 ? "Conv1D" : "Conv2D";
    }

    // For MaxPool layers, change label based on dimension parameter
    if (block.label === "MaxPool" && hasDimension(block)) {
      layerKind = block.params.dimension === 1 ? "MaxPool1D" : "MaxPool2D";
    }

    // For AvgPool layers, change label based on dimension parameter
    if (block.label === "AvgPool" && hasDimension(block)) {
      layerKind = block.params.dimension === 1 ? "AvgPool1D" : "AvgPool2D";
    }

    // Handle layers that have input/output neurons
    if (hasNeurons(block)) {
      const inputNeurons = block.params.inputNeurons;
      const outputNeurons = block.params.outputNeurons;

      let args: number[];

      // Special handling for Conv layers - backend expects: [dimension, inputChannels, outputChannels, kernelSize, stride, padding]
      if (block.label === "Conv" && hasParams(block)) {
        const params = block.params as any;
        args = [
          params.dimension,
          inputNeurons,
          outputNeurons,
          params.kernelSize,
          params.stride,
          params.padding,
        ];
      } else {
        // For other layers with neurons (Linear, RNN, GRU), extract other parameters
        const otherParamValues = hasParams(block)
          ? Object.entries(block.params)
              .filter(
                ([key]) => key !== "inputNeurons" && key !== "outputNeurons",
              )
              .map(([_, value]) => value)
          : [];

        args =
          otherParamValues.length > 0
            ? [inputNeurons, outputNeurons, ...otherParamValues]
            : [inputNeurons, outputNeurons];
      }

      layers.push({
        kind: layerKind,
        args,
      });

      if (hasActivationFunction(block)) {
        layers.push({
          kind: block.activationFunction,
        });
      }
    } else {
      // Handle layers without neurons (like MaxPool, Dropout)
      let args: number[];

      // Special handling for MaxPool layers - backend expects: [dimension, kernelSize, stride, padding]
      if (block.label === "MaxPool" && hasParams(block)) {
        const params = block.params as any;
        args = [
          params.dimension,
          params.kernelSize,
          params.stride,
          params.padding,
        ];
      } else {
        // For other layers without neurons, use all parameter values
        args = hasParams(block)
          ? Object.values(block.params as Record<string, any>)
          : [];
      }

      layers.push({
        kind: layerKind,
        args,
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
