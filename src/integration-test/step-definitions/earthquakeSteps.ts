import { Given, Then, When } from "@cucumber/cucumber";
import axios from "axios";
import {
  EarthQuakeDto,
  EarthQuakeDtosConnection,
  Feature,
  MagType,
} from "../../model/earthquake";
import { expect } from "chai";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const USGS_URL =
  process.env.USGS_URL ||
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let originalEarthquakes: Feature[] = [];
let filteredEarthquakes: EarthQuakeDtosConnection;
let startTime: number;
let endTime: number;

Given("I fetch the latest earthquakes from USGS", async function () {
  const response = await axios.get(USGS_URL);
  originalEarthquakes = response.data.features;
});

When("I synchronize the app's earthquake data", async function () {
  await axios.put(
    `${APP_URL}/api/earthquakes/sync`,
    {},
    {
      headers: {
        Authorization: `Bearer ${process.env.APP_TOKEN}`,
      },
    },
  );
});

Then(
  "the earthquake data should be validated against the original",
  async function () {
    const earthquakesResponse = await axios.get<EarthQuakeDtosConnection>(
      `${APP_URL}/api/earthquakes`,
      {
        headers: {
          Authorization: `Bearer ${process.env.APP_TOKEN}`,
        },
        params: {
          pageLimit: 20,
          magType: originalEarthquakes[0].properties.magType,
        },
      },
    );

    expect(earthquakesResponse.data.items.length).greaterThanOrEqual(20);

    const originalFirstEarthquake = originalEarthquakes[0];
    const matchedEarthquake = earthquakesResponse.data.items.find(
      (eq) => eq.id === originalFirstEarthquake.id,
    );

    expect(matchedEarthquake).to.exist;
    compareEarthquakes(
      matchedEarthquake as EarthQuakeDto,
      originalFirstEarthquake,
    );

    for (let i = 1; i < earthquakesResponse.data.items.length; i++) {
      expect(earthquakesResponse.data.items[i - 1].time).greaterThanOrEqual(
        earthquakesResponse.data.items[i].time,
      );
    }
  },
);

When("I send an API call with modified startTime", async function () {
  startTime = originalEarthquakes[0].properties.time - 1;
  await fetchFilteredEarthquakes();
});

When(
  "I send an API call with parameters startTime and endTime",
  async function () {
    startTime = originalEarthquakes[0].properties.time - 1;
    endTime = originalEarthquakes[0].properties.time + 1;
    await fetchFilteredEarthquakes();
  },
);

When("I send an API call with different magType", async function () {
  startTime = originalEarthquakes[0].properties.time - 1;
  endTime = originalEarthquakes[0].properties.time + 1;
  const diffMagType = Object.keys(MagType).find(
    (key) => key !== originalEarthquakes[0].properties.magType,
  );
  await fetchFilteredEarthquakes(diffMagType);
});

When("I send an API call out of the range", async function () {
  startTime = originalEarthquakes[0].properties.time + 1;
  endTime = originalEarthquakes[0].properties.time + 3;
  await fetchFilteredEarthquakes();
});

Then("I should see the latest earthquake details in response", function () {
  const earthquakes = filteredEarthquakes.items;
  const originalFirstEarthquake = originalEarthquakes[0];
  const matchedEarthquake = earthquakes.find(
    (eq) => eq.id === originalFirstEarthquake.id,
  );

  expect(matchedEarthquake).to.exist;
  compareEarthquakes(
    matchedEarthquake as EarthQuakeDto,
    originalFirstEarthquake,
  );

  const startTime = originalFirstEarthquake.properties.time - 1;
  for (let i = 1; i < earthquakes.length; i++) {
    expect(earthquakes[i - 1].time).greaterThanOrEqual(earthquakes[i].time);
    expect(earthquakes[i].time).greaterThanOrEqual(startTime);
  }
});

Then("I should not see the latest earthquake details in response", function () {
  const earthquakes = filteredEarthquakes.items;
  const originalFirstEarthquake = originalEarthquakes[0];
  const matchedEarthquake = earthquakes.find(
    (eq) => eq.id === originalFirstEarthquake.id,
  );

  expect(matchedEarthquake).not.exist;

  for (let i = 1; i < earthquakes.length; i++) {
    expect(earthquakes[i - 1].time).greaterThanOrEqual(earthquakes[i].time);
  }
});

async function fetchFilteredEarthquakes(magType?: string) {
  const earthquakesResponse = await axios.get(`${APP_URL}/api/earthquakes`, {
    headers: {
      Authorization: `Bearer ${process.env.APP_TOKEN}`,
    },
    params: {
      pageLimit: 10,
      magType: magType || originalEarthquakes[0].properties.magType,
      startTime,
      endTime,
    },
  });
  filteredEarthquakes = earthquakesResponse.data as EarthQuakeDtosConnection;
}

function compareEarthquakes(
  matchedEarthquake: EarthQuakeDto,
  originalEarthquake: Feature,
): void {
  const matchedProperties = {
    id: matchedEarthquake.id,
    time: matchedEarthquake.time,
    title: matchedEarthquake.title,
    status: matchedEarthquake.status,
    mag: matchedEarthquake.mag,
    place: matchedEarthquake.place,
    geometryType: matchedEarthquake.geometry.type,
    coordinates: matchedEarthquake.geometry.coordinates,
    updated: matchedEarthquake.updated,
  };

  const originalProperties = {
    id: originalEarthquake.id,
    time: originalEarthquake.properties.time,
    title: originalEarthquake.properties.title,
    status: originalEarthquake.properties.status,
    mag: originalEarthquake.properties.mag,
    place: originalEarthquake.properties.place,
    geometryType: originalEarthquake.geometry.type,
    coordinates: originalEarthquake.geometry.coordinates,
    updated: originalEarthquake.properties.updated,
  };

  expect(matchedProperties).to.deep.equal(originalProperties);
}
