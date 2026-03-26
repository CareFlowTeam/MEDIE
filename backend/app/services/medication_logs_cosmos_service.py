import os
from azure.cosmos import CosmosClient, PartitionKey

COSMOS_CONNECTION_STRING = os.getenv("COSMOS_CONNECTION_STRING")

MEDICATION_LOGS_COSMOS_DB = os.getenv("MEDICATION_LOGS_COSMOS_DB", "medichub")
MEDICATION_LOGS_COSMOS_CONTAINER = os.getenv(
    "MEDICATION_LOGS_COSMOS_CONTAINER", "medication_logs"
)

client = CosmosClient.from_connection_string(COSMOS_CONNECTION_STRING)


def get_medication_logs_container():
    database = client.create_database_if_not_exists(id=MEDICATION_LOGS_COSMOS_DB)
    container = database.create_container_if_not_exists(
        id=MEDICATION_LOGS_COSMOS_CONTAINER,
        partition_key=PartitionKey(path="/user_id"),
        offer_throughput=400,
    )
    return container
