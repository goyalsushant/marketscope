import {
  describe,
  expect,
  it
} from "vitest";

describe(
  "portfolio market boundary",
  () => {
    it(
      "keeps a point inside the boundary",
      () => {
        const boundary = {
          south: 12.90,
          west: 77.55,
          north: 13.00,
          east: 77.70
        };

        const point = {
          latitude: 12.95,
          longitude: 77.62
        };

        expect(
          point.latitude >=
            boundary.south
        ).toBe(true);

        expect(
          point.latitude <=
            boundary.north
        ).toBe(true);

        expect(
          point.longitude >=
            boundary.west
        ).toBe(true);

        expect(
          point.longitude <=
            boundary.east
        ).toBe(true);
      }
    );

    it(
      "identifies a point outside the boundary",
      () => {
        const boundary = {
          south: 12.90,
          west: 77.55,
          north: 13.00,
          east: 77.70
        };

        const point = {
          latitude: 13.05,
          longitude: 77.62
        };

        const inside =
          point.latitude >=
            boundary.south &&
          point.latitude <=
            boundary.north &&
          point.longitude >=
            boundary.west &&
          point.longitude <=
            boundary.east;

        expect(inside).toBe(false);
      }
    );
  }
);
