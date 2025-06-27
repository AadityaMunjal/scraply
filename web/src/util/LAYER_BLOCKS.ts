import { LegacyUILayer } from "~/types";

export const LAYER_BLOCKS: LegacyUILayer[] = [
  {
    id: "linear",
    label: "Linear",
    color: "#00B359",
    activationFunction: "ReLU",
    inputNeurons: 8,
    outputNeurons: 8,
  },
  {
    id: "conv",
    label: "Conv",
    color: "#E6A000",
    activationFunction: "ReLU",
    inputNeurons: 8,
    outputNeurons: 8,
    otherParams: { dimension: 2, kernelSize: 3, stride: 1, padding: 1 },
  },
  {
    id: "rnn",
    label: "RNN",
    color: "#E67300",
    activationFunction: "ReLU",
    inputNeurons: 8,
    outputNeurons: 8,
    otherParams: { hiddenSize: 32, dropout: 0.1 },
  },
  {
    id: "gru",
    label: "GRU",
    color: "#E63900",
    activationFunction: "ReLU",
    inputNeurons: 8,
    outputNeurons: 8,
    otherParams: { hiddenSize: 32, dropout: 0.2 },
  },
  {
    id: "flatten",
    label: "Flatten",
    color: "#E6007A",
    activationFunction: "",
    inputNeurons: 8,
    outputNeurons: 8,
  },
];
