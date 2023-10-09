import {
  decodeCursor,
  encodeCursor,
  getEarthquakes,
  storeEarthquakes,
} from "./earthquakes";
import { dynamoDbClient } from "../dynamo/client";
import { BatchWriteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Feature, MagType } from "../model/earthquake";

jest.mock("../dynamo/client");
jest.mock("config", () => ({
  has: () => {
    return false;
  },
  get: (key: string) => {
    return {
      DYNAMO_DB_TABLE_NAME: "GeologicalEvents",
      ENV: "test",
    }[key];
  },
}));

const EARTHQUAKE_FEATURE = {
  id: "us7000d0b2",
  properties: {
    mag: 4.5,
    place: "south of the Fiji Islands",
    time: 1614553931530,
    updated: 1614555158040,
    title: "M 4.5 - south of the Fiji Islands",
    status: "reviewed",
  },
  geometry: {
    type: "Point",
    coordinates: [-179.9998, -24.9999, 10],
  },
} as unknown as Feature;

describe("Earthquake Module", () => {
  const sendMock = jest.fn();

  beforeEach(() => {
    (dynamoDbClient.send as jest.Mock) = sendMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("storeEarthquakes", () => {
    it("should store earthquakes data", async () => {
      const mockData = [EARTHQUAKE_FEATURE];
      sendMock.mockResolvedValueOnce({});

      const result = await storeEarthquakes(mockData);

      expect(sendMock).toBeCalledWith(expect.any(BatchWriteCommand));
      expect(result).toBe(true);
    });

    it("should handle errors while storing earthquakes data", async () => {
      sendMock.mockRejectedValueOnce(new Error("Store Error"));
      expect(await storeEarthquakes([EARTHQUAKE_FEATURE])).toBeFalsy();
    });
  });

  describe("getEarthquakes", () => {
    it("should retrieve earthquakes data by magnitude and time range", async () => {
      const mockParams = {
        magType: "ml" as MagType,
        startTime: 1696746198876,
        endTime: 1696746198879,
        pageLimit: 2,
      };

      const mockResponse = {
        Items: [EARTHQUAKE_FEATURE],
        LastEvaluatedKey: { pk: "EARTHQUAKE#us7000d0b2", sk: "DATA" },
      };

      sendMock.mockResolvedValueOnce(mockResponse);
      const result = await getEarthquakes(mockParams);
      expect(sendMock).toBeCalledWith(expect.any(QueryCommand));
      expect(result.items).toEqual([EARTHQUAKE_FEATURE]);
      expect(result.pageInfo.nextCursor).toEqual(
        encodeCursor(mockResponse.LastEvaluatedKey as Record<string, string>),
      );
    });

    it("should handle errors while retrieving earthquakes data", async () => {
      sendMock.mockRejectedValueOnce(new Error("Fetch Error"));

      await expect(
        getEarthquakes({ magType: "ml" as MagType }),
      ).rejects.toThrow("Error getting earthquakes");
    });
  });

  describe("Cursor Utilities", () => {
    it("should encode and then decode to get the original value", () => {
      const mockLastEvaluatedKey: Record<string, string> = {
        someKey: "someValue",
        anotherKey: "anotherValue",
      };

      const encodedValue = encodeCursor(mockLastEvaluatedKey);
      const decodedValue = decodeCursor(encodedValue);

      expect(decodedValue).toEqual(mockLastEvaluatedKey);
    });
  });
});
