export interface PortfolioRow {
  storeName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PortfolioValidationError {
  row: number;
  field: string;
  message: string;
}

export interface PortfolioValidationResult {
  rows: PortfolioRow[];
  errors: PortfolioValidationError[];
}
