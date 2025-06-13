<template>
  <div class="analysis-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>财务分析</h1>
      <p>基于粗糙集理论的智能财务分析与预测</p>
    </div>

    <!-- 分析控制面板 -->
    <el-card class="analysis-controls">
      <template #header>
        <div class="card-header">
          <span>分析配置</span>
          <el-button type="primary" @click="performAnalysis" :loading="analysisLoading">
            <el-icon><Search /></el-icon>
            开始分析
          </el-button>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="分析类型">
            <el-select v-model="analysisType" placeholder="选择分析类型">
              <el-option label="收支趋势分析" value="trend"></el-option>
              <el-option label="支出结构分析" value="structure"></el-option>
              <el-option label="异常检测分析" value="anomaly"></el-option>
              <el-option label="预测分析" value="prediction"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="账户类型">
            <el-select v-model="accountType" placeholder="选择账户类型" multiple>
              <el-option label="资产" value="asset"></el-option>
              <el-option label="负债" value="liability"></el-option>
              <el-option label="收入" value="income"></el-option>
              <el-option label="费用" value="expense"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="分析粒度">
            <el-select v-model="granularity" placeholder="选择分析粒度">
              <el-option label="按日" value="daily"></el-option>
              <el-option label="按周" value="weekly"></el-option>
              <el-option label="按月" value="monthly"></el-option>
              <el-option label="按季度" value="quarterly"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 分析结果展示 -->
    <div v-if="analysisResults" class="analysis-results">
      <!-- 趋势分析图表 -->
      <el-card v-if="analysisType === 'trend'" class="analysis-chart">
        <template #header>
          <span>收支趋势分析</span>
        </template>
        <div ref="trendChart" style="height: 400px;"></div>
      </el-card>

      <!-- 支出结构分析 -->
      <el-card v-if="analysisType === 'structure'" class="analysis-chart">
        <template #header>
          <span>支出结构分析</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <div ref="pieChart" style="height: 350px;"></div>
          </el-col>
          <el-col :span="12">
            <div ref="barChart" style="height: 350px;"></div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 异常检测结果 -->
      <el-card v-if="analysisType === 'anomaly'" class="analysis-chart">
        <template #header>
          <span>异常交易检测</span>
        </template>
        <el-table :data="anomalyData" style="width: 100%">
          <el-table-column prop="date" label="日期" width="120"></el-table-column>
          <el-table-column prop="description" label="交易描述" width="200"></el-table-column>
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="scope">
              <span :class="scope.row.amount > 0 ? 'text-success' : 'text-danger'">
                {{ formatCurrency(scope.row.amount) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="confidence" label="异常度" width="120">
            <template #default="scope">
              <el-tag :type="getAnomalyType(scope.row.confidence)">
                {{ (scope.row.confidence * 100).toFixed(1) }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="异常原因" show-overflow-tooltip></el-table-column>
        </el-table>
      </el-card>

      <!-- 预测分析 -->
      <el-card v-if="analysisType === 'prediction'" class="analysis-chart">
        <template #header>
          <span>财务预测分析</span>
        </template>
        <div ref="predictionChart" style="height: 400px;"></div>
        <div class="prediction-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="下月预计收入" :value="predictionData.income" :precision="2" prefix="¥" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="下月预计支出" :value="predictionData.expense" :precision="2" prefix="¥" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="预计结余" :value="predictionData.balance" :precision="2" prefix="¥" 
                           :class="predictionData.balance >= 0 ? 'text-success' : 'text-danger'" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="预测准确度" :value="predictionData.accuracy" suffix="%" />
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 粗糙集分析洞察 -->
      <el-card class="insights-card">
        <template #header>
          <span>智能洞察</span>
        </template>
        <div class="insights-content">
          <el-alert
            v-for="insight in analysisResults.insights"
            :key="insight.id"
            :title="insight.title"
            :description="insight.description"
            :type="insight.type"
            show-icon
            style="margin-bottom: 15px;"
          >
          </el-alert>
        </div>
      </el-card>

      <!-- 建议和行动计划 -->
      <el-card class="recommendations-card">
        <template #header>
          <span>智能建议</span>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="recommendation in analysisResults.recommendations"
            :key="recommendation.id"
            :icon="recommendation.icon"
            :type="recommendation.priority"
            :timestamp="recommendation.category"
          >
            <h4>{{ recommendation.title }}</h4>
            <p>{{ recommendation.description }}</p>
            <el-tag v-if="recommendation.impact" size="small">
              预期影响: {{ recommendation.impact }}
            </el-tag>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="选择分析类型并点击开始分析" />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import api from '@/services/api'

export default {
  name: 'Analysis',
  components: {
    Search
  },
  data() {
    return {
      analysisType: 'trend',
      dateRange: null,
      accountType: [],
      granularity: 'monthly',
      analysisLoading: false,
      analysisResults: null,
      anomalyData: [],
      predictionData: {
        income: 0,
        expense: 0,
        balance: 0,
        accuracy: 0
      }
    }
  },
  mounted() {
    // 设置默认日期范围为最近3个月
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)
    this.dateRange = [
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ]
  },
  methods: {
    async performAnalysis() {
      if (!this.dateRange || this.dateRange.length !== 2) {
        ElMessage.warning('请选择分析的时间范围')
        return
      }

      this.analysisLoading = true
      try {
        const params = {
          analysis_type: this.analysisType,
          start_date: this.dateRange[0],
          end_date: this.dateRange[1],
          account_types: this.accountType,
          granularity: this.granularity
        }

        const response = await api.performFinancialAnalysis(params)
        this.analysisResults = response.data

        // 根据分析类型渲染对应的图表
        this.$nextTick(() => {
          this.renderCharts()
        })

        ElMessage.success('分析完成')
      } catch (error) {
        console.error('分析失败:', error)
        ElMessage.error('分析失败，请稍后重试')
      } finally {
        this.analysisLoading = false
      }
    },

    renderCharts() {
      switch (this.analysisType) {
        case 'trend':
          this.renderTrendChart()
          break
        case 'structure':
          this.renderStructureCharts()
          break
        case 'prediction':
          this.renderPredictionChart()
          break
      }
    },

    renderTrendChart() {
      const chart = echarts.init(this.$refs.trendChart)
      const option = {
        title: {
          text: '收支趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['收入', '支出', '净收入'],
          top: 30
        },
        xAxis: {
          type: 'category',
          data: this.analysisResults.trend_data.dates
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '收入',
            type: 'line',
            data: this.analysisResults.trend_data.income,
            itemStyle: { color: '#67C23A' },
            smooth: true
          },
          {
            name: '支出',
            type: 'line',
            data: this.analysisResults.trend_data.expense,
            itemStyle: { color: '#F56C6C' },
            smooth: true
          },
          {
            name: '净收入',
            type: 'bar',
            data: this.analysisResults.trend_data.net_income,
            itemStyle: { color: '#409EFF' }
          }
        ]
      }
      chart.setOption(option)
    },

    renderStructureCharts() {
      // 饼图
      const pieChart = echarts.init(this.$refs.pieChart)
      const pieOption = {
        title: {
          text: '支出分类占比',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
        },
        series: [{
          name: '支出分类',
          type: 'pie',
          radius: ['50%', '70%'],
          data: this.analysisResults.structure_data.pie_data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
      pieChart.setOption(pieOption)

      // 柱状图
      const barChart = echarts.init(this.$refs.barChart)
      const barOption = {
        title: {
          text: '各类别支出金额',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: ¥{c}'
        },
        xAxis: {
          type: 'category',
          data: this.analysisResults.structure_data.categories,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [{
          type: 'bar',
          data: this.analysisResults.structure_data.amounts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }]
      }
      barChart.setOption(barOption)
    },

    renderPredictionChart() {
      const chart = echarts.init(this.$refs.predictionChart)
      const option = {
        title: {
          text: '财务预测',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['历史数据', '预测数据'],
          top: 30
        },
        xAxis: {
          type: 'category',
          data: this.analysisResults.prediction_data.dates
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '历史数据',
            type: 'line',
            data: this.analysisResults.prediction_data.historical,
            itemStyle: { color: '#409EFF' },
            smooth: true
          },
          {
            name: '预测数据',
            type: 'line',
            data: this.analysisResults.prediction_data.predicted,
            itemStyle: { color: '#F56C6C' },
            lineStyle: { type: 'dashed' },
            smooth: true
          }
        ]
      }
      chart.setOption(option)

      // 更新预测统计数据
      this.predictionData = this.analysisResults.prediction_summary
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY'
      }).format(amount)
    },

    getAnomalyType(confidence) {
      if (confidence >= 0.8) return 'danger'
      if (confidence >= 0.6) return 'warning'
      return 'info'
    }
  }
}
</script>

<style scoped>
.analysis-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  color: #909399;
  font-size: 14px;
}

.analysis-controls {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-chart {
  margin-bottom: 20px;
}

.prediction-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.insights-content {
  max-height: 400px;
  overflow-y: auto;
}

.recommendations-card {
  margin-top: 20px;
}

.text-success {
  color: #67C23A;
}

.text-danger {
  color: #F56C6C;
}
</style>
