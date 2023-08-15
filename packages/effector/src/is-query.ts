import { QUERY_KIND, Query } from './create-query';

export function isQuery(value: unknown): value is Query<Record<string, any>, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__kind' in value &&
    value.__kind === QUERY_KIND
  );
}
