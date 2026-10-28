/**
 * Returns true when an error looks like a browser/network failure rather than
 * a normal Appwrite response (invalid credentials, duplicate email, etc.).
 *
 * Browsers report CORS/offline failures as `TypeError: Failed to fetch`,
 * while Appwrite wraps some of them with its own message. Detecting both lets
 * the auth pages show a helpful message instead of the raw error.
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;

  if (error instanceof TypeError) return true;

  if (error instanceof DOMException && error.name === 'AbortError') {
    return false;
  }

  const name =
    typeof error === 'object' && 'name' in error
      ? String((error as { name?: unknown }).name ?? '')
      : '';

  const message = error instanceof Error ? error.message : String(error);

  if (name === 'TypeError' || name === 'NetworkError') return true;

  return /failed to fetch|network\s*error|network request failed|load failed|fetch failed|err_network|err_internet_disconnected/i.test(
    message
  );
};
