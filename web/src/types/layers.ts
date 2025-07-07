export type ActivationFunction =
  | "ReLU"
  | "Sigmoid"
  | "Tanh"
  | "Softmax"
  | "LeakyReLU"
  | "PReLU";

export interface LegacyUILayer {
  id: string;
  label: Labels;
  color: string;
  inputNeurons: number;
  outputNeurons: number;
  otherParams?: Record<string, number>;
  activationFunction: ActivationFunction;
}

export type Labels =
  | "Linear"
  | "Conv"
  | "Conv1D"
  | "Conv2D"
  | "RNN"
  | "GRU"
  | "Flatten"
  | "MaxPool"
  | "MaxPool1D"
  | "MaxPool2D"
  | "Dropout";

export interface BaseLayer<L extends Labels> {
  id: string;
  label: L;
  color: string;
}

export interface LayerWithAF<L extends Labels> extends BaseLayer<L> {
  activationFunction: ActivationFunction;
}

export interface LayerWithParams<T> {
  params: T;
}

export type LayerWithNeurons = LayerWithParams<{
  inputNeurons: number;
  outputNeurons: number;
}>;

export type LinearLayer = LayerWithAF<"Linear"> & LayerWithNeurons;

export type ConvLayer = LayerWithAF<"Conv"> &
  LayerWithNeurons &
  LayerWithParams<{
    dimension: 1 | 2;
    kernelSize: number;
    stride: number;
    padding: number;
  }>;

export type RNNLayer = LayerWithAF<"RNN"> &
  LayerWithNeurons &
  LayerWithParams<{
    hiddenSize: number;
    dropout: number;
  }>;
// will be sent as a list ex: [1, 2]

export type GRULayer = LayerWithAF<"GRU"> &
  LayerWithNeurons &
  LayerWithParams<{
    hiddenSize: number;
    dropout: number;
  }>;

export type FlattenLayer = BaseLayer<"Flatten"> & {
  inputNeurons: number;
  startDimension: number;
  endDimension: number;
};

export type MaxPoolLayer = BaseLayer<"MaxPool"> &
  LayerWithParams<{
    dimension: 1 | 2;
    kernelSize: number;
    stride: number;
    padding: number;
  }>;

export type DropoutLayer = BaseLayer<"Dropout"> &
  LayerWithParams<{
    dropout: number;
  }>;

export type LayersToolbarMap = [
  LinearLayer,
  ConvLayer,
  RNNLayer,
  GRULayer,
  FlattenLayer,
  MaxPoolLayer,
  DropoutLayer,
];

// Union type for all specific layer types
export type UILayer =
  | LinearLayer
  | ConvLayer
  | RNNLayer
  | GRULayer
  | FlattenLayer
  | MaxPoolLayer
  | DropoutLayer;
