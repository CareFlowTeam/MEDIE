import os
from azure.cosmos import CosmosClient, PartitionKey
from dotenv import load_dotenv

load_dotenv()

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DATABASE_NAME = os.getenv("COSMOS_DATABASE_NAME", "medichubs")

if not COSMOS_ENDPOINT or not COSMOS_KEY:
    raise ValueError("COSMOS_ENDPOINT 또는 COSMOS_KEY 환경변수가 없습니다.")

client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
database = client.create_database_if_not_exists(id=COSMOS_DATABASE_NAME)


def get_container(container_name: str):
    return database.get_container_client(container_name)


def create_container_if_not_exists(container_name: str, partition_key: str):
    return database.create_container_if_not_exists(
        id=container_name,
        partition_key=PartitionKey(path=partition_key),
    )
