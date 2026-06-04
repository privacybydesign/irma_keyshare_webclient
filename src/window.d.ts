interface WindowConfig {
  server: string;
  lang?: string;
  emailIssuanceUrl?: Record<string, string>;
  attributesOverviewUrl?: Record<string, string>;
}

declare global {
  interface Window {
    config?: WindowConfig;
  }
}

export {};
