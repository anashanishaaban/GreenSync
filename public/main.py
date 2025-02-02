from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import ray
import psutil
import threading
import uvicorn
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# --- In-Memory Data Store ---
in_memory_db = {
    "user_credits": {},
    "latest_hardware_metrics": {"cpu_usage": 0}
}

# --- Constants for Calculations ---
DATA_CENTER_EMISSION_RATE = 0.0005
LOCAL_DEVICE_EMISSION_RATE = 0.0001
CREDIT_MULTIPLIER = 20  # Adjust this multiplier to scale up credit earnings

# --- Ray Actor for Credit Calculation ---
@ray.remote
class CreditCalculator:
    def calculate_credits(self, duration: float, cpu_usage: float):
        data_center_emissions = duration * DATA_CENTER_EMISSION_RATE
        local_emissions = duration * LOCAL_DEVICE_EMISSION_RATE * (cpu_usage / 100)
        saved_emissions = data_center_emissions - local_emissions
        base_credits = max(saved_emissions, 0)

        # Apply a dynamic multiplier based on CPU usage
        dynamic_multiplier = CREDIT_MULTIPLIER + (cpu_usage / 2)  # Scales up with CPU usage
        credits_earned = base_credits * dynamic_multiplier * 100  # Boost credits significantly

        return {
            "saved_co2e": round(saved_emissions, 4),
            "credits_earned": round(credits_earned),  # Rounded to whole number
            "data_center_equivalent": round(data_center_emissions, 4)
        }

# --- CPU Monitoring ---
def monitor_cpu_usage():
    while True:
        cpu_usage = psutil.cpu_percent(interval=1)
        in_memory_db["latest_hardware_metrics"] = {"cpu_usage": cpu_usage}
        print(f"Updated CPU usage: {cpu_usage}%")

# --- FastAPI Setup ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    ray.init(address="auto", logging_level="debug")
    monitor_thread = threading.Thread(target=monitor_cpu_usage, daemon=True)
    monitor_thread.start()
    print("CPU monitoring thread started.")

@app.on_event("shutdown")
async def shutdown_event():
    ray.shutdown()
    print("Ray shutdown.")

# --- Endpoints ---
class CreditRequest(BaseModel):
    duration: float    
    cpu_usage: float   
    user_id: str

@app.post("/calculate-credits")
async def calculate_credits(request: CreditRequest, background_tasks: BackgroundTasks):
    calculator = CreditCalculator.remote()
    result = ray.get(calculator.calculate_credits.remote(request.duration, request.cpu_usage))
    background_tasks.add_task(store_result_in_db, request.user_id, result)
    return {
        "saved_emissions": result["saved_co2e"],
        "green_credits": result["credits_earned"],
        "data_center_comparison": result["data_center_equivalent"]
    }

def store_result_in_db(user_id: str, result: dict):
    current = in_memory_db["user_credits"].get(user_id, 0.0)
    new_total = current + result["credits_earned"]
    in_memory_db["user_credits"][user_id] = new_total
    print(f"Updated credits for user {user_id}: {new_total}")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/current-hardware-metrics")
async def current_hardware_metrics():
    return in_memory_db.get("latest_hardware_metrics", {"cpu_usage": 0})

# New endpoint: return the accumulated green credits for a user.
@app.get("/user-credits")
async def get_user_credits(user_id: str):
    credits = in_memory_db["user_credits"].get(user_id, 0.0)
    return {"green_credits": credits}

@app.post("/chat")
async def chat_endpoint(payload: dict):
    message = payload.get("message", "")
    user_id = payload.get("user_id", "guest-user")
    response_content = f"Received your message: {message}"
    return {"response": {"content": response_content}}

# Pydantic model for validation
class DonationRequest(BaseModel):
    user_id: str
    amount: int

@app.post("/donate-credits")
async def donate_credits(payload: DonationRequest):
    user_id = payload.user_id
    amount = payload.amount

    print(f"🔹 Received donation request: user_id={user_id}, amount={amount}")

    if amount < 1:
        print("❌ Error: Invalid donation amount")
        raise HTTPException(status_code=400, detail="Invalid donation amount")

    current_credits = in_memory_db["user_credits"].get(user_id, 0)

    print(f"🔹 Current credits for {user_id}: {current_credits}")

    # Ensure values are properly treated as integers
    if isinstance(current_credits, float):
        current_credits = int(current_credits)

    if current_credits > amount:
        print(f"❌ Error: Insufficient credits. Available: {current_credits}, Attempted: {amount}")
        raise HTTPException(status_code=400, detail="Insufficient credits")

    in_memory_db["user_credits"][user_id] = current_credits - amount
    new_balance = in_memory_db["user_credits"][user_id]

    print(f"✅ Success! {amount} credits deducted. New balance: {new_balance}")

    return {"status": "success", "new_balance": new_balance}




if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
