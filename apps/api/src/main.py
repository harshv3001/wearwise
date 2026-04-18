from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.auth.router import router as auth_router
from src.closet_items.router import router as closet_items_router
from src.locations.router import router as locations_router
from src.media.router import router as media_router
from src.outfits.router import router as outfits_router
from src.users.router import router as users_router
from src.wear.router import router as wear_router
from src.weather.router import router as weather_router

app = FastAPI(title="WearWise API")

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / "closet_items").mkdir(exist_ok=True)
(UPLOADS_DIR / "outfits").mkdir(exist_ok=True)
(UPLOADS_DIR / "profile_images").mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://wearwise-eight.vercel.app",
        "https://wearwise.xyz",
        "https://www.wearwise.xyz",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(locations_router)
app.include_router(weather_router)
app.include_router(closet_items_router)
app.include_router(outfits_router)
app.include_router(media_router)
app.include_router(wear_router)


@app.get("/health")
def health():
    return {"status": "ok"}
