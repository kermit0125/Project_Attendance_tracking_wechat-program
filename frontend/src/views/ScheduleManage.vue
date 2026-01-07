<template>
  <div class="schedule-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>班次管理</h3>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建班次
          </el-button>
        </div>
      </template>

      <el-table :data="scheduleList" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="班次名称" width="150" />
        <el-table-column label="上班时间" width="120">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.startTime }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下班时间" width="120">
          <template #default="{ row }">
            <el-tag type="success">{{ row.endTime }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="休息时间" width="150">
          <template #default="{ row }">
            <span v-if="row.breakStart && row.breakEnd">
              {{ row.breakStart }} - {{ row.breakEnd }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="迟到宽限" width="100">
          <template #default="{ row }">
            {{ row.lateGraceMinutes }}分钟
          </template>
        </el-table-column>
        <el-table-column label="早退宽限" width="100">
          <template #default="{ row }">
            {{ row.earlyLeaveGraceMinutes }}分钟
          </template>
        </el-table-column>
        <el-table-column label="最低工时" width="100">
          <template #default="{ row }">
            <span v-if="row.minWorkMinutes">{{ row.minWorkMinutes }}分钟</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="跨天" width="80">
          <template #default="{ row }">
            <el-tag :type="row.crossDay ? 'warning' : 'info'" size="small">
              {{ row.crossDay ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑班次对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="班次名称" prop="name">
          <el-input v-model="formData.name" placeholder="如：标准班、早班、晚班" />
        </el-form-item>
        <el-form-item label="上班时间" prop="startTime">
          <el-time-picker
            v-model="formData.startTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择上班时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="下班时间" prop="endTime">
          <el-time-picker
            v-model="formData.endTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择下班时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="休息开始时间">
          <el-time-picker
            v-model="formData.breakStart"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择休息开始时间（可选）"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="休息结束时间">
          <el-time-picker
            v-model="formData.breakEnd"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择休息结束时间（可选）"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="迟到宽限" prop="lateGraceMinutes">
          <el-input-number
            v-model="formData.lateGraceMinutes"
            :min="0"
            :max="60"
            style="width: 100%"
          />
          <div class="form-tip">超过上班时间多少分钟算迟到</div>
        </el-form-item>
        <el-form-item label="早退宽限" prop="earlyLeaveGraceMinutes">
          <el-input-number
            v-model="formData.earlyLeaveGraceMinutes"
            :min="0"
            :max="60"
            style="width: 100%"
          />
          <div class="form-tip">提前下班时间多少分钟算早退</div>
        </el-form-item>
        <el-form-item label="最低工时">
          <el-input-number
            v-model="formData.minWorkMinutes"
            :min="0"
            :max="1440"
            placeholder="可选"
            style="width: 100%"
          />
          <div class="form-tip">每天最低工作时长（分钟），留空不限制</div>
        </el-form-item>
        <el-form-item label="跨天班次">
          <el-switch v-model="formData.crossDay" />
          <div class="form-tip">下班时间是否在第二天（如夜班）</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const loading = ref(false)
const submitting = ref(false)
const scheduleList = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑班次' : '创建班次')
const isEdit = ref(false)
const editingId = ref<number | null>(null)

const formRef = ref<FormInstance>()
const formData = ref({
  name: '',
  startTime: '',
  endTime: '',
  breakStart: '',
  breakEnd: '',
  lateGraceMinutes: 5,
  earlyLeaveGraceMinutes: 5,
  minWorkMinutes: null as number | null,
  crossDay: false,
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入班次名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择上班时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择下班时间', trigger: 'change' }],
  lateGraceMinutes: [{ required: true, message: '请输入迟到宽限时间', trigger: 'blur' }],
  earlyLeaveGraceMinutes: [{ required: true, message: '请输入早退宽限时间', trigger: 'blur' }],
}

const loadSchedules = async () => {
  loading.value = true
  try {
    const response = await request.get<any[]>(API_ENDPOINTS.SCHEDULES)
    scheduleList.value = response || []
  } catch (error) {
    console.error('加载班次列表失败:', error)
    ElMessage.error('加载班次列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  isEdit.value = false
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editingId.value = row.id
  formData.value = {
    name: row.name,
    startTime: row.startTime,
    endTime: row.endTime,
    breakStart: row.breakStart || '',
    breakEnd: row.breakEnd || '',
    lateGraceMinutes: row.lateGraceMinutes,
    earlyLeaveGraceMinutes: row.earlyLeaveGraceMinutes,
    minWorkMinutes: row.minWorkMinutes,
    crossDay: row.crossDay,
  }
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除班次 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await request.delete(API_ENDPOINTS.SCHEDULE_DETAIL(row.id))
    ElMessage.success('删除成功')
    loadSchedules()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const data: any = {
      name: formData.value.name,
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      lateGraceMinutes: formData.value.lateGraceMinutes,
      earlyLeaveGraceMinutes: formData.value.earlyLeaveGraceMinutes,
      crossDay: formData.value.crossDay,
    }

    if (formData.value.breakStart) {
      data.breakStart = formData.value.breakStart
    }
    if (formData.value.breakEnd) {
      data.breakEnd = formData.value.breakEnd
    }
    if (formData.value.minWorkMinutes !== null) {
      data.minWorkMinutes = formData.value.minWorkMinutes
    }

    if (isEdit.value && editingId.value) {
      await request.put(API_ENDPOINTS.SCHEDULE_DETAIL(editingId.value), data)
      ElMessage.success('更新成功')
    } else {
      await request.post(API_ENDPOINTS.SCHEDULES, data)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadSchedules()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    startTime: '',
    endTime: '',
    breakStart: '',
    breakEnd: '',
    lateGraceMinutes: 5,
    earlyLeaveGraceMinutes: 5,
    minWorkMinutes: null,
    crossDay: false,
  }
  formRef.value?.clearValidate()
}

onMounted(() => {
  loadSchedules()
})
</script>

<style scoped>
.schedule-manage-page {
  max-width: 1400px;
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>

