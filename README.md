# Earthquakes API

## Prerequisites

### Node and NPM Versions

- Node: `18.13.0`
- npm: `8.19.3`

### Installation

Clone the repository and navigate into the project directory. Then run:

```npm install```

## AWS DynamoDB

**AWS DynamoDB** is a dependency for this project.

- **Local DynamoDB**: If you prefer to run a local instance of DynamoDB, you can use the `localhost:8000` endpoint, as specified in the default configuration.

- **Live AWS DynamoDB**: If you wish to connect to a live AWS DynamoDB service, you'll need to provide your AWS credentials as environment variables. Ensure `AWS_REGION`, `AWS_ACCESS_KEY`, and `AWS_SECRET_KEY` are set up in your environment.

## Environment Variables

This project uses `config` to manage environment variables. Default values can be found in `config/default.json`. For environment-specific values, you can utilize environment variables as mapped in `custom-environment-variables.json`.

### Important Environment Variables:

- **`AWS_REGION`**: AWS Region for DynamoDB.
- **`AWS_ACCESS_KEY`**: AWS access key.
- **`AWS_SECRET_KEY`**: AWS secret key.
- **`EARTHQUAKES_DYNAMO_DB_TABLE`**: DynamoDB table name for earthquakes data.
- **`REQUESTS_DYNAMO_DB_TABLE`**: DynamoDB table name for requests data.
- **`EARTHQUAKE_DATA_URL`**: API URL to fetch earthquake data.
- **`JWT_SECRET`**: Secret key for JWT.
- **`APP_PORT`**: Port for the application to run on.Default is `3000`.

> **Note**: Default values for these environment variables are available in the `config/default.json` file.


## Running the Application

To run the application, follow the steps below:

1. Build the project:
  ``` npm run build```
2. Start the application:
```npm run start```
Note: You can override the APP_PORT environment variable to run the app on a desired port. By default, it will run on port 3000.

## Login to the application
Please use following credentials
- **Username**: admin
- **Password**: password123

## Running Tests

### Testing with Swagger UI

The application comes with a built-in Swagger UI that provides a visual interface for interacting with the API. This makes it convenient to test endpoints, view data models, and understand the overall structure of the API.

To access the Swagger UI:

1. Start the application.
2. Open a browser and navigate to `{BASE_URL}/api-docs`.

Replace `{BASE_URL}` with the actual base URL where the application is running. For instance, if the application is running locally on the default port, the Swagger UI can be accessed at `http://localhost:3000/api-docs`.


### Unit Tests

To run the unit tests, use the following command:

```npm run test:unit```

### Integration Tests

To run the unit tests, use the following command:

```npm run test:integration```

Before executing integration tests, make sure you have the necessary environment variables set up. If not provided, the test framework will fall back to the default values specified below:

- **APP_USERNAME**: The username to access the application.
  - Default: `admin`

- **APP_PASSWORD**: The password to access the application.
  - Default: `password123`

- **APP_URL**: The URL where the application runs.
  - Default: `http://localhost:3000`

- **USGS_URL**: The API URL to fetch earthquake data from USGS.
  - Default: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`

You can override these defaults by setting the respective environment variables in your system before running the tests.
