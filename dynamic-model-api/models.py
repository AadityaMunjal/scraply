import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import datasets, transforms
from torchvision.transforms import ToTensor
from torch.utils.data import DataLoader, TensorDataset
import torch.nn.functional as F
from sklearn.model_selection import train_test_split  # --> pip install scikit-learn
import math
from collections import Counter
import time
from params import DATALOADERS, LAYERS, ACTIVATIONS, LOSSES, OPTIMIZERS

# Import transformer-related classes from the new file
from transformer_models import (
    TransformerModel,
    PositionalEncoding,
    TransformerData,
    TransformerTrain,
    Inference,
)


# data loader + suggestions
# expected data example from the api


class DynamicModel(nn.Module):
    def __init__(self, layers):
        super().__init__()
        raw_layers = layers
        self.layer_list = []

        # Initialize feature_maps dictionary to store convolutional layer outputs during inference
        self.feature_maps = {}

        for l in raw_layers:
            component = None

            layer_type = l["kind"]
            if layer_type in LAYERS.keys():  # is a layer
                layer_args = l["args"]
                if layer_type == "Linear":
                    i, o = layer_args
                    component = nn.Linear(i, o)

                elif layer_type in ["Conv1D", "Conv2D", "Conv3D"]:
                    dim = layer_args[0]
                    i, o, k_size, stride, padding = layer_args[1:]
                    component = LAYERS[layer_type](dim, i, o, k_size, stride, padding)

                elif layer_type in ["LSTM", "GRU", "RNN"]:
                    i, h_size, dropout = layer_args
                    component = LAYERS[layer_type](i, h_size, dropout)

                elif layer_type == "Dropout":
                    p = layer_args
                    component = nn.Dropout(p)  # 1 arg

                elif layer_type == "Flatten":
                    start_dim = 1
                    end_dim = -1  # I AM FORCING 1,-1. CURRENT UI DOES NOT SUPPORT NEGATIVE DIMS. 6/28/25
                    # start_dim, end_dim = layer_args
                    component = nn.Flatten(start_dim, end_dim)

                elif layer_type in ["MaxPool1D", "MaxPool2D", "MaxPool3D"]:
                    dim = layer_args[0]
                    k_size, stride, padding = layer_args[1:]
                    component = LAYERS[layer_type](dim, k_size, stride, padding)

                if component is None:
                    print(f"Layer {layer_type} not recognized or not implemented.")

            elif layer_type in ACTIVATIONS.keys():  # is activation function
                component = ACTIVATIONS[layer_type]

            else:
                print("Invalid layer type")
                break

            self.layer_list.append(component)

        self.layers = nn.ModuleList(self.layer_list)

        # Register hooks for convolutional layers only
        self._register_conv_hooks()

    def _hook_fn(self, module, input, output):
        """Hook function that only activates in eval mode for convolutional layers"""
        if not self.training:  # Ensures it only runs in eval mode
            print(
                f"Forward Hook (Inference Only) - {module.__class__.__name__}: Output Shape {output.shape}"
            )
            self.feature_maps[module] = (
                output  # storing key-value pair in feature_maps dictionary
            )

    def _register_conv_hooks(self):
        """Register forward hooks on all convolutional layers"""
        for layer in self.layers:
            if isinstance(layer, (nn.Conv1d, nn.Conv2d, nn.Conv3d)):
                layer.register_forward_hook(self._hook_fn)

    def get_feature_maps(self):
        """Return the current feature maps dictionary"""
        return self.feature_maps

    def clear_feature_maps(self):
        """Clear the feature maps dictionary"""
        self.feature_maps.clear()

    def forward(self, x):
        for l in self.layers:
            x = l(x)

        return x


class Train:
    def __init__(self, model, input, loss, optimizer, batch_size):
        self.input = input
        ds = DATALOADERS[input]

        self.device = (  # for GPU access --> works with CPU as well
            "cuda"
            if torch.cuda.is_available()
            else "mps"
            if torch.backends.mps.is_available()
            else "cpu"
        )
        print(f"Using {self.device} device")

        # MOVE MODEL TO DEVICE
        self.model = model.to(self.device)

        # preprocessing data here!!!
        if input == "pima":
            X = ds["X"]
            y = ds["y"]

            # split test and training data using ski-kit learn module
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            # could normalize the data here
            # create tensors
            X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
            y_train_tensor = torch.tensor(y_train, dtype=torch.float32).reshape(
                -1, 1
            )  # Reshape for binary classification # SWITCHED FROM 1 1 TO -1 1
            X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
            y_test_tensor = torch.tensor(y_test, dtype=torch.float32).reshape(-1, 1)
            # create dataset objects
            train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
            test_dataset = TensorDataset(X_test_tensor, y_test_tensor)
            # create dataLoader objects
            self.train_loader = DataLoader(
                train_dataset, batch_size=batch_size, shuffle=True
            )
            self.test_loader = DataLoader(
                test_dataset, batch_size=batch_size, shuffle=False
            )
        else:
            train_set = ds["train"]
            test_set = ds["test"]
            self.train_loader = DataLoader(
                train_set, batch_size=batch_size, shuffle=True
            )
            self.test_loader = DataLoader(
                test_set, batch_size=batch_size, shuffle=False
            )

        self.loss_fn = LOSSES[loss]
        self.optimizer = OPTIMIZERS[optimizer["kind"]](
            self.model.parameters(), optimizer["lr"]
        )

        self.final_loss = -1

    def train(self, n_epochs, batch_size):
        size = len(self.train_loader.dataset)
        # num_batches = len(self.train_loader)
        self.model.train()
        train_loss = 0
        correct = 0
        total = 0

        for batch, (X, y) in enumerate(self.train_loader):
            X, y = X.to(self.device), y.to(self.device)
            # Compute prediction error
            pred = self.model(X)
            loss = self.loss_fn(pred, y)
            # Backpropagation
            loss.backward()
            self.optimizer.step()
            self.optimizer.zero_grad()
            train_loss += loss.item()

            if self.input == "pima":
                predicted = (
                    pred > 0.5
                ).float()  # apply threshold for binary classification
            else:
                _, predicted = torch.max(pred, 1)  # for multi-class classification

            # Get the predicted class (index with max value)
            correct += (predicted == y).sum().item()  # Count correct predictions
            total += y.size(0)  # Count total predictions

            if batch % 100 == 0:
                loss, current = loss.item(), (batch + 1) * len(X)
                # print(f"loss: {loss:>7f}  [{current:>5d}/{size:>5d}]")

        # Average loss over all batches
        avg_train_loss = train_loss / len(self.train_loader)
        # Calculate accuracy as a percentage
        avg_acc = 100 * correct / total
        return avg_train_loss, avg_acc

    def test(self, n_epochs, batch_size):
        size = len(self.test_loader.dataset)
        num_batches = len(self.test_loader)
        self.model.eval()  # model mode change is especially important for dropout layers
        test_loss, correct = 0, 0

        with torch.no_grad():
            for X, y in self.test_loader:
                X, y = X.to(self.device), y.to(self.device)
                # Compute prediction error
                pred = self.model(X)
                test_loss += self.loss_fn(pred, y).item()
                if self.input == "pima":
                    predicted = (pred > 0.5).type(torch.float)
                    correct += (predicted == y).sum().item()
                else:
                    correct += (
                        (pred.argmax(1) == y).type(torch.float).sum().item()
                    )  # for accuracy

        test_loss /= num_batches
        correct /= size
        avg_acc = 100 * correct

        # Average loss over all batches
        avg_test_loss = test_loss / len(self.test_loader)
        return avg_test_loss, avg_acc

    def train_test_log(self, n_epochs, batch_size):
        train_losses = []
        train_accs = []
        test_losses = []
        test_accs = []
        for t in range(n_epochs):
            print(f"Epoch {t + 1}/{n_epochs}...")
            avg_train_loss, train_avg_acc = self.train(n_epochs, batch_size)
            print(
                f"Train Loss: {avg_train_loss:.4f}, Train Accuracy: {train_avg_acc:.2f}%\n"
            )
            avg_test_loss, test_avg_acc = self.test(n_epochs, batch_size)
            print(
                f"Test Loss: {avg_test_loss:.4f}, Test Accuracy: {test_avg_acc:.2f}%\n"
            )

            # Store losses
            train_losses.append(float(avg_train_loss))
            train_accs.append(float(train_avg_acc))
            test_losses.append(float(avg_test_loss))
            test_accs.append(float(test_avg_acc))

        # calculate average accuracy and average loss
        avg_train_acc = sum(train_accs) / len(train_accs)
        avg_test_acc = sum(test_accs) / len(test_accs)
        avg_train_loss = sum(train_losses) / len(train_losses)
        avg_test_loss = sum(test_losses) / len(test_losses)

        print("Done!")
        # torch.cuda.empty_cache()

        # Change the losses arrays such that for each index it is {x: index, y: value}
        train_losses = [{"x": i, "y": v} for i, v in enumerate(train_losses)]
        test_losses = [{"x": i, "y": v} for i, v in enumerate(test_losses)]

        return {
            "train_losses": train_losses,
            "test_losses": test_losses,
            "avg_train_loss": avg_train_loss,
            "avg_test_loss": avg_test_loss,
            "avg_train_acc": avg_train_acc,
            "avg_test_acc": avg_test_acc,
        }

        # can add more information to this dictionary, like the saved model, best epochs, etc.
