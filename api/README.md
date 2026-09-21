# Market Intelligence API

Backend API for the Market Intelligence Platform.

The API provides services for geographic location selection, categories, portfolio uploads, market creation, portfolio stores, and store discovery.

## Responsibilities

The API is responsible for:

* Providing countries
* Providing states for a country
* Providing cities for a state
* Providing market categories
* Providing city boundary information
* Accepting portfolio CSV uploads
* Creating markets
* Returning market portfolio stores
* Discovering additional stores
* Returning previously discovered stores

The frontend communicates with these services over HTTP.

## API Base URL

The frontend is configured using: `VITE_API_BASE_URL=http://localhost:3000`
Therefore, the local API is expected to be available at: `http://localhost:3000`

## Endpoints
### Locations
#### Get Countries
`GET /api/locations/countries`

Returns available countries.

Example response:
```
[
  {
    "id": "country-id",
    "name": "India",
    "code": "IN"
  }
]
```
#### Get States
`GET /api/locations/countries/:countryId/states`

Returns states belonging to the selected country.

Example:

`GET /api/locations/countries/country-id/states`


Example response:
```
[
  {
    "id": "state-id",
    "name": "Delhi"
  }
]
```
#### Get Cities
`GET /api/locations/states/:stateId/cities`


Returns cities belonging to the selected state.

Example:

`GET /api/locations/states/state-id/cities`


Example response:
```
[
  {
    "id": "city-id",
    "name": "New Delhi"
  }
]
```
### Categories
#### Get Categories
`GET /api/categories`

Returns the categories available for market creation.

Example response:
```
[
  {
    "id": "category-id",
    "name": "Retail",
    "slug": "retail"
  }
]
```
### Market Boundary
#### Get Boundary Preview
`GET /api/markets/boundary-preview?cityId=:cityId`

Returns the initial geographic boundary for a selected city.

Example:

`GET /api/markets/boundary-preview?cityId=city-id`


Example response:
```
{
  "bounds": {
    "south": 28.50,
    "west": 77.10,
    "north": 28.75,
    "east": 77.30
  },
  "areaKm2": 500
}
```

The frontend allows the user to modify this boundary before creating a market.

### Portfolio Upload
#### Upload Portfolio
`POST /api/portfolio/uploads`

Accepts a portfolio CSV as multipart form data.

The uploaded file is sent using the field: `file`


Example request:
```
POST /api/portfolio/uploads
Content-Type: multipart/form-data
```

The successful response expected by the UI is:
```
{
  "uploadId": "upload-id",
  "fileName": "portfolio.csv",
  "rowCount": 250
}
```

The uploadId is required when creating a market.

### Market Creation
#### Create Market
`POST /api/markets`

Creates a market using the selected location, categories, uploaded portfolio, and geographic boundary.

Request:
```
{
  "cityId": "city-id",
  "categoryIds": [
    "category-id-1",
    "category-id-2"
  ],
  "portfolioUploadId": "upload-id",
  "boundary": {
    "south": 28.50,
    "west": 77.10,
    "north": 28.60,
    "east": 77.20
  }
}
```

The frontend expects the response to contain a market object.

Example:
```
{
  "market": {
    "id": "market-id",
    "name": "Example Market",
    "cityId": "city-id",
    "portfolioUploadId": "upload-id",
    "categoryIds": [
      "category-id"
    ],
    "boundary": {
      "south": 28.50,
      "west": 77.10,
      "north": 28.60,
      "east": 77.20
    },
    "areaKm2": 15.4
  }
}
```
### Market Portfolio
#### Get Market Portfolio
`GET /api/markets/:marketId/portfolio`

Returns the market boundary and portfolio stores associated with the market.

Example response:
```
{
  "marketId": "market-id",
  "boundary": {
    "south": 28.50,
    "west": 77.10,
    "north": 28.60,
    "east": 77.20
  },
  "stores": [
    {
      "id": "store-id",
      "storeName": "Example Store",
      "address": "123 Main Street",
      "city": "New Delhi",
      "state": "Delhi",
      "country": "India",
      "categoryId": "category-id",
      "category": "Retail",
      "latitude": "28.5700",
      "longitude": "77.1900",
      "insideBoundary": true
    }
  ]
}
```

The insideBoundary property determines whether the UI displays the store as an inside or outside portfolio store.

### Store Discovery
#### Discover Stores
`POST /api/markets/:marketId/discovered-stores/discover`

Triggers the store discovery process for a market.

Example:

`POST /api/markets/market-id/discovered-stores/discover`

Expected response:
```
{
  "marketId": "market-id",
  "stores": [
    {
      "id": "store-id",
      "externalId": "external-store-id",
      "name": "Example Store",
      "category": "Retail",
      "address": "123 Main Street",
      "latitude": "28.5700",
      "longitude": "77.1900"
    }
  ]
}
```

The UI replaces the current discovered-store list with the returned list.

#### Get Discovered Stores
`GET /api/markets/:marketId/discovered-stores`

Returns discovered stores previously associated with a market.

Example response:
```
{
  "marketId": "market-id",
  "stores": [
    {
      "id": "store-id",
      "externalId": "external-store-id",
      "name": "Example Store",
      "category": "Retail",
      "address": "123 Main Street",
      "latitude": "28.5700",
      "longitude": "77.1900"
    }
  ]
}
```
## Error Responses

The frontend expects failed requests to return JSON containing an optional message field.

Example:
```
{
  "message": "Market could not be created."
}
```

The UI displays this message to the user when available.

If no message is returned, the frontend uses a generic error message.

## Data Models
### BoundingBox
```
interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}
```
### LocationOption
```
interface LocationOption {
  id: string;
  name: string;
  code?: string;
}
```

### Category
```
interface Category {
  id: string;
  name: string;
  slug: string;
}
```
### PortfolioStore
```
interface PortfolioStore {
  id: string;
  storeName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  categoryId: string;
  category: string;
  latitude: string | null;
  longitude: string | null;
  insideBoundary: boolean;
}
```
### DiscoveredStore
```
interface DiscoveredStore {
  id: string;
  externalId: string;
  name: string;
  category: string;
  address: string | null;
  latitude: string;
  longitude: string;
}
```
### CreateMarketInput
```
interface CreateMarketInput {
  cityId: string;
  categoryIds: string[];
  portfolioUploadId: string;
  boundary: BoundingBox;
}
```

## Development

From the API directory:
```
cd api
npm install
```
Run the development server using the project's configured script:
`npm run dev`

For production:
```
npm run build
npm start
```

Use the actual production/start commands defined in `package.json` if they differ.

API Development Guidelines

When adding or changing an endpoint:

1. Keep request and response structures explicit.
2. Return appropriate HTTP status codes.
3. Return a useful message on errors.
4. Validate IDs and request payloads.
5. Validate uploaded portfolio files.
6. Validate geographic boundaries server-side.
7. Do not rely exclusively on frontend validation.
8. Keep geographic calculations consistent between API and UI.
9. Make discovery operations safe to retry where possible.
10. Keep response structures backwards-compatible when practical.

## Frontend Dependency

The frontend API client is located under:
`ui/src/api/`


Relevant API client files currently include:
```
market.ts
portfolioApi.ts
```

The frontend also contains market-specific API functions in:
`ui/src/features/market/api.ts`


When adding new endpoints, consider centralizing API configuration and error handling so all API clients use the same base URL and request behavior.