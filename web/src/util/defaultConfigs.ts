import { UILayer } from "~/types/index";

// Default layer configurations for each dataset
export const DEFAULT_DATASET_CONFIGS: Record<string, UILayer[]> = {
  // MNIST: 28x28 grayscale images, 10 classes
  MNIST: [
    {
      id: `conv-${Date.now()}-1`,
      label: "Conv",
      color: "#E6A000",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 1,
        outputNeurons: 32,
        dimension: 2,
        kernelSize: 3,
        stride: 1,
        padding: 0,
      },
    },
    {
      id: `conv-${Date.now()}-2`,
      label: "Conv",
      color: "#E6A000",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 32,
        outputNeurons: 64,
        dimension: 2,
        kernelSize: 3,
        stride: 1,
        padding: 0,
      },
    },
    {
      id: `maxpool-${Date.now()}`,
      label: "MaxPool",
      color: "#0099CC",
      params: {
        dimension: 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    },
    {
      id: `dropout-${Date.now()}-1`,
      label: "Dropout",
      color: "#B266FF",
      params: {
        dropout: 0.25,
      },
    },
    {
      id: `flatten-${Date.now()}`,
      label: "Flatten",
      color: "#E6007A",
      inputNeurons: 9216,
      startDimension: 1,
      endDimension: -1,
    },
    {
      id: `linear-${Date.now()}-1`,
      label: "Linear",
      color: "#00B359",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 9216,
        outputNeurons: 128,
      },
    },
    {
      id: `dropout-${Date.now()}-2`,
      label: "Dropout",
      color: "#B266FF",
      params: {
        dropout: 0.5,
      },
    },
    {
      id: `linear-${Date.now()}-2`,
      label: "Linear",
      color: "#00B359",
      activationFunction: "Softmax",
      params: {
        inputNeurons: 128,
        outputNeurons: 10,
      },
    },
  ],

  // FashionMNIST: 28x28 grayscale images, 10 classes (similar to MNIST but with different complexity)
  FashionMNIST: [
    {
      id: `conv-${Date.now()}-1`,
      label: "Conv",
      color: "#E6A000",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 1,
        outputNeurons: 32,
        dimension: 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    },
    {
      id: `maxpool-${Date.now()}-1`,
      label: "MaxPool",
      color: "#0099CC",
      params: {
        dimension: 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    },
    {
      id: `conv-${Date.now()}-2`,
      label: "Conv",
      color: "#E6A000",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 32,
        outputNeurons: 64,
        dimension: 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    },
    {
      id: `maxpool-${Date.now()}-2`,
      label: "MaxPool",
      color: "#0099CC",
      params: {
        dimension: 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    },
    {
      id: `conv-${Date.now()}-3`,
      label: "Conv",
      color: "#E6A000",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 128,
        dimension: 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    },
    {
      id: `flatten-${Date.now()}`,
      label: "Flatten",
      color: "#E6007A",
      inputNeurons: 6272,
      startDimension: 1,
      endDimension: -1,
    },
    {
      id: `linear-${Date.now()}-1`,
      label: "Linear",
      color: "#00B359",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 6272,
        outputNeurons: 256,
      },
    },
    {
      id: `dropout-${Date.now()}`,
      label: "Dropout",
      color: "#B266FF",
      params: {
        dropout: 0.5,
      },
    },
    {
      id: `linear-${Date.now()}-2`,
      label: "Linear",
      color: "#00B359",
      activationFunction: "Softmax",
      params: {
        inputNeurons: 256,
        outputNeurons: 10,
      },
    },
  ],

  // CIFAR-10: 32x32 RGB images, 10 classes
  CIFAR10: [
    {
      id: `conv-${Date.now()}-1`,
      label: "Conv",
      color: "#E6A000",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 3,
        outputNeurons: 32,
        dimension: 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    },
    {
      id: `conv-${Date.now()}-2`,
      label: "Conv",
      color: "#E6A000",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 32,
        outputNeurons: 32,
        dimension: 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    },
    {
      id: `maxpool-${Date.now()}-1`,
      label: "MaxPool",
      color: "#0099CC",
      params: {
        dimension: 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    },
    {
      id: `dropout-${Date.now()}-1`,
      label: "Dropout",
      color: "#B266FF",
      params: {
        dropout: 0.25,
      },
    },
    {
      id: `conv-${Date.now()}-3`,
      label: "Conv",
      color: "#E6A000",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 32,
        outputNeurons: 64,
        dimension: 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    },
    {
      id: `conv-${Date.now()}-4`,
      label: "Conv",
      color: "#E6A000",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 64,
        dimension: 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    },
    {
      id: `maxpool-${Date.now()}-2`,
      label: "MaxPool",
      color: "#0099CC",
      params: {
        dimension: 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    },
    {
      id: `dropout-${Date.now()}-2`,
      label: "Dropout",
      color: "#B266FF",
      params: {
        dropout: 0.25,
      },
    },
    {
      id: `flatten-${Date.now()}`,
      label: "Flatten",
      color: "#E6007A",
      inputNeurons: 4096,
      startDimension: 1,
      endDimension: -1,
    },
    {
      id: `linear-${Date.now()}-1`,
      label: "Linear",
      color: "#00B359",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 4096,
        outputNeurons: 512,
      },
    },
    {
      id: `dropout-${Date.now()}-3`,
      label: "Dropout",
      color: "#B266FF",
      params: {
        dropout: 0.5,
      },
    },
    {
      id: `linear-${Date.now()}-2`,
      label: "Linear",
      color: "#00B359",
      activationFunction: "Softmax",
      params: {
        inputNeurons: 512,
        outputNeurons: 10,
      },
    },
  ],

  // Pima Diabetes: 8 features, 2 classes (binary classification)
  pima: [
    {
      id: `linear-${Date.now()}-1`,
      label: "Linear",
      color: "#00B359",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 8,
        outputNeurons: 10,
      },
    },
    {
      id: `linear-${Date.now()}-2`,
      label: "Linear",
      color: "#00B359",
      activationFunction: "ReLU",
      params: {
        inputNeurons: 10,
        outputNeurons: 8,
      },
    },
    {
      id: `linear-${Date.now()}-3`,
      label: "Linear",
      color: "#00B359",
      activationFunction: "Sigmoid",
      params: {
        inputNeurons: 8,
        outputNeurons: 1,
      },
    },
  ],
};

export const generateUniqueBlocks = (datasetName: string): UILayer[] => {
  const baseConfig = DEFAULT_DATASET_CONFIGS[datasetName];
  if (!baseConfig) return [];

  const timestamp = Date.now();
  return baseConfig.map((block, index) => ({
    ...block,
    id: `${block.label.toLowerCase()}-${timestamp}-${index}`,
  }));
};
