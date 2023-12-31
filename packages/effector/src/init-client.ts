import { Store } from 'effector';
import type { Contract, ContractConfig, InferRoutePayloadType } from '@simple-contract/core';
import { type Query, createQuery } from './create-query';

interface Config<T extends ContractConfig> {
  contract: Contract<T>;
  baseHeaders: Record<string, string | Store<string>>;
}

export function initClient<T extends ContractConfig>({
  contract,
  baseHeaders,
}: Config<T>) {
  const effects = {} as {
    [Property in keyof T]: {
      [RouteKey in keyof T[Property]['routes'] as `${string & RouteKey}Query`]: (
        Query<
          T[Property]['routes'][RouteKey]['responses'],
          InferRoutePayloadType<T[Property]['routes'][RouteKey]> extends infer R ? Record<string, never> extends R ? void : R : never
        >
      );
    }
  };

  for (const contractKey in contract) {
    effects[contractKey] = {} as any;
    for (const routeKey in contract[contractKey].routes) {
      const route = contract[contractKey].routes[routeKey];

      const request = {
        method: route.method,
        url: route.getFullDynamicPath,
        body: 'body' in route ? (params: any) => params.body : undefined,
        headers: baseHeaders,
      };

      //@ts-expect-error should i fix that?
      effects[contractKey][`${routeKey}Query`] = createQuery({
        contracts: route.responses,
        request,
      });
    }
  }  

  return effects;
}
