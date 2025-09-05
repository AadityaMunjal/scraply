#!/usr/bin/env python3
import sys
import json


def main():
    try:
        # Check if required modules can be imported
        import torch
        import numpy as np
        import pandas as pd
        from sklearn.model_selection import train_test_split

        # Check PyTorch CUDA/MPS availability
        device_info = {
            "cuda_available": torch.cuda.is_available(),
            "mps_available": (
                torch.backends.mps.is_available()
                if hasattr(torch.backends, "mps")
                else False
            ),
            "device_count": (
                torch.cuda.device_count() if torch.cuda.is_available() else 0
            ),
        }

        if torch.cuda.is_available():
            device = "cuda"
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            device = "mps"
        else:
            device = "cpu"

        print(f"Python environment health check passed")
        print(f"PyTorch version: {torch.__version__}")
        print(f"Device: {device}")
        print(f"CUDA available: {device_info['cuda_available']}")
        if hasattr(torch.backends, "mps"):
            print(f"MPS available: {device_info['mps_available']}")
        print("All required packages are available")

    except ImportError as e:
        print(f"Missing required package: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"Health check failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
