from fastapi import FastAPI, Depends
from app.routers.users import router as users_router
from app.routers.locations import router as locations_router
from app.routers.trips import router as trips_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Joloo API",
    description="бэкенд для сервиса поиска попутчиков в Бурятии (возможно, и не только в Бурятии)",
    version="0.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(locations_router)
app.include_router(trips_router)