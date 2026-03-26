from azure.cosmos import CosmosClient, PartitionKey

from dotenv import load_dotenv

load_dotenv()

import os

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DATABASE_NAME = os.getenv("COSMOS_DATABASE_NAME", "medichubs")


print("ENDPOINT:", COSMOS_ENDPOINT)
print("KEY:", COSMOS_KEY)

client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
database = client.create_database_if_not_exists(id=COSMOS_DATABASE_NAME)

container = database.create_container_if_not_exists(
    id="weight_logs",
    partition_key=PartitionKey(path="/device_id"),
    indexing_policy={
        "indexingMode": "consistent",
        "automatic": True,
        "includedPaths": [{"path": "/*"}],
        "excludedPaths": [{"path": '/"_etag"/?'}],
        "compositeIndexes": [
            [
                {"path": "/device_id", "order": "ascending"},
                {"path": "/timestamp_epoch", "order": "descending"},
            ]
        ],
    },
)

print("weight_logs container ready")
