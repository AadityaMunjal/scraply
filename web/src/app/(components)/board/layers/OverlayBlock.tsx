"use client";
import React from "react";
import { useBoardStore } from "~/state/boardStore";
import { ActivationFunction, UILayer } from "~/types";
import { PARAM_CONFIG } from "~/util/layerConfig";

interface OverlayBlockProps {
  id: string;
  label: string;
  color: string;
  block: UILayer;
}

const OtherParamsInputs = ({
  id,
  otherParams,
  changeOtherParams,
}: {
  id: string;
  otherParams?: Record<string, number>;
  changeOtherParams: (id: string, otherParams: Record<string, number>) => void;
}) => {
  if (!otherParams || Object.keys(otherParams).length === 0) {
    return null;
  }

  const handleParamChange = (paramKey: string, newValue: number) => {
    const config = PARAM_CONFIG[paramKey];
    if (config && newValue < config.min) return;

    if (paramKey === "dimension" && (newValue < 1 || newValue > 2)) return;

    changeOtherParams(id, {
      ...otherParams,
      [paramKey]: newValue,
    });
  };

  return (
    <div className="space-y-2">
      {Object.entries(otherParams).map(([paramKey, paramValue]) => {
        const config = PARAM_CONFIG[paramKey] || {
          label: paramKey.charAt(0).toUpperCase() + paramKey.slice(1),
          shortLabel: paramKey,
          min: 0,
          defaultValue: 1,
          step: 1,
        };

        return (
          <div
            key={paramKey}
            className="flex items-center justify-between gap-2"
          >
            <label className="min-w-fit text-xs font-medium text-white/80">
              {config.label}
            </label>
            <input
              type="number"
              className="h-6 w-12 rounded-md border-0 bg-white/90 text-center text-xs text-slate-900 shadow-sm outline-none backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-white/50"
              value={paramValue}
              min={config.min}
              step={config.step || 1}
              onChange={(e) => {
                const newValue =
                  config.step === 0.1
                    ? parseFloat(e.target.value)
                    : parseInt(e.target.value);
                if (!isNaN(newValue)) {
                  handleParamChange(paramKey, newValue);
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const OverlayBlock = ({ id, label, color, block }: OverlayBlockProps) => {
  const {
    changeActivationFunction,
    changeInputNeurons,
    changeOutputNeurons,
    changeOtherParams,
  } = useBoardStore();

  return (
    <div
      className="group relative cursor-grab rounded-xl p-4 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:ring-white/20"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
      }}
    >
      {/* Header with layer name and neuron inputs */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-col">
          <h3 className="text-base font-semibold tracking-wide">{label}</h3>
        </div>

        <div className="flex gap-1.5">
          <div className="flex flex-col items-center gap-0.5">
            <label className="text-xs font-medium text-white/70">In</label>
            <input
              className="h-7 w-10 rounded-md border-0 bg-white/90 text-center text-xs text-slate-900 shadow-sm outline-none backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-white/50"
              type="number"
              value={block?.inputNeurons}
              onChange={(e) => {
                const newInputNeurons = parseInt(e.target.value);
                if (newInputNeurons < 1) return;
                changeInputNeurons(id, newInputNeurons);
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <label className="text-xs font-medium text-white/70">Out</label>
            <input
              className="h-7 w-10 rounded-md border-0 bg-white/90 text-center text-xs text-slate-900 shadow-sm outline-none backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-white/50"
              type="number"
              value={block?.outputNeurons}
              onChange={(e) => {
                const newOutputNeurons = parseInt(e.target.value);
                if (newOutputNeurons < 1) return;
                changeOutputNeurons(id, newOutputNeurons);
              }}
            />
          </div>
        </div>
      </div>

      {/* Params section */}
      <div className="mb-3">
        <OtherParamsInputs
          id={id}
          otherParams={block?.otherParams}
          changeOtherParams={changeOtherParams}
        />
      </div>

      {/* Activation function dropdown */}
      {block?.activationFunction && (
        <div className="relative">
          <label className="mb-1 block text-xs font-medium text-white/70">
            Activation
          </label>
          <select
            className="w-full cursor-pointer rounded-md border-0 bg-white/90 px-3 py-2 text-xs text-slate-900 shadow-sm outline-none backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-white/50"
            value={block?.activationFunction as string}
            onChange={(e) => {
              const newActivationFunction = e.target.value;
              changeActivationFunction(
                id,
                newActivationFunction as ActivationFunction,
              );
            }}
          >
            <option value="ReLU">ReLU</option>
            <option value="Sigmoid">Sigmoid</option>
            <option value="Tanh">Tanh</option>
            <option value="Softmax">Softmax</option>
            <option value="LeakyReLU">LeakyReLU</option>
            <option value="PReLU">PReLU</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default OverlayBlock;
