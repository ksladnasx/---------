<template>
  <div class="knowledge-discovery">
    <div class="card">
      <div class="card-header">
        <h3>知识发现与粗糙集分析</h3>
        <div class="analysis-controls">
          <el-select v-model="selectedDecisionAttribute" placeholder="选择决策属性" style="width: 200px; margin-right: 10px;">
            <el-option label="交易模式" value="transaction_pattern" />
            <el-option label="交易类别" value="transaction_category" />
            <el-option label="金额类别" value="amount_category" />
          </el-select>
          <el-button type="primary" @click="runAnalysis" :loading="analyzing">
            <el-icon><DataAnalysis /></el-icon>
            开始分析
          </el-button>
          <el-button type="success" @click="generateInsights" :loading="generatingInsights">
            <el-icon><BulbFilled /></el-icon>
            生成洞察
          </el-button>
        </div>
      </div>

      <!-- 分析状态 -->
      <div v-if="analyzing" class="analysis-progress">
        <el-alert
          title="正在执行粗糙集分析..."
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 分析结果选项卡 -->
      <el-tabs v-model="activeTab" v-if="analysisResults">
        <!-- 数据视图 -->
        <el-tab-pane label="数据视图" name="dataView">
          <div class="data-view-section">
            <div class="section-header">
              <h4>分析数据集</h4>
              <el-button size="small" @click="refreshDataView">刷新</el-button>
            </div>
            <div v-if="dataView">
              <el-descriptions :column="4" border style="margin-bottom: 20px;">
                <el-descriptions-item label="总记录数">{{ dataView.row_count }}</el-descriptions-item>
                <el-descriptions-item label="属性数量">{{ dataView.columns.length }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ new Date().toLocaleString() }}</el-descriptions-item>
                <el-descriptions-item label="数据质量">
                  <el-tag type="success">良好</el-tag>
                </el-descriptions-item>
              </el-descriptions>
              
              <el-table 
                :data="dataView.data.slice(0, 50)" 
                stripe 
                style="width: 100%"
                max-height="400"
              >
                <el-table-column 
                  v-for="column in dataView.columns"
                  :key="column"
                  :prop="column"
                  :label="column"
                  :width="getColumnWidth(column)"
                />
              </el-table>
              
              <div v-if="dataView.data.length > 50" class="data-note">
                显示前50条记录，共{{ dataView.row_count }}条
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 消费模式 -->
        <el-tab-pane label="消费模式" name="patterns">
          <div class="patterns-section">
            <div v-if="analysisResults.decision_attribute" class="analysis-info">
              <el-alert 
                :title="`当前分析决策属性: ${analysisResults.decision_attribute}`"
                type="info"
                :closable="false"
                style="margin-bottom: 20px;"
              />
            </div>
            <div v-if="analysisResults.patterns && analysisResults.patterns.length > 0">
              <el-row :gutter="20">
                <el-col 
                  v-for="(pattern, index) in analysisResults.patterns.slice(0, 10)" 
                  :key="index"
                  :span="12"
                  style="margin-bottom: 20px;"
                >
                  <el-card shadow="hover">
                    <template #header>
                      <div class="pattern-header">
                        <span>{{ pattern.decision || `模式 ${index + 1}` }}</span>
                        <el-tag :type="getPatternType(pattern.confidence)">
                          置信度: {{ (pattern.confidence * 100).toFixed(1) }}%
                        </el-tag>
                      </div>
                    </template>
                    <div class="pattern-content">
                      <p><strong>决策:</strong> {{ pattern.decision }}</p>
                      <p><strong>支持度:</strong> {{ pattern.support }} 条交易</p>
                      <p><strong>置信度:</strong> {{ (pattern.confidence * 100).toFixed(1) }}%</p>
                      <div v-if="pattern.conditions" class="pattern-attributes">
                        <strong>关键条件:</strong>
                        <el-tag 
                          v-for="(value, key) in pattern.conditions"
                          :key="key"
                          size="small"
                          style="margin: 2px;"
                        >
                          {{ key }}: {{ value }}
                        </el-tag>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
            <div v-else class="no-data">
              <el-empty description="暂无发现的模式" />
            </div>
          </div>
        </el-tab-pane>

        <!-- 决策规则 -->
        <el-tab-pane label="决策规则" name="rules">
          <div class="rules-section">
            <div class="section-header">
              <h4>决策规则列表</h4>
              <div>
                <el-input
                  v-model="ruleSearch"
                  placeholder="搜索规则"
                  size="small"
                  style="width: 200px; margin-right: 10px;"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-select v-model="ruleFilter" placeholder="筛选" size="small" style="width: 120px;">
                  <el-option label="全部" value="" />
                  <el-option label="高置信度" value="high" />
                  <el-option label="中置信度" value="medium" />
                  <el-option label="低置信度" value="low" />
                </el-select>
              </div>
            </div>
            
            <el-table :data="filteredRules" stripe style="width: 100%">
              <el-table-column label="序号" type="index" width="60" />
              <el-table-column label="条件" prop="conditions" min-width="200">
                <template #default="{ row }">
                  <div class="rule-conditions">
                    <el-tag 
                      v-for="(value, key) in row.conditions"
                      :key="key"
                      size="small"
                      style="margin: 2px;"
                    >
                      {{ key }} = {{ value }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="结论" prop="decision" width="120" />
              <el-table-column label="支持度" prop="support" width="100">
                <template #default="{ row }">
                  {{ row.support }} 条
                </template>
              </el-table-column>
              <el-table-column label="置信度" prop="confidence" width="100">
                <template #default="{ row }">
                  <el-tag :type="getConfidenceType(row.confidence)">
                    {{ (row.confidence * 100).toFixed(1) }}%
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="覆盖数" prop="coverage" width="80" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 属性重要性 -->
        <el-tab-pane label="属性重要性" name="importance">
          <div class="importance-section">
            <div v-if="attributeImportance">
              <el-row :gutter="20">
                <el-col :span="12">
                  <h4>属性重要性排序</h4>
                  <div class="importance-list">
                    <div 
                      v-for="(item, index) in sortedImportance"
                      :key="index"
                      class="importance-item"
                    >
                      <div class="importance-label">{{ item[0] }}</div>
                      <div class="importance-bar">
                        <el-progress 
                          :percentage="item[1] * 100" 
                          :stroke-width="20"
                          :color="getImportanceColor(item[1])"
                        />
                      </div>
                      <div class="importance-value">{{ (item[1] * 100).toFixed(1) }}%</div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <h4>重要性分析</h4>
                  <div class="importance-analysis">
                    <el-alert
                      v-for="insight in importanceInsights"
                      :key="insight.type"
                      :title="insight.title"
                      :description="insight.description"
                      :type="insight.type"
                      show-icon
                      style="margin-bottom: 10px;"
                    />
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- 财务洞察 -->
        <el-tab-pane label="财务洞察" name="insights">
          <div class="insights-section">
            <el-button type="primary" @click="generateInsights" :loading="generatingInsights">
              <el-icon><BulbFilled /></el-icon>
              生成洞察
            </el-button>
            
            <div v-if="financialInsights && financialInsights.length > 0" class="insights-list">
              <el-card 
                v-for="(insight, index) in financialInsights"
                :key="index"
                shadow="hover"
                style="margin-top: 20px;"
              >
                <template #header>
                  <div class="insight-header">
                    <span>{{ insight.title }}</span>
                    <el-tag :type="getInsightType(insight.type)">{{ insight.type }}</el-tag>
                  </div>
                </template>
                <div class="insight-content">
                  <p>{{ insight.description }}</p>
                  <div v-if="insight.recommendations" class="recommendations">
                    <h5>建议措施:</h5>
                    <ul>
                      <li v-for="rec in insight.recommendations" :key="rec">{{ rec }}</li>
                    </ul>
                  </div>
                  <div v-if="insight.potential_savings" class="savings-info">
                    <el-statistic 
                      title="潜在节省"
                      :value="insight.potential_savings"
                      :precision="2"
                      prefix="¥"
                    />
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { DataAnalysis, Search,  } from '@element-plus/icons-vue'

import { ElMessage } from 'element-plus'
import api from '@/services/api'

// 响应式数据
const analyzing = ref(false)
const generatingInsights = ref(false)
const activeTab = ref('dataView')
const analysisResults = ref(null)
const dataView = ref(null)
const attributeImportance = ref(null)
const financialInsights = ref([])
const ruleSearch = ref('')
const ruleFilter = ref('')
const selectedDecisionAttribute = ref('transaction_pattern')

// 计算属性
const filteredRules = computed(() => {
  if (!analysisResults.value?.decision_rules) return []
  
  let rules = analysisResults.value.decision_rules
  
  // 搜索过滤
  if (ruleSearch.value) {
    const search = ruleSearch.value.toLowerCase()
    rules = rules.filter(rule => 
      rule.decision.toLowerCase().includes(search) ||
      JSON.stringify(rule.conditions).toLowerCase().includes(search)
    )
  }
  
  // 置信度过滤
  if (ruleFilter.value) {
    rules = rules.filter(rule => {
      if (ruleFilter.value === 'high') return rule.confidence >= 0.8
      if (ruleFilter.value === 'medium') return rule.confidence >= 0.5 && rule.confidence < 0.8
      if (ruleFilter.value === 'low') return rule.confidence < 0.5
      return true
    })
  }
  
  return rules
})

const sortedImportance = computed(() => {
  // 优先使用分析结果中的属性重要性，否则使用单独获取的属性重要性
  const importance = analysisResults.value?.attribute_importance || attributeImportance.value
  if (!importance) return []
  return Object.entries(importance)
    .sort((a, b) => b[1] - a[1])
})

const importanceInsights = computed(() => {
  if (!sortedImportance.value.length) return []
  
  const insights = []
  const top = sortedImportance.value[0]
  
  if (top[1] > 0.5) {
    insights.push({
      type: 'success',
      title: '关键属性识别',
      description: `"${top[0]}" 是最重要的决策属性，重要性为 ${(top[1] * 100).toFixed(1)}%`
    })
  }
  
  const lowImportance = sortedImportance.value.filter(item => item[1] < 0.1)
  if (lowImportance.length > 0) {
    insights.push({
      type: 'warning',
      title: '冗余属性',
      description: `发现 ${lowImportance.length} 个低重要性属性，可考虑简化分析模型`
    })
  }
  
  return insights
})

// 方法
const runAnalysis = async () => {
  analyzing.value = true
  try {
    // 获取数据视图
    dataView.value = await api.getDataView()
    
    // 执行模式分析 - 使用正确的参数
    const patternsResult = await api.getPatterns({ decision_attribute: selectedDecisionAttribute.value })
    
    // 获取决策规则
    const rulesResult = await api.getDecisionRules({ decision_attribute: selectedDecisionAttribute.value })
    
    // 获取属性重要性
    attributeImportance.value = await api.getAttributeImportance()
    
    analysisResults.value = {
      patterns: patternsResult.decision_rules || [], // 使用 decision_rules 作为模式
      decision_rules: rulesResult.rules || patternsResult.decision_rules || [],
      summary: patternsResult.analysis_summary || {},
      reducts: patternsResult.reducts || [],
      approximations: patternsResult.approximations || {},
      attribute_importance: patternsResult.attribute_importance || {},
      decision_attribute: patternsResult.decision_attribute || selectedDecisionAttribute.value
    }
    
    ElMessage.success('分析完成')
  } catch (error) {
    ElMessage.error('分析失败: ' + error.message)
    console.error('分析失败:', error)
  } finally {
    analyzing.value = false
  }
}

const generateInsights = async () => {
  generatingInsights.value = true
  try {
    const insights = await api.generateInsights()
    financialInsights.value = insights.insights || []
    ElMessage.success('洞察生成完成')
  } catch (error) {
    ElMessage.error('洞察生成失败: ' + error.message)
    console.error('洞察生成失败:', error)
  } finally {
    generatingInsights.value = false
  }
}

const refreshDataView = async () => {
  try {
    dataView.value = await api.getDataView()
    ElMessage.success('数据刷新完成')
  } catch (error) {
    ElMessage.error('数据刷新失败')
    console.error('数据刷新失败:', error)
  }
}

// 工具函数
const getPatternType = (confidence) => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'info'
}

const getConfidenceType = (confidence) => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'danger'
}

const getImportanceColor = (importance) => {
  if (importance >= 0.7) return '#67C23A'
  if (importance >= 0.4) return '#E6A23C'
  return '#F56C6C'
}

const getInsightType = (type) => {
  const typeMap = {
    'cost_optimization': 'warning',
    'savings_opportunity': 'success',
    'investment_opportunity': 'primary',
    'risk_warning': 'danger'
  }
  return typeMap[type] || 'info'
}

const getColumnWidth = (column) => {
  if (column.includes('id')) return 120
  if (column.includes('date')) return 100
  if (column.includes('amount')) return 120
  return 150
}

// 生命周期
onMounted(() => {
  // 自动加载数据视图
  refreshDataView()
})
</script>

<style scoped>
.knowledge-discovery {
  padding: 0;
}

.analysis-progress {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h4 {
  margin: 0;
  color: #303133;
}

.data-note {
  text-align: center;
  color: #909399;
  margin-top: 10px;
  font-size: 12px;
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pattern-content p {
  margin-bottom: 8px;
}

.pattern-attributes {
  margin-top: 10px;
}

.rule-conditions {
  max-width: 300px;
}

.importance-list {
  max-height: 400px;
  overflow-y: auto;
}

.importance-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.importance-label {
  width: 120px;
  font-weight: 500;
  color: #303133;
}

.importance-bar {
  flex: 1;
  margin: 0 15px;
}

.importance-value {
  width: 60px;
  text-align: right;
  font-weight: 600;
  color: #409EFF;
}

.importance-analysis {
  max-height: 400px;
  overflow-y: auto;
}

.insights-list {
  margin-top: 20px;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insight-content {
  line-height: 1.6;
}

.recommendations {
  margin-top: 15px;
}

.recommendations h5 {
  margin-bottom: 8px;
  color: #409EFF;
}

.recommendations ul {
  margin: 0;
  padding-left: 20px;
}

.recommendations li {
  margin-bottom: 5px;
}

.savings-info {
  margin-top: 15px;
  text-align: center;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

.analysis-controls {
  display: flex;
  align-items: center;
}
</style>
