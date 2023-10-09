import express from "express";
import { createErrorResponse } from "../utils/errorUtils";
import { getNumberOfRequestsPerWeek } from "../services/apiMetrics";

const router = express.Router();

/**
 * @swagger
 * /api/metrics/requests-count/week:
 *   get:
 *     tags:
 *       - API Metrics
 *     summary: Get the number of requests per week.
 *     description: Fetches the number of requests made during a specific week of a given year.
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *           example: 40
 *         description: The week number to fetch the metrics for.
 *         required: true
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2023
 *         description: The year to fetch the metrics for.
 *         required: true
 *     responses:
 *       '200':
 *         description: Successful response.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   count:
 *                     type: integer
 *                     description: Number of requests.
 *                     example: 150
 *                   path:
 *                     type: string
 *                     description: The endpoint path.
 *                     example: /api/users/login
 *                   method:
 *                     type: string
 *                     description: HTTP method used.
 *                     enum: ["GET", "PUT", "POST", "DELETE"]
 *                     example: POST
 *       '400':
 *         description: Bad request. Week and year are required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Week and year are required.
 *       '500':
 *         description: Internal server error. Failed to retrieve metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve metrics.
 */
router.get("/requests-count/week", async (req, res) => {
  const week = req.query.week as string;
  const year = req.query.year as string;
  if (!week || !year) {
    return res
      .status(400)
      .send(createErrorResponse("Week and year are required."));
  }
  try {
    const metrics = await getNumberOfRequestsPerWeek({
      week: Number(week),
      year: Number(year),
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json(createErrorResponse("Failed to retrieve metrics."));
  }
});

export default router;
