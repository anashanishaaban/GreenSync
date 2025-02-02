from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
import ray
from fastapi.middleware.cors import CORSMiddleware

# Connect Ray
ray.init(address="auto", ignore_reinit_error=True)

# ✅ Define Ray remote function to distribute requests
@ray.remote
def ollama_chat_remote(message):
    try:
        response = ollama.chat(model="llama3.1:8b", messages=[{"role": "user", "content": message}])
        if "message" in response:
            return {"message": response["message"]}
        else:
            return {"message": "No response from Ollama"}
    except Exception as e:
        return {"message": f"Ollama Error: {str(e)}"}

# ✅ Initialize FastAPI
app = FastAPI()

# ✅ Enable CORS (Modify for your ngrok domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# ✅ Request Model
class ChatRequest(BaseModel):
    message: str

# ✅ API Endpoint to handle chat with distributed computing
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        future = ollama_chat_remote.remote(request.message)
        response = ray.get(future)  # Get result from Ray workers

        # Validate response structure
        if isinstance(response, dict) and "message" in response:
            return {"response": response["message"]["content"]}
        else:
            return {"message": "Invalid response from AI"}
    except Exception as e:
        print(f"Ray or Ollama Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

# ✅ Root Endpoint
@app.get("/")
async def root():
    return {"message": "Chat API is running with Ollama and Ray! Send a POST request to /chat."}

# ✅ Connect Users as Workers (Optional)
@app.post("/connect-worker")
async def connect_worker():
    try:
        ray.init(address="auto")
        return {"message": "Connected as Ray worker!"}
    except Exception as e:
        return {"error": str(e)}
