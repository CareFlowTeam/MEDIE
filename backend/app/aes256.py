# aes256.py
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.padding import PKCS7
from cryptography.hazmat.backends import default_backend

# ⚠️ 반드시 환경변수로 관리하세요
SECRET_KEY = b"0123456789abcdef0123456789abcdef"  # 32 bytes


def decrypt_aes256(cipher_text: str, iv: str) -> str:
    backend = default_backend()

    cipher_bytes = base64.b64decode(cipher_text)
    iv_bytes = base64.b64decode(iv)

    cipher = Cipher(algorithms.AES(SECRET_KEY), modes.CBC(iv_bytes), backend=backend)

    decryptor = cipher.decryptor()
    padded_plaintext = decryptor.update(cipher_bytes) + decryptor.finalize()

    unpadder = PKCS7(128).unpadder()
    plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()

    return plaintext.decode("utf-8")
