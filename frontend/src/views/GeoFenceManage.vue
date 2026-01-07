<template>
  <div class="geofence-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>打卡地点管理</h3>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            添加打卡地点
          </el-button>
        </div>
      </template>

      <el-table :data="fenceList" v-loading="loading" border>
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="lat" label="纬度" width="120" />
        <el-table-column prop="lng" label="经度" width="120" />
        <el-table-column prop="radiusM" label="允许范围（米）" width="140" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              link
              :type="row.isActive ? 'warning' : 'success'"
              @click="handleToggleActive(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入围栏名称" />
        </el-form-item>
        <el-form-item label="纬度" prop="lat">
          <el-input-number
            v-model="form.lat"
            :precision="7"
            :step="0.0000001"
            :min="-90"
            :max="90"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="经度" prop="lng">
          <el-input-number
            v-model="form.lng"
            :precision="7"
            :step="0.0000001"
            :min="-180"
            :max="180"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="允许范围（米）" prop="radiusM">
          <el-input-number
            v-model="form.radiusM"
            :min="10"
            :max="10000"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item v-if="editingId" label="状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ editingId ? '更新' : '创建' }}
          </el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const fenceList = ref<any[]>([])

const form = reactive({
  name: '',
  lat: 0,
  lng: 0,
  radiusM: 100,
  description: '',
  isActive: true,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  lat: [
    { required: true, message: '请输入纬度', trigger: 'blur' },
    { type: 'number', min: -90, max: 90, message: '纬度必须在 -90 到 90 之间', trigger: 'blur' },
  ],
  lng: [
    { required: true, message: '请输入经度', trigger: 'blur' },
    { type: 'number', min: -180, max: 180, message: '经度必须在 -180 到 180 之间', trigger: 'blur' },
  ],
  radiusM: [
    { required: true, message: '请输入允许范围', trigger: 'blur' },
    { type: 'number', min: 10, max: 10000, message: '范围必须在 10 到 10000 米之间', trigger: 'blur' },
  ],
}

const dialogTitle = computed(() => {
  return editingId.value ? '编辑打卡地点' : '添加打卡地点'
})

const loadFences = async () => {
  loading.value = true
  try {
    const response = await request.get(API_ENDPOINTS.GEO_FENCES)
    // 响应拦截器已经提取了 data.data，所以 response 就是数据本身
    fenceList.value = response.items || []
  } catch (error) {
    console.error('加载围栏列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  editingId.value = row.id
  form.name = row.name
  form.lat = row.lat
  form.lng = row.lng
  form.radiusM = row.radiusM
  form.description = row.description || ''
  form.isActive = row.isActive
  dialogVisible.value = true
}

const handleToggleActive = async (row: any) => {
  try {
    await request.put(API_ENDPOINTS.GEO_FENCE_DETAIL(row.id), {
      isActive: !row.isActive,
    })
    ElMessage.success('操作成功')
    loadFences()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个打卡地点吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await request.delete(API_ENDPOINTS.GEO_FENCE_DETAIL(id))
    ElMessage.success('删除成功')
    loadFences()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (editingId.value) {
          await request.put(API_ENDPOINTS.GEO_FENCE_DETAIL(editingId.value), form)
          ElMessage.success('更新成功')
        } else {
          await request.post(API_ENDPOINTS.GEO_FENCES, form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadFences()
      } catch (error) {
        console.error('操作失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  resetForm()
  editingId.value = null
}

const resetForm = () => {
  form.name = ''
  form.lat = 0
  form.lng = 0
  form.radiusM = 100
  form.description = ''
  form.isActive = true
  formRef.value?.resetFields()
}

onMounted(() => {
  loadFences()
})
</script>


<style scoped>
.geofence-manage {
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

