from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Request Model
class ChatRequest(BaseModel):
    message: str

# API Endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Use Ollama's chat function
        response = ollama.chat(model="llama3.1:8b", messages=[{"role": "user", "content": request.message}])
        return {"response": response["message"]}
    except Exception as e:
        print(f"❌ Ollama Error: {e}")  # Debugging line
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

# Root Endpoint
@app.get("/")
async def root():
    return {"message": "Chat API is running with Ollama! Send a POST request to /chat."}
