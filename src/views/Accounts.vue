<template>
  <div class="accounts">
    <div class="card">
      <div class="card-header">
        <h3>账户管理</h3>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新增账户
        </el-button>
      </div>

      <!-- 账户统计 -->
      <el-row :gutter="20" class="account-stats">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ accounts.length }}</div>
            <div class="stat-label">总账户数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ assetAccounts.length }}</div>
            <div class="stat-label">资产账户</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ liabilityAccounts.length }}</div>
            <div class="stat-label">负债账户</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ formatCurrency(totalBalance) }}</div>
            <div class="stat-label">总余额</div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchText"
              placeholder="搜索账户名称或ID"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="filterType"
              placeholder="账户类型"
              clearable
              @change="handleFilter"
            >
              <el-option label="全部" value="" />
              <el-option label="资产" value="asset" />
              <el-option label="负债" value="liability" />
              <el-option label="权益" value="equity" />
              <el-option label="收入" value="revenue" />
              <el-option label="费用" value="expense" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 账户表格 -->
      <el-table 
        :data="filteredAccounts" 
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="账户ID" width="120" />
        <el-table-column prop="name" label="账户名称" width="200" />
        <el-table-column prop="type" label="账户类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getAccountTypeColor(row.type)">
              {{ getAccountTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="150">
          <template #default="{ row }">
            <span :class="getBalanceClass(row.balance)">
              {{ formatCurrency(row.balance) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editAccount(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="viewAccountDetail(row)">
              详情
            </el-button>
            <el-popconfirm
              title="确定要删除这个账户吗？"
              @confirm="deleteAccount(row.id)"
            >
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑账户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingAccount ? '编辑账户' : '新增账户'"
      width="500px"
    >
      <el-form
        ref="accountFormRef"
        :model="accountForm"
        :rules="accountRules"
        label-width="80px"
      >
        <el-form-item label="账户ID" prop="id">
          <el-input 
            v-model="accountForm.id" 
            :disabled="!!editingAccount"
            placeholder="请输入账户ID"
          />
        </el-form-item>
        <el-form-item label="账户名称" prop="name">
          <el-input v-model="accountForm.name" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="账户类型" prop="type">
          <el-select v-model="accountForm.type" placeholder="请选择账户类型">
            <el-option label="资产" value="asset" />
            <el-option label="负债" value="liability" />
            <el-option label="权益" value="equity" />
            <el-option label="收入" value="revenue" />
            <el-option label="费用" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始余额" prop="balance">
          <el-input-number
            v-model="accountForm.balance"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="button-group">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveAccount">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 账户详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="账户详情"
      width="600px"
    >
      <div v-if="selectedAccount" class="account-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="账户ID">
            {{ selectedAccount.id }}
          </el-descriptions-item>
          <el-descriptions-item label="账户名称">
            {{ selectedAccount.name }}
          </el-descriptions-item>
          <el-descriptions-item label="账户类型">
            <el-tag :type="getAccountTypeColor(selectedAccount.type)">
              {{ getAccountTypeName(selectedAccount.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前余额">
            <span :class="getBalanceClass(selectedAccount.balance)">
              {{ formatCurrency(selectedAccount.balance) }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 相关交易 -->
        <h4 style="margin-top: 20px; margin-bottom: 10px;">相关交易</h4>
        <el-table :data="accountTransactions" max-height="300">
          <el-table-column prop="date" label="日期" width="100" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">
              {{ formatCurrency(row.amount) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '@/services/api'

// 响应式数据
const accounts = ref([])
const transactions = ref([])
const loading = ref(false)
const searchText = ref('')
const filterType = ref('')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const editingAccount = ref(null)
const selectedAccount = ref(null)

// 表单数据
const accountForm = ref({
  id: '',
  name: '',
  type: '',
  balance: 0
})

const accountRules = {
  id: [{ required: true, message: '请输入账户ID', trigger: 'blur' }],
  name: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择账户类型', trigger: 'change' }]
}

const accountFormRef = ref()

// 计算属性
const filteredAccounts = computed(() => {
  let result = accounts.value
  
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(account => 
      account.id.toLowerCase().includes(search) ||
      account.name.toLowerCase().includes(search)
    )
  }
  
  if (filterType.value) {
    result = result.filter(account => account.type === filterType.value)
  }
  
  return result
})

const assetAccounts = computed(() => 
  accounts.value.filter(a => a.type === 'asset')
)

const liabilityAccounts = computed(() => 
  accounts.value.filter(a => a.type === 'liability')
)

const totalBalance = computed(() => 
  accounts.value.reduce((sum, account) => sum + account.balance, 0)
)

const accountTransactions = computed(() => {
  if (!selectedAccount.value) return []
  
  return transactions.value.filter(t => 
    t.debit_account_id === selectedAccount.value.id ||
    t.credit_account_id === selectedAccount.value.id
  )
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const [accountsData, transactionsData] = await Promise.all([
      api.getAccounts(),
      api.getTransactions()
    ])
    accounts.value = accountsData
    transactions.value = transactionsData
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const editAccount = (account) => {
  editingAccount.value = account
  accountForm.value = { ...account }
  showCreateDialog.value = true
}

const viewAccountDetail = (account) => {
  selectedAccount.value = account
  showDetailDialog.value = true
}

const deleteAccount = async (accountId) => {
  try {
    await api.deleteAccount(accountId)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
    console.error('删除失败:', error)
  }
}

const saveAccount = async () => {
  try {
    await accountFormRef.value.validate()
    
    if (editingAccount.value) {
      await api.updateAccount(editingAccount.value.id, accountForm.value)
      ElMessage.success('更新成功')
    } else {
      await api.createAccount(accountForm.value)
      ElMessage.success('创建成功')
    }
    
    showCreateDialog.value = false
    loadData()
  } catch (error) {
    if (error.response?.status === 400) {
      ElMessage.error('账户ID已存在或数据无效')
    } else {
      ElMessage.error('保存失败')
    }
    console.error('保存失败:', error)
  }
}

const cancelEdit = () => {
  showCreateDialog.value = false
  editingAccount.value = null
  accountForm.value = {
    id: '',
    name: '',
    type: '',
    balance: 0
  }
}

const handleSearch = () => {
  // 搜索逻辑在计算属性中处理
}

const handleFilter = () => {
  // 筛选逻辑在计算属性中处理
}

// 工具函数
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

const getAccountTypeName = (type) => {
  const typeMap = {
    asset: '资产',
    liability: '负债',
    equity: '权益',
    revenue: '收入',
    expense: '费用'
  }
  return typeMap[type] || type
}

const getAccountTypeColor = (type) => {
  const colorMap = {
    asset: 'success',
    liability: 'warning',
    equity: 'info',
    revenue: 'primary',
    expense: 'danger'
  }
  return colorMap[type] || 'default'
}

const getBalanceClass = (balance) => {
  if (balance > 0) return 'positive-balance'
  if (balance < 0) return 'negative-balance'
  return ''
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.accounts {
  padding: 0;
}

.account-stats {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.account-detail {
  padding: 0;
}
</style>
