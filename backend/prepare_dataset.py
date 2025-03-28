import os
import shutil
from sklearn.model_selection import train_test_split
import argparse

def prepare_dataset(dataset_path, output_path):
    """
    Prepares the Plant Village dataset by splitting it into train, validation, and test sets.
    
    Args:
        dataset_path: Path to the downloaded Plant Village dataset
        output_path: Path where the processed dataset will be stored
    """
    print(f"Processing dataset from {dataset_path} to {output_path}")
    
    # Create output directories
    os.makedirs(os.path.join(output_path, "train"), exist_ok=True)
    os.makedirs(os.path.join(output_path, "val"), exist_ok=True)
    os.makedirs(os.path.join(output_path, "test"), exist_ok=True)
    
    # Get all class folders
    classes = os.listdir(dataset_path)
    classes = [c for c in classes if os.path.isdir(os.path.join(dataset_path, c))]
    
    print(f"Found {len(classes)} classes: {classes}")
    
    # Create class mapping
    class_mapping = {cls: i for i, cls in enumerate(sorted(classes))}
    with open(os.path.join(output_path, "class_mapping.txt"), "w") as f:
        for cls, idx in class_mapping.items():
            f.write(f"{cls},{idx}\n")
    
    # Process each class
    for cls in classes:
        print(f"Processing class: {cls}")
        
        # Create class directories in train, val, test
        os.makedirs(os.path.join(output_path, "train", cls), exist_ok=True)
        os.makedirs(os.path.join(output_path, "val", cls), exist_ok=True)
        os.makedirs(os.path.join(output_path, "test", cls), exist_ok=True)
        
        # Get all images for this class
        class_path = os.path.join(dataset_path, cls)
        images = os.listdir(class_path)
        images = [img for img in images if img.endswith(('.jpg', '.JPG', '.png', '.PNG'))]
        
        if not images:
            print(f"Warning: No images found for class {cls}")
            continue
            
        print(f"  Found {len(images)} images")
        
        # Split into train, val, test (70%, 15%, 15%)
        train_images, test_val_images = train_test_split(images, test_size=0.3, random_state=42)
        val_images, test_images = train_test_split(test_val_images, test_size=0.5, random_state=42)
        
        print(f"  Split: {len(train_images)} train, {len(val_images)} validation, {len(test_images)} test")
        
        # Copy images to respective directories
        for img in train_images:
            shutil.copy(
                os.path.join(class_path, img),
                os.path.join(output_path, "train", cls, img)
            )
        
        for img in val_images:
            shutil.copy(
                os.path.join(class_path, img),
                os.path.join(output_path, "val", cls, img)
            )
        
        for img in test_images:
            shutil.copy(
                os.path.join(class_path, img),
                os.path.join(output_path, "test", cls, img)
            )

    print("Dataset preparation complete!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare Plant Village dataset")
    parser.add_argument("--dataset_path", type=str, required=True, 
                        help="Path to the downloaded Plant Village dataset")
    parser.add_argument("--output_path", type=str, default="models/data",
                        help="Path where the processed dataset will be stored")
    
    args = parser.parse_args()
    
    prepare_dataset(args.dataset_path, args.output_path)