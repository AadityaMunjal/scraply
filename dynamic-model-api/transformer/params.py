import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
from collections import Counter

from torch.utils.data import Dataset
from torchvision import datasets
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.transforms import ToTensor
import torch.nn.functional as F
import matplotlib.pyplot as plt


DATALOADERS = {
    "alice": {  # dataset for decoder-only transformer, demonstrating text generation
        "file": "datasets/alice_1.txt"
    },
    "shakespeare": {"file": "datasets/shakespeare.txt"},
}


ACTIVATIONS = {
    "ReLU": nn.ReLU(),
    "Sigmoid": nn.Sigmoid(),
    "Tanh": nn.Tanh(),
    "Softmax": nn.Softmax(dim=1), # forcing dim=1, as this is usually the case. 
    "LeakyReLU": nn.LeakyReLU(),
    "PReLU": nn.PReLU(),
}


LAYERS = {
    "Dropout": lambda p: nn.Dropout(p),  # need to add functionality for dropout layer?
    "Decoder": lambda embed_dim, heads, hidden_dim: nn.TransformerDecoderLayer(d_model=embed_dim, nhead=heads, dim_feedforward=hidden_dim, batch_first=True),  # USE IMPORTED CLASS FOR CONSTRUCTING DECODER HERE
    "Output": lambda p: nn.Dropout(p),
    # Output: [nn.Dropout(p), nn.Linear(embed_dim, vocab_size)], # would need to also access Linear layer after the dropout. Linear dimensions will be (embed_dim, vocab_size)
}


LOSSES = {
    "BCE": nn.BCELoss(),  # binary cross entropy --> 0 or 1 classification models
    "CrossEntropy": nn.CrossEntropyLoss(),  # multi-class classification models (including CNN)
    # "MSE": nn.MSELoss() # regression models
    "BCEWithLogitsLoss": nn.BCEWithLogitsLoss(),  # with logits for CNN binary classification
}

OPTIMIZERS = {
    "Adam": lambda model_params, lr: optim.Adam(model_params, lr),  # momentum parameter is optional
    "AdamW": lambda model_params, lr: optim.AdamW(model_params, lr),
    "SGD": lambda model_params, lr: optim.SGD(model_params, lr),
    "RMSprop": lambda model_params, lr: optim.RMSprop(model_params, lr),
}
