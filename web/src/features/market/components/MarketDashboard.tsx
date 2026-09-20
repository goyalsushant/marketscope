// import {
//     useEffect,
//     useMemo,
//     useState,
//     type ReactNode
// } from "react";
// import { getMarketPortfolio, type PortfolioStore } from "../../../api/markets";
// import "./MarketDashboard.css";
// import type { PortfolioMapStore } from "./BoundaryMap";


// interface MarketDashboardProps {
//     marketId: string;
//     map?: ReactNode;
// }

// export default function MarketDashboard({
//     marketId,
//     map
// }: MarketDashboardProps) {
//     const [
//         portfolioStores,
//         setPortfolioStores
//     ] = useState<PortfolioStore[]>([]);

//     const [
//         showPortfolioInside,
//         setShowPortfolioInside
//     ] = useState(true);

//     const [
//         showPortfolioOutside,
//         setShowPortfolioOutside
//     ] = useState(true);

//     const [
//         loading,
//         setLoading
//     ] = useState(true);

//     const [
//         error,
//         setError
//     ] = useState<string | null>(null);

//     useEffect(() => {
//         let cancelled = false;

//         async function loadPortfolio() {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const result =
//                     await getMarketPortfolio(
//                         marketId
//                     );

//                 if (!cancelled) {
//                     setPortfolioStores(
//                         result.stores
//                     );
//                 }
//             } catch (error) {
//                 if (!cancelled) {
//                     setError(
//                         error instanceof Error
//                             ? error.message
//                             : "Failed to load market portfolio"
//                     );
//                 }
//             } finally {
//                 if (!cancelled) {
//                     setLoading(false);
//                 }
//             }
//         }

//         void loadPortfolio();

//         return () => {
//             cancelled = true;
//         };
//     }, [marketId]);

//     const insideStores = useMemo(
//         () =>
//             portfolioStores.filter(
//                 (store) =>
//                     store.insideBoundary
//             ),
//         [portfolioStores]
//     );

//     const outsideStores = useMemo(
//         () =>
//             portfolioStores.filter(
//                 (store) =>
//                     !store.insideBoundary
//             ),
//         [portfolioStores]
//     );

//     const visibleInsideStores =
//         useMemo(
//             () =>
//                 showPortfolioInside
//                     ? insideStores
//                     : [],
//             [
//                 showPortfolioInside,
//                 insideStores
//             ]
//         );

//     const visibleOutsideStores =
//         useMemo(
//             () =>
//                 showPortfolioOutside
//                     ? outsideStores
//                     : [],
//             [
//                 showPortfolioOutside,
//                 outsideStores
//             ]
//         );

//     const mapInsideStores: PortfolioMapStore[] =
//         visibleInsideStores;

//     const mapOutsideStores: PortfolioMapStore[] =
//         visibleOutsideStores;

//     if (loading) {
//         return (
//             <main className="market-dashboard">
//                 <div className="dashboard-loading">
//                     Loading market...
//                 </div>
//             </main>
//         );
//     }

//     if (error) {
//         return (
//             <main className="market-dashboard">
//                 <div className="dashboard-error">
//                     <h2>
//                         Unable to load market
//                     </h2>

//                     <p>{error}</p>
//                 </div>
//             </main>
//         );
//     }

//     return (
//         <main className="market-dashboard">
//             <header className="dashboard-header">
//                 <div>
//                     <h1>
//                         Market Dashboard
//                     </h1>

//                     <p>
//                         Portfolio stores within and
//                         outside the selected market
//                         boundary.
//                     </p>
//                 </div>

//                 <div className="dashboard-summary">
//                     <div className="summary-card">
//                         <span>
//                             Total portfolio
//                         </span>

//                         <strong>
//                             {portfolioStores.length}
//                         </strong>
//                     </div>

//                     <div className="summary-card">
//                         <span>
//                             Inside boundary
//                         </span>

//                         <strong>
//                             {insideStores.length}
//                         </strong>
//                     </div>

//                     <div className="summary-card">
//                         <span>
//                             Outside boundary
//                         </span>

//                         <strong>
//                             {outsideStores.length}
//                         </strong>
//                     </div>
//                 </div>
//             </header>

//             <section className="dashboard-controls">
//                 <div>
//                     <h2>
//                         Map layers
//                     </h2>

//                     <p>
//                         Toggle portfolio layers
//                         independently.
//                     </p>
//                 </div>

//                 <div className="layer-controls">
//                     <label className="layer-control">
//                         <input
//                             type="checkbox"
//                             checked={
//                                 showPortfolioInside
//                             }
//                             onChange={(event) =>
//                                 setShowPortfolioInside(
//                                     event.target.checked
//                                 )
//                             }
//                         />

//                         <span className="layer-dot inside" />

//                         <span>
//                             Portfolio inside boundary
//                         </span>

//                         <strong>
//                             {insideStores.length}
//                         </strong>
//                     </label>

//                     <label className="layer-control">
//                         <input
//                             type="checkbox"
//                             checked={
//                                 showPortfolioOutside
//                             }
//                             onChange={(event) =>
//                                 setShowPortfolioOutside(
//                                     event.target.checked
//                                 )
//                             }
//                         />

//                         <span className="layer-dot outside" />

//                         <span>
//                             Portfolio outside boundary
//                         </span>

//                         <strong>
//                             {outsideStores.length}
//                         </strong>
//                     </label>

//                     <div className="layer-control discovered-disabled">
//                         <span className="layer-dot discovered" />

//                         <span>
//                             Discovered stores
//                         </span>

//                         <span className="coming-soon">
//                             Coming next
//                         </span>
//                     </div>
//                 </div>
//             </section>

//             <section className="dashboard-content">
//                 <div className="dashboard-map">
//                     {map}
//                 </div>

//                 <aside className="dashboard-sidebar">
//                     <div className="store-list-header">
//                         <div>
//                             <h2>
//                                 Portfolio stores
//                             </h2>

//                             <p>
//                                 {portfolioStores.length} stores
//                             </p>
//                         </div>
//                     </div>

//                     <div className="store-list">
//                         {portfolioStores.length ===
//                             0 ? (
//                             <div className="empty-state">
//                                 No portfolio stores found.
//                             </div>
//                         ) : (
//                             portfolioStores.map(
//                                 (store) => (
//                                     <StoreListItem
//                                         key={store.id}
//                                         store={store}
//                                     />
//                                 )
//                             )
//                         )}
//                     </div>
//                 </aside>
//             </section>

//             <section className="dashboard-debug">
//                 <div>
//                     Visible inside:
//                     {" "}
//                     {visibleInsideStores.length}
//                 </div>

//                 <div>
//                     Visible outside:
//                     {" "}
//                     {visibleOutsideStores.length}
//                 </div>
//             </section>
//         </main>
//     );
// }

// interface StoreListItemProps {
//     store: PortfolioStore;
// }

// function StoreListItem({
//     store
// }: StoreListItemProps) {
//     return (
//         <article className="store-list-item">
//             <div className="store-list-item-main">
//                 <div className="store-status-row">
//                     <span
//                         className={
//                             store.insideBoundary
//                                 ? "store-status inside"
//                                 : "store-status outside"
//                         }
//                     >
//                         {store.insideBoundary
//                             ? "Inside"
//                             : "Outside"}
//                     </span>

//                     <span className="store-category">
//                         {store.category}
//                     </span>
//                 </div>

//                 <h3>
//                     {store.storeName}
//                 </h3>

//                 <p>
//                     {store.address}
//                 </p>

//                 <small>
//                     {store.city},{" "}
//                     {store.state}
//                 </small>
//             </div>
//         </article>
//     );
// }

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    discoverStores,
    getDiscoveredStores,
    getMarketPortfolio,
    type DiscoveredStore,
    type PortfolioStore
} from "../../../api/markets";

import "./MarketDashboard.css";

import {
    BoundaryMap,
    type DiscoveredMapStore,
    type PortfolioMapStore
} from "./BoundaryMap";

interface MarketDashboardProps {
    marketId: string;
}

interface DiscoveredStoreListItemProps {
    store: DiscoveredStore;
}

function DiscoveredStoreListItem({
    store
}: DiscoveredStoreListItemProps) {
    return (
        <article className="store-list-item">
            <div className="store-list-item-main">
                <div className="store-status-row">
                    <span className="store-status discovered">
                        Discovered
                    </span>

                    <span className="store-category">
                        {store.category}
                    </span>
                </div>

                <h3>
                    {store.name}
                </h3>

                {store.address && (
                    <p>
                        {store.address}
                    </p>
                )}
            </div>
        </article>
    );
}


export default function MarketDashboard({
    marketId
}: MarketDashboardProps) {
    const [
        portfolioStores,
        setPortfolioStores
    ] = useState<PortfolioStore[]>([]);

    const [
        discoveredStores,
        setDiscoveredStores
    ] = useState<DiscoveredStore[]>([]);

    const [
        discovering,
        setDiscovering
    ] = useState(false);


    const [
        boundary,
        setBoundary
    ] = useState<{
        south: number;
        west: number;
        north: number;
        east: number;
    } | null>(null);

    const [
        showPortfolioInside,
        setShowPortfolioInside
    ] = useState(true);

    const [
        showPortfolioOutside,
        setShowPortfolioOutside
    ] = useState(true);

    const [
        showDiscoveredStores,
        setShowDiscoveredStores
    ] = useState(true);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadPortfolio() {
            try {
                setLoading(true);
                setError(null);

                const result =
                    await getMarketPortfolio(
                        marketId
                    );

                if (cancelled) {
                    return;
                }

                setPortfolioStores(
                    result.stores
                );

                setBoundary(
                    result.boundary
                );
            } catch (error) {
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Failed to load market portfolio"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadPortfolio();

        return () => {
            cancelled = true;
        };
    }, [marketId]);

    useEffect(() => {
        let cancelled = false;

        async function loadDiscoveredStores() {
            try {
                const result =
                    await getDiscoveredStores(
                        marketId
                    );

                if (!cancelled) {
                    setDiscoveredStores(
                        result.stores
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load discovered stores:",
                    error
                );
            }
        }

        void loadDiscoveredStores();

        return () => {
            cancelled = true;
        };
    }, [marketId]);


    const insideStores = useMemo(
        () =>
            portfolioStores.filter(
                (store) =>
                    store.insideBoundary
            ),
        [portfolioStores]
    );

    const outsideStores = useMemo(
        () =>
            portfolioStores.filter(
                (store) =>
                    !store.insideBoundary
            ),
        [portfolioStores]
    );

    const visibleInsideStores =
        useMemo(
            () =>
                showPortfolioInside
                    ? insideStores
                    : [],
            [
                showPortfolioInside,
                insideStores
            ]
        );

    const visibleOutsideStores =
        useMemo(
            () =>
                showPortfolioOutside
                    ? outsideStores
                    : [],
            [
                showPortfolioOutside,
                outsideStores
            ]
        );

    const mapInsideStores: PortfolioMapStore[] =
        visibleInsideStores.map(
            (store) => ({
                id: store.id,
                storeName:
                    store.storeName,
                address:
                    store.address,
                category:
                    store.category,
                latitude:
                    store.latitude,
                longitude:
                    store.longitude,
                insideBoundary:
                    true
            })
        );

    const mapOutsideStores: PortfolioMapStore[] =
        visibleOutsideStores.map(
            (store) => ({
                id: store.id,
                storeName:
                    store.storeName,
                address:
                    store.address,
                category:
                    store.category,
                latitude:
                    store.latitude,
                longitude:
                    store.longitude,
                insideBoundary:
                    false
            })
        );

    const mapDiscoveredStores: DiscoveredMapStore[] = showDiscoveredStores
        ? discoveredStores.filter(
            (store) =>
                store.latitude !== null &&
                store.longitude !== null
        )
            .map((store) => ({
                id: store.id,
                name: store.name,
                address: store.address || '',
                category: store.category,
                latitude: store.latitude,
                longitude: store.longitude
            }))
        : [];

    async function handleDiscoverStores() {
        try {
            setDiscovering(true);
            setError(null);

            const result =
                await discoverStores(
                    marketId
                );

            setDiscoveredStores(
                result.stores
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to discover stores"
            );
        } finally {
            setDiscovering(false);
        }
    }


    if (loading) {
        return (
            <main className="market-dashboard">
                <div className="dashboard-loading">
                    Loading market...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="market-dashboard">
                <div className="dashboard-error">
                    <h2>
                        Unable to load market
                    </h2>

                    <p>{error}</p>
                </div>
            </main>
        );
    }

    if (!boundary) {
        return (
            <main className="market-dashboard">
                <div className="dashboard-error">
                    <h2>
                        Market boundary unavailable
                    </h2>

                    <p>
                        The market was loaded, but
                        its geographic boundary could
                        not be determined.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="market-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>
                        Market Dashboard
                    </h1>

                    <p>
                        Portfolio stores within and
                        outside the selected market
                        boundary.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleDiscoverStores}
                    disabled={discovering}
                    className="discover-stores-button"
                >
                    {discovering
                        ? "Discovering..."
                        : "Discover Stores"}
                </button>


                <div className="dashboard-summary">
                    <div className="summary-card">
                        <span>
                            Total portfolio
                        </span>

                        <strong>
                            {portfolioStores.length}
                        </strong>
                    </div>

                    <div className="summary-card">
                        <span>
                            Inside boundary
                        </span>

                        <strong>
                            {insideStores.length}
                        </strong>
                    </div>

                    <div className="summary-card">
                        <span>
                            Outside boundary
                        </span>

                        <strong>
                            {outsideStores.length}
                        </strong>
                    </div>
                    <div className="summary-card">
                        <span>
                            Discovered stores
                        </span>

                        <strong>
                            {discoveredStores.length}
                        </strong>
                    </div>

                </div>
            </header>

            <section className="dashboard-controls">
                <div>
                    <h2>
                        Map layers
                    </h2>

                    <p>
                        Toggle portfolio layers
                        independently.
                    </p>
                </div>

                <div className="layer-controls">
                    <label className="layer-control">
                        <input
                            type="checkbox"
                            checked={
                                showPortfolioInside
                            }
                            onChange={(event) =>
                                setShowPortfolioInside(
                                    event.target.checked
                                )
                            }
                        />

                        <span className="layer-dot inside" />

                        <span>
                            Portfolio inside boundary
                        </span>

                        <strong>
                            {insideStores.length}
                        </strong>
                    </label>

                    <label className="layer-control">
                        <input
                            type="checkbox"
                            checked={
                                showPortfolioOutside
                            }
                            onChange={(event) =>
                                setShowPortfolioOutside(
                                    event.target.checked
                                )
                            }
                        />

                        <span className="layer-dot outside" />

                        <span>
                            Portfolio outside boundary
                        </span>

                        <strong>
                            {outsideStores.length}
                        </strong>
                    </label>

                    <div className="layer-control">
                        <input
                            type="checkbox"
                            checked={
                                showDiscoveredStores
                            }
                            onChange={(event) =>
                                setShowDiscoveredStores(
                                    event.target.checked
                                )
                            }
                        />
                        <span className="layer-dot discovered" />

                        <span>
                            Discovered stores
                        </span>

                        {/* <span className="coming-soon">
                            Coming next
                        </span> */}
                        <strong>
                            {discoveredStores.length}
                        </strong>
                    </div>
                </div>
            </section>

            <section className="dashboard-content">
                <div className="dashboard-map">
                    <BoundaryMap
                        bounds={boundary}
                        // onBoundsChange={() => {
                        //     /*
                        //      * The dashboard boundary is currently
                        //      * read-only. Boundary editing belongs
                        //      * to MarketSetup.
                        //      */
                        // }}
                        portfolioInside={
                            mapInsideStores
                        }
                        portfolioOutside={
                            mapOutsideStores
                        }
                        discoveredStores={mapDiscoveredStores}
                    />
                </div>

                <aside className="dashboard-sidebar">
                    <div className="store-list-header">
                        <div>
                            <h2>
                                Portfolio stores
                            </h2>

                            <p>
                                {
                                    portfolioStores.length
                                }{" "}
                                stores
                            </p>
                        </div>
                    </div>

                    <div className="store-list">
                        {portfolioStores.length ===
                            0 ? (
                            <div className="empty-state">
                                No portfolio stores
                                found.
                            </div>
                        ) : (
                            portfolioStores.map(
                                (store) => (
                                    <StoreListItem
                                        key={
                                            store.id
                                        }
                                        store={
                                            store
                                        }
                                    />
                                )
                            )
                        )}
                    </div>
                </aside>
            </section>
            <section className="discovered-store-section">
                <div className="store-list-header">
                    <div>
                        <h2>
                            Discovered stores
                        </h2>

                        <p>
                            {discoveredStores.length} stores
                        </p>
                    </div>
                </div>

                <div className="store-list">
                    {discoveredStores.length === 0 ? (
                        <div className="empty-state">
                            No discovered stores yet.
                        </div>
                    ) : (
                        discoveredStores.map(
                            (store) => (
                                <DiscoveredStoreListItem
                                    key={store.id}
                                    store={store}
                                />
                            )
                        )
                    )}
                </div>
            </section>

        </main>
    );
}

interface StoreListItemProps {
    store: PortfolioStore;
}

function StoreListItem({
    store
}: StoreListItemProps) {
    return (
        <article className="store-list-item">
            <div className="store-list-item-main">
                <div className="store-status-row">
                    <span
                        className={
                            store.insideBoundary
                                ? "store-status inside"
                                : "store-status outside"
                        }
                    >
                        {store.insideBoundary
                            ? "Inside"
                            : "Outside"}
                    </span>

                    <span className="store-category">
                        {store.category}
                    </span>
                </div>

                <h3>
                    {store.storeName}
                </h3>

                <p>
                    {store.address}
                </p>

                <small>
                    {store.city},{" "}
                    {store.state}
                </small>
            </div>
        </article>
    );
}
