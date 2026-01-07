<template>
  <div class="stats-page">
    <el-card>
      <template #header>
        <h3>统计</h3>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item label="月份">
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            @change="loadStats"
          />
        </el-form-item>
      </el-form>

      <el-row :gutter="20" class="stats-cards" v-if="statsData">
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">出勤天数</div>
              <div class="stat-value">{{ statsData.workDays || 0 }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">总工时</div>
              <div class="stat-value">{{ (statsData.workHours || 0).toFixed(1) }}</div>
              <div class="stat-unit">小时</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">迟到次数</div>
              <div class="stat-value">{{ statsData.lateCount || 0 }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">缺卡次数</div>
              <div class="stat-value">{{ statsData.missingPunchCount || 0 }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 工时详情 -->
      <el-card v-if="statsData" style="margin-top: 20px;">
        <template #header>
          <h4>工时详情</h4>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="基础工时">
            {{ (statsData.baseWorkHours || 0).toFixed(1) }} 小时
            <el-text type="info" size="small" style="margin-left: 8px;">
              (打卡记录)
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="加班工时">
            <el-text type="success">
              +{{ (statsData.overtimeHours || 0).toFixed(1) }} 小时
            </el-text>
            <el-text type="info" size="small" style="margin-left: 8px;">
              (已通过加班申请)
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="补卡工时">
            <el-text type="success">
              +{{ (statsData.fixPunchHours || 0).toFixed(1) }} 小时
            </el-text>
            <el-text type="info" size="small" style="margin-left: 8px;">
              (已通过补卡申请，因错过打卡时间或误操作)
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="出差工时">
            <el-text type="success">
              +{{ (statsData.tripHours || 0).toFixed(1) }} 小时
            </el-text>
            <el-text type="info" size="small" style="margin-left: 8px;">
              (已通过出差申请，因地点限制无法打卡)
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="请假天数" :span="2">
            <el-text type="info">
              {{ (statsData.leaveDays || 0).toFixed(1) }} 天
            </el-text>
            <el-text type="info" size="small" style="margin-left: 8px;">
              (已通过请假申请，不计入工时)
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="总工时" :span="2">
            <el-text type="primary" style="font-size: 18px; font-weight: bold;">
              {{ (statsData.workHours || 0).toFixed(1) }} 小时
            </el-text>
            <el-text type="info" size="small" style="margin-left: 8px;">
              (基础工时 + 加班工时 + 补卡工时 + 出差工时)
            </el-text>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const selectedMonth = ref('')
const statsData = ref<any>(null)

const loadStats = async () => {
  if (!selectedMonth.value) {
    // 默认当前月份
    const now = new Date()
    selectedMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  try {
    const response = await request.get(API_ENDPOINTS.STATS_MONTH, {
      params: {
        month: selectedMonth.value,
      },
    })
    // 响应拦截器已经提取了 data.data，所以 response 就是数据本身
    statsData.value = response
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.stats-page {
  max-width: 1200px;
  margin: 0 auto;
}

.search-form {
  margin-bottom: 20px;
}

.stats-cards {
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.stat-unit {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
</style>

