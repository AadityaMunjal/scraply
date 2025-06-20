// Shared parameter configuration for layer parameters
export const PARAM_CONFIG: Record<
  string,
  {
    label: string;
    shortLabel: string;
    min: number;
    defaultValue: number;
    step?: number;
  }
> = {
  dimension: {
    label: "Dimension",
    shortLabel: "Dim",
    min: 1,
    defaultValue: 2,
  },
  kernelSize: {
    label: "Kernel Size",
    shortLabel: "Kernel",
    min: 1,
    defaultValue: 3,
  },
  hiddenSize: {
    label: "Hidden Size",
    shortLabel: "Hidden",
    min: 1,
    defaultValue: 3,
  },
  stride: {
    label: "Stride",
    shortLabel: "Stride",
    min: 1,
    defaultValue: 1,
  },
  padding: {
    label: "Padding",
    shortLabel: "Pad",
    min: 0,
    defaultValue: 0,
  },
  dropout: {
    label: "Dropout",
    shortLabel: "Dropout",
    min: 0,
    defaultValue: 0.1,
    step: 0.1,
  },
};
