# Simple CNN Training Script

This directory contains scripts to train a simple Convolutional Neural Network (CNN) model and save the weights file.

## Files

- `train_cnn.py` - Main training script for the CNN model
- `test_cnn.py` - Script to test the trained model
- `requirements_cnn.txt` - Python dependencies
- `README_CNN.md` - This file

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements_cnn.txt
```

### 2. Train the Model

```bash
python train_cnn.py
```

This will:
- Load the diabetes dataset from `aws/training-data/pima-indians-diabetes.csv`
- Train a simple CNN model for 50 epochs
- Save the model weights to `models/simple_cnn_model.pth`

### 3. Test the Model

```bash
python test_cnn.py
```

This will:
- Load the trained model
- Test it on a few samples from the dataset
- Show predictions and probabilities

## Model Architecture

The CNN model consists of:
- 2 convolutional layers (16 and 32 filters)
- Max pooling layers
- Dropout for regularization
- 2 fully connected layers (128 and 2 neurons)
- ReLU activation functions

## Command Line Options

### Training Script (`train_cnn.py`)

```bash
python train_cnn.py [options]

Options:
  --data-path PATH        Path to the dataset (default: aws/training-data/pima-indians-diabetes.csv)
  --epochs N              Number of training epochs (default: 50)
  --batch-size N          Batch size (default: 32)
  --learning-rate FLOAT   Learning rate (default: 0.001)
  --output-dir PATH       Directory to save model (default: models)
  --model-name NAME       Model filename (default: simple_cnn_model.pth)
```

### Testing Script (`test_cnn.py`)

```bash
python test_cnn.py [options]

Options:
  --model-path PATH       Path to the trained model (default: models/simple_cnn_model.pth)
  --data-path PATH        Path to the dataset (default: aws/training-data/pima-indians-diabetes.csv)
  --sample-size N         Number of samples to test (default: 5)
```

## Example Usage

### Train with custom parameters:
```bash
python train_cnn.py --epochs 100 --batch-size 16 --learning-rate 0.0005
```

### Test with custom model:
```bash
python test_cnn.py --model-path models/my_custom_model.pth --sample-size 10
```

## Output

The training script will:
1. Print training progress for each epoch
2. Show validation accuracy
3. Evaluate on test set
4. Save the model with metadata including:
   - Model weights
   - Input size and number of classes
   - Data scaler for preprocessing
   - Test accuracy
   - Training history

## Dataset

The script uses the Pima Indians Diabetes dataset, which contains:
- 8 features (glucose, blood pressure, etc.)
- Binary classification (diabetes or no diabetes)
- 768 samples

The features are preprocessed to fit a 4x4 input for the CNN by padding or truncating to 16 features.

## Model Performance

Typical performance on the diabetes dataset:
- Training accuracy: ~75-80%
- Validation accuracy: ~70-75%
- Test accuracy: ~70-75%

Note: This is a simple CNN for demonstration purposes. For better performance on this dataset, other architectures (like fully connected networks) might be more appropriate. 