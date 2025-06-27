import { ActivationFunction, LayersToolbarMap } from "~/types/index";

export const LAYER_BLOCKS: LayersToolbarMap = [
  {
    id: "linear",
    label: "Linear",
    color: "#00B359",
    activationFunction: "ReLU" as ActivationFunction,
    inputNeurons: 8,
    outputNeurons: 8,
  },
  {
    id: "conv",
    label: "Conv",
    color: "#E6A000",
    activationFunction: "ReLU" as ActivationFunction,
    inputNeurons: 8,
    outputNeurons: 8,
    otherParams: { dimension: 2, kernelSize: 3, stride: 1, padding: 1 },
  },
  {
    id: "rnn",
    label: "RNN",
    color: "#E67300",
    activationFunction: "ReLU" as ActivationFunction,
    inputNeurons: 8,
    outputNeurons: 8,
    otherParams: { hiddenSize: 32, dropout: 0.1 },
  },
  {
    id: "gru",
    label: "GRU",
    color: "#E63900",
    activationFunction: "ReLU" as ActivationFunction,
    inputNeurons: 8,
    outputNeurons: 8,
    otherParams: { hiddenSize: 32, dropout: 0.2 },
  },
  {
    id: "flatten",
    label: "Flatten",
    color: "#E6007A",
    inputNeurons: 8,
    outputNeurons: 8,
  },
  {
    id: "maxpool",
    label: "MaxPool",
    color: "#0099CC",
    otherParams: { dimension: 2, kernelSize: 3, stride: 1, padding: 1 },
  },
];
