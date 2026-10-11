// Session authentication and CSRF apply only to our same-origin API.
export function setupApiFetch() {
  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    const request = new Request(input, init)
    const url = new URL(request.url)
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) {
      return originalFetch(input, init)
    }
    const headers = new Headers(request.headers)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const tokenResponse = await originalFetch('/api/user/csrf/', { credentials: 'include' })
      if (!tokenResponse.ok) throw new Error('获取安全验证令牌失败，请刷新页面重试')
      const { csrfToken } = await tokenResponse.json()
      headers.set('X-CSRFToken', csrfToken)
    }
    const response = await originalFetch(new Request(request, { headers, credentials: 'include' }))
    if (response.status === 401 || response.status === 403) {
      const data = await response.clone().json().catch(() => ({}))
      if (data.error_code === 'AUTH_003') {
        window.location.assign(window.location.pathname.startsWith('/admin') ? '/admin/login' : '/')
      }
    }
    return response
  }
}

export function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && 'results' in payload && Array.isArray(payload.results)) {
    return payload.results as T[]
  }
  return []
}

// Used where a view groups the complete collection into tabs.
export async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = []
  let next: string | null = path
  while (next) {
    const url: URL = new URL(next, window.location.origin)
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) throw new Error('无效的分页地址')
    url.searchParams.set('page_size', '100')
    const response: Response = await fetch(url.pathname + url.search)
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || '获取列表失败')
    items.push(...normalizeList<T>(data))
    next = Array.isArray(data) ? null : data.next
  }
  return items
}
