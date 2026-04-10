import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.routes import auth, transactions, invoices, btw, banks, waitlist

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("klaarboek")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="KlaarBoek API",
    description="AI-powered bookkeeping automation for Dutch ZZP'ers",
    version="0.1.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS from env
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(invoices.router)
app.include_router(btw.router)
app.include_router(banks.router)
app.include_router(waitlist.router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"{request.method} {request.url.path} → {response.status_code}")
    return response


@app.get("/")
async def root():
    return {"message": "KlaarBoek API", "version": "0.1.0", "status": "operational"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
