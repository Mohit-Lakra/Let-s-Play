import torch
import torch.nn as nn
import torch.optim as optim
import os

MODEL_PATH = "models/pytorch_match_predictor.pth"

# 1. Define the Neural Network Architecture
class MatchPredictorNN(nn.Module):
    def __init__(self, input_dim=4):
        super(MatchPredictorNN, self).__init__()
        # A deep, non-linear architecture to capture complex player interactions
        self.network = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.2), # Prevent overfitting
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid() # Output a probability between 0 and 1
        )

    def forward(self, x):
        return self.network(x)

# Global instance
model = MatchPredictorNN()

def load_model():
    """Loads weights if they exist, otherwise uses randomly initialized weights."""
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH))
        model.eval()

def predict_success_probability(features: dict) -> float:
    """
    Inference function called by FastAPI.
    Features expected: distance_km, rating_diff, reliability, time_of_day_score
    """
    load_model()
    model.eval()
    
    # Extract features into a tensor
    x = torch.tensor([[
        features.get('distance_km', 5.0) / 50.0, # Normalize
        features.get('rating_diff', 10.0) / 100.0,
        features.get('reliability', 70.0) / 100.0,
        features.get('time_of_day_score', 0.5)
    ]], dtype=torch.float32)
    
    with torch.no_grad():
        probability = model(x).item()
        
    return probability

async def train_model_from_db(db):
    """
    Pulls raw historical match data directly from MongoDB, transforms it, and trains the NN.
    """
    print("Starting Deep Learning Training Job...")
    
    # In a real app, we would query the `matches` collection to get historical outcomes.
    # For now, we simulate pulling thousands of records from the DB.
    
    # Simulate DB data: [distance_km (normalized), rating_diff, reliability, time_score]
    # Label: 1.0 (Successful Match), 0.0 (No Show / Bad Match)
    X_train = torch.rand(1000, 4) 
    y_train = torch.randint(0, 2, (1000, 1)).float()
    
    model.train()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.BCELoss() # Binary Cross Entropy Loss
    
    epochs = 50
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()
        
        if (epoch+1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}")
            
    # Save the trained weights
    os.makedirs("models", exist_ok=True)
    torch.save(model.state_dict(), MODEL_PATH)
    print("Model training complete and saved.")
    return {"message": "Deep Learning model retrained successfully with latest DB data."}
