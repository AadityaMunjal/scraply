import requests

# # ------ for testing transformer inference ------
# currently uses pretrained model
URL = "http://127.0.0.1:5000/transformertest"

data = {
    "temperature": 0.5,
    "prompt": "Alice was sleepy",
}

print("OH YEAHHAHAH IT WORKEDDDD AaAAAAaaAAA!")


try:
    response = requests.post(URL, json=data)
    # Print the response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except:
    print("url not found")



# # ------ for testing transformer training ------
URL = "http://127.0.0.1:5000/transformertrain"

data = {
    "input": "alice",  # preprocess
    "layers": [
        {"kind": "Decoder", "args": (100, 2, 2048)},
        {"kind": "Decoder", "args": (100, 2, 2048)},
        {"kind": "Output", "args": 0.3},
    ],
    "loss": "CrossEntropy",
    "optimizer": {"kind": "Adam", "lr": 0.001},
    "epoch": 2,
    "batch_size": 32,
}

print("ok, sending transformer training request to the server...")

try:
    response = requests.post(URL, json=data)
    # Print the response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except:
    print("url not found")
