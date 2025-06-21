import { Dataset } from "~/types";

const LAYERS: Dataset[] = [
  {
    label: "Pima Diabetes",
    inputName: "pima",
  },
  {
    label: "MNIST",
    inputName: "MNIST",
  },
  {
    label: "FashionMNIST",
    inputName: "FashionMNIST",
  },
  {
    label: "CIFAR-10",
    inputName: "CIFAR10",
  },
];

const TRANSFORMERS: Dataset[] = [
  {
    label: "Alice in Wonderland",
    inputName: "alice",
  },
  {
    label: "Shakespeare",
    inputName: "shakespeare",
  },
];

const DATASETS = LAYERS;

export default DATASETS;
