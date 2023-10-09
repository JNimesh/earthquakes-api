export enum MagType {
  md = "md",
  ml = "ml",
  ms = "ms",
  mw = "mw",
  me = "me",
  mi = "mi",
  mb = "mb",
  mlg = "mlg",
}

export type EarthQuakeDto = {
  id: string;
  title: string;
  status: string;
  mag: number;
  place: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  time: number;
  updated: number;
};

export interface EarthQuakeDtosConnection {
  items: EarthQuakeDto[];
  pageInfo: { nextCursor?: string; pageLimit: number };
}

export interface FeatureCollection {
  type: "FeatureCollection";
  metadata: Metadata;
  bbox: BoundingBox;
  features: Feature[];
}

export interface Metadata {
  generated: number;
  url: string;
  title: string;
  api: string;
  count: number;
  status: number;
}

type BoundingBox = [
  minLongitude: number,
  minLatitude: number,
  minDepth: number,
  maxLongitude: number,
  maxLatitude: number,
  maxDepth: number,
];

export interface Feature {
  type: "Feature";
  properties: Properties;
  geometry: Geometry;
  id: string;
}

export interface Properties {
  mag: number;
  place: string;
  time: number;
  updated: number;
  tz: number;
  url: string;
  detail: string;
  felt: number;
  cdi: number;
  mmi: number;
  alert: string;
  status: string;
  tsunami: number;
  sig: number;
  net: string;
  code: string;
  ids: string;
  sources: string;
  types: string;
  nst: number;
  dmin: number;
  rms: number;
  gap: number;
  magType: MagType;
  type: string;
  title: string;
}

export interface Geometry {
  type: "Point";
  coordinates: [longitude: number, latitude: number, depth: number];
}
