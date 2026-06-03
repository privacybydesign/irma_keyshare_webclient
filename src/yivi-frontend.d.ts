declare module '@privacybydesign/yivi-frontend' {
  export interface YiviWidget {
    start(): Promise<void>;
    abort(): void;
  }

  export interface YiviSessionConfig {
    url: string;
    start: {
      url: (o: { url: string }) => string;
      method: string;
      credentials: string;
    };
    result: boolean;
  }

  export interface NewWebOptions {
    element: string;
    language: string;
    session: YiviSessionConfig;
  }

  export interface NewPopupOptions {
    language: string;
    session: YiviSessionConfig;
  }

  export function newWeb(options: NewWebOptions): YiviWidget;
  export function newPopup(options: NewPopupOptions): YiviWidget;
}
