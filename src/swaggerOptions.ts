const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Earthquake API",
      version: "1.0.0",
      description: "An API to fetch earthquake data and metrics",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
  },
  // Path to the API docs
  apis: ["src/routes/*.ts"],
};

export default options;
