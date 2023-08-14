import type { z } from 'zod';

export type GET = 'GET';
export type POST = 'POST';
export type PATCH = 'PATCH';
export type DELETE = 'DELETE';

export type Method = GET | POST | PATCH | DELETE;

export interface BaseRequestConfig {
  path?: `/${string}`;
  method: Method;
  responses: Record<string, z.ZodTypeAny>;
}

export interface RequestConfigWithQuery extends BaseRequestConfig {
  query: z.ZodObject<Record<string, z.ZodString | z.ZodNumber | z.ZodBoolean>>;
}

export interface RequestConfigWithBody extends BaseRequestConfig {
  method: Method;
  body: z.ZodTypeAny;
}

export interface RequestConfigWithParams extends BaseRequestConfig {
  params: z.ZodObject<Record<string, z.ZodString>>;
}

export type RequestConfigWithBodyAndQuery = (
  RequestConfigWithBody & RequestConfigWithQuery
);

export type RequestConfigWithBodyAndParams = (
  RequestConfigWithBody & RequestConfigWithParams
);

export type RequestConfigWithParamsAndQuery = (
  RequestConfigWithParams & RequestConfigWithQuery
);

export type RequestConfigWithBodyAndParamsAndQuery = (
  RequestConfigWithBody &
  RequestConfigWithParams &
  RequestConfigWithQuery
);

export type RequestConfig = (
  | BaseRequestConfig
  | RequestConfigWithBody
  | RequestConfigWithParams
  | RequestConfigWithBodyAndParams
  | RequestConfigWithQuery
  | RequestConfigWithBodyAndQuery
  | RequestConfigWithParamsAndQuery
  | RequestConfigWithBodyAndParamsAndQuery
);

export type APIConfig = {
  [Property: string]: {
    path: `/${string}`;
    routes: {
      [Property: string]: RequestConfig;
    };
  }
}

export type Route<T extends RequestConfig> = {
  path: T['path'] extends infer R ? R extends string ? ExactString<R> : null : null;
  method: ExactString<T['method']>;
  responses: T['responses'];
  fullStaticPath: string;
  getFullDynamicPath: (
    T extends infer R ? R extends RequestConfigWithParamsAndQuery ?
    (params: { params: z.infer<R['params']>; query: z.infer<R['query']> }) => string :
    R extends RequestConfigWithParams ? (params: { params: z.infer<R['params']> }) => string :
    R extends RequestConfigWithQuery ? (params: { query: z.infer<R['query']> }) => string :
    () => string : () => string
  )
};

export type API<T extends APIConfig> = {
  [h in keyof T]: {
    path: ExactString<T[h]['path']>;
    routes: {
      [e in keyof T[h]['routes']]: T[h]['routes'][e] extends infer R ?
        R extends RequestConfigWithBodyAndParamsAndQuery ?
        Route<R> & Pick<R, 'body' | 'params' | 'query'> :
        R extends RequestConfigWithBodyAndParams ?
        Pick<R, 'body' | 'params'> & Route<R> :
        R extends RequestConfigWithBodyAndQuery ?
        Pick<R, 'body' | 'query'> & Route<R> :
        R extends RequestConfigWithParamsAndQuery ? 
        Pick<R, 'params' | 'query'> & Route<R> :
        R extends RequestConfigWithParams ? 
        Pick<R, 'params'> & Route<R> :
        R extends RequestConfigWithQuery ?
        Pick<R, 'query'> & Route<R> :
        R extends RequestConfigWithBody ?
        Pick<R, 'body'> & Route<R> : R extends BaseRequestConfig ? Route<R> : never : never
    }
  }
};

type ExactString<T extends string> = `${T}`;
