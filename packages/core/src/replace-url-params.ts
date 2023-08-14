interface Config {
  url: string;
  params: Record<string, string>;
}

export function replaceUrlParams({ url, params }: Config) {
  let newUrl = url;
  for (const key in params) {
    const paramValue = encodeURIComponent(params[key]);
    newUrl = newUrl.replace(`:${key}`, paramValue);
  }

  return newUrl;
}
