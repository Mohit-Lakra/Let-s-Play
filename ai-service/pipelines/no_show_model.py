import os
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

MODEL_PATH = "models/no_show_classifier.pkl"

def train_initial_model():
    """
    Trains a baseline model with dummy data if we don't have enough history yet.
    In a real app, you would retrain this weekly using actual completed/missed match data from the DB.
    """
    # Create some dummy training data
    # Features: [past_no_show_rate, days_since_last_match, request_lead_time_hours, reliability]
    # Label: 1 (no-show) or 0 (showed up)
    data = {
        'past_no_show_rate': [0.1, 0.5, 0.0, 0.8, 0.2, 0.9, 0.1, 0.4],
        'days_since_last_match': [2, 30, 5, 45, 1, 60, 10, 15],
        'request_lead_time_hours': [24, 2, 48, 1, 12, 0.5, 72, 6],
        'reliability': [90, 40, 95, 20, 85, 10, 80, 60],
        'no_show': [0, 1, 0, 1, 0, 1, 0, 0] # 1 means they missed the match
    }
    
    df = pd.DataFrame(data)
    X = df[['past_no_show_rate', 'days_since_last_match', 'request_lead_time_hours', 'reliability']]
    y = df['no_show']
    
    # Train Logistic Regression model
    model = LogisticRegression()
    model.fit(X, y)
    
    # Save the model to a file so FastAPI can load it instantly on startup
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model trained and saved to {MODEL_PATH}")
    return model

def predict_no_show(features: dict):
    """
    Predicts the probability of a user missing a match.
    features: dict containing the 4 required parameters
    """
    if not os.path.exists(MODEL_PATH):
        # If no model exists, train the dummy one first
        model = train_initial_model()
    else:
        model = joblib.load(MODEL_PATH)
        
    # Format the input data for scikit-learn
    X_input = pd.DataFrame([{
        'past_no_show_rate': features['past_no_show_rate'],
        'days_since_last_match': features['days_since_last_match'],
        'request_lead_time_hours': features['request_lead_time_hours'],
        'reliability': features['reliability']
    }])
    
    # predict_proba returns [[P(class=0), P(class=1)]]
    probability = model.predict_proba(X_input)[0][1]
    
    return {
        "probability": probability,
        "risky": probability > 0.5
    }

if __name__ == "__main__":
    # Test the model if run directly
    train_initial_model()
    test_prediction = predict_no_show({
        'past_no_show_rate': 0.7,
        'days_since_last_match': 20,
        'request_lead_time_hours': 2,
        'reliability': 30
    })
    print(f"Test Prediction (should be high risk): {test_prediction}")
