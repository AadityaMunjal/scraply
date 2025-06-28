import requests


# # ---- for testing linear layers -----
# URL = "http://127.0.0.1:5000/train"

# data = {
#     "input": "pima",
#     "layers": [
#         {"kind": "Linear", "args": (8, 12)},
#         {"kind": "ReLU"},
#         {"kind": "Linear", "args": (12, 8)},
#         {"kind": "ReLU"},
#         {"kind": "Linear", "args": (8, 1)},
#         {"kind": "Sigmoid"},
#     ],
#     "loss": "BCE",
#     "optimizer": {"kind": "Adam", "lr": 0.001},
#     "epoch": 3,
#     "batch_size": 10,
# }

# print("ok, sending training request to the server...")

# try:
#     response = requests.post(URL, json=data)
#     # Print the response
#     print(f"Status Code: {response.status_code}")
#     print(f"Response: {response.json()}")
# except:
#     print("url not found")


# ------ for testing transformer inference ------
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


# # ------ for testing CNN stuff ------

URL = "http://127.0.0.1:5000/train"

data = {
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
    "epoch": 1,
    "batch_size": 64,
}

print("ok, sending training request to the server...")

try:
    response = requests.post(URL, json=data)
    # Print the response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except:
    print("url not found")
