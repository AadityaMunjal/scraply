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

export interface LayerWithAF extends BaseLayer {
  activationFunction: ActivationFunction;
}

export interface LayerWithParams<T> {
  params: T;
}

export type LayerWithNeurons = LayerWithParams<{
  inputNeurons: number;
  outputNeurons: number;
}>;

export type LinearLayer = LayerWithAF & LayerWithNeurons;

export type ConvLayer = LayerWithAF &
  LayerWithNeurons &
  LayerWithParams<{
    dimension: 1 | 2;
    kernelSize: number;
    stride: number;
    padding: number;
  }>;

export type RNNLayer = LayerWithAF &
  LayerWithNeurons &
  LayerWithParams<{
    hiddenSize: number;
    dropout: number;
  }>;
  // will be sent as a list ex: [1, 2]

export type GRULayer = LayerWithAF &
  LayerWithNeurons &
  LayerWithParams<{
    hiddenSize: number;
    dropout: number;
  }>;

export type FlattenLayer = BaseLayer & {
  inputNeurons: number;
  startDimension: number;
  endDimension: number;
};

export type MaxPoolLayer = BaseLayer &
  LayerWithParams<{
    dimension: 1 | 2;
    kernelSize: number;
    stride: number;
    padding: number;
  }>;

export type DropoutLayer = BaseLayer &
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
