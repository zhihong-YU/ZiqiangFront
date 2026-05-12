export function setupMockFetch() {
  const originalFetch = window.fetch

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Remove localStorage mock user tokens if they exist, so they don't mess up real authentication
    if (localStorage.getItem('IS_MOCK_USER')) {
      localStorage.removeItem('IS_MOCK_USER');
      localStorage.removeItem('MOCK_USER_ID');
    }
    
    // --- Real backend requests ---
    const newInit = { ...init };
    const method_upper = newInit.method ? newInit.method.toUpperCase() : 'GET';

    const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    
    // Login endpoints: skip CSRF pre-fetching (login is @csrf_exempt)
    // Must use credentials: 'include' so the browser accepts Set-Cookie: sessionid
    const isLogin = requestUrl.includes('/api/user/login/') || requestUrl.includes('/api/admin/login/')
    
    if (isLogin && method_upper === 'POST') {
      newInit.credentials = 'include';
      return originalFetch(input, newInit)
    }
    
    // CSRF token handling for write requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method_upper)) {
      let csrftoken = '';
      
      const csrfEndpoint = requestUrl.includes('/api/admin/') ? '/api/admin/csrf/' : '/api/user/csrf/'
      
      try {
        const csrfRes = await originalFetch(csrfEndpoint, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (csrfRes.ok) {
          const csrfData = await csrfRes.json();
          csrftoken = csrfData.csrfToken || csrfData.csrftoken || csrfData.token;
        }
      } catch (err) {
        console.warn('Failed to fetch CSRF token from endpoint, falling back to cookie:', err);
      }
      
      if (!csrftoken) {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
        };
        csrftoken = getCookie('csrftoken') || '';
      }

      if (csrftoken) {
        newInit.headers = {
          ...newInit.headers,
          'X-CSRFToken': csrftoken,
        };
      }
    }
    
    newInit.credentials = 'include';

    const response = await originalFetch(input, newInit)
    
    // Global error interception: AUTH_003 (401) and AUTH_004 (403)
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      try {
        const cloned = response.clone()
        const data = await cloned.json()
        const code = data.error_code || ''
        
        if (code === 'AUTH_003') {
          const isAdminPage = window.location.pathname.startsWith('/admin')
          window.location.href = isAdminPage ? '/admin/login' : '/'
          return response
        }
        
        if (code === 'AUTH_004') {
          import('antd').then(({ message }) => {
            message.error(data.detail || '您没有权限执行此操作')
          })
        }
      } catch {
        // Response body might not be JSON, ignore
      }
    }
    
    return response
  }
}
