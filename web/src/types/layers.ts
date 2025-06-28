export type ActivationFunction =
  | "ReLU"
  | "Sigmoid"
  | "Tanh"
  | "Softmax"
  | "LeakyReLU"
  | "PReLU";

export interface LegacyUILayer {
  id: string;
  label: string;
  color: string;
  inputNeurons: number;
  outputNeurons: number;
  otherParams?: Record<string, number>;
  activationFunction: ActivationFunction;
}

export interface BaseLayer {
  id: string;
  label: string;
  color: string;
}

export interface LayerWithNeurons extends BaseLayer {
  inputNeurons: number;
  outputNeurons: number;
}

export interface LayerWithNeuronsAndAF extends LayerWithNeurons {
  activationFunction: ActivationFunction;
}

export interface LayerWithOtherParams<T> {
  otherParams: T;
}

export type LinearLayer = LayerWithNeuronsAndAF;

export type ConvLayer = LayerWithNeuronsAndAF &
  LayerWithOtherParams<{
    dimension: 1 | 2;
    kernelSize: number;
    stride: number;
    padding: number;
  }>;

export type RNNLayer = LayerWithNeuronsAndAF &
  LayerWithOtherParams<{
    hiddenSize: number;
    dropout: number;
  }>;

export type GRULayer = LayerWithNeuronsAndAF &
  LayerWithOtherParams<{
    hiddenSize: number;
    dropout: number;
  }>;

export type FlattenLayer = LayerWithNeurons;

export type MaxPoolLayer = BaseLayer &
  LayerWithOtherParams<{
    dimension: 1 | 2;
    kernelSize: number;
    stride: number;
    padding: number;
  }>;

export type DropoutLayer = BaseLayer &
  LayerWithOtherParams<{
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
