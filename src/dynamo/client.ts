import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import config from "config";

const dynamoDbConfig: Record<string, string | Record<string, string>> = {
  region: config.get("AWS_REGION"),
  credentials: {
    accessKeyId: config.get("AWS_ACCESS_KEY_ID"),
    secretAccessKey: config.get("AWS_SECRET_ACCESS_KEY"),
  },
};

if (!(config.has("ENV") && config.get("ENV") === "production")) {
  dynamoDbConfig.endpoint = config.get("DEV_MODE_DYNAMODB_ENDPOINT");
}

export const dynamoDB = new DynamoDBClient(dynamoDbConfig);
export const dynamoDbClient = DynamoDBDocumentClient.from(dynamoDB);
export const earthquakesTableName = config.get(
  "EARTHQUAKES_DYNAMO_DB_TABLE",
) as string;
export const requestsTableName = config.get(
  "REQUESTS_DYNAMO_DB_TABLE",
) as string;
