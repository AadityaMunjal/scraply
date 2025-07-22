import { ActivationFunction, LayersToolbarMap } from "~/types/index";

export const LAYER_BLOCKS: LayersToolbarMap = [
  {
    id: "linear",
    label: "Linear",
    color: "#CD6155", // darker coral
    activationFunction: "ReLU" as ActivationFunction,
    params: {
      inputNeurons: 8,
      outputNeurons: 8,
    },
  },
  {
    id: "conv",
    label: "Conv",
    color: "#DC7633", // darker orange
    activationFunction: "ReLU" as ActivationFunction,
    params: {
      inputNeurons: 8,
      outputNeurons: 8,
      dimension: 2,
      kernelSize: 3,
      stride: 1,
      padding: 1,
    },
  },
  {
    id: "rnn",
    label: "RNN",
    color: "#B7950B", // golden yellow
    activationFunction: "ReLU" as ActivationFunction,
    params: {
      inputNeurons: 8,
      outputNeurons: 8,
      hiddenSize: 32,
      dropout: 0.1,
    },
  },
  {
    id: "gru",
    label: "GRU",
    color: "#229954", // darker green
    activationFunction: "ReLU" as ActivationFunction,
    params: {
      inputNeurons: 8,
      outputNeurons: 8,
      hiddenSize: 32,
      dropout: 0.2,
    },
  },
  {
    id: "flatten",
    label: "Flatten",
    color: "#138D75", // darker teal
    inputNeurons: 8,
    startDimension: 1,
    endDimension: -1,
  },
  {
    id: "maxpool",
    label: "MaxPool",
    color: "#2874A6", // darker blue
    params: {
      dimension: 2,
      kernelSize: 3,
      stride: 1,
      padding: 1,
    },
  },
  {
    id: "dropout",
    label: "Dropout",
    color: "#7D3C98", // darker purple
    params: {
      dropout: 0.25,
    },
  },
];
