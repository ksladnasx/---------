import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 账户相关API
export const accountAPI = {
  // 获取所有账户
  getAll() {
    return api.get('/accounts')
  },
  
  // 获取单个账户
  getById(id) {
    return api.get(`/accounts/${id}`)
  },
  
  // 创建账户
  create(account) {
    return api.post('/accounts', account)
  },
  
  // 更新账户
  update(id, account) {
    return api.put(`/accounts/${id}`, account)
  },
  
  // 删除账户
  delete(id) {
    return api.delete(`/accounts/${id}`)
  }
}

// 交易相关API
export const transactionAPI = {
  // 获取所有交易
  getAll() {
    return api.get('/transactions')
  },
  
  // 获取单个交易
  getById(id) {
    return api.get(`/transactions/${id}`)
  },
  
  // 创建交易
  create(transaction) {
    return api.post('/transactions', transaction)
  },
  
  // 更新交易
  update(id, transaction) {
    return api.put(`/transactions/${id}`, transaction)
  },
  
  // 删除交易
  delete(id) {
    return api.delete(`/transactions/${id}`)
  }
}

// 知识发现相关API
export const knowledgeAPI = {
  // 执行分析
  analyze(params) {
    return api.post('/analysis/patterns', params)
  },
  
  // 获取模式
  getPatterns(params = {}) {
    return api.get('/analysis/patterns', { params })
  },
  
  // 获取决策规则
  getRules(params = {}) {
    return api.get('/analysis/decision-rules', { params })
  },
  
  // 异常检测
  detectAnomalies(params) {
    return api.post('/analysis/anomalies', params)
  },
  
  // 财务预测
  predict(params) {
    return api.post('/analysis/predict', params)
  },
  
  // 生成洞察
  generateInsights(params) {
    return api.post('/analysis/financial-insights', params)
  },
  
  // 获取数据视图
  getDataView() {
    return api.get('/analysis/data-view')
  },
  
  // 获取属性重要性
  getAttributeImportance() {
    return api.get('/analysis/attribute-importance')
  }
}

// 财务分析相关API
export const analysisAPI = {
  // 执行财务分析
  performAnalysis(params) {
    return api.post('/analysis/financial-analysis', params)
  },
  
  // 获取收支趋势
  getTrends(params) {
    return api.get('/analysis/trends', { params })
  },
  
  // 获取支出结构
  getStructure(params) {
    return api.get('/analysis/structure', { params })
  },
  
  // 异常检测
  detectAnomalies(params) {
    return api.post('/analysis/anomalies', params)
  },
  
  // 财务预测
  predict(params) {
    return api.post('/analysis/prediction', params)
  }
}

// 统一导出的API对象
const apiService = {
  // 账户相关
  getAccounts: () => accountAPI.getAll(),
  getAccount: (id) => accountAPI.getById(id),
  createAccount: (account) => accountAPI.create(account),
  updateAccount: (id, account) => accountAPI.update(id, account),
  deleteAccount: (id) => accountAPI.delete(id),
  
  // 交易相关
  getTransactions: () => transactionAPI.getAll(),
  getTransaction: (id) => transactionAPI.getById(id),
  createTransaction: (transaction) => transactionAPI.create(transaction),
  updateTransaction: (id, transaction) => transactionAPI.update(id, transaction),
  deleteTransaction: (id) => transactionAPI.delete(id),
  
  // 知识发现相关
  analyzePatterns: (params) => knowledgeAPI.analyze(params),
  getPatterns: (params) => knowledgeAPI.getPatterns(params),
  getDecisionRules: (params) => knowledgeAPI.getRules(params),
  detectAnomalies: (params) => knowledgeAPI.detectAnomalies(params),
  predictFinancial: (params) => knowledgeAPI.predict(params),
  generateInsights: (params) => knowledgeAPI.generateInsights(params),
  getDataView: () => knowledgeAPI.getDataView(),
  getAttributeImportance: () => knowledgeAPI.getAttributeImportance(),
  
  // 财务分析相关
  performFinancialAnalysis: (params) => analysisAPI.performAnalysis(params),
  getTrends: (params) => analysisAPI.getTrends(params),
  getStructure: (params) => analysisAPI.getStructure(params),
  detectTransactionAnomalies: (params) => analysisAPI.detectAnomalies(params),
  predictFinancialTrends: (params) => analysisAPI.predict(params)
}

export default apiService
