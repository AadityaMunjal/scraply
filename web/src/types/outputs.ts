export type ClassificationClass = string;

export interface PeekMap {
  image: string;
  layer: string;
}

export type ConfusionMatrix = number[][];

export interface OutputsClass {
  accuracy: number[];
  f1_score: number[];
  precision: number[];
  recall: number[];
}

export interface OutputsOverall {
  accuracy: number;
  f1_score: number;
  precision: number;
  recall: number;
}

export interface ClassificationImageOutput {
  idx: number;
  original: string;
  peek_maps: PeekMap[];
}

export interface RandomSamples {
  [key: ClassificationClass]: ClassificationImageOutput[];
}

export interface TopMisclassified {
  [key: ClassificationClass]: ClassificationImageOutput[];
}

export interface Training {
  avg_test_acc: number;
  avg_test_loss: number;
  avg_train_acc: number;
  avg_train_loss: number;
  train_losses: { x: number; y: number }[];
  test_losses: { x: number; y: number }[];
}

export interface OutputsResult {
  confusion_matrix: ConfusionMatrix;
  outputs_class: OutputsClass;
  outputs_overall: OutputsOverall;
  random_samples: RandomSamples;
  top_misclassified: TopMisclassified;
  training: Training;
}
