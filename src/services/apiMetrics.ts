import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getISOWeek, getYear } from "date-fns";
import {
  RequestCount,
  WeeklyRequestCountParams,
} from "../model/apiEndpointMetric";
import {
  dynamoDbClient,
  requestsTableName as TableName,
} from "../dynamo/client";

export interface APIMetricsRequestParams {
  requestId: string;
  datetime: string;
  path: string;
  statusCode: number;
  requestBody: Record<string, string>;
  requestHeaders: { [key: string]: string };
  requestQuery: { [key: string]: string };
  executionTime: number;
  method: string;
}

export async function saveAPIRequestMetrics(
  request: APIMetricsRequestParams,
): Promise<void> {
  const weekString = getWeekString(new Date(request.datetime));

  const putRequestParams = {
    TableName,
    Item: {
      pk: `REQUEST#${request.requestId}`,
      sk: `${request.datetime}`,
      ...request,
    },
  };
  const updateCountParams = {
    TableName,
    Key: {
      pk: `REQUEST_COUNT#${weekString}`,
      sk: `${request.path}#${request.method}`,
    },
    UpdateExpression:
      "SET totalCount = if_not_exists(totalCount, :zero) + :incr",
    ExpressionAttributeValues: {
      ":incr": 1,
      ":zero": 0,
    },
  };
  try {
    await Promise.all([
      dynamoDbClient.send(new PutCommand(putRequestParams)),
      dynamoDbClient.send(new UpdateCommand(updateCountParams)),
    ]);
  } catch (error) {
    console.error("Error saving request metrics", error);
    throw new Error("Error saving request metrics");
  }
}

export async function getNumberOfRequestsPerWeek(
  request: WeeklyRequestCountParams,
): Promise<RequestCount[]> {
  const weekString = `${request.year}-${request.week}`;
  const params = {
    TableName,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": `REQUEST_COUNT#${weekString}`,
    },
    ProjectionExpression: "sk, totalCount",
  };

  try {
    const result = await dynamoDbClient.send(new QueryCommand(params));
    return (result.Items as Array<{ totalCount: number; sk: string }>)
      ?.sort((a, b) => b.totalCount - a.totalCount)
      .map((iitem) => {
        const [path, method] = iitem.sk.split("#");
        return {
          path,
          method,
          count: iitem.totalCount,
        };
      });
  } catch (error) {
    console.error("Error getting metrics", error);
    throw new Error("Error getting metrics");
  }
}

function getWeekString(date: Date): string {
  const year = getYear(date);
  const week = getISOWeek(date);
  return `${year}-${String(week).padStart(2, "0")}`;
}
