import type { FastifyInstance } from "fastify";
import {
  getCities,
  getCountries,
  getStates
} from "./location.service.js";

export async function locationRoutes(app: FastifyInstance) {
  app.get("/api/locations/countries", async () => {
    return getCountries();
  });

  app.get<{
    Params: {
      countryId: string;
    };
  }>("/api/locations/countries/:countryId/states", async (request) => {
    return getStates(request.params.countryId);
  });

  app.get<{
    Params: {
      stateId: string;
    };
  }>("/api/locations/states/:stateId/cities", async (request) => {
    return getCities(request.params.stateId);
  });
}
