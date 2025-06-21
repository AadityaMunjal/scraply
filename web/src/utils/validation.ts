import {
  Config,
  TransformerConfig,
  LossFunction,
  OptimizerType,
  UILayer,
} from "~/types";
import { TRAINING_DEFAULTS } from "~/configs/training";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateTrainingConfig = (
  config: Partial<Config>,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate loss function
  if (!config.loss) {
    errors.push({ field: "loss", message: "Loss function is required" });
  } else if (!["BCE", "CrossEntropy"].includes(config.loss)) {
    errors.push({ field: "loss", message: "Invalid loss function" });
  }

  // Validate optimizer
  if (!config.optimizer?.kind) {
    errors.push({ field: "optimizer", message: "Optimizer is required" });
  } else if (
    !["Adam", "AdamW", "SGD", "RMSprop"].includes(config.optimizer.kind)
  ) {
    errors.push({ field: "optimizer", message: "Invalid optimizer" });
  }

  // Validate learning rate
  if (config.optimizer?.lr !== undefined) {
    const lr = config.optimizer.lr;
    if (
      lr < TRAINING_DEFAULTS.learningRate.min ||
      lr > TRAINING_DEFAULTS.learningRate.max
    ) {
      errors.push({
        field: "learningRate",
        message: `Learning rate must be between ${TRAINING_DEFAULTS.learningRate.min} and ${TRAINING_DEFAULTS.learningRate.max}`,
      });
    }
  }

  // Validate epochs
  if (config.epoch !== undefined) {
    if (
      config.epoch < TRAINING_DEFAULTS.epochs.min ||
      config.epoch > TRAINING_DEFAULTS.epochs.max
    ) {
      errors.push({
        field: "epochs",
        message: `Epochs must be between ${TRAINING_DEFAULTS.epochs.min} and ${TRAINING_DEFAULTS.epochs.max}`,
      });
    }
  }

  // Validate batch size
  if (config.batch_size !== undefined) {
    if (
      config.batch_size < TRAINING_DEFAULTS.batchSize.min ||
      config.batch_size > TRAINING_DEFAULTS.batchSize.max
    ) {
      errors.push({
        field: "batchSize",
        message: `Batch size must be between ${TRAINING_DEFAULTS.batchSize.min} and ${TRAINING_DEFAULTS.batchSize.max}`,
      });
    }
  }

  // Note: Layer validation is handled separately in the board store
  // to avoid duplicate validation errors in the UI

  return errors;
};

export const validateUILayers = (layers: UILayer[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (layers.length === 0) {
    errors.push({ field: "layers", message: "At least one layer is required" });
    return errors;
  }

  layers.forEach((layer, index) => {
    // Validate neuron counts
    if (layer.inputNeurons < 1) {
      errors.push({
        field: `layer-${index}-input`,
        message: `Layer ${index + 1}: Input neurons must be at least 1`,
      });
    }

    if (layer.outputNeurons < 1) {
      errors.push({
        field: `layer-${index}-output`,
        message: `Layer ${index + 1}: Output neurons must be at least 1`,
      });
    }

    // Validate layer connections (except first layer)
    if (index > 0) {
      const prevLayer = layers[index - 1];
      if (prevLayer && layer.inputNeurons !== prevLayer.outputNeurons) {
        errors.push({
          field: `layer-${index}-connection`,
          message: `Layer ${index + 1}: Input neurons (${layer.inputNeurons}) must match previous layer's output neurons (${prevLayer.outputNeurons})`,
        });
      }
    }

    // Validate other parameters
    if (layer.otherParams) {
      Object.entries(layer.otherParams).forEach(([param, value]) => {
        if (typeof value !== "number" || value < 0) {
          errors.push({
            field: `layer-${index}-${param}`,
            message: `Layer ${index + 1}: ${param} must be a positive number`,
          });
        }

        // Specific validation for dimension parameter
        if (param === "dimension" && (value < 1 || value > 3)) {
          errors.push({
            field: `layer-${index}-dimension`,
            message: `Layer ${index + 1}: Dimension must be 1, 2, or 3`,
          });
        }
      });
    }
  });

  return errors;
};

export const isValidConfig = (config: Partial<Config>): config is Config => {
  return validateTrainingConfig(config).length === 0;
};

export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return errors[0]!.message;
  }

  return `Multiple validation errors:\n${errors.map((e) => `• ${e.message}`).join("\n")}`;
};
