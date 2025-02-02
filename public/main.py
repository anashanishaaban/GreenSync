from fastapi import FastAPI, BackgroundTasks
import ray
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import redis
import json
import psutil
import time
import uvicorn

# --- Redis Setup ---
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

# --- FastAPI Setup ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants for calculations
DATA_CENTER_EMISSION_RATE = 0.0005  # kg CO₂e per second per chat
LOCAL_DEVICE_EMISSION_RATE = 0.0001 # kg CO₂e per second per chat

@ray.remote
class CreditCalculator:
    def calculate_credits(self, duration: float, cpu_usage: float):
        data_center_emissions = duration * DATA_CENTER_EMISSION_RATE
        local_emissions = duration * LOCAL_DEVICE_EMISSION_RATE * (cpu_usage / 100)
        saved_emissions = data_center_emissions - local_emissions
        credits_earned = max(saved_emissions, 0)
        return {
            "saved_co2e": round(saved_emissions, 4),
            "credits_earned": round(credits_earned, 2),
            "data_center_equivalent": round(data_center_emissions, 4)
        }

@app.on_event("startup")
async def startup_event():
    """Runs when FastAPI starts."""
    ray.init()
    # Start background CPU monitoring
    background_task = BackgroundTasks()
    background_task.add_task(monitor_cpu_usage)

class CreditRequest(BaseModel):
    duration: float    
    cpu_usage: float   
    user_id: str

@app.post("/calculate-credits")
async def calculate_credits(request: CreditRequest, background_tasks: BackgroundTasks):
    """Calculate green credits and store them."""
    calculator = CreditCalculator.remote()
    result = ray.get(calculator.calculate_credits.remote(request.duration, request.cpu_usage))
    
    background_tasks.add_task(store_result_in_db, request.user_id, result)
    
    return {
        "saved_emissions": result["saved_co2e"],
        "green_credits": result["credits_earned"],
        "data_center_comparison": result["data_center_equivalent"]
    }

def store_result_in_db(user_id: str, result: dict):
    """Update user credits in Redis."""
    key = f"user_credits:{user_id}"
    current = redis_client.get(key)
    current = float(current) if current else 0.0
    new_total = current + result["credits_earned"]
    redis_client.set(key, new_total)
    print(f"Updated credits for user {user_id}: {new_total}")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- Hardware Monitoring ---
def monitor_cpu_usage():
    """Continuously monitors CPU and updates Redis every second."""
    while True:
        cpu_usage = psutil.cpu_percent(interval=1)
        redis_client.set("latest_hardware_metrics", json.dumps({"cpu_usage": cpu_usage}))
        print(f"Updated CPU usage: {cpu_usage}%")
        time.sleep(1)

@app.get("/current-hardware-metrics")
async def current_hardware_metrics():
    """Fetch the latest CPU usage data."""
    data = redis_client.get("latest_hardware_metrics")
    return json.loads(data) if data else {"cpu_usage": 0}

# --- Run the server ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000)
