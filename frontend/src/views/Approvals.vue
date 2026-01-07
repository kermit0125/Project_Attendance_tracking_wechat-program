<template>
  <div class="approvals-page">
    <el-card>
      <template #header>
        <h3>待审批</h3>
      </template>

      <el-table :data="approvalList" v-loading="loading" border>
        <el-table-column prop="id" label="申请ID" width="100" />
        <el-table-column prop="requestType" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRequestTypeTag(row.requestType)">
              {{ getRequestTypeName(row.requestType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requester.fullName" label="申请人" width="120" />
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
        <el-table-column prop="reason" label="原因" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row.id)">
              查看详情
            </el-button>
            <el-button link type="success" @click="handleApprove(row.id)">
              通过
            </el-button>
            <el-button link type="danger" @click="handleReject(row.id)">
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 审批通过对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="审批通过"
      width="500px"
    >
      <el-form :model="{ approvedDurationHours, approvalComment }" label-width="140px">
        <el-form-item label="申请时长" v-if="currentDetail">
          <span>{{ formatDuration(currentDetail.startAt, currentDetail.endAt) }}</span>
        </el-form-item>
        <el-form-item label="批准时长（小时）">
          <el-input-number
            v-model="approvedDurationHours"
            :min="0"
            :precision="1"
            :step="0.5"
            placeholder="留空则使用申请时长"
            style="width: 100%"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            留空则使用申请时的时长，填写则覆盖申请时长（例如：1.5 表示 1小时30分钟）
          </div>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input
            v-model="approvalComment"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApprove">确定</el-button>
      </template>
    </el-dialog>

    <!-- 驳回对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="驳回申请"
      width="500px"
    >
      <el-form :model="{ rejectComment }" label-width="100px">
        <el-form-item label="驳回原因" required>
          <el-input
            v-model="rejectComment"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确定驳回</el-button>
      </template>
    </el-dialog>

    <!-- 审批详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="申请详情"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="currentDetail">
        <el-descriptions-item label="申请ID">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="getRequestTypeTag(currentDetail.requestType)">
            {{ getRequestTypeName(currentDetail.requestType) }}
          </el-tag>
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
        <el-descriptions-item label="原因" :span="2">
          {{ currentDetail.reason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDateTime(currentDetail.createdAt) }}
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
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const loading = ref(false)
const approvalList = ref<any[]>([])
const detailVisible = ref(false)
const currentDetail = ref<any>(null)
const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentApproveId = ref<number | null>(null)
const approvedDurationHours = ref<number | null>(null)
const approvalComment = ref('')
const rejectComment = ref('')

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

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const formatDuration = (startAt: string, endAt: string) => {
  const start = new Date(startAt).getTime()
  const end = new Date(endAt).getTime()
  const hours = (end - start) / (1000 * 60 * 60)
  const minutes = Math.round(hours * 60)
  return `${hours.toFixed(1)} 小时（${minutes} 分钟）`
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

const loadApprovals = async () => {
  loading.value = true
  try {
    const response = await request.get(API_ENDPOINTS.APPROVALS)
    // 响应拦截器已经提取了 data.data，所以 response 就是数据本身
    // 后端返回格式：{ list, total }
    approvalList.value = response.list || []
  } catch (error) {
    console.error('加载待审批列表失败:', error)
  } finally {
    loading.value = false
  }
}

const viewDetail = async (id: number) => {
  try {
    loading.value = true
    const response = await request.get(API_ENDPOINTS.APPROVAL_DETAIL(id))
    // 响应拦截器已经提取了 data.data，所以 response 就是数据本身
    currentDetail.value = response
    detailVisible.value = true
  } catch (error) {
    console.error('加载申请详情失败:', error)
    ElMessage.error('加载申请详情失败')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id: number) => {
  // 查找申请详情
  const requestDetail = approvalList.value.find((r: any) => r.id === id)
  if (!requestDetail) {
    ElMessage.error('未找到申请信息')
    return
  }

  // 加载完整详情
  try {
    const response = await request.get(API_ENDPOINTS.APPROVAL_DETAIL(id))
    currentDetail.value = response
  } catch (error) {
    ElMessage.error('加载申请详情失败')
    return
  }

  // 重置表单，如果有申请时长，转换为小时显示
  if (currentDetail.value?.durationMinutes) {
    approvedDurationHours.value = Math.round((currentDetail.value.durationMinutes / 60) * 10) / 10
  } else {
    approvedDurationHours.value = null
  }
  approvalComment.value = ''
  currentApproveId.value = id
  approveDialogVisible.value = true
}

const confirmApprove = async () => {
  if (!currentApproveId.value) return

  try {
    // 将小时转换为分钟
    const approvedDurationMinutes = approvedDurationHours.value !== null 
      ? Math.round(approvedDurationHours.value * 60) 
      : undefined

    await request.post(API_ENDPOINTS.APPROVAL_DECISION(currentApproveId.value), {
      decision: 'APPROVED',
      comment: approvalComment.value || undefined,
      approvedDurationMinutes,
    })
    ElMessage.success('审批通过')
    approveDialogVisible.value = false
    loadApprovals()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

const handleReject = (id: number) => {
  rejectComment.value = ''
  currentApproveId.value = id
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!currentApproveId.value) return

  if (!rejectComment.value || rejectComment.value.trim().length === 0) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  try {
    await request.post(API_ENDPOINTS.APPROVAL_DECISION(currentApproveId.value), {
      decision: 'REJECTED',
      comment: rejectComment.value,
    })
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    loadApprovals()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

onMounted(() => {
  loadApprovals()
})
</script>

<style scoped>
.approvals-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

