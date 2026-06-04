declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.scss';
declare module '*.json' {
  const value: Record<string, unknown>;
  export default value;
}
declare module 'moment/locale/nl';
