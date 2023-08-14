import { RequestConfig, RequestConfigWithBody, RequestConfigWithParams, RequestConfigWithQuery } from './types';

export function isRequestConfigWithBody(value: RequestConfig): value is RequestConfigWithBody {
  return 'body' in value;
}

export function isRequestConfigWithParams(value: RequestConfig): value is RequestConfigWithParams {
  return 'params' in value;
}

export function isRequestConfigWithQuery(value: RequestConfig): value is RequestConfigWithQuery {
  return 'query' in value;
}
