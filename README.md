# Market Intelligence Platform

A market planning and store discovery application for creating geographic markets, uploading an existing store portfolio, visualizing stores within and outside a selected market boundary, and discovering additional stores in the market.

The project is split into two main applications:
```
api/ — Backend API responsible for market creation, portfolio uploads, geographic data, and store discovery.

ui/ — React/Vite frontend responsible for the market setup workflow, interactive map, portfolio visualization, and discovered-store dashboard.
```
Project Structure
```text
.
├── api/
│   └── README.md
│
├── ui/
│   └── README.md
│
├── README.md
│
└── ...
```
## API

The API provides the backend services used by the UI.

Responsibilities include:

* Countries, states, and cities
* Market categories
* City boundary lookup
* Portfolio CSV uploads
* Market creation
* Portfolio stores associated with a market
* Store discovery
* Discovered-store retrieval

See `api/README.md` for API-specific documentation.

## UI

The UI is a React application that provides the complete user-facing market workflow.

Responsibilities include:

* Location selection
* Category selection
* Portfolio CSV upload
* Interactive market boundary selection
* Market creation
* Portfolio visualization
* Store discovery
* Map layer controls
* Store lists

See `ui/README.md` for frontend-specific documentation.

## Application Workflow

The application follows this general workflow:
```text
Select Country
      ↓
Select State
      ↓
Select City
      ↓
Load City Boundary
      ↓
Select Categories
      ↓
Upload Portfolio CSV
      ↓
Adjust Market Boundary
      ↓
Create Market
      ↓
Market Dashboard
      ↓
View Portfolio Stores
      ↓
Discover Additional Stores
      ↓
View Discovered Stores
```
## Core Concepts
### Market
A market represents a geographic area created from:

* A city
* One or more categories
* An uploaded portfolio
* A geographic bounding box

A market boundary is represented by:
```
interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}
```

The current UI enforces a maximum market boundary area of: `30 km²`

### Portfolio

A portfolio is an uploaded CSV containing existing stores.

The upload process:

1. User selects a CSV file.
2. UI sends the file to the API.
3. API processes the file.
4. API returns an upload ID.
5. UI stores the upload ID.
6. The upload ID is submitted when creating the market.

The frontend expects the upload response to contain:
```
{
  "uploadId": "string",
  "fileName": "portfolio.csv",
  "rowCount": 100
}
```
### Portfolio Stores

After a market is created, the dashboard retrieves the stores associated with the market.

Each store contains geographic information and whether it falls inside the market boundary.

Example:
```
{
  "id": "store-id",
  "storeName": "Example Store",
  "address": "123 Main Street",
  "city": "Example City",
  "state": "Example State",
  "country": "Example Country",
  "categoryId": "category-id",
  "category": "Retail",
  "latitude": "28.6139",
  "longitude": "77.2090",
  "insideBoundary": true
}
```
### Discovered Stores

Discovered stores represent additional stores found for a market after the user triggers store discovery.

The UI supports:

* Discovering stores
* Displaying discovered-store counts
* Showing discovered stores on the map
* Toggling discovered stores on/off
* Displaying discovered stores in a separate list
* Discovered stores use orange map markers.

### Geographic Boundary

The frontend uses Leaflet for geographic visualization.

The boundary is represented as a rectangular bounding box:
```
south ───────────────── east
  │                      │
  │     Market Area      │
  │                      │
  │                      │
  west ─────────────── north
```

During market setup, the user can:

Move the complete boundary

Resize the boundary using corner handles

The frontend calculates the approximate area in square kilometers using the Haversine distance between the bounding-box edges.

Markets larger than 30 km² cannot be created from the UI.

### Map Layers

The dashboard currently supports three store layers.

|Layer	|Color	|Description|
|:-----------:|:-----------:|:-----------:|
|Portfolio inside	|Blue|Portfolio stores inside the market boundary|
|Portfolio outside|Gray|Portfolio stores outside the market boundary|
|Discovered stores|Orange|Stores returned by the discovery process|

Each layer can be independently enabled or disabled.

## API Configuration

The frontend uses: `VITE_API_BASE_URL=http://localhost:3000`


When `VITE_API_BASE_URL` is not provided, the market setup API currently falls back to: `http://localhost:3000`

Make sure the API is running at the configured URL before starting the UI.

## Local Development
1. Start the API
      1. Navigate to the API project:
      ```text 
      cd api
      ```
      2. Install dependencies:
      ```text
      npm install
      ```
      3. Start the development server using the command defined by the API project:
      ```text
      npm run dev
      ```
      4. The API should be accessible from the URL configured in the UI.

2. Start the UI

      1. In a separate terminal:
      ```text
      cd ui
      ```
      2. Install dependencies:
      ```text
      npm install
      ```

      3. Create an environment file:
      ```text
      VITE_API_BASE_URL=http://localhost:3000
      ```
      4. Start the frontend:
      ```text
      npm run dev
      ```

      5. Open the Vite development URL shown in the terminal.

## Development Requirements

The project requires:

* Node.js
* npm
* A running API service
* A browser with JavaScript enabled
* Internet access for OpenStreetMap map tiles

The UI uses Leaflet/OpenStreetMap for map rendering.

## Error Handling

The frontend handles API failures by displaying user-facing error messages.

Examples include:

* Failed to load countries
* Failed to load states
* Failed to load cities
* Failed to load city boundary
* Failed to upload portfolio
* Failed to create market
* Failed to load market portfolio
* Failed to discover stores

The frontend also validates:

A country/state/city selection
At least one category
A portfolio upload
A valid market boundary
A maximum boundary area of 30 km²

## Important API Contracts

The UI currently depends on the following API routes:
```text
GET  /api/locations/countries
GET  /api/locations/countries/:countryId/states
GET  /api/locations/states/:stateId/cities

GET  /api/categories

GET  /api/markets/boundary-preview?cityId=:cityId

POST /api/markets

POST /api/portfolio/uploads

GET  /api/markets/:marketId/portfolio

POST /api/markets/:marketId/discovered-stores/discover

GET  /api/markets/:marketId/discovered-stores
```

The detailed API contract is documented in `api/README.md`.

## Architecture

At a high level:
```text
                    ┌─────────────────┐
                    │      User       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │       UI        │
                    │ React + Leaflet │
                    └────────┬────────┘
                             │ HTTP
                             ▼
                    ┌─────────────────┐
                    │      API        │
                    └────────┬────────┘
                             │
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
             Locations   Portfolio   Discovery
                 │           │           │
                 └───────────┼───────────┘
                             ▼
                         Market Data
```
## Future Improvements

Potential areas for future development include:

* Persisting edited dashboard boundaries
* More precise geographic boundary support
* Polygon-based market boundaries
* Store search and filtering
* Category-specific map layers
* Discovered-store filtering
* Pagination for large store lists
* Store selection from the map
* Store-to-market assignment
* Market editing
* Authentication and authorization
* Automated API/UI tests
* Production environment configuration
* Centralized API client/error handling

## Documentation

* `api/README.md` — Backend API documentation

* `ui/README.md` — Frontend documentation