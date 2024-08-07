/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/Index` | `/_sitemap` | `/screens/Camera` | `/screens/Finder`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
