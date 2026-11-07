import { PlatformError } from './contracts'

const DEFAULT_TIMEOUT_MS = 15000

function normalizeApiError(payload, status, requestId) {
  return new PlatformError(
    payload?.message || payload?.error?.message || \`MARCHY API request failed (\${status}).\`,
    {
      code: payload?.code || payload?.error?.code || 'API_REQUEST_FAILED',
      status,
      requestId: requestId || payload?.request_id || null,
      fieldErrors: payload?.field_errors || payload?.error?.field_errors || null
    }
  )
}

export function createApiClient({
  baseUrl = import.meta.env.VITE_MARCHY_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api/v1',
  getAccessToken = null,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  const normalizedBase = String(baseUrl || '').trim().replace(/\/+$/, '')

  async function request(path, {
    method = 'GET',
    query,
    body,
    headers = {},
    idempotencyKey,
    signal
  } = {}) {
    if (!normalizedBase) {
      throw new PlatformError('The MARCHY API URL is not configured. Set VITE_MARCHY_API_URL before enabling live mode.', {
        code: 'API_NOT_CONFIGURED'
      })
    }
    if (typeof fetchImpl !== 'function') {
      throw new PlatformError('This environment does not provide fetch.', { code: 'FETCH_UNAVAILABLE' })
    }

    const url = new URL(\`\${normalizedBase}/\${String(path).replace(/^\/+/, '')}\`)
    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value))
        }
      })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(new Error('Request timed out')), timeoutMs)
    const abortFromCaller = () => controller.abort(signal.reason)
    if (signal) {
      if (signal.aborted) controller.abort(signal.reason)
      else signal.addEventListener('abort', abortFromCaller, { once: true })
    }

    try {
      const token = typeof getAccessToken === 'function' ? await getAccessToken() : null
      const requestHeaders = {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        ...headers
      }
      const response = await fetchImpl(url, {
        method,
        headers: requestHeaders,
        credentials: 'include',
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal
      })
      const requestId = response.headers?.get?.('x-request-id') || null
      const raw = response.status === 204 ? null : await response.text()
      let payload = null
      if (raw) {
        try { payload = JSON.parse(raw) } catch {
          throw new PlatformError('The MARCHY API returned an unreadable response.', {
            code: 'INVALID_API_RESPONSE', status: response.status, requestId
          })
        }
      }
      if (!response.ok) throw normalizeApiError(payload, response.status, requestId)
      return payload
    } catch (error) {
      if (error instanceof PlatformError) throw error
      if (controller.signal.aborted) {
        throw new PlatformError(
          controller.signal.reason?.message === 'Request timed out' ? 'The request timed out. Please try again.' : 'The request was cancelled.',
          { code: controller.signal.reason?.message === 'Request timed out' ? 'REQUEST_TIMEOUT' : 'REQUEST_ABORTED', cause: error }
        )
      }
      throw new PlatformError('Unable to reach MARCHY right now. Check your connection and try again.', {
        code: 'NETWORK_ERROR', cause: error
      })
    } finally {
      clearTimeout(timeout)
      if (signal) signal.removeEventListener('abort', abortFromCaller)
    }
  }

  return {
    request,
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' })
  }
}
