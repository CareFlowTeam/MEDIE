import base64, json
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from Crypto.Hash import MD5


def decrypt_cryptojs_aes(cipher_text: str, secret_key: str):
    raw = base64.b64decode(cipher_text)

    if raw[:8] != b"Salted__":
        raise ValueError("Invalid encrypted format")

    salt = raw[8:16]
    encrypted = raw[16:]

    derived = b""
    while len(derived) < 48:
        derived += MD5.new(derived + secret_key.encode() + salt).digest()

    key = derived[:32]
    iv = derived[32:48]

    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted = unpad(cipher.decrypt(encrypted), AES.block_size)

    return json.loads(decrypted.decode("utf-8"))
