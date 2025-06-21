"use client";
import React from "react";
import { LossFunction, OptimizerType } from "~/types";
import {
  TRAINING_DEFAULTS,
  LOSS_FUNCTIONS,
  OPTIMIZERS,
} from "~/configs/training";
import { ValidationError } from "~/utils/validation";
import TrainingConfigItem from "./TrainingConfigItem";
import ValidatedInput from "./ValidatedInput";

interface SharedTrainingConfigProps {
  // Configuration values
  loss: LossFunction;
  optimizer: OptimizerType;
  learningRate: number;
  epochs: number;
  batchSize: number;

  // Setters
  setLoss: (loss: LossFunction) => void;
  setOptimizer: (optimizer: OptimizerType) => void;
  setLearningRate: (rate: number) => void;
  setEpochs: (epochs: number) => void;
  setBatchSize: (size: number) => void;

  // Optional reset functions
  onResetLoss?: () => void;
  onResetOptimizer?: () => void;
  onResetLearningRate?: () => void;
  onResetEpochs?: () => void;
  onResetBatchSize?: () => void;

  // Validation errors
  validationErrors?: ValidationError[];

  // Style variant
  variant?: "full" | "compact";
}

const SharedTrainingConfig: React.FC<SharedTrainingConfigProps> = ({
  loss,
  optimizer,
  learningRate,
  epochs,
  batchSize,
  setLoss,
  setOptimizer,
  setLearningRate,
  setEpochs,
  setBatchSize,
  onResetLoss,
  onResetOptimizer,
  onResetLearningRate,
  onResetEpochs,
  onResetBatchSize,
  validationErrors = [],
  variant = "full",
}) => {
  const isCompact = variant === "compact";

  // Helper functions to get field-specific validation errors
  const getFieldError = (fieldName: string) => {
    return validationErrors.find((error) => error.field === fieldName);
  };

  const hasFieldError = (fieldName: string) => {
    return validationErrors.some((error) => error.field === fieldName);
  };

  if (isCompact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="min-w-fit text-sm">Loss:</span>
          <select
            className="cursor-pointer rounded bg-zinc-700 p-1 text-sm text-white outline-none"
            value={loss}
            onChange={(e) => setLoss(e.target.value as LossFunction)}
          >
            {LOSS_FUNCTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="min-w-fit text-sm">Optimizer:</span>
          <select
            className="cursor-pointer rounded bg-zinc-700 p-1 text-sm text-white outline-none"
            value={optimizer}
            onChange={(e) => setOptimizer(e.target.value as OptimizerType)}
          >
            {OPTIMIZERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="min-w-fit text-sm">Learning Rate:</span>
          <ValidatedInput
            type="range"
            value={learningRate}
            onChange={setLearningRate}
            min={TRAINING_DEFAULTS.learningRate.min}
            max={TRAINING_DEFAULTS.learningRate.max}
            step={TRAINING_DEFAULTS.learningRate.step}
            className="flex-1"
            hasError={hasFieldError("learningRate")}
            errorMessage={getFieldError("learningRate")?.message}
            name="learningRate"
          />
          <ValidatedInput
            type="number"
            value={learningRate}
            onChange={setLearningRate}
            min={TRAINING_DEFAULTS.learningRate.min}
            max={TRAINING_DEFAULTS.learningRate.max}
            step={TRAINING_DEFAULTS.learningRate.step}
            className="w-14 text-center text-sm"
            hasError={hasFieldError("learningRate")}
            errorMessage={getFieldError("learningRate")?.message}
            name="learningRate"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="min-w-fit text-sm">Epochs:</span>
          <ValidatedInput
            type="range"
            value={epochs}
            onChange={setEpochs}
            min={TRAINING_DEFAULTS.epochs.min}
            max={TRAINING_DEFAULTS.epochs.max}
            className="flex-1"
            hasError={hasFieldError("epochs")}
            errorMessage={getFieldError("epochs")?.message}
            name="epochs"
          />
          <ValidatedInput
            type="number"
            value={epochs}
            onChange={setEpochs}
            min={TRAINING_DEFAULTS.epochs.min}
            max={TRAINING_DEFAULTS.epochs.max}
            className="w-14 text-center text-sm"
            hasError={hasFieldError("epochs")}
            errorMessage={getFieldError("epochs")?.message}
            name="epochs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="min-w-fit text-sm">Batch Size:</span>
          <ValidatedInput
            type="range"
            value={batchSize}
            onChange={setBatchSize}
            min={TRAINING_DEFAULTS.batchSize.min}
            max={TRAINING_DEFAULTS.batchSize.max}
            className="flex-1"
            hasError={hasFieldError("batchSize")}
            errorMessage={getFieldError("batchSize")?.message}
            name="batchSize"
          />
          <ValidatedInput
            type="number"
            value={batchSize}
            onChange={setBatchSize}
            min={TRAINING_DEFAULTS.batchSize.min}
            max={TRAINING_DEFAULTS.batchSize.max}
            className="w-14 text-center text-sm"
            hasError={hasFieldError("batchSize")}
            errorMessage={getFieldError("batchSize")?.message}
            name="batchSize"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-2xl text-zinc-700">Model</div>
      <TrainingConfigItem title="Loss" onReset={onResetLoss}>
        <select
          className="cursor-pointer rounded bg-zinc-700 px-4 py-2 text-sm text-white outline-none"
          value={loss}
          onChange={(e) => setLoss(e.target.value as LossFunction)}
        >
          {LOSS_FUNCTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </TrainingConfigItem>

      <TrainingConfigItem title="Optimizer" onReset={onResetOptimizer}>
        <select
          className="cursor-pointer rounded bg-zinc-700 px-4 py-2 text-sm text-white outline-none"
          value={optimizer}
          onChange={(e) => setOptimizer(e.target.value as OptimizerType)}
        >
          {OPTIMIZERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </TrainingConfigItem>

      <div className="mt-4 text-2xl text-zinc-700">Training</div>
      <TrainingConfigItem title="Learning Rate" onReset={onResetLearningRate}>
        <div className="flex items-center">
          <ValidatedInput
            type="range"
            value={learningRate}
            onChange={setLearningRate}
            min={TRAINING_DEFAULTS.learningRate.min}
            max={TRAINING_DEFAULTS.learningRate.max}
            step={TRAINING_DEFAULTS.learningRate.step}
            hasError={hasFieldError("learningRate")}
            errorMessage={getFieldError("learningRate")?.message}
            name="learningRate"
          />
          <ValidatedInput
            type="number"
            value={learningRate}
            onChange={setLearningRate}
            min={TRAINING_DEFAULTS.learningRate.min}
            max={TRAINING_DEFAULTS.learningRate.max}
            step={TRAINING_DEFAULTS.learningRate.step}
            className="mx-1 text-center"
            hasError={hasFieldError("learningRate")}
            errorMessage={getFieldError("learningRate")?.message}
            name="learningRate"
          />
        </div>
      </TrainingConfigItem>

      <TrainingConfigItem title="Epochs" onReset={onResetEpochs}>
        <div className="flex items-center">
          <ValidatedInput
            type="range"
            value={epochs}
            onChange={setEpochs}
            min={TRAINING_DEFAULTS.epochs.min}
            max={TRAINING_DEFAULTS.epochs.max}
            hasError={hasFieldError("epochs")}
            errorMessage={getFieldError("epochs")?.message}
            name="epochs"
          />
          <ValidatedInput
            type="number"
            value={epochs}
            onChange={setEpochs}
            min={TRAINING_DEFAULTS.epochs.min}
            max={TRAINING_DEFAULTS.epochs.max}
            className="mx-1 text-center"
            hasError={hasFieldError("epochs")}
            errorMessage={getFieldError("epochs")?.message}
            name="epochs"
          />
        </div>
      </TrainingConfigItem>

      <TrainingConfigItem title="Batch Size" onReset={onResetBatchSize}>
        <div className="flex items-center">
          <ValidatedInput
            type="range"
            value={batchSize}
            onChange={setBatchSize}
            min={TRAINING_DEFAULTS.batchSize.min}
            max={TRAINING_DEFAULTS.batchSize.max}
            hasError={hasFieldError("batchSize")}
            errorMessage={getFieldError("batchSize")?.message}
            name="batchSize"
          />
          <ValidatedInput
            type="number"
            value={batchSize}
            onChange={setBatchSize}
            min={TRAINING_DEFAULTS.batchSize.min}
            max={TRAINING_DEFAULTS.batchSize.max}
            className="mx-1 text-center"
            hasError={hasFieldError("batchSize")}
            errorMessage={getFieldError("batchSize")?.message}
            name="batchSize"
          />
        </div>
      </TrainingConfigItem>
    </div>
  );
};

export default SharedTrainingConfig;
