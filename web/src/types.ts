export type Dataset = {
  label: string;
  inputName: string;
};

export type LossFunction = "BCE" | "CrossEntropy";
export type OptimizerType = "Adam" | "AdamW" | "SGD" | "RMSprop";

export interface LegacyUILayer {
  id: string;
  label: string;
  color: string;
  inputNeurons: number;
  outputNeurons: number;
  otherParams?: Record<string, number>;
  activationFunction: ActivationFunction;
}

export interface BaseLayer {
  id: string;
  label: string;
  color: string;
}

export interface LayerWithNeurons extends BaseLayer {
  inputNeurons: number;
  outputNeurons: number;
}

export interface LayerWithNeuronsAndAF extends LayerWithNeurons {
  activationFunction: ActivationFunction;
}

export interface LayerWithOtherParams<T> {
  otherParams: T;
}

export type LinearLayer = LayerWithNeuronsAndAF;

export type ConvLayer = LayerWithNeuronsAndAF &
  LayerWithOtherParams<{
    dimension: 1 | 2;
    kernelSize: number;
    stride: number;
    padding: number;
  }>;

export type RNNLayer = LayerWithNeuronsAndAF &
  LayerWithOtherParams<{
    hiddenSize: number;
    dropout: number;
  }>;

export type GRULayer = LayerWithNeuronsAndAF &
  LayerWithOtherParams<{
    hiddenSize: number;
    dropout: number;
  }>;

export type FlattenLayer = LayerWithNeurons;

export type MaxPoolLayer = BaseLayer &
  LayerWithOtherParams<{
    dimension: 1 | 2;
    kernelSize: number;
    stride: number;
    padding: number;
  }>;

export type ActivationFunction =
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
  loss: LossFunction;
  optimizer: {
    kind: OptimizerType;
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
  train_losses: { x: number; y: number }[];
  test_losses: { x: number; y: number }[];
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
  loss: LossFunction;
  optimizer: {
    kind: OptimizerType;
    lr: number;
  };
  epoch: number;
  batch_size: number;
}

export enum AppTabs {
  LAYERS = "LAYERS",
  TRAINING = "TRAINING",
  OUTPUTS = "OUTPUTS",
}
