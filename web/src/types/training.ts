export type LossFunction = "BCE" | "CrossEntropy";
export type OptimizerType = "Adam" | "AdamW" | "SGD" | "RMSprop";

interface ConfigLayer {
  kind: string;
  args: number[];
}

interface ConfigLayerActivationFunction {
  kind: string;
}

type ConfigLayerBlock = ConfigLayer | ConfigLayerActivationFunction;

export interface Config {
  input: string;
  layers: ConfigLayerBlock[];
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
