interface Config {
  url: string;
  query: Record<string, string | number | boolean>;
}

export function attachQuery({
  url,
  query,
}: Config) {
  const queryString = Object.keys(query)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&');

  if (url.includes('?')) {
    return `${url}&${queryString}`;
  } else {
    return `${url}?${queryString}`;
  }
}
