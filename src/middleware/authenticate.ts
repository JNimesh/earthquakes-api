import { expressjwt, UnauthorizedError } from "express-jwt";
import express from "express";
import { createErrorResponse } from "../utils/errorUtils";
import config from "config";

export default function authenticate() {
  return [
    expressjwt({
      secret: config.get("JWT_SECRET"),
      algorithms: ["HS256"],
      getToken: (req: express.Request): string | undefined => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(" ")[0] === "Bearer") {
          return authHeader.split(" ")[1];
        } else {
          return req.query?.token as string | undefined;
        }
      },
    }).unless({
      path: ["/api/users/login", /^\/api\/metrics\/?.*/, /^\/api-docs\/?.*/],
    }),
    // Error handling middleware
    (
      err: unknown,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.log("err", err);
      if (err instanceof UnauthorizedError) {
        return res
          .status(401)
          .json(createErrorResponse("Token is invalid or expired"));
      }
      next(err);
    },
  ];
}
