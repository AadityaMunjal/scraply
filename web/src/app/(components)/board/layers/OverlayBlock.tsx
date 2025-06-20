"use client";
import React from "react";
import { useBoardStore } from "~/state/boardStore";
import { ActivationFunction, UILayer } from "~/types";

interface OverlayBlockProps {
  id: string;
  label: string;
  color: string;
  block: UILayer;
}

const PARAM_CONFIG: Record<
  string,
  { label: string; min: number; defaultValue: number }
> = {
  kernelSize: { label: "Kernel Size", min: 1, defaultValue: 3 },
  hiddenSize: { label: "Hidden Size", min: 1, defaultValue: 3 },
  stride: { label: "Stride", min: 1, defaultValue: 1 },
  padding: { label: "Padding", min: 0, defaultValue: 0 },
  dilation: { label: "Dilation", min: 1, defaultValue: 1 },
  dropout: { label: "Dropout", min: 0, defaultValue: 0.1 },
};

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
          min: 0,
          defaultValue: 1,
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
              step={paramKey === "dropout" ? 0.1 : 1}
              onChange={(e) => {
                const newValue =
                  paramKey === "dropout"
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
      className={`cursor-grab rounded-2xl pb-3 pt-4 text-center ring-1 ring-zinc-200`}
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
