import {
  describe,
  expect,
  it
} from "vitest";
import { boundingBoxAreaKm2, constrainBoundingBox } from "../src/modules/geo/geo.geometry.js";


describe("geo geometry", () => {
  it("calculates a positive area", () => {
    const area = boundingBoxAreaKm2({
      south: 12.9,
      west: 77.5,
      north: 13.0,
      east: 77.6
    });

    expect(area).toBeGreaterThan(0);
  });

  it("keeps a small boundary unchanged", () => {
    const bounds = {
      south: 12.9,
      west: 77.6,
      north: 12.91,
      east: 77.61
    };

    expect(constrainBoundingBox(bounds))
      .toEqual(bounds);
  });

  it("constrains a large boundary to 30 km²", () => {
    const bounds = constrainBoundingBox({
      south: 12.5,
      west: 77.2,
      north: 13.5,
      east: 78.2
    });

    const area = boundingBoxAreaKm2(bounds);

    expect(area).toBeLessThanOrEqual(30.01);
  });
});
