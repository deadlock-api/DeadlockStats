export interface ConfigProps {
  persistNavigation: "always" | "dev" | "prod" | "never";
  catchErrors: "always" | "dev" | "prod" | "never";
  exitRoutes: string[];
  ASSETS_API_URL: string;
  API_URL: string;
  AI_ASSISTANT_API_URL: string;
  TURNSTILE_SITE_KEY: string;
}

export default {
  persistNavigation: "dev",
  catchErrors: "always",
  exitRoutes: ["Main"],
  ASSETS_API_URL: "https://assets.deadlock-api.com/",
  API_URL: "https://api.deadlock-api.com/",
  AI_ASSISTANT_API_URL: "https://ai-assistant.deadlock-api.com",
  TURNSTILE_SITE_KEY: "0x4AAAAAABs5lyUV9iomsdK2",
} as ConfigProps;
