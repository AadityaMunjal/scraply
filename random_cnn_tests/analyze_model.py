import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms
from torch.utils.data import DataLoader
import os
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import entr
from scipy.ndimage import zoom
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
)
import seaborn as sns
from collections import defaultdict, Counter

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")


# Define the same CNN model architecture
class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.relu = nn.ReLU()
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.fc1 = nn.Linear(32 * 7 * 7, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.pool(x)
        x = self.relu(self.conv2(x))
        x = self.pool(x)  # --> returns 7 x 7
        x = x.view(x.size(0), -1)
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x


# Load the trained model
print("Loading trained model...")
model = SimpleCNN()
model_path = "models/mnist_cnn_model.pth"

if not os.path.exists(model_path):
    print(f"Model file not found at {model_path}. Please run train_model.py first.")
    exit(1)

checkpoint = torch.load(model_path, map_location=device)
model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()
print("Model loaded successfully!")

# Initialize feature maps and hooks
feature_maps = {}


def hook_fn(m, i, o):
    if not model.training:  # Ensures it only runs in eval mode
        feature_maps[m] = o  # storing key-value pair in feature_maps dictionary


# Register hooks to convolutional layers
model.conv1.register_forward_hook(hook_fn)
model.conv2.register_forward_hook(hook_fn)

# Data preprocessing and loading
transform = transforms.Compose(
    [transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))]
)

test_dataset = torchvision.datasets.MNIST(
    root="./data", train=False, transform=transform, download=True
)
test_loader = DataLoader(dataset=test_dataset, batch_size=64, shuffle=False)


# PEEK computation functions
def compute_PEEK(feature_maps, h, w):
    positivized_maps = feature_maps + np.abs(np.min(feature_maps))  # Make positive
    entropy_map = -np.sum(entr(positivized_maps), axis=-1)  # Compute entropy
    # Use scipy zoom instead of cv2.resize
    zoom_factors = (h / entropy_map.shape[0], w / entropy_map.shape[1])
    peek_map = zoom(
        entropy_map, zoom_factors, order=1
    )  # order=1 for bilinear interpolation
    return peek_map


def generate_peek_maps_directly(model, sample_image, conv_layers):
    """Generate PEEK maps directly from feature maps without saving to disk"""
    # Forward pass to capture feature maps
    with torch.no_grad():
        _ = model(sample_image)

    # Load original image
    image = sample_image.squeeze().cpu().numpy()
    h, w = image.shape

    peek_maps = {}

    for layer in conv_layers:
        # Get feature maps using layer as key
        feature_maps_data = feature_maps.get(layer, None)
        if feature_maps_data is None:
            raise KeyError(f"Layer {layer} not found in feature_maps")

        feature_maps_data = feature_maps_data[0]  # Access the first element
        feature_maps_data = np.moveaxis(
            feature_maps_data.cpu().numpy(), 0, -1
        )  # Rearrange channels
        peek_map = compute_PEEK(feature_maps_data, h, w)  # Compute PEEK map
        peek_maps[layer] = peek_map

    return peek_maps, image


def save_image_with_peek_maps(
    image, peek_maps, save_path, title="Image with PEEK Maps"
):
    """Save image with PEEK maps overlaid"""
    num_layers = len(peek_maps)
    fig, axes = plt.subplots(1, num_layers + 1, figsize=(4 * (num_layers + 1), 4))

    # Original image
    axes[0].imshow(image, cmap="gray")
    axes[0].set_title("Original Image")
    axes[0].axis("off")

    # PEEK maps for each layer
    for i, (layer, peek_map) in enumerate(peek_maps.items()):
        axes[i + 1].imshow(image, cmap="gray")  # Original image
        axes[i + 1].imshow(peek_map, alpha=0.7, cmap="jet")  # Overlay PEEK
        axes[i + 1].set_title(f"PEEK - {layer.__class__.__name__}")
        axes[i + 1].axis("off")

    fig.suptitle(title, fontsize=16)
    fig.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()


# Evaluation and data collection
print("Running evaluation and collecting data...")

all_predictions = []
all_labels = []
all_images = []
class_predictions = defaultdict(
    list
)  # class -> list of (image_idx, image, true_label, pred_label)
class_incorrect_predictions = defaultdict(
    list
)  # predicted_class -> list of (image_idx, image, true_label, pred_label)

# Run inference on test set
with torch.no_grad():
    for batch_idx, (images, labels) in enumerate(test_loader):
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        predictions = torch.argmax(outputs, dim=1)

        # Store results
        all_predictions.extend(predictions.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

        # Store images and track predictions by class
        batch_size = test_loader.batch_size or 64
        for i in range(images.size(0)):
            image_idx = batch_idx * batch_size + i
            all_images.append(images[i].cpu())

            true_label = labels[i].item()
            pred_label = predictions[i].item()

            # Store all predictions for each class
            class_predictions[true_label].append(
                (image_idx, images[i].cpu(), true_label, pred_label)
            )

            # Store incorrect predictions where the model predicted this class but it was wrong
            if true_label != pred_label:
                class_incorrect_predictions[pred_label].append(
                    (image_idx, images[i].cpu(), true_label, pred_label)
                )

# Convert to numpy arrays
all_predictions = np.array(all_predictions)
all_labels = np.array(all_labels)

# Calculate metrics
accuracy = accuracy_score(all_labels, all_predictions)
precision, recall, f1, _ = precision_recall_fscore_support(
    all_labels, all_predictions, average="macro"
)
conf_matrix = confusion_matrix(all_labels, all_predictions)

print(f"Overall Accuracy: {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1-Score: {f1:.4f}")

# Calculate per-class accuracy
class_accuracies = {}
for class_label in range(10):
    class_mask = all_labels == class_label
    if np.sum(class_mask) > 0:
        class_correct = np.sum((all_predictions == all_labels) & class_mask)
        class_total = np.sum(class_mask)
        class_accuracies[class_label] = class_correct / class_total
    else:
        class_accuracies[class_label] = 0.0

# Sort classes by accuracy (lowest first)
sorted_classes = sorted(class_accuracies.items(), key=lambda x: x[1])
print("\nPer-class accuracy (lowest to highest):")
for class_label, acc in sorted_classes:
    print(f"Class {class_label}: {acc:.4f}")

# Create output directories
output_dir = "cnn_analysis_results"
os.makedirs(output_dir, exist_ok=True)

# Create confusion matrix plot
plt.figure(figsize=(10, 8))
sns.heatmap(
    conf_matrix,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=[str(i) for i in range(10)],
    yticklabels=[str(i) for i in range(10)],
)
plt.title("Confusion Matrix")
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.savefig(
    os.path.join(output_dir, "confusion_matrix.png"), dpi=150, bbox_inches="tight"
)
plt.close()

# Save confusion matrix as text
np.savetxt(os.path.join(output_dir, "confusion_matrix.txt"), conf_matrix, fmt="%d")

# Save metrics summary
with open(os.path.join(output_dir, "metrics_summary.txt"), "w") as f:
    f.write("MNIST CNN Model Evaluation Metrics\n")
    f.write("=" * 40 + "\n\n")
    f.write(f"Overall Accuracy: {accuracy:.4f}\n")
    f.write(f"Precision: {precision:.4f}\n")
    f.write(f"Recall: {recall:.4f}\n")
    f.write(f"F1-Score: {f1:.4f}\n\n")

    f.write("Per-class Accuracy:\n")
    for class_label, acc in sorted_classes:
        f.write(f"Class {class_label}: {acc:.4f}\n")

    f.write("\nMetric Definitions:\n")
    f.write("- Accuracy: The ratio of correct predictions to total predictions\n")
    f.write(
        "- Precision: The ratio of true positive predictions to all positive predictions\n"
    )
    f.write(
        "- Recall: The ratio of true positive predictions to all actual positive cases\n"
    )
    f.write("- F1-Score: The harmonic mean of precision and recall\n\n")

    f.write("Interpretation:\n")
    f.write("- High accuracy indicates the model correctly classifies most digits\n")
    f.write(
        "- High precision means when the model predicts a digit, it's usually correct\n"
    )
    f.write("- High recall means the model finds most instances of each digit\n")
    f.write("- F1-score balances precision and recall for overall performance\n")

# Create folders for each class with 3 predicted images
print("Creating class-specific folders...")
conv_layers = [model.conv1, model.conv2]

for class_label in range(10):
    class_dir = os.path.join(output_dir, f"class_{class_label}")
    os.makedirs(class_dir, exist_ok=True)

    # Find images predicted as this class
    class_preds = class_predictions[class_label]

    if len(class_preds) >= 3:
        selected_examples = class_preds[:3]
    else:
        # If not enough predictions, take all available
        selected_examples = class_preds

    for i, (idx, image, true_label, pred_label) in enumerate(selected_examples):
        # Move image to device for processing
        image_device = image.to(device)

        # Generate PEEK maps directly
        peek_maps, original_image = generate_peek_maps_directly(
            model, image_device.unsqueeze(0), conv_layers
        )

        # Save image with PEEK maps
        image_save_path = os.path.join(class_dir, f"image_{idx}_peek_maps.png")
        title = f"True: {true_label}, Predicted: {pred_label}"
        save_image_with_peek_maps(original_image, peek_maps, image_save_path, title)

        # Save original image
        plt.figure(figsize=(4, 4))
        plt.imshow(original_image, cmap="gray")
        plt.title(f"True: {true_label}, Predicted: {pred_label}")
        plt.axis("off")
        plt.savefig(
            os.path.join(class_dir, f"image_{idx}_original.png"),
            dpi=150,
            bbox_inches="tight",
        )
        plt.close()

# Create folder for top 3 classes with lowest accuracy
print("Creating analysis for classes with lowest accuracy...")
lowest_accuracy_classes = sorted_classes[:3]  # Top 3 lowest accuracy classes

lowest_acc_dir = os.path.join(output_dir, "lowest_accuracy_classes")
os.makedirs(lowest_acc_dir, exist_ok=True)

# Save summary of lowest accuracy classes
with open(os.path.join(lowest_acc_dir, "lowest_accuracy_summary.txt"), "w") as f:
    f.write("Top 3 Classes with Lowest Accuracy\n")
    f.write("=" * 40 + "\n\n")
    for i, (class_label, accuracy) in enumerate(lowest_accuracy_classes, 1):
        f.write(f"{i}. Class {class_label}: {accuracy:.4f} accuracy\n")
        f.write(f"   Total samples: {len(class_predictions[class_label])}\n")
        f.write(
            f"   Incorrect predictions: {len([x for x in class_predictions[class_label] if x[2] != x[3]])}\n\n"
        )

# Create folders for each lowest accuracy class
for i, (class_label, accuracy) in enumerate(lowest_accuracy_classes, 1):
    class_subdir = os.path.join(
        lowest_acc_dir, f"class_{class_label}_accuracy_{accuracy:.4f}"
    )
    os.makedirs(class_subdir, exist_ok=True)

    # Get incorrect predictions where this class was predicted but was wrong
    incorrect_examples = class_incorrect_predictions[class_label]

    if len(incorrect_examples) >= 3:
        selected_examples = incorrect_examples[:3]
    else:
        selected_examples = incorrect_examples

    for j, (idx, image, true_l, pred_l) in enumerate(selected_examples):
        # Move image to device for processing
        image_device = image.to(device)

        # Generate PEEK maps directly
        peek_maps, original_image = generate_peek_maps_directly(
            model, image_device.unsqueeze(0), conv_layers
        )

        # Save image with PEEK maps
        image_save_path = os.path.join(class_subdir, f"example_{j}_peek_maps.png")
        title = f"True: {true_l}, Predicted: {pred_l}"
        save_image_with_peek_maps(original_image, peek_maps, image_save_path, title)

        # Save original image
        plt.figure(figsize=(4, 4))
        plt.imshow(original_image, cmap="gray")
        plt.title(f"True: {true_l}, Predicted: {pred_l}")
        plt.axis("off")
        plt.savefig(
            os.path.join(class_subdir, f"example_{j}_original.png"),
            dpi=150,
            bbox_inches="tight",
        )
        plt.close()

print(f"All results saved in '{output_dir}' directory!")
print(f"Class-specific folders: {output_dir}/class_0 through {output_dir}/class_9")
print(f"Lowest accuracy analysis: {output_dir}/lowest_accuracy_classes")
print(f"Confusion matrix: {output_dir}/confusion_matrix.png")
print(f"Metrics summary: {output_dir}/metrics_summary.txt")
