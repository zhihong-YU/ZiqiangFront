import { Routes, Route } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import Profile from './pages/Profile'
import KnowledgeBase from './pages/KnowledgeBase'
import ProjectManagement from './pages/ProjectManagement'
import ProjectMarket from './pages/ProjectMarket'
import MyApplications from './pages/MyApplications'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminEvents from './pages/admin/AdminEvents'
import AdminApplications from './pages/admin/AdminApplications'
import AdminFiles from './pages/admin/AdminFiles'

function App() {
  return (
    <div>
      <Routes>
        {/* ========== 用户端路由 ========== */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/projects/manage" element={<ProjectManagement />} />
        <Route path="/projects/market" element={<ProjectMarket />} />
        <Route path="/projects/applications" element={<MyApplications />} />

        {/* ========== 管理员端路由（独立入口） ========== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/files" element={<AdminFiles />} />

        {/* 404 */}
        <Route path="*" element={<h1>404 - 页面找不到了</h1>} />
      </Routes>
    </div>
  )
}

export default App
