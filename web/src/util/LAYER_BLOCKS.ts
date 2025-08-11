import { ActivationFunction, LayersToolbarMap } from "~/types/index";

export const LAYER_BLOCKS: LayersToolbarMap = [
  {
    id: "linear",
    label: "Linear",
    color: "#B82C2C", // darker coral
    activationFunction: "ReLU" as ActivationFunction,
    params: {
      inputNeurons: 8,
      outputNeurons: 8,
    },
  },
  {
    id: "conv",
    label: "Conv",
    color: "#E65100", // darker orange
    activationFunction: "ReLU" as ActivationFunction,
    params: {
      dimension: 2,
      inputNeurons: 8,
      outputNeurons: 8,
      kernelSize: 3,
      stride: 1,
      padding: 1,
    },
  },
  // {
  //   id: "rnn",
  //   label: "RNN",
  //   color: "#B7950B", // golden yellow
  //   activationFunction: "ReLU" as ActivationFunction,
  //   params: {
  //     inputNeurons: 8,
  //     outputNeurons: 8,
  //     hiddenSize: 32,
  //     dropout: 0.1,
  //   },
  // },
  // {
  //   id: "gru",
  //   label: "GRU",
  //   color: "#229954", // darker green
  //   activationFunction: "ReLU" as ActivationFunction,
  //   params: {
  //     inputNeurons: 8,
  //     outputNeurons: 8,
  //     hiddenSize: 32,
  //     dropout: 0.2,
  //   },
  // },
  // AvgPool comes before Flatten/MaxPool to match LayersToolbarMap tuple
  {
    id: "maxpool",
    label: "MaxPool",
    color: "#B8860B", // darker blue
    params: {
      dimension: 2,
      kernelSize: 3,
      stride: 1,
      padding: 1,
    },
  },
  {
    id: "avgpool",
    label: "AvgPool",
    color: "#1B5E20", // pink
    params: {
      dimension: 2,
      kernelSize: 3,
      stride: 1,
      padding: 1,
    },
  },
  {
    id: "flatten",
    label: "Flatten",
    color: "#0D47A1", // darker teal
    inputNeurons: 8,
    startDimension: 1,
    endDimension: -1,
  },
  {
    id: "dropout",
    label: "Dropout",
    color: "#6A1B9A", // darker purple
    params: {
      dropout: 0.25,
    },
  },
];
