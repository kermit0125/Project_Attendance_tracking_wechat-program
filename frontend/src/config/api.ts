/**
 * API 配置
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const API_ENDPOINTS = {
  // 认证
  LOGIN: '/auth/login',
  GET_CURRENT_USER: '/auth/me',
  
  // 打卡
  PUNCH: '/punch',
  PUNCH_TODAY: '/punch/today',
  PUNCH_HISTORY: '/punch/history',
  PUNCH_SCHEDULE: '/punch/schedule',
  
  // 班次管理
  SCHEDULES: '/admin/schedules',
  SCHEDULE_DETAIL: (id: number) => `/admin/schedules/${id}`,
  
  // 申请
  REQUESTS: '/requests',
  REQUEST_DETAIL: (id: number) => `/requests/${id}`,
  REQUEST_CANCEL: (id: number) => `/requests/${id}/cancel`,
  REQUEST_ATTACHMENTS: (id: number) => `/requests/${id}/attachments`,
  
  // 审批
  APPROVALS: '/admin/approvals',
  APPROVAL_DETAIL: (id: number) => `/admin/approvals/${id}`,
  APPROVAL_DECISION: (id: number) => `/admin/approvals/${id}/decision`,
  
  // 统计
  STATS_MONTH: '/stats/month',
  
  // 设置
  SETTINGS: '/settings',
  
  // 地理围栏管理
  GEO_FENCES: '/admin/settings/geofences',
  GEO_FENCE_DETAIL: (id: number) => `/admin/settings/geofences/${id}`,
  
  // 用户管理
  USERS: '/admin/users',
  USER_DETAIL: (id: number) => `/admin/users/${id}`,
  USER_DELETE: (id: number) => `/admin/users/${id}`,
  DEPARTMENTS: '/admin/departments',
  ROLES: '/admin/roles',
} as const

