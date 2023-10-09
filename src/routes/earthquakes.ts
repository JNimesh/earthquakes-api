import express from "express";
import persistAPIRequestData from "../middleware/persistAPIRequestData";
import axios from "axios";
import {
  getEarthquakes,
  GetEarthquakesParams,
  storeEarthquakes,
} from "../services/earthquakes";
import { FeatureCollection, MagType } from "../model/earthquake";
import { createErrorResponse } from "../utils/errorUtils";
import config from "config";

const EARTHQUAKES_SUMMARY_URL = config.get("EARTHQUAKE_DATA_URL") as string;

const router = express.Router();
/**
 * @swagger
 * /api/earthquakes:
 *   get:
 *     tags:
 *       - Earthquakes Routes
 *     summary: Retrieve earthquakes data.
 *     description: Fetches earthquakes data based on provided filtering criteria. User must be authenticated using a Bearer token.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: integer
 *           format: int64
 *           example: 1640918400000
 *         description: Start time to filter earthquakes (in milliseconds since epoch).
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: integer
 *           format: int64
 *           example: 1641004800000
 *         description: End time to filter earthquakes (in milliseconds since epoch).
 *       - in: query
 *         name: magType
 *         schema:
 *           type: string
 *           enum: [md, ml, ms, mw, me, mi, mb, mlg]
 *         description: The magnitude type for the earthquake.
 *         required: true
 *       - in: query
 *         name: pageLimit
 *         schema:
 *           type: integer
 *           example: 20
 *         description: Limit for the number of results to return.
 *       - in: query
 *         name: nextCursor
 *         schema:
 *           type: string
 *         description: Cursor for the next set of results (pagination).
 *     responses:
 *       '200':
 *         description: Successful retrieval of earthquakes data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EarthQuakeDtosConnection'
 *       '400':
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 * components:
 *   schemas:
 *     EarthQuakeDto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         status:
 *           type: string
 *         mag:
 *           type: number
 *         place:
 *           type: string
 *         geometry:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *         time:
 *           type: integer
 *           format: int64
 *         updated:
 *           type: integer
 *           format: int64
 *     EarthQuakeDtosConnection:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EarthQuakeDto'
 *         pageInfo:
 *           type: object
 *           properties:
 *             nextCursor:
 *               type: string
 *             pageLimit:
 *               type: integer
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get("/", persistAPIRequestData, async (req, res) => {
  const startTime =
    req.query.startTime && parseInt(req.query.startTime as string); // e.g., '1640918400000'
  const endTime = req.query.endTime && parseInt(req.query.endTime as string);
  const magType = req.query.magType;

  if (!magType || MagType[magType as MagType] !== magType) {
    res.status(400).json(createErrorResponse("Invalid magType"));
    return;
  }

  if (startTime && endTime && startTime > endTime) {
    res
      .status(400)
      .json(createErrorResponse("startTime must be less than endTime"));
    return;
  }

  try {
    const data = await getEarthquakes({
      startTime,
      endTime,
      magType: magType as MagType,
      pageLimit: req.query.pageLimit,
      nextCursor: req.query.nextCursor,
    } as GetEarthquakesParams);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json(createErrorResponse(`Failed to retrieve earthquakes: ${error}`));
  }
});

/**
 * @swagger
 * /api/earthquakes/sync:
 *   put:
 *     tags:
 *       - Earthquakes Routes
 *     summary: Sync earthquakes data.
 *     description: Endpoint to trigger a synchronization of the earthquakes data from an external source. User must be authenticated using a Bearer token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful sync operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       '400':
 *         description: Bad request, parameters missing or incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid request parameters.
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to synchronize earthquakes data.
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.put("/sync", persistAPIRequestData, async (req, res) => {
  try {
    const response = await axios.get<FeatureCollection>(
      EARTHQUAKES_SUMMARY_URL,
    );
    const earthquakes = response.data.features.slice(0, 100);
    const success = await storeEarthquakes(earthquakes);
    if (success) {
      res.status(200).send({ success: true });
    } else {
      res.status(500).send(createErrorResponse("Error storing earthquakes"));
    }
  } catch (error) {
    res
      .status(500)
      .send(
        createErrorResponse("Error fetching earthquakes from external API"),
      );
  }
});

export default router;
