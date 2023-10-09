import { Given, Then } from "@cucumber/cucumber";
import axios from "axios";
import { expect } from "chai";
import { RequestCount } from "../../model/apiEndpointMetric";

let initialCount: number;

const APP_URL = process.env.APP_URL || "http://localhost:3000";

Given(
  "I send an API call to get the requests count for path {string}",
  async function (path: string) {
    const currentDate = new Date();
    const response = await axios.get<RequestCount[]>(
      `${APP_URL}/api/metrics/requests-count/week`,
      {
        params: {
          week: getWeek(currentDate),
          year: currentDate.getFullYear(),
        },
      },
    );
    const requestCount = response.data.find((item) => item.path === path);
    const count = requestCount ? requestCount.count : 0;
    expect(count).to.be.a("number");
    initialCount = count;
  },
);

Then(
  "the count for path {string} should be increased",
  async function (path: string) {
    const currentDate = new Date();
    const response = await axios.get<RequestCount[]>(
      `${APP_URL}/api/metrics/requests-count/week`,
      {
        params: {
          week: getWeek(currentDate),
          year: currentDate.getFullYear(),
        },
      },
    );
    const requestCount = response.data.find((item) => item.path === path);
    const newCount = requestCount ? requestCount.count : 0;
    console.log("initialCount", initialCount);
    console.log("newCount", newCount);
    expect(newCount).greaterThan(initialCount);
  },
);

function getWeek(date: Date): number {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((tempDate.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}
