"use client";
import { MdClose as CrossIcon } from "react-icons/md";
import React from "react";
import { useBoardStore } from "~/state/boardStore";
import {
  ActivationFunction,
  UILayer,
  hasNeurons,
  hasActivationFunction,
  hasParams,
} from "~/types/index";
import { PARAM_CONFIG } from "~/util/layerConfig";

interface OverlayBlockProps {
  id: string;
  label: string;
  color: string;
  block: UILayer;
}

const OtherParamsInputs = ({
  id,
  params,
  onParamChange,
}: {
  id: string;
  params?: Record<string, number>;
  onParamChange: (paramKey: string, newValue: number) => void;
}) => {
  if (!params || Object.keys(params).length === 0) {
    return null;
  }

  const handleParamChange = (paramKey: string, newValue: number) => {
    const config = PARAM_CONFIG[paramKey];
    if (config && newValue < config.min) return;

    if (paramKey === "dimension" && (newValue < 1 || newValue > 2)) return;

    onParamChange(paramKey, newValue);
  };

  return (
    <div className="space-y-2">
      {Object.entries(params)
        .filter(([key]) => key !== "inputNeurons" && key !== "outputNeurons")
        .map(([paramKey, paramValue]) => {
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
              className="flex items-center justify-between gap-3"
            >
              <label className="min-w-fit text-sm font-medium text-white">
                {config.label}
              </label>
              <input
                type="number"
                className="h-8 w-14 rounded-md border border-gray-300 bg-white text-center text-sm text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
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
  const { updateBlock, updateInputNeurons, removeBlock } = useBoardStore();

  const handleActivationChange = (activationFunction: ActivationFunction) => {
    if (hasActivationFunction(block)) {
      updateBlock(id, { activationFunction } as Partial<UILayer>);
    }
  };

  const handleInputNeuronsChange = (inputNeurons: number) => {
    if (inputNeurons < 1) return;
    updateInputNeurons(id, inputNeurons);
  };

  const handleOutputNeuronsChange = (outputNeurons: number) => {
    if (outputNeurons < 1) return;
    if (hasNeurons(block)) {
      updateBlock(id, {
        params: {
          ...(block.params as Record<string, any>),
          outputNeurons,
        },
      });
    }
  };

  const handleParamChange = (paramKey: string, newValue: number) => {
    if (hasParams(block)) {
      const newParams = {
        ...(block.params as Record<string, any>),
        [paramKey]: newValue,
      };
      updateBlock(id, { params: newParams });
    }
  };

  return (
    <div className="group relative flex items-center gap-2">
      <div
        className="w-full min-w-80 flex-1 cursor-grab rounded-lg border-l-4 p-5 text-white shadow-xl transition-all duration-100 hover:shadow-2xl hover:brightness-110"
        style={{
          backgroundColor: `${color}`,
          borderLeftColor: color,
          boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 4px 0 20px -4px ${color}30`,
        }}
      >
        {/* Header with layer name and neuron inputs */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold tracking-tight text-white">
              {label}
            </h3>
          </div>

          {hasNeurons(block) && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs font-medium text-white">In</label>
                <input
                  className="h-8 w-12 rounded-md border border-gray-300 bg-white text-center text-sm text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1"
                  style={{ "--accent-color": color } as React.CSSProperties}
                  type="number"
                  value={block.params.inputNeurons}
                  onChange={(e) => {
                    const newInputNeurons = parseInt(e.target.value);
                    handleInputNeuronsChange(newInputNeurons);
                  }}
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs font-medium text-white">Out</label>
                <input
                  className="h-8 w-12 rounded-md border border-gray-300 bg-white text-center text-sm text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1"
                  style={{ "--accent-color": color } as React.CSSProperties}
                  type="number"
                  value={block.params.outputNeurons}
                  onChange={(e) => {
                    const newOutputNeurons = parseInt(e.target.value);
                    handleOutputNeuronsChange(newOutputNeurons);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Params section */}
        <div className="mb-3">
          <OtherParamsInputs
            id={id}
            params={
              hasParams(block)
                ? (block.params as Record<string, number>)
                : undefined
            }
            onParamChange={handleParamChange}
          />
        </div>

        {/* Activation function dropdown */}
        {hasActivationFunction(block) && (
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-white">
              Activation
            </label>
            <select
              className="w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              value={block.activationFunction as string}
              onChange={(e) => {
                const newActivationFunction = e.target.value;
                handleActivationChange(
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

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeBlock(id);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-zinc-400 opacity-0 shadow-lg transition-all duration-200 hover:bg-red-500 hover:text-zinc-200 group-hover:opacity-100"
        title="Remove layer"
      >
        <CrossIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default OverlayBlock;
