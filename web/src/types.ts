export type Dataset = {
  label: string;
  inputName: string;
};

export interface UILayer {
  id: string;
  label: string;
  color: string;
  inputNeurons: number;
  outputNeurons: number;
  otherParams?: Record<string, number>;
  activationFunction: ActivationFunction;
}

export type ActivationFunction =
  | ""
  | "ReLU"
  | "Sigmoid"
  | "Tanh"
  | "Softmax"
  | "LeakyReLU"
  | "PReLU";

interface Layer {
  kind: string;
  args: number[];
}

interface LayerActivationFunction {
  kind: string;
}

type LayerBlock = Layer | LayerActivationFunction;

export interface Config {
  input: string;
  layers: LayerBlock[];
  loss: string;
  optimizer: {
    kind: string;
    lr: number;
  };
  learning_rate: number;
  epoch: number;
  batch_size: number;
}

export interface TrainingResult {
  avg_train_loss: number;
  avg_train_acc: number;
  avg_test_loss: number;
  avg_test_acc: number;
  train_losses: number[];
  test_losses: number[];
  trainingConfig: Config;
}

export const TrainingResultFormat = {
  avg_train_loss: { key: "Average Train Loss", positiveTemperament: false },
  avg_train_acc: { key: "Average Train Accuracy", positiveTemperament: true },
  avg_test_loss: { key: "Average Test Loss", positiveTemperament: false },
  avg_test_acc: { key: "Average Test Accuracy", positiveTemperament: true },
};

export interface TransformerConfig {
  input: string;
  layers: (
    | {
        kind: string;
        args: number[];
      }
    | {
        kind: string;
        args: number;
      }
  )[];
  loss: string;
  optimizer: {
    kind: string;
    lr: number;
  };
  epoch: number;
  batch_size: number;
}

export enum AppTabs {
  LAYERS = "LAYERS",
  TRAINING = "TRAINING",
  OUTPUTS = "OUTPUTS",
  // TRANSFORMERS = "TRANSFORMERS",
}
