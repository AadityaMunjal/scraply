#!/usr/bin/env python3
"""
Training wrapper for Electron integration
Provides a simple interface to the DynamicModel training functionality
"""

import sys
import json
import asyncio
from models import DynamicModel, Train


class ElectronTrainingHandler:
    def __init__(self):
        self.training_active = {
            "is_training": False,
            "current_progress": None,
            "is_paused": False,
        }

    def send_progress(self, data):
        """Send progress update to Electron"""
        progress_msg = {"type": "progress", "data": data}
        print(json.dumps(progress_msg))
        sys.stdout.flush()

    async def simulate_socketio_emit(self, event_name, data):
        """Simulate SocketIO emit for compatibility with existing code"""
        if event_name == "training_started":
            self.send_progress({"event": "training_started", "data": data})
        elif event_name == "epoch_completed":
            self.send_progress({"event": "epoch_completed", "data": data})
        elif event_name == "training_completed":
            self.send_progress({"event": "training_completed", "data": data})
        elif event_name == "training_error":
            self.send_progress({"event": "training_error", "data": data})

    async def run_training(self, config):
        """Run training with the provided configuration"""
        try:
            inp = config["input"]
            layers = config["layers"]
            loss = config["loss"]
            optimizer = config["optimizer"]
            n_epochs = config["epoch"]
            batch_size = config["batch_size"]

            # Initialize model and trainer
            model = DynamicModel(layers)
            trainer = Train(
                model=model,
                input=inp,
                loss=loss,
                optimizer=optimizer,
                batch_size=batch_size,
            )

            # Create a mock SocketIO object that redirects to our progress handler
            class MockSocketIO:
                async def emit(self, event, data, room=None):
                    await self.training_handler.simulate_socketio_emit(event, data)

            mock_sio = MockSocketIO()
            mock_sio.training_handler = self

            # Run training with streaming
            results = await trainer.train_test_log_stream_async(
                n_epochs,
                batch_size,
                socketio=mock_sio,
                active_training=self.training_active,
                dev_testing=False,
            )

            # Send final results
            result_msg = {"type": "result", "data": results}
            print(json.dumps(result_msg))
            sys.stdout.flush()

            return results

        except Exception as e:
            error_msg = {"type": "error", "data": {"error": str(e)}}
            print(json.dumps(error_msg))
            sys.stdout.flush()
            raise


def main():
    if len(sys.argv) != 2:
        print(
            json.dumps(
                {
                    "type": "error",
                    "data": {"error": "Configuration JSON required as argument"},
                }
            )
        )
        sys.exit(1)

    try:
        config = json.loads(sys.argv[1])
        handler = ElectronTrainingHandler()

        # Run the training
        results = asyncio.run(handler.run_training(config))

    except json.JSONDecodeError as e:
        print(
            json.dumps(
                {
                    "type": "error",
                    "data": {"error": f"Invalid JSON configuration: {str(e)}"},
                }
            )
        )
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"type": "error", "data": {"error": str(e)}}))
        sys.exit(1)


if __name__ == "__main__":
    main()
