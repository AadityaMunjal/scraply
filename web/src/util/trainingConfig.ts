export const TRAINING_DEFAULTS = {
  learningRate: {
    min: 0.001,
    max: 0.1,
    default: 0.001,
    step: 0.001,
  },
  epochs: {
    min: 1,
    max: 1000,
    default: 100,
  },
  batchSize: {
    min: 1,
    max: 100,
    default: 10,
  },
};

export const LOSS_FUNCTIONS = [
  { value: "BCE", label: "BCE" },
  { value: "CrossEntropy", label: "CrossEntropy" },
  { value: "BCEWithLogitsLoss", label: "BCE with Logits Loss"}
] as const;

export const OPTIMIZERS = [
  { value: "Adam", label: "Adam" },
  { value: "AdamW", label: "AdamW" },
  { value: "SGD", label: "SGD" },
  { value: "RMSprop", label: "RMSprop" },
] as const;

export const DEFAULT_TRAINING_CONFIG = {
  loss: "BCE" as const,
  optimizer: "Adam" as const,
  learningRate: TRAINING_DEFAULTS.learningRate.default,
  epochs: TRAINING_DEFAULTS.epochs.default,
  batchSize: TRAINING_DEFAULTS.batchSize.default,
};
