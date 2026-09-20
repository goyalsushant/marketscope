import {
    useEffect,
    useState
} from "react";

import {
    getCategories,
    getCities,
    getCountries,
    getStates,
    getBoundaryPreview,
    createMarket
} from "./api";

import type {
    BoundaryPreview,
    Category,
    LocationOption
} from "./types";

import { LocationSelectors } from "./components/LocationSelectors";
import { CategorySelector } from "./components/CategorySelector";
import { BoundaryMap } from "./components/BoundaryMap";
import { boundingBoxAreaKm2 } from "./geo";
import { PortfolioUpload } from "../../components/PortfolioUpload";
import MarketDashboard from "./components/MarketDashboard";

export function MarketSetup() {
    const [
        countries,
        setCountries
    ] = useState<LocationOption[]>([]);

    const [
        states,
        setStates
    ] = useState<LocationOption[]>([]);

    const [
        cities,
        setCities
    ] = useState<LocationOption[]>([]);

    const [
        categories,
        setCategories
    ] = useState<Category[]>([]);

    const [
        countryId,
        setCountryId
    ] = useState("");

    const [
        stateId,
        setStateId
    ] = useState("");

    const [
        cityId,
        setCityId
    ] = useState("");

    const [
        selectedCategoryIds,
        setSelectedCategoryIds
    ] = useState<string[]>([]);

    const [
        boundary,
        setBoundary
    ] = useState<BoundaryPreview | null>(
        null
    );

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        error,
        setError
    ] = useState<string | null>(null);

    const [
        creatingMarket,
        setCreatingMarket
    ] = useState(false);

    const [
        portfolioUploadId,
        setPortfolioUploadId
    ] = useState<string | null>(null);

    const [
        createdMarketId,
        setCreatedMarketId
    ] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            getCountries(),
            getCategories()
        ])
            .then(
                ([
                    countriesResult,
                    categoriesResult
                ]) => {
                    setCountries(
                        countriesResult
                    );

                    setCategories(
                        categoriesResult
                    );
                }
            )
            .catch((err: unknown) => {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load market setup"
                );
            });
    }, []);

    async function handleCountryChange(
        id: string
    ) {
        setCountryId(id);
        setStateId("");
        setCityId("");
        setStates([]);
        setCities([]);
        setBoundary(null);

        if (!id) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result =
                await getStates(id);

            setStates(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load states"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleStateChange(
        id: string
    ) {
        setStateId(id);
        setCityId("");
        setCities([]);
        setBoundary(null);

        if (!id) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result =
                await getCities(id);

            setCities(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load cities"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleCityChange(
        id: string
    ) {
        setCityId(id);
        setBoundary(null);

        if (!id) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result =
                await getBoundaryPreview(id);

            setBoundary(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load city boundary"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateMarket() {
        console.log(
            "Create Market clicked"
        );

        if (!cityId) {
            setError(
                "Please select a city."
            );
            return;
        }

        if (
            selectedCategoryIds.length ===
            0
        ) {
            setError(
                "Please select at least one category."
            );
            return;
        }

        if (!portfolioUploadId) {
            setError(
                "Please upload a portfolio before creating the market."
            );
            return;
        }

        if (!boundary) {
            setError(
                "Please select a valid market boundary."
            );
            return;
        }

        if (boundary.areaKm2 > 30) {
            setError(
                "Market boundary cannot exceed 30 km²."
            );
            return;
        }

        try {
            setCreatingMarket(true);
            setError(null);

            console.log(
                "Submitting market:",
                {
                    cityId,
                    categoryIds:
                        selectedCategoryIds,
                    portfolioUploadId,
                    boundary:
                        boundary.bounds
                }
            );

            const market =
                await createMarket({
                    cityId,
                    categoryIds:
                        selectedCategoryIds,
                    portfolioUploadId,
                    boundary:
                        boundary.bounds
                });

            console.log(
                "Market created:",
                market
            );

            setCreatedMarketId(
                market.id
            );
        } catch (err) {
            console.error(
                "Create market failed:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create market"
            );
        } finally {
            setCreatingMarket(false);
        }
    }

    /*
     * Once the market has been created,
     * show the dashboard instead of the
     * setup screen.
     */
    if (createdMarketId) {
        return (
            <MarketDashboard
                marketId={
                    createdMarketId
                }
            />
        );
    }

    return (
        <main className="market-setup">
            <PortfolioUpload
                onUploaded={
                    setPortfolioUploadId
                }
            />

            <h1>
                Create Market
            </h1>

            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            <LocationSelectors
                countries={countries}
                states={states}
                cities={cities}
                countryId={countryId}
                stateId={stateId}
                cityId={cityId}
                onCountryChange={
                    handleCountryChange
                }
                onStateChange={
                    handleStateChange
                }
                onCityChange={
                    handleCityChange
                }
                loadingCountries={false}
                loadingStates={loading}
                loadingCities={loading}
            />

            <CategorySelector
                categories={categories}
                selectedIds={
                    selectedCategoryIds
                }
                onChange={
                    setSelectedCategoryIds
                }
            />

            {boundary && (
                <>
                    <BoundaryMap
                        bounds={
                            boundary.bounds
                        }
                        onBoundsChange={(
                            bounds
                        ) => {
                            const areaKm2 =
                                boundingBoxAreaKm2(
                                    bounds
                                );

                            setBoundary({
                                bounds,
                                areaKm2
                            });
                        }}
                    />

                    <div
                        className={
                            boundary.areaKm2 >
                                30
                                ? "boundary-summary boundary-invalid"
                                : "boundary-summary boundary-valid"
                        }
                    >
                        Boundary area:{" "}
                        <strong>
                            {boundary.areaKm2.toFixed(
                                2
                            )}{" "}
                            km²
                        </strong>

                        <span>
                            {" "}
                            / 30 km² maximum
                        </span>

                        {boundary.areaKm2 >
                            30 && (
                                <p>
                                    Reduce the
                                    boundary area
                                    to 30 km²
                                    or less to
                                    continue.
                                </p>
                            )}
                    </div>
                </>
            )}

            <button
                type="button"
                disabled={
                    !cityId ||
                    selectedCategoryIds.length ===
                    0 ||
                    !portfolioUploadId ||
                    !boundary ||
                    boundary.areaKm2 >
                    30 ||
                    creatingMarket
                }
                onClick={
                    handleCreateMarket
                }
            >
                {creatingMarket
                    ? "Creating Market..."
                    : "Create Market"}
            </button>
        </main>
    );
}
