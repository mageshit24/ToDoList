// Small fetch wrapper: adds a timeout and consistent error handling so a
// slow/cold backend (e.g. a Render free-tier instance spinning up) fails
// predictably instead of hanging the UI or surfacing a raw exception.

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Wraps the native fetch() with:
 *  - an AbortController-based timeout (defaults to 15s)
 *  - friendlier, user-facing error messages instead of raw network errors
 *
 * @param {string} url
 * @param {RequestInit} options - standard fetch options (method, headers, body, ...)
 * @param {number} timeoutMs - how long to wait before aborting the request
 * @returns {Promise<Response>} the raw fetch Response on success (caller still
 *   needs to check res.ok, same as a normal fetch call)
 */
export async function apiFetch(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    // If the request takes too long, abort it ourselves rather than letting
    // the browser (or the user) wait indefinitely.
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
    } catch (err) {
        if (err.name === 'AbortError') {
            // Our own timeout fired — most likely a cold-starting free-tier server.
            throw new Error('The server is taking longer than usual to respond. It may be waking up — please try again in a moment.');
        }
        // Any other failure (DNS, offline, CORS, etc) — keep it generic and actionable.
        throw new Error('Could not reach the server. Check your connection and try again.');
    } finally {
        // Always clear the timer, whether the request succeeded, failed, or aborted,
        // so it doesn't fire late and abort a *future* unrelated request.
        clearTimeout(timer);
    }
}
