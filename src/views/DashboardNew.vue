<template>
  <div class="dashboard">
    <!-- 调试信息 -->
    <div class="debug-info">
      <strong>调试信息:</strong> 
      loading={{ loading }}, 
      accounts={{ accounts.length }}, 
      transactions={{ transactions.length }}
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-loading />
      <p>正在加载数据...</p>
    </div>

    <!-- 主要内容 -->
    <div v-else class="dashboard-content">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="12" :md="6">
          <div class="stat-card income">
            <div class="stat-value">{{ formatCurrency(totalIncome) }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :md="6">
          <div class="stat-card expense">
            <div class="stat-value">{{ formatCurrency(totalExpense) }}</div>
            <div class="stat-label">总支出</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :md="6">
          <div class="stat-card balance">
            <div class="stat-value">{{ formatCurrency(netBalance) }}</div>
            <div class="stat-label">净余额</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :md="6">
          <div class="stat-card accountnum" >
            <div class="stat-value">{{ accountCount }}</div>
            <div class="stat-label">账户数量</div>
          </div>
        </el-col>
      </el-row>

      <!-- 内容区域 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="card">
            <div class="card-header">
              <h3>财务概览</h3>
              <el-button type="primary" @click="loadData" :loading="loading" icon="refresh" > 
                刷新数据
              </el-button>
            </div>
            
            <div v-if="accounts.length === 0 && transactions.length === 0" class="no-data">
              <p>暂无数据，请先添加账户和交易记录</p>
              <el-button type="primary" @click="showNewAccount = true">添加账户</el-button>
            </div>
            
            <div v-else>
              <p>当前有 <strong>{{ accounts.length }}</strong> 个账户，<strong>{{ transactions.length }}</strong> 笔交易</p>
              
              <div v-if="accounts.length > 0" class="data-section">
                <h4>账户列表：</h4>
                <div class="account-list">
                  <div v-for="account in accounts.slice(0, 5)" :key="account.id" class="account-item">
                    <span class="account-name">{{ account.name }}</span>
                    <span class="account-balance">{{ formatCurrency(account.balance) }}</span>
                  </div>
                  <div v-if="accounts.length > 5" class="more-info">
                    还有 {{ accounts.length - 5 }} 个账户...
                  </div>
                </div>
              </div>
              
              <div v-if="transactions.length > 0" class="data-section">
                <h4>最近交易：</h4>
                <div class="transaction-list">
                  <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
                    <span class="transaction-desc">{{ transaction.description }}</span>
                    <span class="transaction-amount">{{ formatCurrency(transaction.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 快速新增交易对话框 -->
    <QuickTransactionDialog 
      v-model="showNewTransaction" 
      :accounts="accounts"
      @transaction-created="refreshData"
    />

    <!-- 快速新增账户对话框 -->
    <QuickAccountDialog 
      v-model="showNewAccount" 
      :accounts="accounts"
      @account-created="refreshData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import QuickTransactionDialog from '@/components/QuickTransactionDialog.vue'
import QuickAccountDialog from '@/components/QuickAccountDialog.vue'

// 响应式数据
const accounts = ref([])
const transactions = ref([])
const loading = ref(false)
const showNewTransaction = ref(false)
const showNewAccount = ref(false)

console.log('Dashboard: 组件初始化')

// 计算属性
const totalIncome = computed(() => {
  return transactions.value
    .filter(t => isIncomeTransaction(t))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => !isIncomeTransaction(t))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
})

const netBalance = computed(() => totalIncome.value - totalExpense.value)

const accountCount = computed(() => accounts.value.length)

const recentTransactions = computed(() => {
  return transactions.value
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

// 方法
const loadData = async () => {
  console.log('Dashboard: 开始加载数据...')
  loading.value = true
  
  try {
    console.log('Dashboard: 调用API获取数据...')
    const [accountsData, transactionsData] = await Promise.all([
      api.getAccounts(),
      api.getTransactions()
    ])
    
    console.log('Dashboard: 账户数据:', accountsData)
    console.log('Dashboard: 交易数据:', transactionsData)
    
    accounts.value = accountsData || []
    transactions.value = transactionsData || []
    
    console.log('Dashboard: 数据设置完成')
  } catch (error) {
    console.error('Dashboard: 加载数据失败:', error)
    // 设置默认值，防止页面崩溃
    accounts.value = []
    transactions.value = []
  } finally {
    loading.value = false
    console.log('Dashboard: 数据加载完成，loading=false')
  }
}

const refreshData = () => {
  console.log('Dashboard: 刷新数据')
  loadData()
}

// 工具方法
const isIncomeTransaction = (transaction) => {
  // 简单判断：如果有credit_account_id且其类型为income，则为收入
  const creditAccount = accounts.value.find(acc => acc.id === transaction.credit_account_id)
  return creditAccount && creditAccount.type === 'income'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

// 生命周期
onMounted(() => {
  console.log('Dashboard: 组件已挂载，开始加载数据')
  loadData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.debug-info {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 12px;
  color: #0369a1;
}

.loading-container {
  padding: 40px;
  text-align: center;
}

.dashboard-content {
  min-height: 400px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #343536;
}

.stat-card.income .stat-value {
  color: #ffffff;
}

.stat-card.expense .stat-value {
  color: #ffffff;
}

.stat-card.balance .stat-value {
  color: #ffffff;
}

.stat-card.accountnum .stat-value {
  color: #ffffff;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 40px;
}

.data-section {
  margin: 20px 0;
}

.data-section h4 {
  margin: 15px 0 10px 0;
  color: #409EFF;
}

.account-list, .transaction-list {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
}

.account-item, .transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
}

.account-item:last-child, .transaction-item:last-child {
  border-bottom: none;
}

.account-name, .transaction-desc {
  font-weight: 500;
}

.account-balance, .transaction-amount {
  font-weight: bold;
  color: #409EFF;
}

.more-info {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding-top: 10px;
}
</style>
