import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { Routes, Route } from 'react-router-dom'
import { RequireRole } from './components/common/RequireRole'
const Login = lazy(() => import('./Login'))
const Register = lazy(() => import('./Register'))
const Profile = lazy(() => import('./pages/Profile'))
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'))
const ProjectManagement = lazy(() => import('./pages/ProjectManagement'))
const ProjectMarket = lazy(() => import('./pages/ProjectMarket'))
const MyApplications = lazy(() => import('./pages/MyApplications'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'))
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'))
const AdminFiles = lazy(() => import('./pages/admin/AdminFiles'))
const AdminTemplates = lazy(() => import('./pages/admin/AdminTemplates'))

function App() {
  return (
    <Suspense fallback={<Spin fullscreen />} >
      <Routes>
        {/* ========== 用户端路由 ========== */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireRole />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        </Route>
        <Route element={<RequireRole roles={['teacher', 'admin']} />}>
        <Route path="/projects/manage" element={<ProjectManagement />} />
        </Route>
        <Route element={<RequireRole roles={['student']} />}>
        <Route path="/projects/market" element={<ProjectMarket />} />
        <Route path="/projects/applications" element={<MyApplications />} />
        </Route>

        {/* ========== 管理员端路由（独立入口） ========== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<RequireRole roles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/files" element={<AdminFiles />} />
        <Route path="/admin/templates" element={<AdminTemplates />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1>404 - 页面找不到了</h1>} />
      </Routes>
    </Suspense>
  )
}

export default App
