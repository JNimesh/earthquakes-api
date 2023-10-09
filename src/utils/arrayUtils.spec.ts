import { chunkArray } from "./arrayUtils";

describe("chunkArray", () => {
  it("should split array into chunks of the specified size", () => {
    const array = [1, 2, 3, 4, 5, 6, 7];
    const chunked = chunkArray(array, 3);
    expect(chunked).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it("should return empty array for empty input array", () => {
    const array: number[] = [];
    const chunked = chunkArray(array, 3);
    expect(chunked).toEqual([]);
  });

  it("should return original array in a single chunk if chunk size is greater than array length", () => {
    const array = [1, 2, 3];
    const chunked = chunkArray(array, 5);
    expect(chunked).toEqual([[1, 2, 3]]);
  });
});
