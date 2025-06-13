<template>
  <el-dialog
    v-model="visible"
    title="快速创建账户"
    width="500px"
    :before-close="handleClose"
    @opened="focusName"
  >
    <el-form
      ref="accountForm"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent="submitAccount"
    >
      <el-form-item label="账户名称" prop="name">
        <el-input
          ref="nameInput"
          v-model="form.name"
          placeholder="请输入账户名称"
          maxlength="50"
          show-word-limit
        ></el-input>
      </el-form-item>

      <el-form-item label="账户类型" prop="type">
        <el-select v-model="form.type" placeholder="选择账户类型" style="width: 100%">
          <el-option
            v-for="type in accountTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          >
            <div style="display: flex; justify-content: space-between;">
              <span>{{ type.label }}</span>
              <span style="color: #8492a6; font-size: 13px;">{{ type.description }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="账户编码" prop="code">
        <el-input
          v-model="form.code"
          placeholder="自动生成或手动输入"
          maxlength="20"
        >
          <template #append>
            <el-button @click="generateCode" :disabled="!form.type">
              <el-icon><Refresh /></el-icon>
              生成
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="初始余额" prop="initialBalance">
        <el-input
          v-model="form.initialBalance"
          placeholder="请输入初始余额"
          type="number"
          step="0.01"
        >
          <template #prepend>¥</template>
        </el-input>
        <div class="form-tip">
          <el-text size="small" type="info">
            资产账户余额为正数，负债账户余额为负数
          </el-text>
        </div>
      </el-form-item>

      <el-form-item label="账户描述">
        <el-input
          v-model="form.description"
          placeholder="请输入账户描述（可选）"
          type="textarea"
          :rows="2"
          maxlength="200"
          show-word-limit
        ></el-input>
      </el-form-item>

      <el-form-item label="父级账户">
        <el-select
          v-model="form.parentId"
          placeholder="选择父级账户（可选）"
          style="width: 100%"
          clearable
          filterable
        >
          <el-option
            v-for="account in filteredParentAccounts"
            :key="account.id"
            :label="`${account.name} (${account.code})`"
            :value="account.id"
          ></el-option>
        </el-select>
        <div class="form-tip">
          <el-text size="small" type="info">
            选择父级账户可以建立账户层级关系
          </el-text>
        </div>
      </el-form-item>

      <!-- 账户模板 -->
      <el-form-item label="账户模板">
        <el-select
          v-model="selectedTemplate"
          placeholder="选择预设模板"
          style="width: 100%"
          clearable
          @change="applyTemplate"
        >
          <el-option
            v-for="template in accountTemplates"
            :key="template.id"
            :label="template.name"
            :value="template.id"
          >
            <div style="display: flex; justify-content: space-between;">
              <span>{{ template.name }}</span>
              <span style="color: #8492a6; font-size: 13px;">{{ template.type_label }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitAccount" :loading="submitting">
          <el-icon><Check /></el-icon>
          创建账户
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Check, Refresh } from '@element-plus/icons-vue'
import api from '@/services/api'

export default {
  name: 'QuickAccountDialog',
  components: {
    Check,
    Refresh
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    accounts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'account-created'],
  data() {
    return {
      submitting: false,
      selectedTemplate: null,
      form: {
        name: '',
        type: '',
        code: '',
        initialBalance: '0',
        description: '',
        parentId: null
      },
      rules: {
        name: [
          { required: true, message: '请输入账户名称', trigger: 'blur' },
          { min: 2, max: 50, message: '账户名称长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择账户类型', trigger: 'change' }
        ],
        code: [
          { required: true, message: '请输入账户编码', trigger: 'blur' },
          { min: 3, max: 20, message: '账户编码长度在 3 到 20 个字符', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (!/^[A-Za-z0-9]+$/.test(value)) {
                callback(new Error('账户编码只能包含字母和数字'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        initialBalance: [
          { 
            validator: (rule, value, callback) => {
              if (isNaN(value)) {
                callback(new Error('请输入有效的数字'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ]
      },
      accountTypes: [
        { value: 'asset', label: '资产', description: '现金、银行存款、投资等' },
        { value: 'liability', label: '负债', description: '借款、信用卡、应付款等' },
        { value: 'income', label: '收入', description: '工资、奖金、投资收益等' },
        { value: 'expense', label: '费用', description: '生活费用、娱乐支出等' },
        { value: 'equity', label: '权益', description: '所有者权益、资本公积等' }
      ],
      accountTemplates: [
        {
          id: 1,
          name: '现金',
          type: 'asset',
          type_label: '资产',
          code_prefix: 'CASH',
          description: '现金账户'
        },
        {
          id: 2,
          name: '银行存款',
          type: 'asset',
          type_label: '资产',
          code_prefix: 'BANK',
          description: '银行账户'
        },
        {
          id: 3,
          name: '支付宝',
          type: 'asset',
          type_label: '资产',
          code_prefix: 'ALIPAY',
          description: '支付宝账户'
        },
        {
          id: 4,
          name: '微信钱包',
          type: 'asset',
          type_label: '资产',
          code_prefix: 'WECHAT',
          description: '微信支付账户'
        },
        {
          id: 5,
          name: '信用卡',
          type: 'liability',
          type_label: '负债',
          code_prefix: 'CREDIT',
          description: '信用卡账户'
        },
        {
          id: 6,
          name: '工资收入',
          type: 'income',
          type_label: '收入',
          code_prefix: 'SALARY',
          description: '工资收入科目'
        },
        {
          id: 7,
          name: '餐饮费用',
          type: 'expense',
          type_label: '费用',
          code_prefix: 'DINING',
          description: '餐饮支出科目'
        },
        {
          id: 8,
          name: '交通费用',
          type: 'expense',
          type_label: '费用',
          code_prefix: 'TRANSPORT',
          description: '交通支出科目'
        }
      ]
    }
  },
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    filteredParentAccounts() {
      return this.accounts.filter(account => 
        account.type === this.form.type && account.id !== this.form.id
      )
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetForm()
      }
    },
    'form.type'() {
      // 当账户类型改变时，清空父级账户选择
      this.form.parentId = null
      // 如果有选择的类型，自动生成编码
      if (this.form.type && !this.form.code) {
        this.generateCode()
      }
    },
    'form.name'() {
      // 当账户名称改变时，如果编码为空，自动生成
      if (this.form.name && this.form.type && !this.form.code) {
        this.generateCode()
      }
    }
  },
  methods: {
    resetForm() {
      this.form = {
        name: '',
        type: '',
        code: '',
        initialBalance: '0',
        description: '',
        parentId: null
      }
      this.selectedTemplate = null
      this.$nextTick(() => {
        this.$refs.accountForm?.clearValidate()
      })
    },

    generateCode() {
      if (!this.form.type) {
        ElMessage.warning('请先选择账户类型')
        return
      }

      const typePrefix = {
        'asset': 'AST',
        'liability': 'LIA',
        'income': 'INC',
        'expense': 'EXP',
        'equity': 'EQU'
      }

      const prefix = typePrefix[this.form.type]
      const timestamp = Date.now().toString().slice(-6)
      
      this.form.code = `${prefix}${timestamp}`
    },

    applyTemplate(templateId) {
      if (!templateId) return
      
      const template = this.accountTemplates.find(t => t.id === templateId)
      if (template) {
        this.form.name = template.name
        this.form.type = template.type
        this.form.description = template.description
        
        // 生成基于模板的编码
        const timestamp = Date.now().toString().slice(-6)
        this.form.code = `${template.code_prefix}${timestamp}`
      }
    },

    async submitAccount() {
      try {
        const valid = await this.$refs.accountForm.validate()
        if (!valid) return

        // 检查账户编码是否已存在
        const existingAccount = this.accounts.find(account => 
          account.code === this.form.code
        )
        if (existingAccount) {
          ElMessage.error('账户编码已存在，请修改后重试')
          return
        }

        this.submitting = true

        const accountData = {
          name: this.form.name,
          type: this.form.type,
          code: this.form.code,
          balance: parseFloat(this.form.initialBalance),
          description: this.form.description || null,
          parent_id: this.form.parentId || null
        }

        await api.createAccount(accountData)
        
        ElMessage.success('账户创建成功')
        this.$emit('account-created')
        this.handleClose()
      } catch (error) {
        console.error('创建账户失败:', error)
        if (error.response?.data?.detail) {
          ElMessage.error(error.response.data.detail)
        } else {
          ElMessage.error('创建账户失败，请稍后重试')
        }
      } finally {
        this.submitting = false
      }
    },

    handleClose() {
      this.visible = false
    },

    focusName() {
      this.$nextTick(() => {
        this.$refs.nameInput?.focus()
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.form-tip {
  margin-top: 5px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
