import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import auth, transactions, invoices, btw, banks, waitlist

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("klaarboek")

app = FastAPI(
    title="KlaarBoek API",
    description="Bookkeeping automation for Dutch ZZP'ers.",
    version="0.2.0",
)

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
    response = await call_next(request)
    logger.info("%s %s -> %s", request.method, request.url.path, response.status_code)
    return response


@app.get("/")
async def root():
    return {"message": "KlaarBoek API", "version": app.version, "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
