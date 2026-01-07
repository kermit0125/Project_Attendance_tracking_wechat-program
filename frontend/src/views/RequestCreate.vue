<template>
  <div class="request-create">
    <el-card>
      <template #header>
        <h3>创建申请</h3>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 600px;"
      >
        <el-form-item label="申请类型" prop="requestType">
          <el-select v-model="form.requestType" placeholder="请选择申请类型" @change="handleTypeChange">
            <el-option label="请假" value="LEAVE" />
            <el-option label="出差" value="TRIP" />
            <el-option label="补卡" value="FIX_PUNCH" />
            <el-option label="加班" value="OVERTIME" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间" prop="startAt">
          <el-date-picker
            v-model="form.startAt"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endAt">
          <el-date-picker
            v-model="form.endAt"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          />
        </el-form-item>

        <el-form-item
          v-if="form.requestType === 'LEAVE'"
          label="请假类型"
          prop="leaveCategory"
        >
          <el-input v-model="form.leaveCategory" placeholder="如：年假、病假、事假等" />
        </el-form-item>

        <el-form-item
          v-if="form.requestType === 'TRIP'"
          label="目的地"
          prop="destination"
        >
          <el-input v-model="form.destination" placeholder="请输入目的地" />
        </el-form-item>

        <el-form-item label="原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入申请原因"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            提交申请
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  requestType: '',
  startAt: '',
  endAt: '',
  leaveCategory: '',
  destination: '',
  reason: '',
})

const rules: FormRules = {
  requestType: [{ required: true, message: '请选择申请类型', trigger: 'change' }],
  startAt: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endAt: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  reason: [{ required: true, message: '请输入申请原因', trigger: 'blur' }],
}

const handleTypeChange = () => {
  // 重置相关字段
  form.leaveCategory = ''
  form.destination = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const payload: any = {
          requestType: form.requestType,
          reason: form.reason,
        }

        // 格式化日期时间为 ISO 8601 格式
        if (form.startAt) {
          const startDate = new Date(form.startAt)
          payload.startAt = startDate.toISOString()
        }

        if (form.endAt) {
          const endDate = new Date(form.endAt)
          payload.endAt = endDate.toISOString()
        }

        if (form.requestType === 'LEAVE') {
          payload.leaveCategory = form.leaveCategory
        }

        if (form.requestType === 'TRIP') {
          payload.destination = form.destination
        }

        await request.post(API_ENDPOINTS.REQUESTS, payload)
        ElMessage.success('申请提交成功')
        router.push('/requests')
      } catch (error: any) {
        // 错误消息已经在拦截器中显示
        console.error('提交申请失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.request-create {
  max-width: 800px;
  margin: 0 auto;
}
</style>

