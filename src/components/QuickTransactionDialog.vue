<template>
  <el-dialog
    v-model="visible"
    title="快速记账"
    width="600px"
    :before-close="handleClose"
    @opened="focusAmount"
  >
    <el-form
      ref="transactionForm"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent="submitTransaction"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="交易类型" prop="type">
            <el-select v-model="form.type" placeholder="选择交易类型" style="width: 100%">
              <el-option label="收入" value="income"></el-option>
              <el-option label="支出" value="expense"></el-option>
              <el-option label="转账" value="transfer"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="金额" prop="amount">
            <el-input
              ref="amountInput"
              v-model="form.amount"
              placeholder="请输入金额"
              type="number"
              step="0.01"
              style="width: 100%"
            >
              <template #prepend>¥</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="借方账户" prop="debitAccount">
            <el-select
              v-model="form.debitAccount"
              placeholder="选择借方账户"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="account in filteredDebitAccounts"
                :key="account.id"
                :label="`${account.name} (${account.code})`"
                :value="account.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="贷方账户" prop="creditAccount">
            <el-select
              v-model="form.creditAccount"
              placeholder="选择贷方账户"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="account in filteredCreditAccounts"
                :key="account.id"
                :label="`${account.name} (${account.code})`"
                :value="account.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="交易描述" prop="description">
        <el-input
          v-model="form.description"
          placeholder="请输入交易描述"
          type="textarea"
          :rows="2"
        ></el-input>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="交易日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类标签">
            <el-select
              v-model="form.category"
              placeholder="选择分类（可选）"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="category in categories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 快速金额按钮 -->
      <el-form-item label="快速金额">
        <div class="quick-amounts">
          <el-button
            v-for="amount in quickAmounts"
            :key="amount"
            size="small"
            @click="setQuickAmount(amount)"
          >
            ¥{{ amount }}
          </el-button>
        </div>
      </el-form-item>

      <!-- 常用交易模板 -->
      <el-form-item label="常用交易">
        <el-select
          v-model="selectedTemplate"
          placeholder="选择常用交易模板"
          style="width: 100%"
          clearable
          @change="applyTemplate"
        >
          <el-option
            v-for="template in transactionTemplates"
            :key="template.id"
            :label="template.name"
            :value="template.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitTransaction" :loading="submitting">
          <el-icon><Check /></el-icon>
          确认记账
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import api from '@/services/api'

export default {
  name: 'QuickTransactionDialog',
  components: {
    Check
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
  emits: ['update:modelValue', 'transaction-created'],
  data() {
    return {
      submitting: false,
      selectedTemplate: null,
      form: {
        type: 'expense',
        amount: '',
        debitAccount: '',
        creditAccount: '',
        description: '',
        date: '',
        category: ''
      },
      rules: {
        type: [
          { required: true, message: '请选择交易类型', trigger: 'change' }
        ],
        amount: [
          { required: true, message: '请输入金额', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value <= 0) {
                callback(new Error('金额必须大于0'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        debitAccount: [
          { required: true, message: '请选择借方账户', trigger: 'change' }
        ],
        creditAccount: [
          { required: true, message: '请选择贷方账户', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入交易描述', trigger: 'blur' }
        ],
        date: [
          { required: true, message: '请选择交易日期', trigger: 'change' }
        ]
      },
      quickAmounts: [10, 20, 50, 100, 200, 500, 1000],
      categories: [
        { label: '餐饮', value: 'dining' },
        { label: '交通', value: 'transport' },
        { label: '购物', value: 'shopping' },
        { label: '娱乐', value: 'entertainment' },
        { label: '医疗', value: 'medical' },
        { label: '教育', value: 'education' },
        { label: '住房', value: 'housing' },
        { label: '投资', value: 'investment' },
        { label: '工资', value: 'salary' },
        { label: '其他', value: 'other' }
      ],
      transactionTemplates: [
        {
          id: 1,
          name: '工资收入',
          type: 'income',
          debitAccountType: 'asset',
          creditAccountType: 'income',
          category: 'salary'
        },
        {
          id: 2,
          name: '餐饮支出',
          type: 'expense',
          debitAccountType: 'expense',
          creditAccountType: 'asset',
          category: 'dining'
        },
        {
          id: 3,
          name: '交通费用',
          type: 'expense',
          debitAccountType: 'expense',
          creditAccountType: 'asset',
          category: 'transport'
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
    filteredDebitAccounts() {
      if (!this.form.type) return this.accounts
      
      switch (this.form.type) {
        case 'income':
          return this.accounts.filter(account => 
            account.type === 'asset'
          )
        case 'expense':
          return this.accounts.filter(account => 
            account.type === 'expense'
          )
        case 'transfer':
          return this.accounts.filter(account => 
            account.type === 'asset'
          )
        default:
          return this.accounts
      }
    },
    filteredCreditAccounts() {
      if (!this.form.type) return this.accounts
      
      switch (this.form.type) {
        case 'income':
          return this.accounts.filter(account => 
            account.type === 'income'
          )
        case 'expense':
          return this.accounts.filter(account => 
            account.type === 'asset'
          )
        case 'transfer':
          return this.accounts.filter(account => 
            account.type === 'asset' && account.id !== this.form.debitAccount
          )
        default:
          return this.accounts
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetForm()
      }
    },
    'form.type'() {
      // 当交易类型改变时，清空账户选择
      this.form.debitAccount = ''
      this.form.creditAccount = ''
    }
  },
  methods: {
    resetForm() {
      this.form = {
        type: 'expense',
        amount: '',
        debitAccount: '',
        creditAccount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: ''
      }
      this.selectedTemplate = null
      this.$nextTick(() => {
        this.$refs.transactionForm?.clearValidate()
      })
    },

    setQuickAmount(amount) {
      this.form.amount = amount
    },

    applyTemplate(templateId) {
      if (!templateId) return
      
      const template = this.transactionTemplates.find(t => t.id === templateId)
      if (template) {
        this.form.type = template.type
        this.form.category = template.category
        
        // 自动选择合适的账户
        const debitAccount = this.accounts.find(a => a.type === template.debitAccountType)
        const creditAccount = this.accounts.find(a => a.type === template.creditAccountType)
        
        if (debitAccount) this.form.debitAccount = debitAccount.id
        if (creditAccount) this.form.creditAccount = creditAccount.id
      }
    },

    async submitTransaction() {
      try {
        const valid = await this.$refs.transactionForm.validate()
        if (!valid) return

        this.submitting = true

        const transactionData = {
          amount: parseFloat(this.form.amount),
          description: this.form.description,
          date: this.form.date,
          debit_account_id: this.form.debitAccount,
          credit_account_id: this.form.creditAccount,
          category: this.form.category
        }

        await api.createTransaction(transactionData)
        
        ElMessage.success('交易记录成功')
        this.$emit('transaction-created')
        this.handleClose()
      } catch (error) {
        console.error('创建交易失败:', error)
        ElMessage.error('记账失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },

    handleClose() {
      this.visible = false
    },

    focusAmount() {
      this.$nextTick(() => {
        this.$refs.amountInput?.focus()
      })
    }
  }
}
</script>

<style scoped>
.quick-amounts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dialog-footer {
  text-align: right;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
