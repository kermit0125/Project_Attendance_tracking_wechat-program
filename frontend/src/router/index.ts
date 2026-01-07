import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '工作台',
        },
      },
      {
        path: 'punch',
        name: 'Punch',
        component: () => import('@/views/Punch.vue'),
        meta: {
          title: '打卡',
        },
      },
      {
        path: 'punch/history',
        name: 'PunchHistory',
        component: () => import('@/views/PunchHistory.vue'),
        meta: {
          title: '打卡记录',
        },
      },
      {
        path: 'requests',
        name: 'Requests',
        component: () => import('@/views/Requests.vue'),
        meta: {
          title: '我的申请',
        },
      },
      {
        path: 'requests/create',
        name: 'RequestCreate',
        component: () => import('@/views/RequestCreate.vue'),
        meta: {
          title: '创建申请',
        },
      },
      {
        path: 'approvals',
        name: 'Approvals',
        component: () => import('@/views/Approvals.vue'),
        meta: {
          title: '待审批',
          requiresRoles: ['MANAGER', 'HR', 'ADMIN'],
        },
      },
      {
        path: 'geofences',
        name: 'GeoFences',
        component: () => import('@/views/GeoFenceManage.vue'),
        meta: {
          title: '打卡地点管理',
          requiresRoles: ['MANAGER', 'HR', 'ADMIN'],
        },
      },
      {
        path: 'users',
        name: 'UserManage',
        component: () => import('@/views/UserManage.vue'),
        meta: {
          title: '用户管理',
          requiresRoles: ['HR', 'ADMIN'],
        },
      },
      {
        path: 'schedules',
        name: 'ScheduleManage',
        component: () => import('@/views/ScheduleManage.vue'),
        meta: {
          title: '班次管理',
          requiresRoles: ['HR', 'ADMIN'],
        },
      },
      {
        path: 'stats',
        name: 'Stats',
        component: () => import('@/views/Stats.vue'),
        meta: {
          title: '统计',
        },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: {
          title: '个人中心',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 企业考勤系统`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 如果已登录，访问登录页则重定向到首页
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  // 检查角色权限
  if (to.meta.requiresRoles) {
    const userRoles = authStore.userRoles
    const requiredRoles = to.meta.requiresRoles as string[]
    const hasRole = requiredRoles.some((role) => userRoles.includes(role))

    if (!hasRole) {
      next({ name: 'Dashboard' })
      return
    }
  }

  next()
})

export default router

