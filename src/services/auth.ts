import jwt from "jsonwebtoken";
import config from "config";

export function getToken(username: string, password: string): string {
  // For the purpose of this example, we're hardcoding a single username and password.
  // In a real-world scenario, you'd verify against a database.
  const USER = { username: "admin", password: "password123" }; // DO NOT hardcode credentials in production.
  if (username === USER.username && password === USER.password) {
    // Generate JWT
    return jwt.sign(
      { username: USER.username },
      config.get("JWT_SECRET") as string,
      {
        expiresIn: "1day",
      },
    );
  } else {
    throw new Error("Invalid credentials");
  }
}
