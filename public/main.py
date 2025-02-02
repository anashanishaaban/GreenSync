from fastapi import FastAPI, BackgroundTasks
import ray
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants for calculations
DATA_CENTER_EMISSION_RATE = 0.0005  # kgCO2e per second per chat
LOCAL_DEVICE_EMISSION_RATE = 0.0001 # kgCO2e per second per chat

@ray.remote
class CreditCalculator:
    def calculate_credits(self, duration: float, cpu_usage: float, gpu_usage: float):
        # Calculate emissions savings
        data_center_emissions = duration * DATA_CENTER_EMISSION_RATE
        local_emissions = duration * LOCAL_DEVICE_EMISSION_RATE * (cpu_usage/100 + gpu_usage/100)
        saved_emissions = data_center_emissions - local_emissions
        
        # Calculate green credits (1 credit = 1kg CO2e saved)
        credits_earned = max(saved_emissions, 0)
        
        return {
            "saved_co2e": round(saved_emissions, 4),
            "credits_earned": round(credits_earned, 2),
            "data_center_equivalent": round(data_center_emissions, 4)
        }

@app.on_event("startup")
async def startup_event():
    ray.init(address="auto")

class CreditRequest(BaseModel):
    duration: float    # Chat duration in seconds
    cpu_usage: float   # CPU usage percentage
    gpu_usage: float   # GPU usage percentage
    user_id: str

@app.post("/calculate-credits")
async def calculate_credits(request: CreditRequest, background_tasks: BackgroundTasks):
    calculator = CreditCalculator.remote()
    result = ray.get(calculator.calculate_credits.remote(
        request.duration,
        request.cpu_usage,
        request.gpu_usage
    ))
    
    background_tasks.add_task(store_result_in_db, request.user_id, result)
    
    return {
        "saved_emissions": result["saved_co2e"],
        "green_credits": result["credits_earned"],
        "data_center_comparison": result["data_center_equivalent"]
    }

def store_result_in_db(user_id: str, result: dict):
    # Implement database storage
    pass

@app.get("/health")
def health_check():
    return {"status": "healthy"}