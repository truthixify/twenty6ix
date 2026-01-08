declare var __DEV__: boolean;

declare global {
  interface Element {
    href?: string;
  }
  
  interface HTMLLinkElement {
    href: string;
  }
}