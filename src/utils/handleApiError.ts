import { message } from 'antd'

type NavigationFn = (path: string) => void

let _navigateToUserLogin: NavigationFn = () => { window.location.href = '/' }
let _navigateToAdminLogin: NavigationFn = () => { window.location.href = '/admin/login' }

export function setErrorNavigationHandlers(userLogin: NavigationFn, adminLogin: NavigationFn) {
  _navigateToUserLogin = userLogin
  _navigateToAdminLogin = adminLogin
}

export interface ApiError {
  detail?: string
  error_code?: string
  [key: string]: unknown
}

export function handleApiError(data: ApiError, status: number): void {
  const code = data.error_code || ''

  switch (code) {
    case 'AUTH_001':
      message.error(data.detail || '账号或密码错误')
      break

    case 'AUTH_002':
      message.error('该账号无管理员权限')
      break

    case 'AUTH_003': {
      const url = window.location.pathname
      message.error('请先登录')
      if (url.startsWith('/admin')) {
        _navigateToAdminLogin('/admin/login')
      } else {
        _navigateToUserLogin('/')
      }
      break
    }

    case 'AUTH_004':
      message.error(data.detail || '您没有权限执行此操作')
      break

    case 'USER_001':
      message.error('不能修改自己的角色')
      break

    case 'USER_002':
      message.error('不能删除自己的账号')
      break

    case 'EVENT_001':
      message.error('只有草稿状态的项目才能发布')
      break

    case 'EVENT_002':
      message.error('只有草稿状态的项目才能删除')
      break

    case 'EVENT_003':
      message.error('已关闭的项目不能编辑')
      break

    case 'EVENT_004':
      message.error('该项目已经关闭')
      break

    case 'EVENT_005':
      message.error('该项目当前不可关闭')
      break

    case 'EVENT_007':
      message.error('该项目名额已满')
      break

    case 'APP_001':
      message.error('该项目当前不接受申请')
      break

    case 'APP_002':
      message.error('该项目名额已满，无法申请')
      break

    case 'APP_003':
      message.error('您已经申请过该项目')
      break

    case 'APP_004':
      message.error('只能审核待审核状态的申请')
      break

    case 'APP_005':
      message.error('该申请决定不可更改')
      break

    case 'APP_006':
      message.error('已撤回的申请不可操作')
      break

    case 'APP_007':
      message.error('审核时项目名额已满')
      break

    case 'FILE_001':
      message.error('文件正在被使用，无法删除')
      break

    case 'VAL_001':
      message.error('两次密码不一致')
      break

    case 'VAL_002':
      message.error('旧密码错误')
      break

    case 'VAL_003':
      message.error('验证码无效')
      break

    case 'VAL_004':
      message.error('验证码已过期')
      break

    case 'VAL_005':
      message.error(data.detail || '该值已被注册')
      break

    case 'VAL_008': {
      const fieldErrors = Object.entries(data)
        .filter(([key]) => key !== 'detail' && key !== 'error_code')
        .flatMap(([, msgs]) => (Array.isArray(msgs) ? msgs : []))
        .join('; ')
      if (fieldErrors) {
        message.error(fieldErrors)
      } else {
        message.error(data.detail || '表单数据无效')
      }
      break
    }

    default:
      if (status === 404) {
        message.error(data.detail || '资源不存在')
      } else if (status === 500) {
        message.error('服务器内部错误，请稍后重试')
      } else if (data.detail) {
        message.error(data.detail)
      }
      break
  }
}
