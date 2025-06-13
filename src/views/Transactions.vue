<template>
  <div class="transactions">
    <div class="card">
      <div class="card-header">
        <h3>交易记录</h3>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon>
            <Plus />
          </el-icon>
          新增交易
        </el-button>
      </div>

      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="handleDateFilter"
              style="width: 100%" />
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-input v-model="searchText" placeholder="搜索交易描述" clearable @input="handleSearch" style="width: 100%">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-select v-model="filterAccount" placeholder="筛选账户" clearable @change="handleAccountFilter"
              style="width: 100%">
              <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="24" :md="6">
            <el-button @click="resetFilters" style="width: 50%;margin-left: 30%;">重置筛选</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 交易统计 -->
      <el-row :gutter="20" class="transaction-stats">
        <el-col :span="8">
          <div class="stat-item income">
            <div class="stat-number">{{ formatCurrency(totalIncome) }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item expense">
            <div class="stat-number">{{ formatCurrency(totalExpense) }}</div>
            <div class="stat-label">总支出</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item balance">
            <div class="stat-number">{{ formatCurrency(netBalance) }}</div>
            <div class="stat-label">净余额</div>
          </div>
        </el-col>
      </el-row>

      <!-- 交易表格 -->
      <el-table :data="paginatedTransactions" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="100" sortable />
        <el-table-column prop="id" label="交易ID" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="借方账户" width="150">
          <template #default="{ row }">
            {{ getAccountName(row.debit_account_id) }}
          </template>
        </el-table-column>
        <el-table-column label="贷方账户" width="150">
          <template #default="{ row }">
            {{ getAccountName(row.credit_account_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" sortable>
          <template #default="{ row }">
            <span class="amount">{{ formatCurrency(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editTransaction(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="viewTransactionDetail(row)">
              详情
            </el-button>
            <el-popconfirm title="确定要删除这笔交易吗？" @confirm="deleteTransaction(row.id)">
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="filteredTransactions.length" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 新增/编辑交易对话框 -->
    <el-dialog v-model="showCreateDialog" :title="editingTransaction ? '编辑交易' : '新增交易'" width="600px">
      <el-form ref="transactionFormRef" :model="transactionForm" :rules="transactionRules" label-width="100px">
        <el-form-item label="交易ID" prop="id">
          <el-input v-model="transactionForm.id" :disabled="!!editingTransaction" placeholder="请输入交易ID" />
        </el-form-item>
        <el-form-item label="交易日期" prop="date">
          <el-date-picker v-model="transactionForm.date" type="date" placeholder="选择日期" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="交易描述" prop="description">
          <el-input v-model="transactionForm.description" placeholder="请输入交易描述" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="借方账户" prop="debit_account_id">
          <el-select v-model="transactionForm.debit_account_id" placeholder="选择借方账户" style="width: 100%">
            <el-option v-for="account in accounts" :key="account.id" :label="`${account.name} (${account.id})`"
              :value="account.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="贷方账户" prop="credit_account_id">
          <el-select v-model="transactionForm.credit_account_id" placeholder="选择贷方账户" style="width: 100%">
            <el-option v-for="account in accounts" :key="account.id" :label="`${account.name} (${account.id})`"
              :value="account.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易金额" prop="amount">
          <el-input-number v-model="transactionForm.amount" :precision="2" :min="0.01" style="width: 100%"
            placeholder="请输入交易金额" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="button-group">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveTransaction">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 交易详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="交易详情" width="500px">
      <div v-if="selectedTransaction" class="transaction-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="交易ID">
            {{ selectedTransaction.id }}
          </el-descriptions-item>
          <el-descriptions-item label="交易日期">
            {{ selectedTransaction.date }}
          </el-descriptions-item>
          <el-descriptions-item label="交易描述">
            {{ selectedTransaction.description }}
          </el-descriptions-item>
          <el-descriptions-item label="借方账户">
            {{ getAccountName(selectedTransaction.debit_account_id) }}
            <el-tag size="small" style="margin-left: 8px;">借方</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="贷方账户">
            {{ getAccountName(selectedTransaction.credit_account_id) }}
            <el-tag size="small" type="warning" style="margin-left: 8px;">贷方</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="交易金额">
            <span class="amount">{{ formatCurrency(selectedTransaction.amount) }}</span>
          </el-descriptions-item>
        </el-descriptions>
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
const filterAccount = ref('')
const dateRange = ref([])
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const editingTransaction = ref(null)
const selectedTransaction = ref(null)

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 表单数据
const transactionForm = ref({
  id: '',
  date: '',
  description: '',
  debit_account_id: '',
  credit_account_id: '',
  amount: 0
})

const transactionRules = {
  id: [{ required: true, message: '请输入交易ID', trigger: 'blur' }],
  date: [{ required: true, message: '请选择交易日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入交易描述', trigger: 'blur' }],
  debit_account_id: [{ required: true, message: '请选择借方账户', trigger: 'change' }],
  credit_account_id: [{ required: true, message: '请选择贷方账户', trigger: 'change' }],
  amount: [{ required: true, message: '请输入交易金额', trigger: 'blur' }]
}

const transactionFormRef = ref()

// 计算属性
const filteredTransactions = computed(() => {
  let result = transactions.value

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    result = result.filter(t =>
      t.date >= dateRange.value[0] && t.date <= dateRange.value[1]
    )
  }

  // 文本搜索
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(t =>
      t.description.toLowerCase().includes(search) ||
      t.id.toLowerCase().includes(search)
    )
  }

  // 账户筛选
  if (filterAccount.value) {
    result = result.filter(t =>
      t.debit_account_id === filterAccount.value ||
      t.credit_account_id === filterAccount.value
    )
  }

  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTransactions.value.slice(start, end)
})

const totalIncome = computed(() => {
  return filteredTransactions.value
    .filter(t => isIncomeTransaction(t))
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpense = computed(() => {
  return filteredTransactions.value
    .filter(t => !isIncomeTransaction(t))
    .reduce((sum, t) => sum + t.amount, 0)
})

const netBalance = computed(() => totalIncome.value - totalExpense.value)

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

const editTransaction = (transaction) => {
  editingTransaction.value = transaction
  transactionForm.value = { ...transaction }
  showCreateDialog.value = true
}

const viewTransactionDetail = (transaction) => {
  selectedTransaction.value = transaction
  showDetailDialog.value = true
}

const deleteTransaction = async (transactionId) => {
  try {
    await api.deleteTransaction(transactionId)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
    console.error('删除失败:', error)
  }
}

const saveTransaction = async () => {
  try {
    await transactionFormRef.value.validate()

    if (editingTransaction.value) {
      await api.updateTransaction(editingTransaction.value.id, transactionForm.value)
      ElMessage.success('更新成功')
    } else {
      await api.createTransaction(transactionForm.value)
      ElMessage.success('创建成功')
    }

    showCreateDialog.value = false
    loadData()
  } catch (error) {
    if (error.response?.status === 400) {
      ElMessage.error('交易ID已存在或数据无效')
    } else {
      ElMessage.error('保存失败')
    }
    console.error('保存失败:', error)
  }
}

const cancelEdit = () => {
  showCreateDialog.value = false
  editingTransaction.value = null
  transactionForm.value = {
    id: '',
    date: '',
    description: '',
    debit_account_id: '',
    credit_account_id: '',
    amount: 0
  }
}

const resetFilters = () => {
  searchText.value = ''
  filterAccount.value = ''
  dateRange.value = []
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleDateFilter = () => {
  currentPage.value = 1
}

const handleAccountFilter = () => {
  currentPage.value = 1
}

const handleSizeChange = () => {
  currentPage.value = 1
}

const handleCurrentChange = () => {
  // 页面变化时的处理
}

const getAccountName = (accountId) => {
  const account = accounts.value.find(a => a.id === accountId)
  return account ? account.name : accountId
}

const isIncomeTransaction = (transaction) => {
  const debitAccount = accounts.value.find(a => a.id === transaction.debit_account_id)
  return debitAccount && (debitAccount.type === 'asset')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.transactions {
  padding: 0;
}

.transaction-stats {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.transaction-detail {
  padding: 0;
}
</style>
