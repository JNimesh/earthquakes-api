import express from "express";
import { getToken } from "../services/auth";
import { createErrorResponse } from "../utils/errorUtils";

const router = express.Router();

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *       - User Routes
 *     summary: Login a user
 *     description: Login a user and retrieve a JWT token
 *     operationId: loginUser
 *     requestBody:
 *       description: User's credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - token
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  try {
    const token = getToken(username, password);
    res.json({ token });
  } catch (error) {
    res.status(401).send(createErrorResponse("Invalid Credentials"));
  }
});

export default router;
