import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  saveAPIRequestMetrics,
  getNumberOfRequestsPerWeek,
  APIMetricsRequestParams,
} from "./apiMetrics";
import { dynamoDbClient } from "../dynamo/client";

jest.mock("../dynamo/client");

describe("Metrics Module", () => {
  const sendMock = jest.fn();

  beforeEach(() => {
    (dynamoDbClient.send as jest.Mock) = sendMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("saveAPIRequestMetrics", () => {
    it("should successfully save API request metrics", async () => {
      const mockData: APIMetricsRequestParams = {
        requestId: "123",
        datetime: "2023-10-06T00:00:00Z",
        path: "/test",
        statusCode: 200,
        requestBody: {},
        requestHeaders: {},
        requestQuery: {},
        executionTime: 123,
        method: "GET",
      };

      sendMock.mockResolvedValueOnce({}).mockResolvedValueOnce({}); // Mock two dynamoDbClient.send calls

      await saveAPIRequestMetrics(mockData);

      expect(sendMock).toHaveBeenNthCalledWith(1, expect.any(PutCommand));
      expect(sendMock).toHaveBeenNthCalledWith(2, expect.any(UpdateCommand));
    });

    it("should handle errors while saving API request metrics", async () => {
      const mockData: APIMetricsRequestParams = {
        requestId: "123",
        datetime: "2023-10-06T00:00:00Z",
        path: "/test",
        statusCode: 200,
        requestBody: {},
        requestHeaders: {},
        requestQuery: {},
        executionTime: 123,
        method: "GET",
      };

      sendMock.mockRejectedValueOnce(new Error("Save Error"));

      await expect(saveAPIRequestMetrics(mockData)).rejects.toThrow(
        "Error saving request metrics",
      );
    });
  });

  describe("getNumberOfRequestsPerWeek", () => {
    it("should successfully retrieve number of requests per week", async () => {
      const mockWeekParams = {
        week: 40,
        year: 2023,
      };

      const mockResponse = {
        Items: [
          {
            totalCount: 5,
            sk: "/test#GET",
          },
          {
            totalCount: 9,
            sk: "/test9#GET",
          },
        ],
      };

      sendMock.mockResolvedValueOnce(mockResponse);
      const result = await getNumberOfRequestsPerWeek(mockWeekParams);
      expect(sendMock).toBeCalledWith(expect.any(QueryCommand));
      expect(result).toEqual([
        {
          path: "/test9",
          method: "GET",
          count: 9,
        },
        {
          path: "/test",
          method: "GET",
          count: 5,
        },
      ]);
    });

    it("should handle errors while retrieving number of requests per week", async () => {
      const mockWeekParams = {
        week: 40,
        year: 2023,
      };

      sendMock.mockRejectedValueOnce(new Error("Fetch Error"));

      await expect(getNumberOfRequestsPerWeek(mockWeekParams)).rejects.toThrow(
        "Error getting metrics",
      );
    });
  });
});
