import requests

API_URL = "http://127.0.0.1:8000/distribute_task/"

def send_task(carbon_emission: float):
    """
    Sends emission data to the API and retrieves results.
    """
    payload = {"carbon_emission": carbon_emission}
    response = requests.post(API_URL, json=payload)
    return response.json()

if __name__ == "__main__":
    test_data = 100  # Example: 100 units of carbon emission
    result = send_task(test_data)
    print(f"API Response: {result}")
