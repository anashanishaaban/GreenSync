import requests

url = "http://35.21.142.150:8000/current-hardware-metrics"
response = requests.get(url)

if response.status_code == 200:
    print(response.json())
else:
    print("Error:", response.status_code)