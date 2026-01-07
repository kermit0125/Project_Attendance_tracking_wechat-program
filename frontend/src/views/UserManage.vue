<template>
  <div class="user-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>用户管理</h3>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户（姓名/邮箱/工号/手机号）"
              style="width: 300px; margin-right: 10px"
              clearable
              @clear="loadUsers"
              @keyup.enter="loadUsers"
            >
              <template #append>
                <el-button :icon="Search" @click="loadUsers" />
              </template>
            </el-input>
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              创建用户
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="userList" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="fullName" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="department.name" label="部门" width="150">
          <template #default="{ row }">
            {{ row.department?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="角色" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.code"
              size="small"
              style="margin-right: 5px"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadUsers"
        @current-change="loadUsers"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 创建/编辑用户对话框 -->
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
        label-width="100px"
      >
        <el-form-item label="姓名" prop="fullName">
          <el-input v-model="formData.fullName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
          <el-input
            v-model="formData.password"
            type="password"
            :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'"
            show-password
          />
        </el-form-item>
        <el-form-item label="工号" prop="employeeNo">
          <el-input v-model="formData.employeeNo" placeholder="请输入工号（可选）" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号（可选）" />
        </el-form-item>
        <el-form-item label="部门" prop="departmentId">
          <el-select
            v-model="formData.departmentId"
            placeholder="请选择部门"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select
            v-model="formData.roles"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roles"
              :key="role.code"
              :label="role.name"
              :value="role.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="ACTIVE">激活</el-radio>
            <el-radio value="INACTIVE">停用</el-radio>
            <el-radio v-if="isEdit" value="LEFT">离职</el-radio>
          </el-radio-group>
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
import { Search, Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const loading = ref(false)
const submitting = ref(false)
const userList = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')

const dialogVisible = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '创建用户')
const isEdit = ref(false)
const editingUserId = ref<number | null>(null)

const formRef = ref<FormInstance>()
const formData = ref({
  fullName: '',
  email: '',
  password: '',
  employeeNo: '',
  phone: '',
  departmentId: null as number | null,
  roles: [] as string[],
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'LEFT',
})

const formRules: FormRules = {
  fullName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const departments = ref<any[]>([])
const roles = ref<any[]>([])

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    ACTIVE: 'success',
    INACTIVE: 'warning',
    LEFT: 'info',
  }
  return map[status] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: '激活',
    INACTIVE: '停用',
    LEFT: '离职',
  }
  return map[status] || status
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await request.get<any>(API_ENDPOINTS.USERS, {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value || undefined,
      },
    })
    userList.value = response.list || []
    total.value = response.total || 0
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const loadDepartments = async () => {
  try {
    const response = await request.get<any[]>(API_ENDPOINTS.DEPARTMENTS)
    departments.value = response || []
  } catch (error) {
    console.error('加载部门列表失败:', error)
  }
}

const loadRoles = async () => {
  try {
    const response = await request.get<any[]>(API_ENDPOINTS.ROLES)
    roles.value = response || []
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

const handleCreate = () => {
  isEdit.value = false
  editingUserId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editingUserId.value = row.id
  formData.value = {
    fullName: row.fullName,
    email: row.email,
    password: '',
    employeeNo: row.employeeNo || '',
    phone: row.phone || '',
    departmentId: row.department?.id || null,
    roles: row.roles.map((r: any) => r.code),
    status: row.status,
  }
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.fullName}" 吗？删除后用户状态将变为离职。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await request.delete(API_ENDPOINTS.USER_DELETE(row.id))
    ElMessage.success('删除成功')
    loadUsers()
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
      fullName: formData.value.fullName,
      email: formData.value.email,
      employeeNo: formData.value.employeeNo || undefined,
      phone: formData.value.phone || undefined,
      departmentId: formData.value.departmentId || undefined,
      roles: formData.value.roles,
      status: formData.value.status,
    }

    if (formData.value.password) {
      data.password = formData.value.password
    }

    if (isEdit.value && editingUserId.value) {
      await request.put(API_ENDPOINTS.USER_DETAIL(editingUserId.value), data)
      ElMessage.success('更新成功')
    } else {
      if (!data.password) {
        ElMessage.error('请输入密码')
        return
      }
      await request.post(API_ENDPOINTS.USERS, data)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadUsers()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    fullName: '',
    email: '',
    password: '',
    employeeNo: '',
    phone: '',
    departmentId: null,
    roles: [],
    status: 'ACTIVE',
  }
  formRef.value?.clearValidate()
}

onMounted(() => {
  loadUsers()
  loadDepartments()
  loadRoles()
})
</script>

<style scoped>
.user-manage-page {
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

.header-actions {
  display: flex;
  align-items: center;
}
</style>

