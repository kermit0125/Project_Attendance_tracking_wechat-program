import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

export interface User {
  id: number
  email: string
  fullName: string
  employeeNo: string | null
  department: string | null
  roles: string[]
  orgId?: number
  phone?: string | null
  status?: string
  org?: {
    id: number
    name: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  // 计算属性：是否已登录
  const isAuthenticated = computed(() => !!token.value)

  // 计算属性：用户角色
  const userRoles = computed(() => user.value?.roles || [])

  // 计算属性：是否是管理员
  const isAdmin = computed(() => userRoles.value.includes('ADMIN'))

  // 计算属性：是否是 HR
  const isHR = computed(() => userRoles.value.includes('HR'))

  // 计算属性：是否是经理
  const isManager = computed(() => userRoles.value.includes('MANAGER'))

  /**
   * 登录
   */
  async function login(email: string, password: string) {
    try {
      // 响应拦截器已经提取了 data.data，所以这里直接使用 response
      const response = await request.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
        email,
        password,
      })

      // response 已经是 { token, user } 格式
      const { token: newToken, user: userData } = response

      token.value = newToken
      user.value = userData

      // 保存到 localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 获取当前用户信息
   */
  async function fetchCurrentUser() {
    try {
      // 响应拦截器已经提取了 data.data，所以这里直接使用 response
      const response = await request.get<User>(API_ENDPOINTS.GET_CURRENT_USER)
      user.value = response

      // 更新 localStorage
      localStorage.setItem('user', JSON.stringify(response))

      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 登出
   */
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /**
   * 初始化：从 localStorage 恢复用户信息
   */
  function init() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('恢复用户信息失败:', error)
        logout()
      }
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userRoles,
    isAdmin,
    isHR,
    isManager,
    login,
    fetchCurrentUser,
    logout,
    init,
  }
})

