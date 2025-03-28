import os
import json
import argparse
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model

def train_model(data_path, model_save_path, epochs=10, batch_size=16):
    """
    Train a soil classification model using transfer learning with MobileNetV2.
    
    Args:
        data_path: Path to the dataset with Train and test folders
        model_save_path: Path where the trained model will be saved
        epochs: Number of training epochs
        batch_size: Batch size for training
    """
    # Set paths
    os.makedirs(model_save_path, exist_ok=True)
    
    # Parameters
    IMG_SIZE = 224
    
    print(f"Training soil classification model with data from {data_path}")
    print(f"Model will be saved to {model_save_path}")
    
    # Data generators with augmentation for soil images
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,  # Soil images can be flipped vertically
        brightness_range=[0.8, 1.2],  # Adjust brightness
        fill_mode='nearest'
    )
    
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        os.path.join(data_path, "Train"),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=batch_size,
        class_mode='categorical'
    )
    
    test_generator = test_datagen.flow_from_directory(
        os.path.join(data_path, "test"),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=batch_size,
        class_mode='categorical'
    )
    
    NUM_CLASSES = len(train_generator.class_indices)
    print(f"Training model for {NUM_CLASSES} soil types: {train_generator.class_indices}")
    
    # Create model using transfer learning with MobileNetV2
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
    
    # Freeze the base model layers
    for layer in base_model.layers:
        layer.trainable = False
    
    # Add custom layers optimized for soil classification
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(512, activation='relu')(x)  # Larger dense layer
    x = Dropout(0.5)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(NUM_CLASSES, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile model
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Train model
    print("Starting soil classification model training...")
    history = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // batch_size,
        validation_data=test_generator,
        validation_steps=test_generator.samples // batch_size,
        epochs=epochs
    )
    
    # Save model
    model.save(model_save_path)
    print(f"Model saved to {model_save_path}")
    
    # Save class indices mapping
    with open(os.path.join(model_save_path, "soil_class_indices.json"), "w") as f:
        json.dump(train_generator.class_indices, f)
    
    # Create soil characteristics and recommendations mapping
    soil_characteristics = {
        "Alluvial soil": {
            "characteristics": [
                "Rich in humus and very fertile",
                "Good water retention capacity",
                "Well-drained"
            ],
            "recommendations": [
                "Ideal for most crops",
                "Regular organic matter addition recommended",
                "Maintain proper drainage"
            ]
        },
        "Black Soil": {
            "characteristics": [
                "High clay content",
                "High water retention",
                "Rich in calcium carbonate"
            ],
            "recommendations": [
                "Best for cotton and wheat",
                "Deep ploughing recommended",
                "Careful irrigation to prevent waterlogging"
            ]
        },
        "Clay soil": {
            "characteristics": [
                "Heavy and compact",
                "Poor drainage",
                "High nutrient content"
            ],
            "recommendations": [
                "Add organic matter to improve structure",
                "Install drainage systems",
                "Deep tilling when dry"
            ]
        },
        "Red soil": {
            "characteristics": [
                "Rich in iron oxides",
                "Well-drained",
                "Lower fertility than alluvial"
            ],
            "recommendations": [
                "Regular fertilizer application needed",
                "Suitable for drought-resistant crops",
                "Mulching recommended"
            ]
        }
    }
    
    with open(os.path.join(model_save_path, "soil_characteristics.json"), "w") as f:
        json.dump(soil_characteristics, f)
    
    print("Model training complete!")
    print(f"Final validation accuracy: {history.history['val_accuracy'][-1]:.4f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train soil classification model")
    parser.add_argument("--data_path", type=str, default="Dataset",
                        help="Path to the dataset with Train and test folders")
    parser.add_argument("--model_save_path", type=str, default="models/soil_classification_model",
                        help="Path where the trained model will be saved")
    parser.add_argument("--epochs", type=int, default=10,
                        help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32,
                        help="Batch size for training")
    
    args = parser.parse_args()
    
    train_model(args.data_path, args.model_save_path, args.epochs, args.batch_size)