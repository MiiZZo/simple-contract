import {
  Event,
  Store,
  createEvent,
  createStore,
  createEffect,
  sample,
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
    headers?: Record<string, string>;
  },
  contracts: C,
}): Query<C, Params> {
  const fetcher = createEffect(async ({
    url,
    body,
  }: { url: string; body?: unknown }) => {
    const headers: Record<string, string> = {
      ...request.headers,
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

  const query = {
    start: createEvent<Params>(),
    $isPending: createStore(false),
    finished: {},
    __kind: QUERY_KIND,
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
    clock: query.start,
    fn: (params) => {
      const url = request.url(params);
      if (request.body) {
        return { body: request.body(params), url }
      }

      return { url };
    },
    target: fetcher,
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