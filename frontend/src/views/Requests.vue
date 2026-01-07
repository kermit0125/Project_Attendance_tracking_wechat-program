<template>
  <div class="requests-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>我的申请</h3>
          <el-button type="primary" @click="$router.push('/requests/create')">
            <el-icon><Plus /></el-icon>
            创建申请
          </el-button>
        </div>
      </template>

      <el-table :data="requestList" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="requestType" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRequestTypeTag(row.requestType)">
              {{ getRequestTypeName(row.requestType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startAt" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="endAt" label="结束时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.endAt) }}
          </template>
        </el-table-column>
        <el-table-column label="时长" width="150">
          <template #default="{ row }">
            <div v-if="row.status === 'APPROVED' && row.approvedDurationMinutes !== null && row.approvedDurationMinutes !== undefined">
              <div>
                <span :style="{ color: row.approvedDurationMinutes !== row.durationMinutes ? '#f56c6c' : 'inherit', fontWeight: row.approvedDurationMinutes !== row.durationMinutes ? 'bold' : 'normal' }">
                  {{ formatDuration(row.approvedDurationMinutes) }}
                </span>
                <el-tag v-if="row.approvedDurationMinutes !== row.durationMinutes" type="danger" size="small" style="margin-left: 4px;">
                  已修改
                </el-tag>
              </div>
              <div v-if="row.approvedDurationMinutes !== row.durationMinutes" style="font-size: 12px; color: #909399; margin-top: 2px;">
                原申请: {{ formatDuration(row.durationMinutes) }}
              </div>
            </div>
            <div v-else>
              {{ formatDuration(row.durationMinutes) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="viewDetail(row.id)"
            >
              查看
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              link
              type="danger"
              @click="handleCancel(row.id)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadRequests"
        @current-change="loadRequests"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 申请详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="申请详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="currentDetail" v-loading="detailLoading">
        <el-descriptions-item label="申请ID">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="getRequestTypeTag(currentDetail.requestType)">
            {{ getRequestTypeName(currentDetail.requestType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">
          {{ currentDetail.title || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentDetail.requester?.fullName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentDetail.status)">
            {{ getStatusName(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间" :span="2">
          {{ formatDateTime(currentDetail.startAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间" :span="2">
          {{ formatDateTime(currentDetail.endAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时长" :span="2">
          {{ currentDetail.durationMinutes ? `${Math.floor(currentDetail.durationMinutes / 60)}小时${currentDetail.durationMinutes % 60}分钟` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批后实际时长" :span="2" v-if="currentDetail.status === 'APPROVED'">
          <span v-if="currentDetail.approvedDurationMinutes !== null && currentDetail.approvedDurationMinutes !== undefined">
            <span :style="{ color: currentDetail.approvedDurationMinutes !== currentDetail.durationMinutes ? '#f56c6c' : 'inherit', fontWeight: currentDetail.approvedDurationMinutes !== currentDetail.durationMinutes ? 'bold' : 'normal' }">
              {{ Math.floor(currentDetail.approvedDurationMinutes / 60) }}小时{{ currentDetail.approvedDurationMinutes % 60 }}分钟
            </span>
            <el-tag v-if="currentDetail.approvedDurationMinutes !== currentDetail.durationMinutes" type="danger" size="small" style="margin-left: 8px;">
              已修改
            </el-tag>
          </span>
          <span v-else>
            {{ currentDetail.durationMinutes ? `${Math.floor(currentDetail.durationMinutes / 60)}小时${currentDetail.durationMinutes % 60}分钟` : '-' }}
            <el-text type="info" size="small" style="margin-left: 8px;">（未修改）</el-text>
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="原因" :span="2">
          {{ currentDetail.reason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.leaveCategory" label="请假类型" :span="2">
          {{ currentDetail.leaveCategory }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.destination" label="出差地点" :span="2">
          {{ currentDetail.destination }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.fixPunchDate" label="补卡日期" :span="2">
          {{ formatDateTime(currentDetail.fixPunchDate) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.fixPunchType" label="补卡类型" :span="2">
          {{ currentDetail.fixPunchType === 'IN' ? '上班' : '下班' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批流程" :span="2" v-if="currentDetail.approvals && currentDetail.approvals.length > 0">
          <div v-for="approval in currentDetail.approvals" :key="approval.id" style="margin-bottom: 8px;">
            <el-tag :type="getApprovalDecisionTag(approval.decision)" style="margin-right: 8px;">
              第{{ approval.stepNo }}步: {{ approval.approver?.fullName || '-' }} - {{ getApprovalDecisionName(approval.decision) }}
            </el-tag>
            <span v-if="approval.comment" style="color: #909399; font-size: 12px;">{{ approval.comment }}</span>
            <span v-if="approval.decidedAt" style="color: #909399; font-size: 12px; margin-left: 8px;">
              {{ formatDateTime(approval.decidedAt) }}
            </span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const loading = ref(false)
const requestList = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const detailVisible = ref(false)
const detailLoading = ref(false)
const currentDetail = ref<any>(null)

const getRequestTypeName = (type: string) => {
  const map: Record<string, string> = {
    LEAVE: '请假',
    TRIP: '出差',
    FIX_PUNCH: '补卡',
    OVERTIME: '加班',
  }
  return map[type] || type
}

const getRequestTypeTag = (type: string) => {
  const map: Record<string, string> = {
    LEAVE: 'primary',
    TRIP: 'success',
    FIX_PUNCH: 'warning',
    OVERTIME: 'info',
  }
  return map[type] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    CANCELLED: '已取消',
  }
  return map[status] || status
}

const getStatusTag = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'info',
  }
  return map[status] || ''
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const formatDuration = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}小时${mins}分钟`
  } else if (hours > 0) {
    return `${hours}小时`
  } else {
    return `${mins}分钟`
  }
}

const loadRequests = async () => {
  loading.value = true
  try {
    const response = await request.get(API_ENDPOINTS.REQUESTS, {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
      },
    })
    // 响应拦截器已经提取了 data.data，所以 response 就是数据本身
    // 后端返回格式：{ list, total, page, pageSize }
    requestList.value = response.list || []
    total.value = response.total || 0
  } catch (error) {
    console.error('加载申请列表失败:', error)
  } finally {
    loading.value = false
  }
}

const getApprovalDecisionName = (decision: string) => {
  const map: Record<string, string> = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    TRANSFERRED: '已转交',
  }
  return map[decision] || decision
}

const getApprovalDecisionTag = (decision: string) => {
  const map: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    TRANSFERRED: 'info',
  }
  return map[decision] || ''
}

const viewDetail = async (id: number) => {
  try {
    detailLoading.value = true
    detailVisible.value = true
    const response = await request.get(API_ENDPOINTS.REQUEST_DETAIL(id))
    // 响应拦截器已经提取了 data.data，所以 response 就是数据本身
    currentDetail.value = response
  } catch (error: any) {
    console.error('加载申请详情失败:', error)
    ElMessage.error(error.response?.data?.message || '加载申请详情失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

const handleCancel = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要取消这个申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await request.post(API_ENDPOINTS.REQUEST_CANCEL(id))
    ElMessage.success('取消成功')
    loadRequests()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '取消失败')
    }
  }
}

onMounted(() => {
  loadRequests()
})
</script>

<style scoped>
.requests-page {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}
</style>

