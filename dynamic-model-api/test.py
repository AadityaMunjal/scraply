import requests


# ---- for testing linear layers -----
URL = "http://127.0.0.1:5000/train"

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

print("ok, sending training request to the server...")

try:
    response = requests.post(URL, json=data)
    # Print the response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except:
    print("url not found")




# # ------ for testing transformer inference ------
# URL = "http://127.0.0.1:5000/transformertest"

# data = {
#     "temperature": 0.5,
#     "prompt": "Alice was sleepy",
# }


# print("OH YEAHHAHAH IT WORKEDDDD AaAAAAaaAAA!")


# try:
#     response = requests.post(URL, json=data)
#     # Print the response
#     print(f"Status Code: {response.status_code}")
#     print(f"Response: {response.json()}")
# except:
#     print("url not found")




# # ------ for testing transformer training ------
# URL = "http://127.0.0.1:5000/transformertrain"

# data = {
#     "input": "alice",  # preprocess
#     "layers": [
#         {"kind": "Decoder", "args": (100, 2, 2048)},
#         {"kind": "Decoder", "args": (100, 2, 2048)},
#         {"kind": "Output", "args": 0.3},
#     ],
#     "loss": "CrossEntropy",
#     "optimizer": {"kind": "Adam", "lr": 0.001},
#     "epoch": 2,
#     "batch_size": 32,
# }

# print("ok, sending transformer training request to the server...")

# try:
#     response = requests.post(URL, json=data)
#     # Print the response
#     print(f"Status Code: {response.status_code}")
#     print(f"Response: {response.json()}")
# except:
#     print("url not found")



# # ------ for testing CNN stuff (MNIST) ------

URL = "http://127.0.0.1:5000/train"

mnist_data = {
    "input": "MNIST",
    "layers": [
        {"kind": "Conv2D", "args": (2, 1, 16, 3, 1, 0)}, # dim, input, output, kernel size, stride, padding. 
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

print("ok, sending MNIST training request to the server...")

try:
    response = requests.post(URL, json=mnist_data)
    # Print the response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except:
    print("url not found")

import shutil
import os

# # delete cnn_analysis_results folder to do a consecutive test

# # cnn_results_folder = "cnn_analysis_results"
# # if os.path.exists(cnn_results_folder) and os.path.isdir(cnn_results_folder):
# #     try:
# #         shutil.rmtree(cnn_results_folder)
# #         print(f"Deleted folder: {cnn_results_folder}")
# #     except Exception as e:
# #         print(f"Failed to delete {cnn_results_folder}: {e}")
# # else:
# #     print(f"Folder {cnn_results_folder} does not exist.")

# # ------ for testing CNN stuff (CIFAR10) ------

cifar10_data = {
    "input": "CIFAR10",
    "layers": [
        {"kind": "Conv2D", "args": (2, 3, 16, 3, 1, 1)},  # For CIFAR10: input channels=3 (RGB), output=16, kernel=3x3, stride=1, padding=1
        {"kind": "ReLU"},
        {"kind": "MaxPool2D", "args": (2, 2, 2, 0)},  # kernel=2, stride=2, padding=0
        {"kind": "Conv2D", "args": (2, 16, 32, 3, 1, 1)},  # input=16, output=32, kernel=3x3, stride=1, padding=1
        {"kind": "ReLU"},
        {"kind": "MaxPool2D", "args": (2, 2, 2, 0)},
        {"kind": "Flatten", "args": [1, -1]},
        {"kind": "Linear", "args": (8 * 8 * 32, 128)},  # 32 channels, 8x8 after pooling
        {"kind": "ReLU"},
        {"kind": "Linear", "args": (128, 10)},  # 10 classes for CIFAR10
    ],
    "loss": "CrossEntropy",
    "optimizer": {"kind": "Adam", "lr": 0.001},
    "epoch": 2,
    "batch_size": 64,
}

print("ok, sending CIFAR10 training request to the server...")

try:
    response = requests.post(URL, json=cifar10_data)
    # Print the response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except:
    print("url not found")