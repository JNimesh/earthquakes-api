import express from "express";
import {
  APIMetricsRequestParams,
  saveAPIRequestMetrics,
} from "../services/apiMetrics";
import { v4 as uuidv4 } from "uuid";

export default function persistAPIRequestData(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const start = Date.now();

  res.on("finish", async () => {
    const executionTime = Date.now() - start;
    try {
      await saveAPIRequestMetrics({
        requestId: uuidv4(),
        datetime: new Date().toISOString(),
        path: req.baseUrl + req.path,
        statusCode: res.statusCode,
        requestBody: req.body,
        requestQuery: req.query,
        requestHeaders: req.headers,
        responseHeaders: res.getHeaders(),
        executionTime: executionTime,
        method: req.method,
      } as APIMetricsRequestParams);
    } catch (error) {
      console.error("Failed to save request: ", error);
    }
  });

  next();
}
