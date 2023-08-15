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
  query?: z.ZodObject<Record<string, z.ZodString | z.ZodNumber>, "strip", z.ZodTypeAny, Record<string, string | number>>;
  body?: z.ZodTypeAny;
  params?: z.ZodObject<Record<string, z.ZodString>, "strip", z.ZodTypeAny, Record<string, string>>;
}

export interface RequestConfigWithQuery extends BaseRequestConfig {
  query: z.ZodObject<Record<string, z.ZodString | z.ZodNumber>, "strip", z.ZodTypeAny, Record<string, string | number>>;
}

export interface RequestConfigWithBody extends BaseRequestConfig {
  body: z.ZodTypeAny;
}

export interface RequestConfigWithParams extends BaseRequestConfig {
  params: z.ZodObject<Record<string, z.ZodString>, "strip", z.ZodTypeAny, Record<string, string>>;
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

export type ContractConfig = {
  [Property: string]: {
    path: `/${string}`;
    routes: {
      [Property: string]: BaseRequestConfig;
    };
  }
}

type OmitUnknownFields<T> = {
  [Key in keyof T as unknown extends T[Key] ? never : Key]: T[Key];
};

export type Route<T extends RequestConfig> = {
  path: T['path'] extends infer R ? R extends string ? ExactString<R> : null : null;
  method: ExactString<T['method']>;
  responses: T['responses'];
  fullStaticPath: string;
  getFullDynamicPath: (
    T extends RequestConfigWithParamsAndQuery ?
    (params: { params: z.infer<T['params']>; query: z.infer<T['query']> }) => string :
    T extends RequestConfigWithParams ? (params: { params: z.infer<T['params']> }) => string :
    T extends RequestConfigWithQuery ? (params: { query: z.infer<T['query']> }) => string :
    () => string
  )
} & OmitUnknownFields<Pick<T, 'body' | 'params' | 'query'>>;

export type Contract<T extends ContractConfig> = {
  [h in keyof T]: {
    path: ExactString<T[h]['path']>;
    routes: {
      [e in keyof T[h]['routes']]: Route<T[h]['routes'][e]>;
    }
  }
};


export type InferRoutePayloadType<T extends Pick<BaseRequestConfig, 'body' | 'query' | 'params'>> = (
  {
    [Key in 'body' | 'query' | 'params' as T[Key] extends z.ZodTypeAny ? Record<string, never> extends z.infer<T[Key]> ? never : Key : never]: T[Key] extends z.ZodTypeAny ? z.infer<T[Key]> : never;
  }
);

export type InferResponsesTypes<T extends (Route<RequestConfig>) | (Record<string, Route<RequestConfig>>)> = (
  T extends Route<RequestConfig> ? (
    {
      [Key in keyof T['responses']]: z.infer<T['responses'][Key]>;
    }
  ) : T extends Record<string, Route<RequestConfig>> ? {
    [ScopeKey in keyof T]: {
      [ResponseKey in keyof T[ScopeKey]['responses']]: z.infer<T[ScopeKey]['responses'][ResponseKey]>;
    }
  } : never
);

type ExactString<T extends string> = `${T}`;
