<template>
  <div class="dashboard">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>工作台</h3>
        </div>
      </template>
      <div class="welcome">
        <h2>欢迎回来，{{ authStore.user?.fullName }}！</h2>
        <p>今天是 {{ currentDate }}</p>
      </div>
      
      <el-row :gutter="20" class="stats-cards">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #409eff;">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ todayPunch?.punchIn ? '已打卡' : '未打卡' }}</div>
                <div class="stat-label">今日上班</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #67c23a;">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingRequests }}</div>
                <div class="stat-label">待审批申请</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #e6a23c;">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ thisMonthAttendance }}</div>
                <div class="stat-label">本月出勤天数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #f56c6c;">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingApprovals }}</div>
                <div class="stat-label">待我审批</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <h4>快速操作</h4>
            </template>
            <div class="quick-actions">
              <el-button type="primary" @click="$router.push('/punch')">
                <el-icon><Location /></el-icon>
                立即打卡
              </el-button>
              <el-button type="success" @click="$router.push('/requests/create')">
                <el-icon><Plus /></el-icon>
                创建申请
              </el-button>
              <el-button
                v-if="authStore.isAdmin || authStore.isHR || authStore.isManager"
                type="warning"
                @click="$router.push('/approvals')"
              >
                <el-icon><Checked /></el-icon>
                审批管理
              </el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <h4>今日打卡记录</h4>
            </template>
            <div v-if="todayPunch">
              <p>上班时间: {{ formatTime(todayPunch.punchIn?.punchedAt) }}</p>
              <p v-if="todayPunch.punchOut">
                下班时间: {{ formatTime(todayPunch.punchOut?.punchedAt) }}
              </p>
              <p v-else>还未下班打卡</p>
            </div>
            <el-empty v-else description="今日暂无打卡记录" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Clock, Document, Calendar, Warning, Location, Plus, Checked } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const authStore = useAuthStore()

const todayPunch = ref<any>(null)
const pendingRequests = ref(0)
const thisMonthAttendance = ref(0)
const pendingApprovals = ref(0)

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

const formatTime = (time: string | Date | undefined) => {
  if (!time) return '-'
  return new Date(time).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadDashboardData = async () => {
  try {
    // 加载今日打卡记录
    const punchRes = await request.get<{ punchIn: any; punchOut: any }>(API_ENDPOINTS.PUNCH_TODAY)
    // 后端返回格式：{ punchIn: {...}, punchOut: {...} }
    // 响应拦截器已经提取了 data.data，所以 response 就是数据本身
    todayPunch.value = punchRes

    // TODO: 加载其他统计数据
    // pendingRequests.value = ...
    // thisMonthAttendance.value = ...
    // pendingApprovals.value = ...
  } catch (error) {
    console.error('加载工作台数据失败:', error)
    todayPunch.value = null
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.welcome {
  margin-bottom: 30px;
  text-align: center;
}

.welcome h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.welcome p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.stats-cards {
  margin-top: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

