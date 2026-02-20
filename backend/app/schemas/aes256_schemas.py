#   aes256_schemas.py
from pydantic import BaseModel


class EncryptedPillRequest(BaseModel):
    cipherText: str
    iv: str
