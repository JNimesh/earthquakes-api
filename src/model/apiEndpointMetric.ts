export interface RequestCount {
  path: string;
  method: string;
  count: number;
}

export interface WeeklyRequestCountParams {
  year: number;
  week: number;
}
