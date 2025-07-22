import { Dataset } from "~/types/index";

const LAYERS: Dataset[] = [
  {
    label: "Pima Diabetes",
    inputName: "pima",
    kind: "classification",
    shape: [8, 1],
    summary: "Medical dataset for diabetes prediction using 8 health features.",
  },
  {
    label: "MNIST",
    inputName: "MNIST",
    kind: "classification",
    shape: [784, 10],
    summary: "Handwritten digit images, 28x28 pixels, 10 output classes total.",
  },
  {
    label: "FashionMNIST",
    inputName: "FashionMNIST",
    kind: "classification",
    shape: [784, 10],
    summary:
      "Images of clothing items, 28x28 grayscale, 10 fashion categories.",
  },
  {
    label: "CIFAR-10",
    inputName: "CIFAR10",
    kind: "classification",
    shape: [3072, 10],
    summary:
      "32x32 color images, 10 object classes, diverse real-world objects.",
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
