<template>
  <div class="punch-page">
    <el-card>
      <template #header>
        <h3>打卡</h3>
      </template>
      
      <div class="punch-container">
        <!-- 班次信息 -->
        <div class="schedule-info" v-if="schedule">
          <el-tag type="info" size="large">
            {{ schedule.name }}：{{ schedule.startTime }} - {{ schedule.endTime }}
          </el-tag>
          <p class="schedule-tips">
            迟到宽限：{{ schedule.lateGraceMinutes }}分钟 | 早退宽限：{{ schedule.earlyLeaveGraceMinutes }}分钟
          </p>
        </div>
        <div class="schedule-info" v-else>
          <el-tag type="warning" size="large">未配置班次</el-tag>
          <p class="schedule-tips">请联系管理员配置班次信息</p>
        </div>

        <div class="punch-info">
          <p class="current-time">{{ currentTime }}</p>
          <p class="current-date">{{ currentDate }}</p>
          <p class="location-info" v-if="location">
            <el-icon><Location /></el-icon>
            位置: {{ location.address || `纬度: ${location.lat.toFixed(6)}, 经度: ${location.lng.toFixed(6)}` }}
          </p>
          <p class="location-info" v-else-if="locationLoading">
            <el-icon><Loading /></el-icon>
            正在获取位置信息...
          </p>
          <p class="location-info" v-else style="color: #f56c6c;">
            <el-icon><Warning /></el-icon>
            未获取到位置信息，请允许浏览器访问位置权限
          </p>
        </div>

        <!-- 打卡状态提示 -->
        <div class="punch-status" v-if="lastPunchResult">
          <el-alert
            :title="lastPunchResult.message"
            :type="lastPunchResult.status === 'NORMAL' ? 'success' : (lastPunchResult.status === 'NO_SCHEDULE' ? 'info' : 'warning')"
            :closable="true"
            show-icon
            @close="lastPunchResult = null"
          />
        </div>

        <div class="punch-actions">
          <el-button
            type="primary"
            size="large"
            :disabled="!canPunchIn || loading || locationLoading"
            :loading="loading"
            @click="handlePunchIn"
            style="width: 200px; height: 60px; font-size: 18px;"
          >
            <el-icon><ArrowRight /></el-icon>
            {{ todayPunch?.punchIn ? '已打卡' : '上班打卡' }}
          </el-button>
          
          <el-button
            type="success"
            size="large"
            :disabled="!canPunchOut || loading"
            :loading="loading"
            @click="handlePunchOut"
            style="width: 200px; height: 60px; font-size: 18px;"
          >
            <el-icon><ArrowLeft /></el-icon>
            下班打卡
          </el-button>
        </div>

        <div class="today-record" v-if="todayPunch && (todayPunch.punchIn || todayPunch.punchOut)">
          <h4>今日打卡记录</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="上班时间">
              {{ formatTime(todayPunch.punchIn?.punchedAt) || '未打卡' }}
            </el-descriptions-item>
            <el-descriptions-item label="下班时间">
              {{ formatTime(todayPunch.punchOut?.punchedAt) || '未打卡' }}
            </el-descriptions-item>
            <el-descriptions-item label="上班地点">
              {{ todayPunch.punchIn?.location || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="下班地点">
              {{ todayPunch.punchOut?.location || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, ArrowRight, ArrowLeft, Loading, Warning } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const loading = ref(false)
const locationLoading = ref(false)
const currentTime = ref('')
const currentDate = ref('')
const location = ref<{ lat: number; lng: number; address?: string } | null>(null)
const todayPunch = ref<any>(null)
const schedule = ref<any>(null)
const lastPunchResult = ref<{
  status: string;
  message: string;
} | null>(null)

let timeInterval: number | null = null

const canPunchIn = computed(() => {
  // 如果没有打卡记录，或者没有上班打卡记录，可以打卡
  if (!todayPunch.value) return true
  return !todayPunch.value.punchIn
})

const canPunchOut = computed(() => {
  // 如果有上班打卡记录，且没有下班打卡记录，可以打卡
  if (!todayPunch.value) {
    console.log('canPunchOut: todayPunch.value 为空')
    return false
  }
  const hasPunchIn = !!todayPunch.value.punchIn
  const hasPunchOut = !!todayPunch.value.punchOut
  const result = hasPunchIn && !hasPunchOut
  console.log('canPunchOut 计算:', {
    hasPunchIn,
    hasPunchOut,
    result,
    punchIn: todayPunch.value.punchIn,
    punchOut: todayPunch.value.punchOut,
  })
  return result
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN')
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

const getLocation = () => {
  if (!navigator.geolocation) {
    ElMessage.warning('浏览器不支持地理位置功能')
    location.value = null
    locationLoading.value = false
    return
  }

  locationLoading.value = true
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      location.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      locationLoading.value = false
      console.log('位置获取成功:', position.coords.latitude, position.coords.longitude)
    },
    (error) => {
      console.error('获取位置失败:', error)
      locationLoading.value = false
      location.value = null
      
      let errorMsg = '无法获取位置信息'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = '位置权限被拒绝，请在浏览器设置中允许位置访问'
          break
        case error.POSITION_UNAVAILABLE:
          errorMsg = '位置信息不可用'
          break
        case error.TIMEOUT:
          errorMsg = '获取位置超时，请重试'
          break
      }
      ElMessage.warning(errorMsg)
    },
    {
      enableHighAccuracy: false, // 改为 false，避免一直等待高精度定位
      timeout: 5000, // 缩短超时时间
      maximumAge: 60000, // 允许使用缓存的位置（1分钟内）
    }
  )
}

const loadTodayPunch = async () => {
  try {
    const response = await request.get<{ punchIn: any; punchOut: any }>(API_ENDPOINTS.PUNCH_TODAY)
    // 响应拦截器已经提取了 data.data，所以 response 就是 { punchIn, punchOut }
    console.log('加载今日打卡记录响应:', response)
    todayPunch.value = response || { punchIn: null, punchOut: null }
    console.log('今日打卡记录已更新:', {
      punchIn: todayPunch.value.punchIn,
      punchOut: todayPunch.value.punchOut,
      canPunchIn: canPunchIn.value,
      canPunchOut: canPunchOut.value,
    })
  } catch (error) {
    console.error('加载今日打卡记录失败:', error)
    todayPunch.value = { punchIn: null, punchOut: null }
  }
}

const loadSchedule = async () => {
  try {
    const response = await request.get<any>(API_ENDPOINTS.PUNCH_SCHEDULE)
    schedule.value = response
    console.log('加载班次信息:', schedule.value)
  } catch (error) {
    console.error('加载班次信息失败:', error)
    schedule.value = null
  }
}

const handlePunchIn = async () => {
  // 如果位置还在加载中，等待
  if (locationLoading.value) {
    ElMessage.warning('正在获取位置信息，请稍候...')
    return
  }

  // 如果位置获取失败，仍然允许打卡（后端会处理）
  if (!location.value) {
    const confirmed = await ElMessageBox.confirm(
      '无法获取位置信息，是否仍然尝试打卡？',
      '提示',
      {
        confirmButtonText: '继续打卡',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).catch(() => false)
    
    if (!confirmed) {
      return
    }
  }

  loading.value = true
  try {
    const payload: any = {
      punchType: 'IN',
      verifyMethod: 'NONE',
    }
    
    // 如果有位置信息，添加到请求中
    if (location.value) {
      payload.lat = location.value.lat
      payload.lng = location.value.lng
      payload.accuracyM = 10
    }

    const response = await request.post<any>(API_ENDPOINTS.PUNCH, payload)
    console.log('上班打卡成功响应:', response)
    
    // 显示打卡状态（迟到提示等）
    if (response.status && response.message) {
      lastPunchResult.value = {
        status: response.status,
        message: response.message,
      }
      
      if (response.status === 'LATE') {
        ElMessage.warning(response.message)
      } else {
        ElMessage.success(response.message)
      }
    } else {
      ElMessage.success('上班打卡成功')
    }
    
    // 立即更新状态（乐观更新）
    if (!todayPunch.value) {
      todayPunch.value = { punchIn: null, punchOut: null }
    }
    todayPunch.value.punchIn = {
      id: response.id,
      punchType: response.punchType,
      punchedAt: response.punchedAt,
    }
    
    // 等待一小段时间确保数据库已更新，然后重新加载打卡记录
    await new Promise(resolve => setTimeout(resolve, 300))
    await loadTodayPunch()
  } catch (error: any) {
    // 错误消息已经在拦截器中显示，这里只处理业务逻辑
    console.error('打卡失败:', error)
    // 如果打卡失败，重新加载记录以更新状态
    await new Promise(resolve => setTimeout(resolve, 300))
    await loadTodayPunch()
  } finally {
    loading.value = false
  }
}

const handlePunchOut = async () => {
  // 如果位置还在加载中，等待
  if (locationLoading.value) {
    ElMessage.warning('正在获取位置信息，请稍候...')
    return
  }

  // 如果位置获取失败，仍然允许打卡（后端会处理）
  if (!location.value) {
    const confirmed = await ElMessageBox.confirm(
      '无法获取位置信息，是否仍然尝试打卡？',
      '提示',
      {
        confirmButtonText: '继续打卡',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).catch(() => false)
    
    if (!confirmed) {
      return
    }
  }

  loading.value = true
  try {
    const payload: any = {
      punchType: 'OUT',
      verifyMethod: 'NONE',
    }
    
    // 如果有位置信息，添加到请求中
    if (location.value) {
      payload.lat = location.value.lat
      payload.lng = location.value.lng
      payload.accuracyM = 10
    }

    const response = await request.post<any>(API_ENDPOINTS.PUNCH, payload)
    console.log('下班打卡成功响应:', response)
    
    // 显示打卡状态（早退提示等）
    if (response.status && response.message) {
      lastPunchResult.value = {
        status: response.status,
        message: response.message,
      }
      
      if (response.status === 'EARLY_LEAVE') {
        ElMessage.warning(response.message)
      } else {
        ElMessage.success(response.message)
      }
    } else {
      ElMessage.success('下班打卡成功')
    }
    
    // 立即更新状态（乐观更新）
    if (!todayPunch.value) {
      todayPunch.value = { punchIn: null, punchOut: null }
    }
    todayPunch.value.punchOut = {
      id: response.id,
      punchType: response.punchType,
      punchedAt: response.punchedAt,
    }
    
    // 等待一小段时间确保数据库已更新，然后重新加载打卡记录
    await new Promise(resolve => setTimeout(resolve, 300))
    await loadTodayPunch()
  } catch (error: any) {
    // 错误消息已经在拦截器中显示，这里只处理业务逻辑
    console.error('打卡失败:', error)
    // 如果打卡失败，重新加载记录以更新状态
    await new Promise(resolve => setTimeout(resolve, 300))
    await loadTodayPunch()
  } finally {
    loading.value = false
  }
}

const formatTime = (time: string | Date | undefined) => {
  if (!time) return null
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
  getLocation()
  loadTodayPunch()
  loadSchedule()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.punch-page {
  max-width: 800px;
  margin: 0 auto;
}

.punch-container {
  text-align: center;
}

.schedule-info {
  margin-bottom: 20px;
}

.schedule-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.punch-info {
  margin-bottom: 30px;
}

.current-time {
  font-size: 48px;
  font-weight: bold;
  color: #409eff;
  margin: 0 0 8px 0;
}

.current-date {
  font-size: 18px;
  color: #909399;
  margin: 0 0 16px 0;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #606266;
}

.punch-status {
  margin-bottom: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.punch-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.today-record {
  margin-top: 40px;
  text-align: left;
}

.today-record h4 {
  margin-bottom: 16px;
  color: #303133;
}
</style>

