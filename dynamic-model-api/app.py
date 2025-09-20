from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
from models import DynamicModel, Train
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

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://scraply-prod.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SocketIO setup
sio = socketio.AsyncServer(
    cors_allowed_origins=["http://localhost:3000", "https://scraply-prod.vercel.app"],
    async_mode="asgi",
)
socket_app = socketio.ASGIApp(sio, app)

# Global state
active_training = {"is_training": False, "current_progress": None, "is_paused": False}


@app.get("/")
async def hello_world():
    return {"data": "hello"}


@app.get("/health")
async def health_check():
    return {"status": "online", "message": "Server is running"}


@app.post("/generate")
async def generate(request: Request):
    data = await request.json()

    try:
        gen = Generate(data)
        gen.generate_notebook()
        return FileResponse("generated_notebook.ipynb")
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@sio.event
async def connect(sid, environ):
    print("Client connected")
    await sio.emit("connected", {"message": "Connected to training server"}, room=sid)


@sio.event
async def disconnect(sid):
    print("Client disconnected")


@sio.event
async def check_training_status(sid):
    await sio.emit(
        "training_status",
        {
            "is_training": active_training["is_training"],
            "current_progress": active_training["current_progress"],
            "is_paused": active_training["is_paused"],
        },
        room=sid,
    )


@sio.event
async def pause_training(sid):
    if active_training["is_training"]:
        active_training["is_paused"] = True
        print("Training paused")
        await sio.emit(
            "training_paused", {"message": "Training has been paused"}, room=sid
        )
    else:
        await sio.emit(
            "training_error", {"error": "No active training to pause"}, room=sid
        )


@sio.event
async def resume_training(sid):
    if active_training["is_training"] and active_training["is_paused"]:
        active_training["is_paused"] = False
        print("Training resumed")
        await sio.emit(
            "training_resumed", {"message": "Training has been resumed"}, room=sid
        )
    else:
        await sio.emit(
            "training_error", {"error": "No paused training to resume"}, room=sid
        )


@sio.event
async def stop_training(sid):
    if active_training["is_training"]:
        active_training["is_training"] = False
        active_training["is_paused"] = False
        active_training["current_progress"] = None
        print("Training stopped")
        await sio.emit(
            "training_stopped", {"message": "Training has been stopped"}, room=sid
        )
    else:
        await sio.emit(
            "training_error", {"error": "No active training to stop"}, room=sid
        )


async def run_training_background(t, n_epochs, batch_size, active_training):
    """Run training in background task"""
    try:
        results = await t.train_test_log_stream_async(
            n_epochs, batch_size, sio, active_training
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
        await sio.emit("training_error", {"error": str(e)})


@app.post("/train-stream")
async def train_stream(request: Request):
    """Streaming training endpoint that emits progress via WebSocket"""
    data = await request.json()
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
        # Start background task
        import asyncio

        asyncio.create_task(
            run_training_background(t, n_epochs, batch_size, active_training)
        )

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
        await sio.emit("training_error", {"error": str(e)})
        return {"error": str(e)}, 500


# Export the ASGI app for uvicorn
asgi_app = socket_app


# command to run this file:
# uvicorn app:socket_app --host 0.0.0.0 --port 5000 --reload
