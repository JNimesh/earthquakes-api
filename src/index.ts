import express from "express";
import userRoutes from "./routes/users";
import apiMetricsRoutes from "./routes/apiMetrics";
import earthquakeRoutes from "./routes/earthquakes";
import authenticate from "./middleware/authenticate";
import { runDbMigrations } from "./startup/dbMigrations";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";
import config from "config";

const PORT = config.has("APP_PORT") ? config.get("APP_PORT") : 3000;

const app = express();
app.use(express.json());
app.use(authenticate());

const swaggerSpec = swaggerJsDoc(swaggerOptions);
// Use Swagger middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/users", userRoutes);
app.use("/api/metrics", apiMetricsRoutes);
app.use("/api/earthquakes", earthquakeRoutes);

runDbMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Error running the DB migrations", error);
    throw error;
  });
