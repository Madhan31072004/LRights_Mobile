"""MongoDB connection - same DB as JS backend."""
import logging
from typing import Optional

from pymongo import MongoClient
from pymongo.database import Database

from app.config import DB_NAME, MONGODB_LOCAL_URI, MONGODB_URI

logger = logging.getLogger(__name__)
_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def _mask_uri(uri: str) -> str:
    if "@" in uri:
        parts = uri.split("@", 1)
        return parts[0].split("//")[0] + "//***:***@" + parts[1]
    return uri


def get_db() -> Database:
    global _db
    if _db is not None:
        return _db
    global _client
    try:
        logger.info("Attempting to connect to MongoDB: %s", _mask_uri(MONGODB_URI))
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        _client.admin.command("ping")
        _db = _client[DB_NAME]
        logger.info("MongoDB Connected (Atlas)")
        return _db
    except Exception as atlas_err:
        logger.warning("MongoDB Atlas failed, trying local: %s", atlas_err)
        try:
            _client = MongoClient(MONGODB_LOCAL_URI, serverSelectionTimeoutMS=3000)
            _client.admin.command("ping")
            _db = _client[DB_NAME]
            logger.info("Local MongoDB Connected")
            return _db
        except Exception as local_err:
            logger.error("All MongoDB connections failed: %s, %s", atlas_err, local_err)
            raise


def close_db() -> None:
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
