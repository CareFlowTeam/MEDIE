from pydantic import BaseModel


class KakaoLoginRequest(BaseModel):
    access_token: str
