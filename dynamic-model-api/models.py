import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import datasets, transforms
from torchvision.transforms import ToTensor
from torch.utils.data import DataLoader, TensorDataset
import torch.nn.functional as F
from sklearn.model_selection import train_test_split  # --> pip install scikit-learn
import math
from collections import Counter, defaultdict
import cv2  # --> pip install opencv-python
import time
import random
from params import DATALOADERS, LAYERS, ACTIVATIONS, LOSSES, OPTIMIZERS
import os
import numpy as np
from scipy.special import entr
import matplotlib
import base64
import json
from io import BytesIO

matplotlib.use("Agg")  # Set the backend to non-interactive Agg
import matplotlib.pyplot as plt

# Import transformer-related classes from the new file
from transformer_models import (
    TransformerModel,
    PositionalEncoding,
    TransformerData,
    TransformerTrain,
    Inference,
)


class ConditionalActivationSaver:
    def __init__(self, model):
        self.model = model

    def hook(self, module, input, output):
        if self.model.feature_save and not self.model.training:
            self.model.feature_maps[module] = output.detach().clone()


class DynamicModel(nn.Module):
    def __init__(self, layers):
        super().__init__()
        raw_layers = layers
        self.layer_list = []
        self.feature_save = False
        self.isConv = False  # set to true if the model has a convolutional layer

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
                    self.isConv = True

                elif layer_type in ["LSTM", "GRU", "RNN"]:
                    i, h_size, dropout = layer_args
                    component = LAYERS[layer_type](i, h_size, dropout)

                elif layer_type == "Dropout":
                    p = layer_args[0]
                    component = nn.Dropout(p)  # 1 arg

                elif layer_type == "Flatten":
                    start_dim = 1
                    end_dim = (
                        -1
                    )  # I AM FORCING 1,-1. CURRENT UI DOES NOT SUPPORT NEGATIVE DIMS. 6/28/25
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

            # if the layer is convolutional then just put the fries in the bag bro (jk)

            self.layer_list.append(component)

        self.layers = nn.ModuleList(self.layer_list)

        # Register hooks for convolutional layers only
        saver = ConditionalActivationSaver(self)  # pass in the model to the saver
        # saver.save = self.feature_save  # set the save flag to the feature_save flag
        self._register_conv_hooks(saver.hook)

    def _register_conv_hooks(self, hook_fn):
        """Register forward hooks on all convolutional layers"""
        for layer in self.layers:
            if isinstance(layer, (nn.Conv1d, nn.Conv2d, nn.Conv3d)):
                layer.register_forward_hook(hook_fn)

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

    # # In evaluation:
    # saver.save = True
    # _ = model(input_data)  # this will save activations
    # saver.save = False
    # _ = model(input_data)  # this will skip saving


class Train:
    # in training.
    # i want to not do anything with the feature maps. flag must be set to false

    # during testing, i stil do not want to save the feature maps.

    # then after training, i need to pick 3 random images from the 10 predicted classes and save the indicies.
    # create folder for each class. save the images in the folder.
    # create a dictionary for each class. save images and their peek map images in it like this: placeholder_img_b64 = base64.b64encode(b"_placeholdetext__" + bytes(str(i), 'utf-8')).decode('utf-8')
    # then i need to get the 3 lowest class acurracies and get 3 incorrect predictions from each of the 3 lowest class acurracies. and save the indicies
    # include true and predicted labels in the dictionary

    # create a folder for the 3 lowest class acurracies. save the images in the folder.
    # create a dictionary for the 3 lowest class acurracies. save images and their peek map images in it like this: placeholder_img_b64 = base64.b64encode(b"_placeholdetext__" + bytes(str(i), 'utf-8')).decode('utf-8').
    # include true and predicted labels in the dictionary

    # each peek map MUST be a SEPERATE IMAGE. i DO NOT WANT TO SAVE THEM AS A SINGLE IMAGE.
    def __init__(self, model, input, loss, optimizer, batch_size):
        self.input = input
        self.num_classes = (
            0  # this will be set to the number of classes in the dataset (hopefully)
        )
        ds = DATALOADERS[input]

        self.device = (  # for GPU access --> works with CPU as well
            "cuda"
            if torch.cuda.is_available()
            else "mps" if torch.backends.mps.is_available() else "cpu"
        )
        print(f"Using {self.device} device")

        # MOVE MODEL TO DEVICE
        self.model = model.to(self.device)

        # preprocessing data here!!!
        if self.input == "pima":
            self.num_classes = 2
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
            self.num_classes = (
                len(train_set.classes)
                if hasattr(train_set, "classes")
                else len(torch.unique(torch.tensor([label for _, label in train_set])))
            )  # this might not work chat :D
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
        self.model.feature_save = False  # set the feature_save flag to false
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

        # Average loss over all batches
        avg_train_loss = train_loss / len(self.train_loader)
        # Calculate accuracy as a percentage
        avg_acc = 100 * correct / total
        return avg_train_loss, avg_acc

    def test(self, output_info=False):
        self.model.feature_save = False  # set the feature_save flag to false
        self.model.eval()  # model mode change is especially important for dropout layers

        all_predictions = []
        all_labels = []
        all_indices = []

        test_loss, correct, total = 0, 0, 0  # Add total for accuracy calculation

        with torch.no_grad():
            for idx, (X, y) in enumerate(
                self.test_loader
            ):  # this might not work with pima
                X, y = X.to(self.device), y.to(self.device)
                # Compute prediction error
                pred = self.model(X)  # outputs
                test_loss += self.loss_fn(pred, y).item()
                if self.input == "pima":
                    predicted = (pred > 0.5).type(torch.float)
                    correct += (predicted == y).sum().item()
                else:
                    _, predicted = torch.max(pred, 1)  # Get predicted class indices
                    correct += (predicted == y).sum().item()  # for accuracy

                total += y.size(0)  # Count total predictions
                if output_info and self.input != "pima":
                    all_predictions.extend(predicted.cpu().numpy().tolist())
                    all_labels.extend(y.cpu().numpy().tolist())
                    all_indices.extend([idx * y.size(0) + i for i in range(y.size(0))])

        if output_info and self.input != "pima":
            # Calculate per-class accuracy
            class_correct = defaultdict(int)
            class_total = defaultdict(int)
            class_predictions = defaultdict(
                list
            )  # Store (idx, true_label, pred_label) for each class
            # class_predictions is a dictionary of lists. each list contains (idx, true_label, pred_label)
            # ex: class_predictions[class_label] = [(idx, true_label, pred_label), (idx, true_label, pred_label), (idx, true_label, pred_label)]
            # ex: class_predictions[class_label] = [(idx, true_label, pred_label), (idx, true_label, pred_label), (idx, true_label, pred_label)]

            for idx, (true_label, pred_label) in enumerate(
                zip(all_labels, all_predictions)
            ):
                class_total[true_label] += 1
                class_predictions[true_label].append((idx, true_label, pred_label))

                if true_label == pred_label:
                    class_correct[true_label] += 1

            # Calculate accuracy for each class
            class_accuracy = {}
            for class_label in range(self.num_classes):
                if class_total[class_label] > 0:
                    class_accuracy[class_label] = (
                        class_correct[class_label] / class_total[class_label]
                    )
                else:
                    class_accuracy[class_label] = 0.0

            # get the 3 lowest class acurracies
            sorted_classes = sorted(class_accuracy.items(), key=lambda x: x[1])
            lowest_accuracy_classes = [
                class_label for class_label, accuracy in sorted_classes[:3]
            ]
            lowest_accuracy_classes_info = {}
            for class_label in lowest_accuracy_classes:
                lowest_accuracy_classes_info[class_label] = class_predictions[
                    class_label
                ]

            print(f"\n3 lowest accuracy classes: {lowest_accuracy_classes}")

            # # Get random predictions per class (3 per class)
            print("\nGetting random predictions per class...")
            random_samples = self.get_random_predictions_per_class(
                class_predictions, num_samples=3
            )

            # now we have random_samples which is a dictionary of lists. each list contains (idx, true_label, pred_label)
            # so basically these means that we now have our image indicies from the test set

            # Get misclassified samples for lowest accuracy classes
            print("Getting misclassified samples for lowest accuracy classes...")
            misclassified_samples = self.get_misclassified_samples(
                lowest_accuracy_classes_info, num_samples=3
            )

            # now we have misclassified_samples which is a dictionary of lists. each list contains (idx, true_label, pred_label)
            # so basically these means that we now have our image indicies from the test set

            # then generate a peek for each if model.isConv is true. --> I THINK I WILL DO THIS OUTSIDE OF THE TEST FUNCTION

        # returning test loss here :)
        avg_test_loss = test_loss / len(self.test_loader)
        avg_acc = 100 * correct / total

        if output_info and self.input != "pima":
            return avg_test_loss, avg_acc, random_samples, misclassified_samples
        else:
            return avg_test_loss, avg_acc  # ORIGINAL OUTPUT

    def get_random_predictions_per_class(
        self, class_predictions, num_samples=3
    ):  # BEWARE: THIS IS VIBE CODED
        """Get random samples for each class (regardless of prediction correctness)"""
        random_samples = {}

        for class_label in range(10):
            if class_label in class_predictions:
                # Get all predictions for this class
                samples = class_predictions[class_label]
                # Randomly sample up to num_samples
                if len(samples) >= num_samples:
                    random_samples[class_label] = random.sample(samples, num_samples)
                else:
                    random_samples[class_label] = samples

        return random_samples

    def get_misclassified_samples(
        self, class_predictions, num_samples=3
    ):  # BEWARE: THIS IS VIBE CODED
        """Get misclassified samples for each class"""
        misclassified_samples = {}

        for class_label in range(self.num_classes):  # self.num_classes might not work.
            if class_label in class_predictions:
                # Get only misclassified samples for this class
                misclassified = [
                    (idx, true_label, pred_label)
                    for idx, true_label, pred_label in class_predictions[class_label]
                    if true_label != pred_label
                ]

                if len(misclassified) >= num_samples:
                    misclassified_samples[class_label] = random.sample(
                        misclassified, num_samples
                    )
                else:
                    misclassified_samples[class_label] = misclassified

        return misclassified_samples

    def process_image_samples(self, samples_dict, base_dir):
        """Process and save images and peek maps for a given set of samples.

        Args:
            samples_dict (dict): Dictionary containing samples in format {class_label: [(idx, true_label, pred_label), ...]}
            base_dir (str): Base directory to save the images and peek maps
        """
        if self.input == "pima":  # Skip processing for non-image datasets
            return

        os.makedirs(base_dir, exist_ok=True)
        print(f"Processing samples in directory: {base_dir}")

        for class_label, samples in samples_dict.items():
            class_dir = os.path.join(base_dir, f"class_{class_label}")
            os.makedirs(class_dir, exist_ok=True)

            for idx, true_label, pred_label in samples:
                image, _ = self.test_loader.dataset[idx]
                image = image.unsqueeze(0).to(self.device)

                # Get image dimensions
                if len(image.shape) == 4:  # B, C, H, W format
                    _, _, h, w = image.shape
                elif len(image.shape) == 3:  # C, H, W format
                    _, h, w = image.shape
                else:  # H, W format
                    h, w = image.shape

                self.model.feature_save = True  # Enable feature map saving
                with torch.no_grad():
                    output = self.model(image)

                    # Save original image
                    image_np = image[0, 0].cpu().numpy()
                    image_np = (
                        (image_np - image_np.min())
                        * (255.0 / (image_np.max() - image_np.min()))
                    ).astype(np.uint8)
                    image_np = cv2.resize(
                        image_np, (400, 400), interpolation=cv2.INTER_NEAREST
                    )
                    cv2.imwrite(
                        os.path.join(class_dir, f"image_{idx}_original.png"), image_np
                    )

                    if self.model.isConv:
                        # Process feature maps for convolutional layers
                        feature_maps = self.model.feature_maps
                        for layer, fmap in feature_maps.items():
                            fmap = fmap.cpu().numpy()
                            fmap = fmap[0]  # Remove batch dimension
                            fmap = np.moveaxis(fmap, 0, -1)  # Rearrange channels
                            peek_map = self.compute_PEEK(fmap, h, w)

                            # Create peek map overlay
                            peek_map_norm = (peek_map - peek_map.min()) / (
                                peek_map.max() - peek_map.min()
                            )
                            peek_map_norm = cv2.resize(
                                peek_map_norm,
                                (400, 400),
                                interpolation=cv2.INTER_NEAREST,
                            )
                            heatmap = cv2.applyColorMap(
                                (peek_map_norm * 255).astype(np.uint8), cv2.COLORMAP_JET
                            )
                            overlay = cv2.addWeighted(
                                cv2.cvtColor(image_np, cv2.COLOR_GRAY2BGR),
                                0.3,
                                heatmap,
                                0.7,
                                0,
                            )

                            cv2.imwrite(
                                os.path.join(class_dir, f"image_{idx}_{layer}.png"),
                                overlay,
                            )
                            print(
                                f"Saved original image and peek map for class {true_label}, sample {idx}"
                            )
                    else:
                        print(
                            f"Saved original image for class {true_label}, sample {idx} (no convolutional layers)"
                        )

                self.model.feature_save = False  # Disable feature map saving
                self.model.clear_feature_maps()  # Clear stored feature maps

    def train_test_log(self, n_epochs, batch_size):
        # i think it would be a good idea to do the images stuff in here
        # # this needs to be a stream
        # # DUMMY EXAMPLE:
        # def train_and_stream():
        # for epoch in range(1, 6):
        # # Simulate training metrics
        #     data = {"epoch": epoch, "loss": 0.1*epoch, "accuracy": 0.9 - 0.05*epoch}
        #     yield f"data: {data}\n\n"
        #     time.sleep(1)  # simulate time per epoch

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

            if t != n_epochs - 1 or self.input == "pima":
                avg_test_loss, test_avg_acc = self.test(output_info=False)
            else:
                avg_test_loss, test_avg_acc, random_samples, misclassified_samples = (
                    self.test(output_info=True)
                )

                # example of random_samples:
                # random_samples {0: [(9527, 0, 0), (7279, 0, 0), (3660, 0, 0)], 1: [(1939, 1, 1), (5831, 1, 1), ...
                # (idx, true_label, pred_label) --> idx is the index of the image in the test set
                # dictionary key is the class label

                # example of misclassified_samples: # ALL ARE MISCLASSIFIED EXAMPLES
                # misclassified_samples {2: [(9527, 2, 0), (7279, 2, 0), (3660, 2, 1)], 4: [(1939, 4, 6), (5831, 4, 9), ...

                # Create directory for random samples if it doesn't exist
                print("----------processing random samples-----------")
                if self.input != "pima":  # Only process images for non-pima datasets
                    # Process random samples
                    base_dir = "cnn_analysis_results"
                    os.makedirs(base_dir, exist_ok=True)

                    # Dictionary to store base64 encoded images
                    RANDOM_SAMPLES_ENCODED = {}

                    for key in random_samples.keys():  # key is the class label
                        class_dir = os.path.join(base_dir, f"class_{key}")
                        os.makedirs(class_dir, exist_ok=True)
                        RANDOM_SAMPLES_ENCODED[key] = []

                        for idx, true_label, pred_label in random_samples[key]:
                            image, _ = self.test_loader.dataset[idx]
                            image = image.unsqueeze(0).to(self.device)

                            # Get dimensions
                            if len(image.shape) == 4:  # B, C, H, W format
                                _, _, h, w = image.shape
                            elif len(image.shape) == 3:  # C, H, W format
                                _, h, w = image.shape
                            else:  # H, W format
                                h, w = image.shape

                            self.model.feature_save = True
                            with torch.no_grad():
                                output = self.model(image)

                                # Save original image
                                image_np = image[0, 0].cpu().numpy()
                                image_np = (
                                    (image_np - image_np.min())
                                    * (255.0 / (image_np.max() - image_np.min()))
                                ).astype(np.uint8)
                                image_np = cv2.resize(
                                    image_np,
                                    (400, 400),
                                    interpolation=cv2.INTER_NEAREST,
                                )

                                # Save to disk
                                cv2.imwrite(
                                    os.path.join(
                                        class_dir, f"image_{idx}_original.png"
                                    ),
                                    image_np,
                                )

                                # Base64 encode original image
                                _, buffer = cv2.imencode(".png", image_np)
                                img_b64 = base64.b64encode(buffer.tobytes()).decode(
                                    "utf-8"
                                )
                                image_data = {
                                    "original": img_b64,
                                    "peek_maps": [],
                                    "true_label": int(true_label),
                                    "pred_label": int(pred_label),
                                    "idx": idx,
                                }

                                if self.model.isConv:
                                    # Process feature maps
                                    feature_maps = self.model.feature_maps
                                    for layer, fmap in feature_maps.items():
                                        fmap = fmap.cpu().numpy()
                                        fmap = fmap[0]  # Remove batch dimension
                                        fmap = np.moveaxis(
                                            fmap, 0, -1
                                        )  # Rearrange channels
                                        peek_map = self.compute_PEEK(fmap, h, w)

                                        # Create peek map overlay
                                        peek_map_norm = (peek_map - peek_map.min()) / (
                                            peek_map.max() - peek_map.min()
                                        )
                                        peek_map_norm = cv2.resize(
                                            peek_map_norm,
                                            (400, 400),
                                            interpolation=cv2.INTER_NEAREST,
                                        )
                                        heatmap = cv2.applyColorMap(
                                            (peek_map_norm * 255).astype(np.uint8),
                                            cv2.COLORMAP_JET,
                                        )
                                        overlay = cv2.addWeighted(
                                            cv2.cvtColor(image_np, cv2.COLOR_GRAY2BGR),
                                            0.3,
                                            heatmap,
                                            0.7,
                                            0,
                                        )

                                        # Save to disk
                                        cv2.imwrite(
                                            os.path.join(
                                                class_dir, f"image_{idx}_{layer}.png"
                                            ),
                                            overlay,
                                        )

                                        # Base64 encode peek map
                                        _, buffer = cv2.imencode(".png", overlay)
                                        peek_b64 = base64.b64encode(
                                            buffer.tobytes()
                                        ).decode("utf-8")
                                        image_data["peek_maps"].append(
                                            {"layer": str(layer), "image": peek_b64}
                                        )

                                        print(
                                            f"Saved original image and peek map for class {true_label}, sample {idx}"
                                        )

                                RANDOM_SAMPLES_ENCODED[key].append(image_data)

                                self.model.feature_save = False
                                self.model.clear_feature_maps()
                else:
                    print("Skipping image processing for pima dataset")

                print("--------processing misclassified samples-----------")
                if self.input != "pima":  # Only process images for non-pima datasets
                    # Process misclassified samples
                    base_dir = os.path.join(
                        "cnn_analysis_results", "lowest_accuracy_classes"
                    )
                    os.makedirs(base_dir, exist_ok=True)

                    # Dictionary to store base64 encoded misclassified images
                    MISCLASSIFIED_SAMPLES_ENCODED = {}

                    # Reorganize misclassified samples by predicted label
                    pred_label_samples = {}
                    for true_class, samples in misclassified_samples.items():
                        for idx, true_label, pred_label in samples:
                            if pred_label not in pred_label_samples:
                                pred_label_samples[pred_label] = []
                            pred_label_samples[pred_label].append(
                                (idx, true_label, pred_label)
                            )

                    # Now process samples grouped by predicted label
                    for pred_label, samples in pred_label_samples.items():
                        class_dir = os.path.join(base_dir, f"misclass_to_{pred_label}")
                        os.makedirs(class_dir, exist_ok=True)
                        MISCLASSIFIED_SAMPLES_ENCODED[pred_label] = []

                        for idx, true_label, pred_label in samples:
                            image, _ = self.test_loader.dataset[idx]
                            image = image.unsqueeze(0).to(self.device)

                            # Get dimensions
                            if len(image.shape) == 4:  # B, C, H, W format
                                _, _, h, w = image.shape
                            elif len(image.shape) == 3:  # C, H, W format
                                _, h, w = image.shape
                            else:  # H, W format
                                h, w = image.shape

                            self.model.feature_save = True
                            with torch.no_grad():
                                output = self.model(image)

                                # Save original image
                                image_np = image[0, 0].cpu().numpy()
                                image_np = (
                                    (image_np - image_np.min())
                                    * (255.0 / (image_np.max() - image_np.min()))
                                ).astype(np.uint8)
                                image_np = cv2.resize(
                                    image_np,
                                    (400, 400),
                                    interpolation=cv2.INTER_NEAREST,
                                )

                                # Save to disk
                                cv2.imwrite(
                                    os.path.join(
                                        class_dir,
                                        f"true_{true_label}_pred_{pred_label}_idx_{idx}_original.png",
                                    ),
                                    image_np,
                                )

                                # Base64 encode original image
                                _, buffer = cv2.imencode(".png", image_np)
                                img_b64 = base64.b64encode(buffer.tobytes()).decode(
                                    "utf-8"
                                )
                                image_data = {
                                    "original": img_b64,
                                    "peek_maps": [],
                                    "true_label": int(true_label),
                                    "pred_label": int(pred_label),
                                    "idx": idx,
                                }

                                if self.model.isConv:
                                    # Process feature maps
                                    feature_maps = self.model.feature_maps
                                    for layer, fmap in feature_maps.items():
                                        fmap = fmap.cpu().numpy()
                                        fmap = fmap[0]  # Remove batch dimension
                                        fmap = np.moveaxis(
                                            fmap, 0, -1
                                        )  # Rearrange channels
                                        peek_map = self.compute_PEEK(fmap, h, w)

                                        # Create peek map overlay
                                        peek_map_norm = (peek_map - peek_map.min()) / (
                                            peek_map.max() - peek_map.min()
                                        )
                                        peek_map_norm = cv2.resize(
                                            peek_map_norm,
                                            (400, 400),
                                            interpolation=cv2.INTER_NEAREST,
                                        )
                                        heatmap = cv2.applyColorMap(
                                            (peek_map_norm * 255).astype(np.uint8),
                                            cv2.COLORMAP_JET,
                                        )
                                        overlay = cv2.addWeighted(
                                            cv2.cvtColor(image_np, cv2.COLOR_GRAY2BGR),
                                            0.3,
                                            heatmap,
                                            0.7,
                                            0,
                                        )

                                        # Save to disk
                                        cv2.imwrite(
                                            os.path.join(
                                                class_dir,
                                                f"true_{true_label}_pred_{pred_label}_idx_{idx}_{layer}.png",
                                            ),
                                            overlay,
                                        )

                                        # Base64 encode peek map
                                        _, buffer = cv2.imencode(".png", overlay)
                                        peek_b64 = base64.b64encode(
                                            buffer.tobytes()
                                        ).decode("utf-8")
                                        image_data["peek_maps"].append(
                                            {"layer": str(layer), "image": peek_b64}
                                        )

                                        print(
                                            f"Saved original image and peek map for misclassified sample (true: {true_label}, pred: {pred_label})"
                                        )

                                MISCLASSIFIED_SAMPLES_ENCODED[pred_label].append(
                                    image_data
                                )

                                self.model.feature_save = False
                                self.model.clear_feature_maps()
                else:
                    print("Skipping misclassified samples processing for pima dataset")

            print("LEGACY OUTPUT. do not mess with this lil bro")
            print(
                f"Test Loss: {avg_test_loss:.4f}, Test Accuracy: {test_avg_acc:.2f}%\n"
            )

            # Store losses
            train_losses.append(float(avg_train_loss))
            train_accs.append(float(train_avg_acc))
            test_losses.append(float(avg_test_loss))
            test_accs.append(float(test_avg_acc))

        # for loop has ended so we are in after last epoch right now

        print("---------------------------------------------")
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

        ORIGINAL_OUTPUT = {
            "train_losses": train_losses,
            "test_losses": test_losses,
            "avg_train_loss": avg_train_loss,
            "avg_test_loss": avg_test_loss,
            "avg_train_acc": avg_train_acc,
            "avg_test_acc": avg_test_acc,
        }

        if self.input != "pima":
            # Return three separate dictionaries
            # return ORIGINAL_OUTPUT, RANDOM_SAMPLES_ENCODED, MISCLASSIFIED_SAMPLES_ENCODED
            return ORIGINAL_OUTPUT
        else:
            # return ORIGINAL_OUTPUT, {}, {}  # Return empty dicts for non-image datasets
            return ORIGINAL_OUTPUT

    def generate_peek_dict(self, random_samples, misclassified_samples):
        print("hello")
        # returns two dictionaries. one for random_sampples and one for misclassified_samples
        # each dictionary contains keys of the class labels.
        # the value is another dictonary that contains: true label, original image, [peek map image, peek map image, peek map image]
        # the number of peek maps in the list is equal to the number of Conv layers in the model

    def generate_image_dict(self, random_samples, misclassified_samples):
        print("hello")
        # does everything that generate peek dict except for any peek map related stuff
        # this is the same as generate_peek_dict but without the peek map related stuff

    def compute_PEEK(self, feature_maps, h, w):
        """Compute PEEK map from feature maps"""
        positivized_maps = feature_maps + np.abs(np.min(feature_maps))
        entropy_map = -np.sum(entr(positivized_maps), axis=-1)
        peek_map = cv2.resize(entropy_map, (w, h))
        return peek_map


if __name__ == "__main__":
    # example data
    print("pima linear layer test")
    data = {
        "input": "pima",
        "layers": [
            {"kind": "Linear", "args": (8, 12)},
            {"kind": "ReLU"},
            {"kind": "Linear", "args": (12, 8)},
            {"kind": "ReLU"},
            {"kind": "Linear", "args": (8, 1)},
            {"kind": "Sigmoid"},
        ],
        "loss": "BCE",
        "optimizer": {"kind": "Adam", "lr": 0.001},
        "epoch": 3,
        "batch_size": 10,
    }

    inp = data["input"]
    layers = data["layers"]
    loss = data["loss"]
    optimizer = data["optimizer"]
    n_epochs = data["epoch"]
    batch_size = data["batch_size"]

    RESULTS = {}

    model = DynamicModel(layers)

    t = Train(
        model=model,
        input=inp,
        loss=loss,
        optimizer=optimizer,
        batch_size=batch_size,
    )

    RESULTS = t.train_test_log(n_epochs, batch_size)

    print(RESULTS)

    print("mnist cnn test")

    data = {
        "input": "MNIST",
        "layers": [
            {
                "kind": "Conv2D",
                "args": (2, 1, 16, 3, 1, 0),
            },  # dim, input, output, kernel size, stride, padding.
            # dim is a fake arg we made up so we just ignore it in the actual api. same for maxpool layers.
            {"kind": "ReLU"},
            {"kind": "MaxPool2D", "args": (2, 2, 2, 0)},
            {"kind": "Conv2D", "args": (2, 16, 32, 3, 1, 0)},
            {"kind": "ReLU"},
            {"kind": "MaxPool2D", "args": (2, 2, 2, 0)},
            {"kind": "Flatten", "args": [1, -1]},
            {"kind": "Linear", "args": (800, 128)},  # supposed to be 32 * 7 * 7
            {"kind": "ReLU"},
            {"kind": "Linear", "args": (128, 10)},
        ],
        "loss": "CrossEntropy",
        "optimizer": {"kind": "Adam", "lr": 0.001},
        "epoch": 2,
        "batch_size": 64,
    }

    inp = data["input"]
    layers = data["layers"]
    loss = data["loss"]
    optimizer = data["optimizer"]
    n_epochs = data["epoch"]
    batch_size = data["batch_size"]

    RESULTS = {}

    model = DynamicModel(layers)

    t = Train(
        model=model,
        input=inp,
        loss=loss,
        optimizer=optimizer,
        batch_size=batch_size,
    )

    RESULTS = t.train_test_log(n_epochs, batch_size)
