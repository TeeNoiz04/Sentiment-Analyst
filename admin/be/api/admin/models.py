"""
Model loading functions for admin API
"""
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np


def load_topic_model():
    """Load topic classification model"""
    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device for topic model: {device}")
        
        model = AutoModelForSequenceClassification.from_pretrained(
            "topic_model",
            num_labels=4,
            device_map=device
        )
        model.eval()
        
        tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base-v2", use_fast=False)
        
        return model, tokenizer, device
    except Exception as e:
        print(f"Error loading topic model: {str(e)}")
        return None, None, None


def analyze_topic(text, model, tokenizer, device):
    """Analyze topic of text"""
    try:
        if model is None or tokenizer is None:
            print("Topic model or tokenizer is not loaded")
            return None
        
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=100)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1)
            probabilities = probabilities.cpu().numpy()[0]
            
            topic = np.argmax(probabilities)
            confidence = float(probabilities[topic])
            
            topic_labels = {
                0: "LABEL_0",  # facility
                1: "LABEL_1",  # lecturer
                2: "LABEL_2",  # student
                3: "LABEL_3"   # program
            }
            
            return {
                "topic": topic_labels[topic],
                "confidence": confidence,
                "probabilities": probabilities.tolist()
            }
    except Exception as e:
        print(f"Error analyzing topic: {str(e)}")
        return None

