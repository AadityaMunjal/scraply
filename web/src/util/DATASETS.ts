import { Dataset } from "~/types/index";

const LAYERS: Dataset[] = [
  {
    label: "Pima Diabetes",
    inputName: "pima",
    kind: "classification",
    shape: [8, 1],
  },
  {
    label: "MNIST",
    inputName: "MNIST",
    kind: "classification",
    shape: [784, 10],
  },
  {
    label: "FashionMNIST",
    inputName: "FashionMNIST",
    kind: "classification",
    shape: [784, 10],
  },
  {
    label: "CIFAR-10",
    inputName: "CIFAR10",
    kind: "classification",
    shape: [3072, 10],
  },
];

// const TRANSFORMERS: Dataset[] = [
//   {
//     label: "Alice in Wonderland",
//     inputName: "alice",
//   },
//   {
//     label: "Shakespeare",
//     inputName: "shakespeare",
//   },
// ];

const DATASETS = LAYERS;

export default DATASETS;
