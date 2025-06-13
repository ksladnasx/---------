<template>
  <div class="simple-dashboard">
    <h1>仪表板测试</h1>
    
    <div class="test-card">
      <h3>基本信息</h3>
      <p>账户数量: {{ accounts.length }}</p>
      <p>交易数量: {{ transactions.length }}</p>
      <p>加载状态: {{ loading ? '加载中...' : '已完成' }}</p>
    </div>

    <div class="test-card">
      <h3>API测试</h3>
      <button @click="testAPI">测试API连接</button>
      <p v-if="apiResult">API结果: {{ apiResult }}</p>
    </div>

    <div class="test-card">
      <h3>账户列表</h3>
      <ul>
        <li v-for="account in accounts" :key="account.id">
          {{ account.name }} ({{ account.type }}) - {{ formatCurrency(account.balance) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const accounts = ref([])
const transactions = ref([])
const loading = ref(false)
const apiResult = ref('')

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

const testAPI = async () => {
  try {
    const result = await api.getAccounts()
    apiResult.value = `成功获取 ${result.length} 个账户`
    accounts.value = result
  } catch (error) {
    apiResult.value = `API错误: ${error.message}`
    console.error('API测试失败:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    console.log('开始加载数据...')
    const [accountsData, transactionsData] = await Promise.all([
      api.getAccounts(),
      api.getTransactions()
    ])
    console.log('账户数据:', accountsData)
    console.log('交易数据:', transactionsData)
    
    accounts.value = accountsData || []
    transactions.value = transactionsData || []
  } catch (error) {
    console.error('加载数据失败:', error)
    accounts.value = []
    transactions.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('组件已挂载，开始加载数据')
  loadData()
})
</script>

<style scoped>
.simple-dashboard {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.test-card h3 {
  margin-bottom: 15px;
  color: #333;
}

button {
  background: #409EFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #337ab7;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

li:last-child {
  border-bottom: none;
}
</style>
