<template>
  <el-container class="main-layout">
    <el-header class="header">
      <div class="header-left">
        <h1 class="logo">企业考勤系统</h1>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><User /></el-icon>
            <span>{{ authStore.user?.fullName || '用户' }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/punch">
            <el-icon><Location /></el-icon>
            <span>打卡</span>
          </el-menu-item>
          <el-menu-item index="/punch/history">
            <el-icon><Clock /></el-icon>
            <span>打卡记录</span>
          </el-menu-item>
          <el-menu-item index="/requests">
            <el-icon><Document /></el-icon>
            <span>我的申请</span>
          </el-menu-item>
          <el-menu-item
            v-if="authStore.isAdmin || authStore.isHR || authStore.isManager"
            index="/approvals"
          >
            <el-icon><Checked /></el-icon>
            <span>待审批</span>
          </el-menu-item>
          <el-menu-item
            v-if="authStore.isAdmin || authStore.isHR || authStore.isManager"
            index="/geofences"
          >
            <el-icon><LocationFilled /></el-icon>
            <span>打卡地点</span>
          </el-menu-item>
          <el-menu-item
            v-if="authStore.isAdmin || authStore.isHR"
            index="/users"
          >
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item
            v-if="authStore.isAdmin || authStore.isHR"
            index="/schedules"
          >
            <el-icon><Clock /></el-icon>
            <span>班次管理</span>
          </el-menu-item>
          <el-menu-item index="/stats">
            <el-icon><DataAnalysis /></el-icon>
            <span>统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  User,
  SwitchButton,
  Odometer,
  Location,
  Clock,
  Document,
  Checked,
  DataAnalysis,
  ArrowDown,
  LocationFilled,
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const handleCommand = async (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      authStore.logout()
      router.push('/login')
    } catch {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.header {
  background-color: #409eff;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left .logo {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: white;
}

.sidebar {
  background-color: #f5f5f5;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>

