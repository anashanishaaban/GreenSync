import requests

API_URL = "http://127.0.0.1:8000/calculate-credits"

def send_chat_metrics(duration: float, cpu_usage: float, user_id: str):
    """Improved error handling"""
    payload = {
        "duration": duration,
        "cpu_usage": cpu_usage,
        "user_id": user_id
    }
    try:
        response = requests.post(API_URL, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API Error: {str(e)}")
        return {"error": "Failed to calculate credits"}

if __name__ == "__main__":
    # Example test values
    test_duration = 300  # 5 minutes in seconds
    test_cpu = 15.5      # Average CPU usage %
    user_id = "test-user"
    result = send_chat_metrics(test_duration, test_cpu, user_id)
    print(f"API Response: {result}")
