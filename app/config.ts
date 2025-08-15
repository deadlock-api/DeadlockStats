export interface ConfigProps {
  persistNavigation: "always" | "dev" | "prod" | "never";
  catchErrors: "always" | "dev" | "prod" | "never";
  exitRoutes: string[];
  ASSETS_API_URL: string;
  API_URL: string;
}

export default {
  persistNavigation: "dev",
  catchErrors: "always",
  exitRoutes: ["Main"],
  ASSETS_API_URL: "https://assets.deadlock-api.com/",
  API_URL: "https://api.deadlock-api.com/",
} as ConfigProps;
