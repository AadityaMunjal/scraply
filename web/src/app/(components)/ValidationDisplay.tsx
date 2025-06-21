"use client";
import React from "react";
import { ValidationError } from "~/utils/validation";
import {
  IoMdWarning as WarningIcon,
  IoMdCheckmark as CheckIcon,
} from "react-icons/io";

interface ValidationDisplayProps {
  errors: ValidationError[];
  isValid: boolean;
  className?: string;
  showSuccess?: boolean;
}

const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  errors,
  isValid,
  className = "",
  showSuccess = true,
}) => {
  if (isValid && showSuccess) {
    return (
      <div className={`flex items-center gap-1 text-green-500 ${className}`}>
        <CheckIcon className="h-4 w-4" />
      </div>
    );
  }

  if (errors.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-lg bg-yellow-900/20 p-3 text-yellow-400 ${className}`}
    >
      <div className="flex items-start gap-2">
        <WarningIcon className="mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-sm font-medium">
            {errors.length === 1
              ? "Validation Issue"
              : `${errors.length} Validation Issues`}
          </div>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li
                key={`${error.field}-${index}`}
                className="text-xs text-yellow-300"
              >
                <span className="font-medium">{error.field}:</span>{" "}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValidationDisplay;
