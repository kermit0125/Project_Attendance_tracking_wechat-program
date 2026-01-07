<template>
  <div class="punch-history">
    <el-card>
      <template #header>
        <h3>打卡记录</h3>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadHistory">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="punchList" v-loading="loading" border>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="上班" width="180">
          <template #default="{ row }">
            <div v-if="row.punchIn">
              <div>{{ formatTime(row.punchIn.punchAt) }}</div>
              <div class="location-text">{{ row.punchIn.location || '-' }}</div>
            </div>
            <span v-else class="no-punch">未打卡</span>
          </template>
        </el-table-column>
        <el-table-column label="下班" width="180">
          <template #default="{ row }">
            <div v-if="row.punchOut">
              <div>{{ formatTime(row.punchOut.punchAt) }}</div>
              <div class="location-text">{{ row.punchOut.location || '-' }}</div>
            </div>
            <span v-else class="no-punch">未打卡</span>
          </template>
        </el-table-column>
        <el-table-column label="工作时长" width="120">
          <template #default="{ row }">
            {{ calculateWorkHours(row) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.punchIn && row.punchOut" type="success">正常</el-tag>
            <el-tag v-else-if="row.punchIn" type="warning">缺下班</el-tag>
            <el-tag v-else type="danger">缺上班</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadHistory"
        @current-change="loadHistory"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const loading = ref(false)
const dateRange = ref<[string, string] | null>(null)
const punchList = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const calculateWorkHours = (row: any) => {
  if (!row.punchIn || !row.punchOut) return '-'
  const inTime = new Date(row.punchIn.punchAt).getTime()
  const outTime = new Date(row.punchOut.punchAt).getTime()
  const hours = (outTime - inTime) / (1000 * 60 * 60)
  return `${hours.toFixed(1)} 小时`
}

const handleDateChange = () => {
  currentPage.value = 1
  loadHistory()
}

const loadHistory = async () => {
  if (!dateRange.value) {
    // 默认查询最近一个月
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    dateRange.value = [
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
    ]
  }

  loading.value = true
  try {
    const response = await request.get(API_ENDPOINTS.PUNCH_HISTORY, {
      params: {
        from: dateRange.value[0],
        to: dateRange.value[1],
        page: currentPage.value,
        pageSize: pageSize.value,
      },
    })
    // 响应拦截器已经提取了 data.data，所以 response 就是数据本身
    // 后端返回格式：{ list, total, page, pageSize }
    punchList.value = response.list || []
    total.value = response.total || 0
  } catch (error) {
    console.error('加载打卡记录失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.punch-history {
  max-width: 1200px;
  margin: 0 auto;
}

.search-form {
  margin-bottom: 20px;
}

.location-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.no-punch {
  color: #c0c4cc;
}
</style>

