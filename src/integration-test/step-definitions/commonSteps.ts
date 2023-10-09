import { Given } from "@cucumber/cucumber";
import axios from "axios";

const USERNAME = process.env.APP_USERNAME || "admin";
const PASSWORD = process.env.APP_PASSWORD || "password123";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

Given("I am logged into the app", async function () {
  const loginResponse = await axios.post(`${APP_URL}/api/users/login`, {
    username: USERNAME,
    password: PASSWORD,
  });
  process.env.APP_TOKEN = loginResponse.data.token;
});

Given("I wait for {int} seconds", function (duration: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration * 1000);
  });
});
