from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth

app = FastAPI(title="Super Car Rental API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")


@app.get("/health")
def health():
    return {"status": "ok"}
