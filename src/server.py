from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
import ray
from fastapi.middleware.cors import CORSMiddleware

import ray

ray.init(address="35.21.142.150:6379", logging_level="debug")

# ✅ Define Ray remote function to distribute requests
@ray.remote
def ollama_chat_remote(message):
    try:
        response = ollama.chat(model="llama3.1:8b", messages=[{"role": "user", "content": message}])
        return response["message"]
    except Exception as e:
        return f" Ollama Error: {str(e)}"

# 🔹 Initialize FastAPI
app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domain if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Request Model
class ChatRequest(BaseModel):
    message: str

# ✅ API Endpoint to handle chat with distributed computing
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # 🔹 Dispatch request as a distributed Ray task
        future = ollama_chat_remote.remote(request.message)
        response = ray.get(future)  # Get the result from Ray workers
        return {"response": response["message"]}
    except Exception as e:
        print(f" Ray or Ollama Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

# ✅ Root Endpoint
@app.get("/")
async def root():
    return {"message": "Chat API is running with Ollama and Ray! Send a POST request to /chat."}

# ✅ Connect Users as Workers (Optional: If you want clients to act as Ray workers)
@app.post("/connect-worker")
async def connect_worker():
    try:
        ray.init(
            address="auto",
            runtime_env={"pip": ["ollama", "fastapi", "pydantic"]}
        )
        return {"message": "Connected as Ray worker!"}
    except Exception as e:
        return {"error": str(e)}
