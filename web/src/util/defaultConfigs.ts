import { UILayer } from "~/types/index";
import { LAYER_BLOCKS } from "./LAYER_BLOCKS";

// Helper to get label and color from LAYER_BLOCKS by label (case-insensitive)
function getBlockMeta<L extends string>(label: L) {
  const block = LAYER_BLOCKS.find(
    (b) => b.label.toLowerCase() === label.toLowerCase(),
  );
  return {
    label: (block?.label || label) as L,
    color: block?.color || "#CCCCCC",
  };
}

// Default layer configurations for each dataset
export const DEFAULT_DATASET_CONFIGS: Record<string, UILayer[]> = {
  // MNIST: 28x28 grayscale images, 10 classes
  MNIST: [
    {
      id: `conv-${Date.now()}-1`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 1,
        outputNeurons: 32,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 0,
      },
    } as const,
    {
      id: `conv-${Date.now()}-2`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 32,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 0,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    } as const,
    {
      id: `dropout-${Date.now()}-1`,
      ...getBlockMeta("Dropout"),
      params: {
        dropout: 0.25,
      },
    } as const,
    {
      id: `flatten-${Date.now()}`,
      ...getBlockMeta("Flatten"),
      inputNeurons: 9216,
      startDimension: 1,
      endDimension: -1,
    } as const,
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 9216,
        outputNeurons: 128,
      },
    } as const,
    {
      id: `dropout-${Date.now()}-2`,
      ...getBlockMeta("Dropout"),
      params: {
        dropout: 0.5,
      },
    } as const,
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "No Activation",
      params: {
        inputNeurons: 128,
        outputNeurons: 10,
      },
    } as const,
  ],

  // FashionMNIST: 28x28 grayscale images, 10 classes (similar to MNIST but with different complexity)
  FashionMNIST: [
    {
      id: `conv-${Date.now()}-1`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 1,
        outputNeurons: 32,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-1`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    } as const,
    {
      id: `conv-${Date.now()}-2`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 32,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-2`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    } as const,
    {
      id: `conv-${Date.now()}-3`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 128,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `flatten-${Date.now()}`,
      ...getBlockMeta("Flatten"),
      inputNeurons: 6272,
      startDimension: 1,
      endDimension: -1,
    } as const,
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 6272,
        outputNeurons: 256,
      },
    } as const,
    {
      id: `dropout-${Date.now()}`,
      ...getBlockMeta("Dropout"),
      params: {
        dropout: 0.5,
      },
    } as const,
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "No Activation",
      params: {
        inputNeurons: 256,
        outputNeurons: 10,
      },
    } as const,
  ],

  // CIFAR-10: 32x32 RGB images, 10 classes
  CIFAR10: [
    {
      id: `conv-${Date.now()}-1`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 3,
        outputNeurons: 32,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `conv-${Date.now()}-2`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 32,
        outputNeurons: 32,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-1`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    } as const,
    {
      id: `dropout-${Date.now()}-1`,
      ...getBlockMeta("Dropout"),
      params: {
        dropout: 0.25,
      },
    } as const,
    {
      id: `conv-${Date.now()}-3`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 32,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `conv-${Date.now()}-4`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-2`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    } as const,
    {
      id: `dropout-${Date.now()}-2`,
      ...getBlockMeta("Dropout"),
      params: {
        dropout: 0.25,
      },
    } as const,
    {
      id: `flatten-${Date.now()}`,
      ...getBlockMeta("Flatten"),
      inputNeurons: 4096,
      startDimension: 1,
      endDimension: -1,
    } as const,
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 4096,
        outputNeurons: 512,
      },
    } as const,
    {
      id: `dropout-${Date.now()}-3`,
      ...getBlockMeta("Dropout"),
      params: {
        dropout: 0.5,
      },
    } as const,
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "No Activation",
      params: {
        inputNeurons: 512,
        outputNeurons: 10,
      },
    } as const,
  ],

  // Pima Diabetes: 8 features, 2 classes (binary classification)
  pima: [
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 8,
        outputNeurons: 10,
      },
    } as const,
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 10,
        outputNeurons: 8,
      },
    } as const,
    {
      id: `linear-${Date.now()}-3`,
      ...getBlockMeta("Linear"),
      activationFunction: "Sigmoid",
      params: {
        inputNeurons: 8,
        outputNeurons: 1,
      },
    } as const,
  ],
};

// AlexNet-style default configs for each dataset, for image datasets only. doesnt include pima
export const ALEXNET_DATASET_CONFIGS: Record<string, UILayer[]> = {
  MNIST: [
    {
      id: `conv-${Date.now()}-1`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: { inputNeurons: 1, outputNeurons: 64, dimension: 2 as 2, kernelSize: 5, stride: 1, padding: 2 },
    },
    {
      id: `maxpool-${Date.now()}-1`,
      ...getBlockMeta("MaxPool"),
      params: { dimension: 2 as 2, kernelSize: 2, stride: 2, padding: 0 },
    },
    {
      id: `conv-${Date.now()}-2`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: { inputNeurons: 64, outputNeurons: 192, dimension: 2 as 2, kernelSize: 5, stride: 1, padding: 2 },
    },
    {
      id: `maxpool-${Date.now()}-2`,
      ...getBlockMeta("MaxPool"),
      params: { dimension: 2 as 2, kernelSize: 2, stride: 2, padding: 0 },
    },
    {
      id: `flatten-${Date.now()}`,
      ...getBlockMeta("Flatten"),
      inputNeurons: 192 * 7 * 7, // = 9408
      startDimension: 1,
      endDimension: -1,
    },
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: { inputNeurons: 9408, outputNeurons: 256 },
    },
    {
      id: `dropout-${Date.now()}-1`,
      ...getBlockMeta("Dropout"),
      params: { dropout: 0.5 },
    },
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "No Activation",
      params: { inputNeurons: 256, outputNeurons: 10 },
    },
  ],
  FashionMNIST: [
    // identical to MNIST in shape
    {
      id: `conv-${Date.now()}-1`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: { inputNeurons: 1, outputNeurons: 64, dimension: 2 as 2, kernelSize: 5, stride: 1, padding: 2 },
    },
    {
      id: `maxpool-${Date.now()}-1`,
      ...getBlockMeta("MaxPool"),
      params: { dimension: 2 as 2, kernelSize: 2, stride: 2, padding: 0 },
    },
    {
      id: `conv-${Date.now()}-2`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: { inputNeurons: 64, outputNeurons: 192, dimension: 2 as 2, kernelSize: 5, stride: 1, padding: 2 },
    },
    {
      id: `maxpool-${Date.now()}-2`,
      ...getBlockMeta("MaxPool"),
      params: { dimension: 2 as 2, kernelSize: 2, stride: 2, padding: 0 },
    },
    {
      id: `flatten-${Date.now()}`,
      ...getBlockMeta("Flatten"),
      inputNeurons: 192 * 7 * 7, // = 9408
      startDimension: 1,
      endDimension: -1,
    },
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: { inputNeurons: 9408, outputNeurons: 256 },
    },
    {
      id: `dropout-${Date.now()}-1`,
      ...getBlockMeta("Dropout"),
      params: { dropout: 0.5 },
    },
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "No Activation",
      params: { inputNeurons: 256, outputNeurons: 10 },
    },
  ],
  CIFAR10: [
    {
      id: `conv-${Date.now()}-1`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: { inputNeurons: 3, outputNeurons: 64, dimension: 2 as 2, kernelSize: 11, stride: 4, padding: 2 },
    },
    {
      id: `maxpool-${Date.now()}-1`,
      ...getBlockMeta("MaxPool"),
      params: { dimension: 2 as 2, kernelSize: 3, stride: 2, padding: 0 },
    },
    {
      id: `conv-${Date.now()}-2`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: { inputNeurons: 64, outputNeurons: 192, dimension: 2 as 2, kernelSize: 5, stride: 1, padding: 2 },
    },
    {
      id: `maxpool-${Date.now()}-2`,
      ...getBlockMeta("MaxPool"),
      params: { dimension: 2 as 2, kernelSize: 3, stride: 2, padding: 0 },
    },
    {
      id: `conv-${Date.now()}-3`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: { inputNeurons: 192, outputNeurons: 384, dimension: 2 as 2, kernelSize: 3, stride: 1, padding: 1 },
    },
    {
      id: `conv-${Date.now()}-4`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: { inputNeurons: 384, outputNeurons: 256, dimension: 2 as 2, kernelSize: 3, stride: 1, padding: 1 },
    },
    {
      id: `conv-${Date.now()}-5`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: { inputNeurons: 256, outputNeurons: 256, dimension: 2 as 2, kernelSize: 3, stride: 1, padding: 1 },
    },
    {
      id: `maxpool-${Date.now()}-3`,
      ...getBlockMeta("MaxPool"),
      params: { dimension: 2 as 2, kernelSize: 3, stride: 2, padding: 0 },
    },
    {
      id: `flatten-${Date.now()}`,
      ...getBlockMeta("Flatten"),
      inputNeurons: 256 * 1 * 1, // = 256 (after aggressive downsampling)
      startDimension: 1,
      endDimension: -1,
    },
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: { inputNeurons: 256, outputNeurons: 512 },
    },
    {
      id: `dropout-${Date.now()}-1`,
      ...getBlockMeta("Dropout"),
      params: { dropout: 0.5 },
    },
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "No Activation",
      params: { inputNeurons: 512, outputNeurons: 10 },
    },
  ],
};


// ResNet-style default configs for each dataset, for image datasets only
export const RESNET_DATASET_CONFIGS: Record<string, UILayer[]> = {
  MNIST: [
    {
      id: `conv-${Date.now()}-1`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 1,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 7,
        stride: 2,
        padding: 3,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-1`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 2,
        padding: 1,
      },
    } as const,
    {
      id: `conv-${Date.now()}-2`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `conv-${Date.now()}-3`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-2`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    } as const,
    {
      id: `flatten-${Date.now()}`,
      ...getBlockMeta("Flatten"),
      inputNeurons: 1024,
      startDimension: 1,
      endDimension: -1,
    } as const,
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 1024,
        outputNeurons: 512,
      },
    } as const,
    {
      id: `dropout-${Date.now()}-1`,
      ...getBlockMeta("Dropout"),
      params: {
        dropout: 0.5,
      },
    } as const,
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "No Activation",
      params: {
        inputNeurons: 512,
        outputNeurons: 10,
      },
    } as const,
  ],
  FashionMNIST: [
    {
      id: `conv-${Date.now()}-1`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 1,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 7,
        stride: 2,
        padding: 3,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-1`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 2,
        padding: 1,
      },
    } as const,
    {
      id: `conv-${Date.now()}-2`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `conv-${Date.now()}-3`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-2`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    } as const,
    {
      id: `flatten-${Date.now()}`,
      ...getBlockMeta("Flatten"),
      inputNeurons: 1024,
      startDimension: 1,
      endDimension: -1,
    } as const,
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 1024,
        outputNeurons: 512,
      },
    } as const,
    {
      id: `dropout-${Date.now()}-1`,
      ...getBlockMeta("Dropout"),
      params: {
        dropout: 0.5,
      },
    } as const,
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "No Activation",
      params: {
        inputNeurons: 512,
        outputNeurons: 10,
      },
    } as const,
  ],
  CIFAR10: [
    {
      id: `conv-${Date.now()}-1`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 3,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 7,
        stride: 2,
        padding: 3,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-1`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 2,
        padding: 1,
      },
    } as const,
    {
      id: `conv-${Date.now()}-2`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `conv-${Date.now()}-3`,
      ...getBlockMeta("Conv"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 64,
        outputNeurons: 64,
        dimension: 2 as 2,
        kernelSize: 3,
        stride: 1,
        padding: 1,
      },
    } as const,
    {
      id: `maxpool-${Date.now()}-2`,
      ...getBlockMeta("MaxPool"),
      params: {
        dimension: 2 as 2,
        kernelSize: 2,
        stride: 2,
        padding: 0,
      },
    } as const,
    {
      id: `flatten-${Date.now()}`,
      ...getBlockMeta("Flatten"),
      inputNeurons: 1600,
      startDimension: 1,
      endDimension: -1,
    } as const,
    {
      id: `linear-${Date.now()}-1`,
      ...getBlockMeta("Linear"),
      activationFunction: "ReLU",
      params: {
        inputNeurons: 1600,
        outputNeurons: 512,
      },
    } as const,
    {
      id: `dropout-${Date.now()}-1`,
      ...getBlockMeta("Dropout"),
      params: {
        dropout: 0.5,
      },
    } as const,
    {
      id: `linear-${Date.now()}-2`,
      ...getBlockMeta("Linear"),
      activationFunction: "No Activation",
      params: {
        inputNeurons: 512,
        outputNeurons: 10,
      },
    } as const,
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

export const generateAlexNetBlocks = (datasetName: string): UILayer[] => {
  const baseConfig = ALEXNET_DATASET_CONFIGS[datasetName];
  if (!baseConfig) return [];

  const timestamp = Date.now();
  return baseConfig.map((block, index) => ({
    ...block,
    id: `${block.label.toLowerCase()}-${timestamp}-${index}`,
  }));
};

export const generateResNetBlocks = (datasetName: string): UILayer[] => {
  const baseConfig = RESNET_DATASET_CONFIGS[datasetName];
  if (!baseConfig) return [];

  const timestamp = Date.now();
  return baseConfig.map((block, index) => ({
    ...block,
    id: `${block.label.toLowerCase()}-${timestamp}-${index}`,
  }));
};
