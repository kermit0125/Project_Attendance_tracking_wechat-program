<template>
  <div class="profile-page">
    <el-card>
      <template #header>
        <h3>个人中心</h3>
      </template>

      <el-descriptions :column="2" border v-if="userInfo">
        <el-descriptions-item label="姓名">{{ userInfo.fullName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ userInfo.employeeNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部门">
          {{ userInfo.department?.name || userInfo.department || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">{{ userInfo.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userInfo.status === 'ACTIVE' ? 'success' : 'danger'">
            {{ userInfo.status === 'ACTIVE' ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag
            v-for="role in userInfo.roles"
            :key="role"
            style="margin-right: 8px;"
          >
            {{ getRoleName(role) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="组织">
          {{ userInfo.org?.name || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const authStore = useAuthStore()
const userInfo = ref<any>(null)

const getRoleName = (role: string) => {
  const map: Record<string, string> = {
    EMPLOYEE: '员工',
    MANAGER: '经理',
    HR: 'HR',
    ADMIN: '管理员',
  }
  return map[role] || role
}

const loadUserInfo = async () => {
  try {
    const response = await request.get(API_ENDPOINTS.GET_CURRENT_USER)
    // 响应拦截器已经提取了 data.data，所以 response 就是数据本身
    userInfo.value = response
    authStore.user = response
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

onMounted(() => {
  if (authStore.user) {
    userInfo.value = authStore.user
  } else {
    loadUserInfo()
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
}
</style>

