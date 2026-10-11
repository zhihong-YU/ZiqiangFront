import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Alert, Spin } from 'antd'

type Role = 'student' | 'teacher' | 'admin'

export function RequireRole({ roles }: { roles?: Role[] }) {
  const [role, setRole] = useState<Role | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/user/me/profile/', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('无法验证会话')
        const data = await response.json()
        if (!controller.signal.aborted) setRole(data.role)
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true) })
    return () => controller.abort()
  }, [])
  if (failed) return <Alert type="error" title="无法验证登录状态，请刷新页面或重新登录" />
  if (!role) return <Spin fullscreen />
  if (roles && !roles.includes(role)) return <Navigate to={role === 'admin' ? '/admin' : '/profile'} replace />
  return <Outlet />
}
