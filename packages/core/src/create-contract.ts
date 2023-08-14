import { z } from 'zod'
import { replaceUrlParams } from './replace-url-params';
import type { APIConfig, API } from './types';
import { isRequestConfigWithBody, isRequestConfigWithParams, isRequestConfigWithQuery } from './guards';
import { attachQuery } from './attach-query';

export function createContract<T extends APIConfig>(baseUrl: string, config: T) {
  const api = {} as API<T>;

  for (const scopeKey in config) {
    api[scopeKey] = { path: config[scopeKey].path, routes: {} } as API<T>[typeof scopeKey];
    for (const _ in config[scopeKey].routes) {
      const endPointKey = _ as Extract<keyof T, string>;
      const endPoint = config[scopeKey].routes[endPointKey];
      const path = (endPoint.path || '/')  as unknown as `${T[Extract<keyof T, string>]["routes"][Extract<keyof T, string>]["path"]}`;
      const fullStaticPath = (
        baseUrl +
        config[scopeKey].path +
        path || ''
      );

      const route = {
        path,
        fullStaticPath,
        responses: endPoint.responses,
        method: endPoint.method,
      } as any;

      if (isRequestConfigWithParams(endPoint) && isRequestConfigWithQuery(endPoint)) {
        route.params = endPoint.params;
        route.query = endPoint.query;

        route.getFullDynamicPath = ({ params, query }: { params: Record<string, string>; query: Record<string, string | number | boolean> }) => {
          return attachQuery({ query, url: replaceUrlParams({ url: fullStaticPath, params }) });
        };
      } else if (isRequestConfigWithParams(endPoint)) {
        route.params = endPoint.params;

        route.getFullDynamicPath = ({ params }: { params: Record<string, string> }) => replaceUrlParams({ url: fullStaticPath, params });
      } else if (isRequestConfigWithQuery(endPoint)) {
        route.query = endPoint.query;

        route.getFullDynamicPath = ({ query }: { query: Record<string, string> }) => attachQuery({ url: fullStaticPath, query });
      } else {
        route.getFullDynamicPath = () => fullStaticPath;
      }

      if (isRequestConfigWithBody(endPoint)) {
        route.body = endPoint.body;
      }

      api[scopeKey].routes[endPointKey] = route;
    }
  }

  return api;
}

export type InferResponsesTypes<T extends Record<string, z.ZodTypeAny>> = {
  [Key in keyof T]: z.infer<T[Key]>;
}[keyof T];
