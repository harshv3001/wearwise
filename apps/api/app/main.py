from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routes import auth, closet_items, outfit, wear

from . import models


Base.metadata.create_all(bind=engine)

app = FastAPI(title="WearWise API")

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / "closet_items").mkdir(exist_ok=True)
(UPLOADS_DIR / "outfits").mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",  
        "https://wearwise-eight.vercel.app",
        "https://wearwise.xyz",
        "https://www.wearwise.xyz"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(closet_items.router)
app.include_router(outfit.router)
app.include_router(wear.router)


@app.get("/health")
def health():
    return {"status": "ok"}