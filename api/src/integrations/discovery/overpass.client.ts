import type {
    DiscoveryProvider,
    DiscoverySearchArea,
    DiscoveredStore
} from "./discovery.types.js";

const OVERPASS_URL =
    "https://overpass-api.de/api/interpreter";

function escapeOverpassValue(
    value: string
) {
    return value.replace(
        /["\\]/g,
        "\\$&"
    );
}

// function buildQuery(
//     category: string,
//     area: DiscoverySearchArea
// ) {
//     const escapedCategory =
//         escapeOverpassValue(category);

//     const {
//         south,
//         west,
//         north,
//         east
//     } = area;

//     return `
// [out:json][timeout:25];

// (
//   nwr[
//     shop="${escapedCategory}"
//   ](${south},${west},${north},${east});

//   nwr[
//     amenity="${escapedCategory}"
//   ](${south},${west},${north},${east});

//   nwr[
//     craft="${escapedCategory}"
//   ](${south},${west},${north},${east});
// );

// out center tags;
// `;
// }

function buildQuery(
    category: string,
    area: DiscoverySearchArea
) {
    const {
        south,
        west,
        north,
        east
    } = area;

    const filters =
        getOverpassFilters(category);

    const clauses = filters
        .map(
            ([key, value]) => `
  nwr[
    ${key}="${escapeOverpassValue(value)}"
  ](${south},${west},${north},${east});
`
        )
        .join("\n");

    return `
[out:json][timeout:120];

(
${clauses}
);

out center tags;
`;
}


function getCoordinates(
    element: any
): {
    latitude: number;
    longitude: number;
} | null {
    if (
        typeof element.lat === "number" &&
        typeof element.lon === "number"
    ) {
        return {
            latitude: element.lat,
            longitude: element.lon
        };
    }

    if (
        element.center &&
        typeof element.center.lat === "number" &&
        typeof element.center.lon === "number"
    ) {
        return {
            latitude: element.center.lat,
            longitude: element.center.lon
        };
    }

    return null;
}

function normalizeElement(
    element: any,
    category: string
): DiscoveredStore | null {
    const coordinates =
        getCoordinates(element);

    if (!coordinates) {
        return null;
    }

    const tags = element.tags ?? {};

    const name =
        typeof tags.name === "string"
            ? tags.name.trim()
            : "";

    if (!name) {
        return null;
    }

    const addressParts = [
        tags["addr:housenumber"],
        tags["addr:street"],
        tags["addr:suburb"],
        tags["addr:city"]
    ].filter(
        (value): value is string =>
            typeof value === "string" &&
            value.trim().length > 0
    );

    return {
        externalId: `osm-${element.type}-${element.id}`,
        name,
        category,
        address:
            addressParts.length > 0
                ? addressParts.join(", ")
                : null,
        latitude:
            coordinates.latitude,
        longitude:
            coordinates.longitude
    };
}

function getOverpassFilters(
    category: string
) {
    const normalized =
        category
            .trim()
            .toLowerCase();

    switch (normalized) {
        case "supermarket":
            return [
                ["shop", "supermarket"]
            ];

        case "hypermarket":
            return [
                ["shop", "supermarket"]
            ];

        case "grocery store":
            return [
                ["shop", "supermarket"],
                ["shop", "convenience"]
            ];

        case "convenience store":
            return [
                ["shop", "convenience"]
            ];

        case "pharmacy":
            return [
                ["amenity", "pharmacy"],
                ["shop", "chemist"]
            ];

        default:
            return [
                ["shop", normalized],
                ["amenity", normalized],
                ["craft", normalized]
            ];
    }
}


export const overpassDiscoveryProvider:
    DiscoveryProvider = {
    async searchStores(
        category,
        area
    ) {
        const response =
            await fetch(OVERPASS_URL, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "User-Agent":
                        "MarketDiscovery/1.0"
                },
                body:
                    `data=${encodeURIComponent(
                        buildQuery(category, area)
                    )}`
            });

        if (!response.ok) {
            throw new Error(
                `Overpass request failed: ${response.status}`
            );
        }

        const data =
            (await response.json()) as {
                elements?: any[];
            };

        const elements =
            data.elements ?? [];

        return elements
            .map((element) =>
                normalizeElement(
                    element,
                    category
                )
            )
            .filter(
                (
                    store
                ): store is DiscoveredStore =>
                    store !== null
            );
    }
};
