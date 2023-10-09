import { dynamoDB } from "../dynamo/client";
import {
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import config from "config";

export async function runDbMigrations() {
  await createEarthQuakesTable();
  await createRequestsTable();
}

export const checkTableExists = async (tableName: string): Promise<boolean> => {
  const describeTableCommand = new DescribeTableCommand({
    TableName: tableName,
  });

  try {
    const data = await dynamoDB.send(describeTableCommand);
    return !!data.Table;
  } catch (error) {
    if ((error as Error).name === "ResourceNotFoundException") {
      return false;
    }
    console.error("Error checking table existence:", error);
    throw error;
  }
};

const createEarthQuakesTable = async () => {
  const tableName = config.get("EARTHQUAKES_DYNAMO_DB_TABLE") as string;
  const exists = await checkTableExists(tableName);

  if (exists) {
    console.log(`${tableName} already exists.`);
    return;
  }

  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" }, // Partition Key based on ID (eq#<id>),
    ],
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "gsi1pk", AttributeType: "S" },
      { AttributeName: "gsi1sk", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "gsi1",
        KeySchema: [
          { AttributeName: "gsi1pk", KeyType: "HASH" }, // Partition Key for GSI
          { AttributeName: "gsi1sk", KeyType: "RANGE" }, // Sort Key for GSI
        ],
        Projection: {
          ProjectionType: "ALL",
        },
      },
    ],
  };
  try {
    const createTableCommand = new CreateTableCommand(params);
    const data = await dynamoDB.send(createTableCommand);
    console.log(`Created table ${tableName}:`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
  }
};

const createRequestsTable = async () => {
  const tableName = config.get("REQUESTS_DYNAMO_DB_TABLE") as string;
  const exists = await checkTableExists(tableName);

  if (exists) {
    console.log(`${tableName} already exists.`);
    return;
  }

  const params = {
    TableName: tableName,
    BillingMode: "PAY_PER_REQUEST",
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" }, // Partition Key based on ID (eq#<id>)
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
    ],
  };
  try {
    const createTableCommand = new CreateTableCommand(params);
    const data = await dynamoDB.send(createTableCommand);
    console.log(`Created table ${tableName}:`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
  }
};
