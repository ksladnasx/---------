<template>
  <div class="test-dashboard">
    <h1>Dashboard测试页面</h1>
    <p>如果您能看到这个页面，说明Vue应用正常运行！</p>
    
    <div class="test-section">
      <h3>基础功能测试</h3>
      <el-button type="primary" @click="testClick">测试按钮</el-button>
      <p v-if="clickCount > 0">按钮被点击了 {{ clickCount }} 次</p>
    </div>
    
    <div class="test-section">
      <h3>API连接测试</h3>
      <el-button type="success" @click="testAPI" :loading="apiLoading">测试API连接</el-button>
      <div v-if="apiResult" class="api-result">
        <h4>API测试结果:</h4>
        <p>状态: <span :class="apiResult.success ? 'success' : 'error'">
          {{ apiResult.success ? '成功' : '失败' }}
        </span></p>
        <p v-if="apiResult.data">数据: {{ apiResult.data.length }} 条记录</p>
        <p v-if="apiResult.error">错误: {{ apiResult.error }}</p>
      </div>
    </div>
    
    <div class="test-section">
      <h3>数据加载测试</h3>
      <el-button type="warning" @click="loadData" :loading="dataLoading">加载数据</el-button>
      <div v-if="accounts.length > 0" class="data-result">
        <h4>账户数据 ({{ accounts.length }} 条):</h4>
        <ul>
          <li v-for="account in accounts.slice(0, 3)" :key="account.id">
            {{ account.name }}: ¥{{ account.balance }}
          </li>
        </ul>
      </div>
      <div v-if="transactions.length > 0" class="data-result">
        <h4>交易数据 ({{ transactions.length }} 条):</h4>
        <ul>
          <li v-for="transaction in transactions.slice(0, 3)" :key="transaction.id">
            {{ transaction.description }}: ¥{{ transaction.amount }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const clickCount = ref(0)
const apiLoading = ref(false)
const dataLoading = ref(false)
const apiResult = ref(null)
const accounts = ref([])
const transactions = ref([])

const testClick = () => {
  clickCount.value++
  console.log('按钮被点击了')
}

const testAPI = async () => {
  apiLoading.value = true
  apiResult.value = null
  
  try {
    console.log('测试API连接...')
    const response = await fetch('/api/accounts')
    
    if (response.ok) {
      const data = await response.json()
      apiResult.value = {
        success: true,
        data: data
      }
      console.log('API测试成功:', data)
    } else {
      apiResult.value = {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    console.error('API测试失败:', error)
    apiResult.value = {
      success: false,
      error: error.message
    }
  } finally {
    apiLoading.value = false
  }
}

const loadData = async () => {
  dataLoading.value = true
  
  try {
    console.log('开始加载数据...')
    
    // 使用api服务加载数据
    const [accountsData, transactionsData] = await Promise.all([
      api.getAccounts(),
      api.getTransactions()
    ])
    
    console.log('账户数据:', accountsData)
    console.log('交易数据:', transactionsData)
    
    accounts.value = accountsData || []
    transactions.value = transactionsData || []
    
    console.log('数据加载成功')
  } catch (error) {
    console.error('数据加载失败:', error)
  } finally {
    dataLoading.value = false
  }
}
</script>

<style scoped>
.test-dashboard {
  padding: 20px;
  max-width: 800px;
}

.test-section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.test-section h3 {
  margin-top: 0;
  color: #409eff;
}

.api-result, .data-result {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.success {
  color: #67c23a;
  font-weight: bold;
}

.error {
  color: #f56c6c;
  font-weight: bold;
}

.data-result ul {
  margin: 10px 0;
  padding-left: 20px;
}

.data-result li {
  margin: 5px 0;
}
</style>
