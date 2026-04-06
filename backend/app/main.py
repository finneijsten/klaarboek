from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, transactions

app = FastAPI(
    title="KlaarBoek API",
    description="AI-powered bookkeeping automation for Dutch ZZP'ers",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://finneijsten.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)


@app.get("/")
async def root():
    return {"message": "KlaarBoek API", "version": "0.1.0", "status": "operational"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
