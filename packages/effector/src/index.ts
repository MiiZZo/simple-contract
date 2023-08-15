import { Contract, ContractConfig, createContract, InferRoutePayloadType } from '@simple-contract/core';
import { z } from 'zod';
import { Query, createQuery } from './create-query';

export function initClient<T extends ContractConfig>(contract: Contract<T>) {
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

      //@ts-expect-error should i fix that?
      effects[contractKey][`${routeKey}Query`] = createQuery({
        contracts: route.responses,
        request: {
          method: route.method,
          url: route.getFullDynamicPath,
        },
      });
    }
  }  

  return effects;
}
