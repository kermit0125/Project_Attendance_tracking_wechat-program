import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { API_BASE_URL } from '@/config/api'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

/**
 * 创建 axios 实例
 */
const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    
    // 添加 token 到请求头
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    
    // 如果后端返回的是标准格式 { code, message, data }
    if (data.code && data.code !== 'SUCCESS') {
      // 后端已经返回了错误信息，这里不重复显示，让调用方处理
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    
    // 如果后端返回的是标准格式，返回 data 字段；否则返回整个响应
    return data.data !== undefined ? data.data : data
  },
  (error: AxiosError<any>) => {
    const { response } = error
    
    if (response) {
      const { status, data } = response
      
      // 如果后端返回了标准格式的错误，使用后端的错误信息
      const errorMessage = data?.message || data?.data?.message
      
      switch (status) {
        case 401:
          // 如果是登录接口，不自动跳转，让登录页面自己处理
          if (error.config?.url?.includes('/auth/login')) {
            // 登录失败，不显示错误消息（由登录页面处理）
            return Promise.reject(error)
          }
          if (errorMessage) {
            ElMessage.error(errorMessage)
          } else {
            ElMessage.error('未授权，请先登录')
          }
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          break
        case 403:
          ElMessage.error(errorMessage || '没有权限访问')
          break
        case 404:
          ElMessage.error(errorMessage || '请求的资源不存在')
          break
        case 409:
          // 409 冲突错误，通常有明确的业务错误信息
          ElMessage.error(errorMessage || '操作冲突')
          break
        case 500:
          ElMessage.error(errorMessage || '服务器错误')
          break
        default:
          ElMessage.error(errorMessage || `请求失败 (${status})`)
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

// 创建一个包装函数，返回正确的类型
const request = {
  get: <T = any>(url: string, config?: any): Promise<T> => {
    return service.get(url, config)
  },
  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return service.post(url, data, config)
  },
  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return service.put(url, data, config)
  },
  delete: <T = any>(url: string, config?: any): Promise<T> => {
    return service.delete(url, config)
  },
  patch: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return service.patch(url, data, config)
  },
}

export default request

