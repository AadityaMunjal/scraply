"use client";
import React from "react";

interface ValidatedInputProps {
  type: "number" | "range";
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  hasError?: boolean;
  errorMessage?: string;
  name?: string;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  type,
  value,
  onChange,
  min,
  max,
  step,
  className = "",
  hasError = false,
  errorMessage,
  name,
}) => {
  const baseClassName =
    type === "range"
      ? "flex-1"
      : "w-20 rounded-lg px-2 py-1 text-center outline-none";

  const errorClassName = hasError
    ? "ring-2 ring-red-400 bg-red-900/20"
    : "bg-zinc-700";

  const finalClassName =
    type === "range"
      ? `${baseClassName} ${className}`
      : `${baseClassName} ${errorClassName} ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      type === "range" || step === 0.1
        ? parseFloat(e.target.value)
        : parseInt(e.target.value);

    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className={finalClassName}
      />
      {hasError && errorMessage && type === "number" && (
        <div className="absolute top-full z-10 mt-1 rounded bg-red-900 px-2 py-1 text-xs text-red-200 shadow-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;
