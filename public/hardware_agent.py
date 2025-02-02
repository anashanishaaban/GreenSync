# import time
# import psutil
# import requests
# import os

# # URL of your backend endpoint that receives hardware metrics.
# BACKEND_URL = "http://localhost:8000/update-hardware-metrics"

# def get_cpu_usage():
#     """Measure CPU usage over 1 second."""
#     return psutil.cpu_percent(interval=1)

# def send_metrics(cpu_usage):
#     """Simplified local version"""
#     payload = {"cpu_usage": cpu_usage}
#     try:
#         response = requests.post(BACKEND_URL, json=payload)
#         if response.ok:
#             print("Sent metrics successfully:", payload)
#     except Exception as e:
#         print("Error sending metrics:", e)

# if __name__ == "__main__":
#     while True:
#         cpu = get_cpu_usage()
#         print(f"Measured CPU: {cpu}%")
#         send_metrics(cpu)
#         time.sleep(2)
