Market Intelligence UI

React/Vite frontend for the Market Intelligence Platform.

The UI provides the complete workflow for creating a market, uploading an existing store portfolio, defining a geographic market boundary, visualizing portfolio stores, and discovering additional stores.

Technology

The frontend is built with:

React

TypeScript

Vite

React Leaflet

Leaflet

OpenStreetMap tiles

Features
Market Setup

The setup screen allows users to:

Select a country

Select a state

Select a city

Select one or more categories

Upload a portfolio CSV

View the initial city boundary

Edit the market boundary

Review the boundary area

Create the market

Portfolio Upload

The portfolio uploader accepts CSV files.

The UI validates that the selected file has a .csv extension.

After a successful upload, the UI displays:

File name

Number of stores loaded

The returned upload ID is retained and submitted when creating the market.

Interactive Boundary

The market boundary is displayed using Leaflet.

Users can:

Drag the complete rectangle

Resize the rectangle using corner handles

See the calculated area

The maximum allowed area is:

30 km²


The Create Market button is disabled when the boundary exceeds this limit.

Market Dashboard

After market creation, the setup screen is replaced by the dashboard.

The dashboard loads:

GET /api/markets/:marketId/portfolio


It displays:

Total portfolio stores

Portfolio stores inside the boundary

Portfolio stores outside the boundary

Discovered stores

Map

The dashboard map uses Leaflet and OpenStreetMap.

Store markers are represented by colored circles.

Marker	Meaning
Blue	Portfolio store inside boundary
Gray	Portfolio store outside boundary
Orange	Discovered store

Clicking a marker opens a popup containing store information.

Map Layers

The dashboard provides independent visibility controls for:

Portfolio stores inside the boundary

Portfolio stores outside the boundary

Discovered stores

The layer counts are displayed next to each layer.

Store Lists

The dashboard contains a portfolio store list showing:

Inside/outside status

Category

Store name

Address

City

State

Discovered stores are displayed in a separate section showing:

Discovered status

Category

Store name

Address

Store Discovery

The dashboard includes a Discover Stores button.

When clicked, the UI calls:

POST /api/markets/:marketId/discovered-stores/discover


During discovery, the button displays:

Discovering...


After completion, the discovered stores are displayed:

On the map

In the discovered-store count

In the discovered-store list

Project Structure

A simplified structure is:

src/
├── api/
│   ├── market.ts
│   └── portfolioApi.ts
│
├── components/
│   └── PortfolioUpload.tsx
│
├── features/
│   └── market/
│       ├── api.ts
│       ├── types.ts
│       ├── geo.ts
│       ├── MarketSetup.tsx
│       │
│       └── components/
│           ├── BoundaryMap.tsx
│           ├── BoundaryMap.css
│           ├── EditableBoundary.tsx
│           ├── LocationSelectors.tsx
│           ├── CategorySelector.tsx
│           ├── MarketDashboard.tsx
│           └── MarketDashboard.css
│
├── App.tsx
└── ...

Application Entry Point

The application entry point renders:

function App() {
  return <MarketSetup />;
}


The initial screen is therefore the market setup workflow.

After successful market creation:

if (createdMarketId) {
  return (
    <MarketDashboard
      marketId={createdMarketId}
    />
  );
}


The created market ID controls the transition to the dashboard.

Market Setup State

MarketSetup maintains state for:

countries
states
cities
categories

countryId
stateId
cityId

selectedCategoryIds

boundary

portfolioUploadId

createdMarketId

loading
creatingMarket
error


The location selectors are hierarchical:

Country
   ↓
State
   ↓
City


Changing the country clears the selected state and city.

Changing the state clears the selected city.

Selecting a city triggers the boundary-preview API.

API Configuration

Create an environment file in the UI project:

VITE_API_BASE_URL=http://localhost:3000


The frontend uses this value when communicating with the API.

For example:

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:3000";

Running the UI

Install dependencies:

cd ui
npm install


Start the development server:

npm run dev


Build for production:

npm run build


Preview the production build:

npm run preview


Use the commands defined in package.json if your project uses different scripts.

Environment Variables
VITE_API_BASE_URL

The base URL of the backend API.

Example:

VITE_API_BASE_URL=http://localhost:3000


For another environment:

VITE_API_BASE_URL=https://api.example.com


Only variables prefixed with VITE_ are exposed to the Vite frontend.

Geographic Calculations

The UI calculates bounding-box area in:

km²


The implementation is in:

src/features/market/geo.ts


The calculation uses the Haversine formula to calculate:

North/south boundary distance

East/west boundary distance

The approximate area is calculated as:

height × width


The resulting value is used to enforce the 30 km² market limit.

Boundary Editing

EditableBoundary provides the interactive boundary controls.

Supported drag modes:

type DragMode =
  | "move"
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | null;

Move

Dragging the rectangle moves the entire market boundary.

Resize

Dragging a corner changes the corresponding north/south/east/west coordinates.

The component prevents invalid rectangles where:

north <= south


or:

east <= west

Leaflet

Leaflet CSS is imported by the map component:

import "leaflet/dist/leaflet.css";


The map uses OpenStreetMap tiles:

https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png


The map attribution is displayed according to OpenStreetMap requirements.

API Client Organization

The frontend currently has API functions in multiple files.

Market setup API
src/features/market/api.ts


Handles:

Countries

States

Cities

Categories

Boundary preview

Market creation

Market portfolio/discovery API
src/api/market.ts


Handles:

Market portfolio

Store discovery

Discovered stores

Portfolio API
src/api/portfolioApi.ts


Handles:

Portfolio CSV uploads

Error Handling

The UI uses local component state for errors.

Example:

const [error, setError] =
  useState<string | null>(null);


API errors are converted to Error objects and displayed to users.

Loading states are also shown for:

Location requests

Market creation

Portfolio upload

Store discovery

Dashboard loading

Responsive Layout

The dashboard uses CSS Grid for the main content:

┌──────────────────────────────┬──────────────┐
│                              │              │
│            MAP               │ STORE LIST   │
│                              │              │
└──────────────────────────────┴──────────────┘


At smaller screen widths, the layout changes to a single-column structure:

┌──────────────────────────────┐
│              MAP             │
├──────────────────────────────┤
│          STORE LIST          │
└──────────────────────────────┘


The dashboard CSS contains responsive breakpoints for:

1000px

800px

Important Frontend Contracts

The UI expects the market API to return a bounding box:

interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}


Portfolio stores:

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


Discovered stores:

interface DiscoveredStore {
  id: string;
  externalId: string;
  name: string;
  category: string;
  address: string | null;
  latitude: string;
  longitude: string;
}

Development Guidelines

When adding a new feature:

Keep API calls in the appropriate API client.

Define request/response types in TypeScript.

Keep map-specific components under features/market/components.

Avoid putting API calls directly inside presentational components.

Handle loading and error states.

Validate user input before submitting.

Keep the dashboard read-only unless explicit market editing is implemented.

Use stable IDs for React list keys.

Validate coordinates before rendering map markers.

Keep geographic calculations in geo.ts.

Known Areas for Improvement

The current UI can be improved by:

Consolidating API clients and API_BASE_URL handling

Adding stronger runtime response validation

Preventing fitBounds() from interfering with active boundary dragging

Avoiding duplicate boundary rendering

Enforcing the 30 km² limit directly during boundary editing

Adding discovered-store styling to MarketDashboard.css

Adding store filtering and search

Adding category filters

Adding marker clustering for large portfolios

Adding pagination/virtualization for large store lists

Adding automated component and API integration tests

Improving accessibility for map controls

Adding explicit empty/loading states for discovered-store discovery

Persisting boundary changes if dashboard editing is introduced