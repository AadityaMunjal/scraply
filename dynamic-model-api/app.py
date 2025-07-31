from flask import Flask, request, send_file
from flask_socketio import SocketIO, emit
from models import (
    DynamicModel,
    Train,
)
from transformer_models import (
    TransformerModel,
    TransformerData,
    TransformerTrain,
    Inference,
)
from flask_cors import CORS  # pip install flask-cors (i think)
from generate import Generate

# dumb imports that i gyatt to add
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
import threading


app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://scraply-prod.vercel.app"])
socketio = SocketIO(
    app,
    cors_allowed_origins=["http://localhost:3000", "https://scraply-prod.vercel.app"],
)


@app.route("/")
def hello_world():
    return {"data": "hello"}


@app.route("/health", methods=["GET"])
def health_check():
    return {"status": "online", "message": "Server is running"}


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()

    try:
        gen = Generate(data)
        gen.generate_notebook()
        return send_file("generated_notebook.ipynb")
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@app.post("/train")  # this is basically train AND test
def train():

    data = request.get_json()
    print("Received data:", data)

    inp = data["input"]
    layers = data["layers"]
    loss = data["loss"]
    optimizer = data["optimizer"]
    n_epochs = data["epoch"]
    batch_size = data["batch_size"]

    RESULTS = {}

    try:
        model = DynamicModel(layers)

        t = Train(
            model=model,
            input=inp,
            loss=loss,
            optimizer=optimizer,
            batch_size=batch_size,
        )

        print("slay... model initialized successfully!")
        RESULTS = t.train_test_log(n_epochs, batch_size)

        # ENCODED_IMAGES and ENCODED_MISCLASSIFIED may be empty dictionaries if the input is not an image.
        # the structure is also different if there is a convolutional layer due to peek map images

    except Exception as e:
        print("Error:", e)
        RESULTS = {"error": str(e)}

    return RESULTS


@socketio.on("connect")
def handle_connect():
    print("Client connected")
    emit("connected", {"message": "Connected to training server"})


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


active_training = {"is_training": False, "current_progress": None, "is_paused": False}


@socketio.on("check_training_status")
def handle_check_training_status():
    emit(
        "training_status",
        {
            "is_training": active_training["is_training"],
            "current_progress": active_training["current_progress"],
            "is_paused": active_training["is_paused"],
        },
    )


@socketio.on("pause_training")
def handle_pause_training():
    if active_training["is_training"]:
        active_training["is_paused"] = True
        print("Training paused")
        emit("training_paused", {"message": "Training has been paused"})
    else:
        emit("training_error", {"error": "No active training to pause"})


@socketio.on("resume_training")
def handle_resume_training():
    if active_training["is_training"] and active_training["is_paused"]:
        active_training["is_paused"] = False
        print("Training resumed")
        emit("training_resumed", {"message": "Training has been resumed"})
    else:
        emit("training_error", {"error": "No paused training to resume"})


@socketio.on("stop_training")
def handle_stop_training():
    if active_training["is_training"]:
        active_training["is_training"] = False
        active_training["is_paused"] = False
        active_training["current_progress"] = None
        print("Training stopped")
        emit("training_stopped", {"message": "Training has been stopped"})
    else:
        emit("training_error", {"error": "No active training to stop"})


def run_training_background(t, n_epochs, batch_size, socketio, active_training):
    """Run training in background thread to avoid Flask response conflicts"""
    try:
        results = t.train_test_log_stream(
            n_epochs, batch_size, socketio, active_training
        )
        # Mark training as complete
        active_training["is_training"] = False
        active_training["current_progress"] = None
        active_training["is_paused"] = False
    except Exception as e:
        print("Background training error:", e)
        active_training["is_training"] = False
        active_training["current_progress"] = None
        active_training["is_paused"] = False
        socketio.emit("training_error", {"error": str(e)})


@app.post("/train-stream")
def train_stream():
    """Streaming training endpoint that emits progress via WebSocket"""
    data = request.get_json()
    print("Received streaming training request:", data)

    inp = data["input"]
    layers = data["layers"]
    loss = data["loss"]
    optimizer = data["optimizer"]
    n_epochs = data["epoch"]
    batch_size = data["batch_size"]

    try:
        active_training["is_training"] = True
        active_training["current_progress"] = None
        active_training["is_paused"] = False

        model = DynamicModel(layers)
        t = Train(
            model=model,
            input=inp,
            loss=loss,
            optimizer=optimizer,
            batch_size=batch_size,
        )

        print("Model initialized successfully! Starting streaming training...")

        # Start training in background thread to avoid Flask response conflicts
        training_thread = threading.Thread(
            target=run_training_background,
            args=(t, n_epochs, batch_size, socketio, active_training),
        )
        training_thread.daemon = True
        training_thread.start()

        return {
            "status": "training_started",
            "message": "Training progress will be streamed via WebSocket",
        }

    except Exception as e:
        print("Error:", e)
        # Reset training state on error
        active_training["is_training"] = False
        active_training["current_progress"] = None
        active_training["is_paused"] = False
        socketio.emit("training_error", {"error": str(e)})
        return {"error": str(e)}, 500


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
