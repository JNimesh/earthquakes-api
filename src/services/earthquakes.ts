import {
  dynamoDbClient,
  earthquakesTableName as TableName,
} from "../dynamo/client";
import { chunkArray } from "../utils/arrayUtils";

import {
  BatchWriteCommand,
  BatchWriteCommandOutput,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import {
  EarthQuakeDto,
  EarthQuakeDtosConnection,
  Feature,
  MagType,
} from "../model/earthquake";

const DEFAULT_PAGE_SIZE = 10;
const PROJECTION_NAMES_MAP: Record<string, string> = {
  "#id": "id",
  "#title": "title",
  "#status": "status",
  "#mag": "mag",
  "#place": "place",
  "#geometry": "geometry",
  "#time": "time",
  "#updated": "updated",
  "#magType": "magType",
};

export interface GetEarthquakesParams {
  magType: MagType;
  startTime?: number;
  endTime?: number;
  pageLimit?: number;
  nextCursor?: string;
}

export function encodeCursor(lastEvaluatedKey: Record<string, string>): string {
  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString("base64");
}

export function decodeCursor(cursor: string): Record<string, string> {
  return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
}

export const storeEarthquakes = async (data: Feature[]): Promise<boolean> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 200;
  const MAX_BATCH_SIZE = 25;
  const requestItems = data.map(({ id, properties, geometry }) => ({
    PutRequest: {
      Item: {
        id,
        ...properties,
        geometry,
        pk: id,
        gsi1pk: `${properties.magType}`,
        gsi1sk: `${properties.time}`,
      },
    },
  }));
  const requestItemChunks = chunkArray(requestItems, MAX_BATCH_SIZE);
  for (const chunk of requestItemChunks) {
    let retries = 0;
    let unprocessedItems = { [TableName]: chunk };
    do {
      try {
        const params = {
          RequestItems: unprocessedItems,
        };
        const response: BatchWriteCommandOutput = await dynamoDbClient.send(
          new BatchWriteCommand(params),
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        unprocessedItems = response.UnprocessedItems ?? {};
        if (Object.keys(unprocessedItems).length === 0) {
          break;
        }
        console.warn("Unprocessed items found. Retrying...");
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        retries++;
      } catch (error) {
        console.error("Unable to add items. Error:", JSON.stringify(error));
        return false;
      }
    } while (retries < MAX_RETRIES);

    if (retries === MAX_RETRIES) {
      console.error("Max retries reached for batch write.");
      return false;
    }
  }
  return true;
};

export const getEarthquakes = async (
  params: GetEarthquakesParams,
): Promise<EarthQuakeDtosConnection> => {
  try {
    return await getEarthQuakesByMagnitudeAndTimeRange(params);
  } catch (error) {
    console.error("Error getting earthquakes", error);
    throw new Error("Error getting earthquakes");
  }
};

async function getEarthQuakesByMagnitudeAndTimeRange(
  params: GetEarthquakesParams,
): Promise<EarthQuakeDtosConnection> {
  const {
    startTime,
    endTime,
    magType,
    pageLimit = DEFAULT_PAGE_SIZE,
    nextCursor,
  } = params;
  const expressionAttributeNames: Record<string, string> = {
    "#gsi1pk": "gsi1pk",
  };
  const expressionAttributeValues: Record<string, string> = {
    ":gsi1pk": `${magType}`,
  };
  let keyConditionExpression = "#gsi1pk = :gsi1pk";
  if (startTime && endTime) {
    keyConditionExpression += " AND #gsi1sk BETWEEN :startTime AND :endTime";
    expressionAttributeNames["#gsi1sk"] = "gsi1sk";
    expressionAttributeValues[":startTime"] = String(startTime);
    expressionAttributeValues[":endTime"] = String(endTime);
  } else if (startTime) {
    keyConditionExpression += " AND #gsi1sk >= :startTime";
    expressionAttributeNames["#gsi1sk"] = "gsi1sk";
    expressionAttributeValues[":startTime"] = String(startTime);
  } else if (endTime) {
    keyConditionExpression += " AND #gsi1sk <= :endTime";
    expressionAttributeNames["#gsi1sk"] = "gsi1sk";
    expressionAttributeValues[":endTime"] = String(endTime);
  }

  const data = await dynamoDbClient.send(
    new QueryCommand({
      TableName,
      IndexName: "gsi1",
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: {
        ...PROJECTION_NAMES_MAP,
        ...expressionAttributeNames,
      },
      ExpressionAttributeValues: expressionAttributeValues,
      ProjectionExpression:
        "#id, #title, #status, #mag, #magType, #place, #geometry, #time, #updated",
      Limit: pageLimit,
      ExclusiveStartKey: nextCursor ? decodeCursor(nextCursor) : undefined,
      ScanIndexForward: false, // For descending order by time
    }),
  );
  return {
    items: (data.Items || []) as Array<EarthQuakeDto>,
    pageInfo: {
      nextCursor: data.LastEvaluatedKey
        ? encodeCursor(data.LastEvaluatedKey as Record<string, string>)
        : undefined,
      pageLimit: pageLimit,
    },
  };
}
