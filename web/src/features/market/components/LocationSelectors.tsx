import type { LocationOption } from "../types";

interface Props {
  countries: LocationOption[];
  states: LocationOption[];
  cities: LocationOption[];

  countryId: string;
  stateId: string;
  cityId: string;

  onCountryChange: (id: string) => void;
  onStateChange: (id: string) => void;
  onCityChange: (id: string) => void;

  loadingCountries: boolean;
  loadingStates: boolean;
  loadingCities: boolean;
}

export function LocationSelectors({
  countries,
  states,
  cities,
  countryId,
  stateId,
  cityId,
  onCountryChange,
  onStateChange,
  onCityChange,
  loadingCountries,
  loadingStates,
  loadingCities
}: Props) {
  return (
    <div className="location-selectors">
      <label>
        Country

        <select
          value={countryId}
          onChange={(event) =>
            onCountryChange(event.target.value)
          }
          disabled={loadingCountries}
        >
          <option value="">
            Select country
          </option>

          {countries.map((country) => (
            <option
              key={country.id}
              value={country.id}
            >
              {country.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        State

        <select
          value={stateId}
          onChange={(event) =>
            onStateChange(event.target.value)
          }
          disabled={!countryId || loadingStates}
        >
          <option value="">
            Select state
          </option>

          {states.map((state) => (
            <option
              key={state.id}
              value={state.id}
            >
              {state.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        City

        <select
          value={cityId}
          onChange={(event) =>
            onCityChange(event.target.value)
          }
          disabled={!stateId || loadingCities}
        >
          <option value="">
            Select city
          </option>

          {cities.map((city) => (
            <option
              key={city.id}
              value={city.id}
            >
              {city.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
