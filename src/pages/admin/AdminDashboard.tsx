import React, { useEffect, useState } from 'react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ContentCard } from '@/components/common/ContentCard'
import { Card, Col, Row, Statistic } from 'antd'
import {
  UserOutlined,
  ProjectOutlined,
  FileSearchOutlined,
  FileOutlined,
  TeamOutlined,
  SolutionOutlined,
} from '@ant-design/icons'

interface DashboardData {
  total_users: number
  total_students: number
  total_teachers: number
  total_admins: number
  total_events: number
  events_by_status: Record<string, number>
  total_applications: number
  applications_by_status: Record<string, number>
  total_files: number
}

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard/')
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <PageHeader title="管理仪表盘" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="用户总数"
              value={data?.total_users ?? 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="学生数"
              value={data?.total_students ?? 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="教师数"
              value={data?.total_teachers ?? 0}
              prefix={<SolutionOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="项目总数"
              value={data?.total_events ?? 0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ContentCard title="项目概览">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="草稿"
                  value={data?.events_by_status?.draft ?? 0}
                  valueStyle={{ color: '#999' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已发布"
                  value={data?.events_by_status?.published ?? 0}
                  valueStyle={{ color: '#1677ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="进行中"
                  value={data?.events_by_status?.ongoing ?? 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已关闭"
                  value={data?.events_by_status?.closed ?? 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </ContentCard>
        </Col>

        <Col xs={24} lg={12}>
          <ContentCard title="申请概览">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="待审核"
                  value={data?.applications_by_status?.pending ?? 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已通过"
                  value={data?.applications_by_status?.approved ?? 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已拒绝"
                  value={data?.applications_by_status?.rejected ?? 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已取消"
                  value={data?.applications_by_status?.cancelled ?? 0}
                  valueStyle={{ color: '#999' }}
                />
              </Col>
            </Row>
          </ContentCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="申请总数"
              value={data?.total_applications ?? 0}
              prefix={<FileSearchOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="文件总数"
              value={data?.total_files ?? 0}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="管理员数"
              value={data?.total_admins ?? 0}
              prefix={<SolutionOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  )
}

export default AdminDashboard
