"use client";
import React from "react";
import { LossFunction, OptimizerType } from "~/types/index";
import DATASETS from "~/util/DATASETS";
import {
  TRAINING_DEFAULTS,
  LOSS_FUNCTIONS,
  OPTIMIZERS,
} from "~/util/trainingConfig";
import TrainingConfigItem from "./TrainingConfigItem";

interface SharedTrainingConfigProps {
  // Configuration values
  loss: LossFunction;
  optimizer: OptimizerType;
  learningRate: number;
  epochs: number;
  batchSize: number;
  runName: string;

  // Setters
  setLoss: (loss: LossFunction) => void;
  setOptimizer: (optimizer: OptimizerType) => void;
  setLearningRate: (rate: number) => void;
  setEpochs: (epochs: number) => void;
  setBatchSize: (size: number) => void;
  setRunName: (name: string) => void;

  // Optional reset functions
  onResetLoss?: () => void;
  onResetOptimizer?: () => void;
  onResetLearningRate?: () => void;
  onResetEpochs?: () => void;
  onResetBatchSize?: () => void;
  onResetRunName?: () => void;
}

const SharedTrainingConfig: React.FC<SharedTrainingConfigProps> = ({
  loss,
  optimizer,
  learningRate,
  epochs,
  batchSize,
  runName,
  setLoss,
  setOptimizer,
  setLearningRate,
  setEpochs,
  setBatchSize,
  setRunName,
  onResetLoss,
  onResetOptimizer,
  onResetLearningRate,
  onResetEpochs,
  onResetBatchSize,
  onResetRunName,
}) => {
  return (
    <div className="space-y-4">
      <TrainingConfigItem title="Run Name" onReset={onResetRunName}>
        <input
          type="text"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          placeholder="(Optional) Name training run"
          className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-zinc-100 placeholder-zinc-400 outline-none focus:bg-zinc-600"
        />
      </TrainingConfigItem>

      <div className="text-2xl text-zinc-700">Model</div>

      <TrainingConfigItem title="Loss Function" onReset={onResetLoss}>
        <select
          value={loss}
          onChange={(e) => setLoss(e.target.value as LossFunction)}
          className="rounded-lg bg-zinc-700 px-3 py-2 outline-none"
        >
          {LOSS_FUNCTIONS.map((fn) => (
            <option key={fn.value} value={fn.value}>
              {fn.label}
            </option>
          ))}
        </select>
      </TrainingConfigItem>

      <TrainingConfigItem title="Optimizer" onReset={onResetOptimizer}>
        <select
          value={optimizer}
          onChange={(e) => setOptimizer(e.target.value as OptimizerType)}
          className="rounded-lg bg-zinc-700 px-3 py-2 outline-none"
        >
          {OPTIMIZERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </TrainingConfigItem>

      <div className="mt-4 text-2xl text-zinc-700">Training</div>

      <TrainingConfigItem title="Learning Rate" onReset={onResetLearningRate}>
        <div className="flex items-center">
          <input
            type="range"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            min={TRAINING_DEFAULTS.learningRate.min}
            max={TRAINING_DEFAULTS.learningRate.max}
            step={TRAINING_DEFAULTS.learningRate.step}
            className="flex-1"
            name="learningRate"
          />
          <input
            type="number"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            min={TRAINING_DEFAULTS.learningRate.min}
            max={TRAINING_DEFAULTS.learningRate.max}
            step={TRAINING_DEFAULTS.learningRate.step}
            className="mx-1 w-20 rounded-lg bg-zinc-700 px-2 py-1 text-center outline-none"
            name="learningRate"
          />
        </div>
      </TrainingConfigItem>

      <TrainingConfigItem title="Epochs" onReset={onResetEpochs}>
        <div className="flex items-center">
          <input
            type="range"
            value={epochs}
            onChange={(e) => setEpochs(parseInt(e.target.value))}
            min={TRAINING_DEFAULTS.epochs.min}
            max={TRAINING_DEFAULTS.epochs.max}
            className="flex-1"
            name="epochs"
          />
          <input
            type="number"
            value={epochs}
            onChange={(e) => setEpochs(parseInt(e.target.value))}
            min={TRAINING_DEFAULTS.epochs.min}
            max={TRAINING_DEFAULTS.epochs.max}
            className="mx-1 w-20 rounded-lg bg-zinc-700 px-2 py-1 text-center outline-none"
            name="epochs"
          />
        </div>
      </TrainingConfigItem>

      <TrainingConfigItem title="Batch Size" onReset={onResetBatchSize}>
        <div className="flex items-center">
          <input
            type="range"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value))}
            min={TRAINING_DEFAULTS.batchSize.min}
            max={TRAINING_DEFAULTS.batchSize.max}
            className="flex-1"
            name="batchSize"
          />
          <input
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value))}
            min={TRAINING_DEFAULTS.batchSize.min}
            max={TRAINING_DEFAULTS.batchSize.max}
            className="mx-1 w-20 rounded-lg bg-zinc-700 px-2 py-1 text-center outline-none"
            name="batchSize"
          />
        </div>
      </TrainingConfigItem>
    </div>
  );
};

export default SharedTrainingConfig;
