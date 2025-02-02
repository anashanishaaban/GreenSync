import requests
import time

API_URL = "http://127.0.0.1:8000/calculate-credits"

def send_chat_metrics(duration: float, cpu_usage: float, gpu_usage: float, user_id: str):
    """
    Sends chat session metrics to calculate green credits
    """
    payload = {
        "duration": duration,
        "cpu_usage": cpu_usage,
        "gpu_usage": gpu_usage,
        "user_id": user_id
    }
    response = requests.post(API_URL, json=payload)
    return response.json()

if __name__ == "__main__":
    # Example test values
    test_duration = 300  # 5 minutes in seconds
    test_cpu = 15.5      # Average CPU usage %
    test_gpu = 22.3      # Average GPU usage %
    user_id = "test-user"
    result = send_chat_metrics(test_duration, test_cpu, test_gpu, user_id)
    print(f"API Response: {result}")
    #test