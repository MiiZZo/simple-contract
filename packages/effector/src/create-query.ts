import {
  Event,
  Store,
  createEvent,
  createStore,
  createEffect,
  sample,
  Effect,
  is,
} from 'effector';
import type { z } from 'zod';

export const QUERY_KIND = Symbol.for('SIMPLE-CONTRACT/EFFECTOR-QUERY');

export interface Query<Contracts extends Record<string, z.ZodTypeAny>, Params = void> {
  start: Event<Params>;
  $isPending: Store<boolean>;
  finished: {
    [key in keyof Contracts]: {
      event: Event<void>;
      $data: Store<z.infer<Contracts[key]> | null>;
    }
  } & {
    unexpected: {
      event: Event<void>;
      $data: Store<unknown | null>;
    }
  }
  __kind: symbol;
  __executorFx: Effect<unknown, unknown, Error>;
};

export function createQuery<C extends Record<string, z.ZodTypeAny>, Body extends (params: Params) => unknown, Params = void>({
  request,
  contracts,
}: {
  params?: Params,
  request: {
    url: (params: Params) => string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: Body;
    headers?: Record<string, string | Store<any>>;
  },
  contracts: C,
}): Query<C, Params> {
  const simpleHeaders: Record<string, string> = {};
  const storeHeaders: Record<string, Store<string>> = {};

  for (const key in request.headers) {
    const header = request.headers[key];

    if (is.store(header)) {
      storeHeaders[key] = header;
    } else {
      simpleHeaders[key] = header;
    }
  }

  const fetcher = createEffect(async ({
    url,
    body,
    extraHeaders,
  }: { url: string; extraHeaders?: Record<string, any>; body?: unknown }) => {

    const headers: Record<string, string> = {
      ...simpleHeaders,
      ...extraHeaders,
    };
    
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      mode: 'cors',
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return await res.json() as unknown;
  });

  const validateResponseFx = createEffect((data: unknown) => {
    let matchedContract: keyof C | 'unexpected' = 'unexpected';

    for (const key in contracts) {
      const result = contracts[key].safeParse(data);
      
      if (result.success) {
        matchedContract = key;
        break;
      }
    }

    return {
      matchedContract,
      data,
    };
  });

  const loadingStarted = createEvent();
  const loadingEnded = createEvent();

  const query = {
    start: createEvent<Params>(),
    $isPending: createStore(false),
    finished: {},
    __kind: QUERY_KIND,
    __executorFx: fetcher,
  } as Query<C, Params>;

  for (const contractKey in contracts) {
    // @ts-ignore
    query.finished[contractKey] = {
      event: createEvent(),
      $data: createStore(null),
    };
  }

  query.finished.unexpected = {
    event: createEvent(),
    $data: createStore<unknown | null>(null),
  };

  sample({
    clock: loadingStarted,
    fn: () => true,
    target: query.$isPending,
  });

  sample({
    clock: loadingEnded,
    fn: () => false,
    target: query.$isPending,
  })

  sample({
    clock: query.start,
    source: storeHeaders,
    fn: (headers, params) => {
      const url = request.url(params);
      if (request.body) {
        return { body: request.body(params), extraHeaders: headers, url }
      }

      return { url };
    },
    target: [
      fetcher,
      loadingStarted,
    ],
  });

  sample({
    clock: fetcher.doneData,
    target: validateResponseFx,
  });

  sample({
    clock: validateResponseFx.doneData,
    target: loadingEnded,
  });

  for (const key in query.finished) {
    sample({
      clock: validateResponseFx.doneData,
      filter: ({ matchedContract }) => matchedContract === key,
      fn: ({ data }) => {
        const $data = query.finished[key].$data;

        return data as ReturnType<typeof $data['getState']>;
      },
      target: [
        query.finished[key].event,
        query.finished[key].$data,
      ]
    })
  }

  return query;
}
