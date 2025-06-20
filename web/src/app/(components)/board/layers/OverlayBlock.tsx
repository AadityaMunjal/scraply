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
    <div className="flex flex-col gap-2">
      {Object.entries(otherParams).map(([paramKey, paramValue]) => {
        const config = PARAM_CONFIG[paramKey] || {
          label: paramKey.charAt(0).toUpperCase() + paramKey.slice(1),
          shortLabel: paramKey,
          min: 0,
          defaultValue: 1,
          step: 1,
        };

        return (
          <div key={paramKey} className="flex items-center gap-2">
            <span className="min-w-fit text-sm font-medium">
              {config.label}:
            </span>
            <input
              type="number"
              className="h-7 w-12 rounded-md text-center text-sm text-zinc-900 shadow-md outline-none"
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
      className={`cursor-grab rounded-xl pb-3 pt-4 text-center ring-1 ring-zinc-200`}
      style={{ backgroundColor: color }}
    >
      <div className="mx-4 flex justify-between">
        <div className="text-xl font-light">{label}</div>
        <div className="flex gap-1">
          <input
            className="h-8 w-10 rounded-md text-center text-zinc-900 shadow-md outline-none"
            type="number"
            placeholder="In"
            value={block?.inputNeurons}
            onChange={(e) => {
              const newInputNeurons = parseInt(e.target.value);
              if (newInputNeurons < 1) return;
              changeInputNeurons(id, newInputNeurons);
            }}
          />
          <input
            className="h-8 w-10 rounded-md text-center text-zinc-900 shadow-md outline-none"
            type="number"
            placeholder="Out"
            value={block?.outputNeurons}
            onChange={(e) => {
              const newOutputNeurons = parseInt(e.target.value);
              if (newOutputNeurons < 1) return;
              changeOutputNeurons(id, newOutputNeurons);
            }}
          />
        </div>
      </div>
      <div className="my-2 flex justify-center text-white">
        <OtherParamsInputs
          id={id}
          otherParams={block?.otherParams}
          changeOtherParams={changeOtherParams}
        />
      </div>
      {block?.activationFunction && (
        <div className="relative flex overflow-y-visible">
          <select
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform cursor-pointer rounded-lg bg-zinc-100 py-2 text-center text-sm text-zinc-900 shadow-md outline-none"
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
