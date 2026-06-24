export function isQueryLoading(query) {
  return Boolean(query?.isPending || (query?.isFetching && query?.isLoading));
}

export function hasQueryData(query) {
  const data = query?.data;

  if (Array.isArray(data)) return data.length > 0;
  return data !== undefined && data !== null;
}

export function shouldShowQueryLoader(query) {
  if (!query) return false;
  if (query.isPending) return true;
  return query.isFetching && !hasQueryData(query);
}
