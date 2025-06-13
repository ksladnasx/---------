<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 侧边栏 -->
      <el-aside width="250px" class="sidebar">
        <div class="logo">
          <h2>智能记账系统</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          class="sidebar-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>仪表板</span>
          </el-menu-item>
          <el-menu-item index="/accounts">
            <el-icon><CreditCard /></el-icon>
            <span>账户管理</span>
          </el-menu-item>
          <el-menu-item index="/transactions">
            <el-icon><List /></el-icon>
            <span>交易记录</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <el-icon><TrendCharts /></el-icon>
            <span>财务分析</span>
          </el-menu-item>
          <el-menu-item index="/knowledge">
            <el-icon><DataAnalysis /></el-icon>
            <span>知识发现</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-content">
            <h3>{{ $route.meta.title || '智能个人会计系统' }}</h3>
            <div class="header-actions">
              <el-button type="primary" @click="showHelp">
                <el-icon><QuestionFilled /></el-icon>
                帮助
              </el-button>
            </div>
          </div>
        </el-header>

        <!-- 主要内容 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 帮助对话框 -->
    <el-dialog v-model="helpVisible" title="使用帮助" width="600px">
      <div class="help-content">
        <h4>功能说明：</h4>
        <ul>
          <li><strong>仪表板</strong>：查看财务概况和快速统计</li>
          <li><strong>账户管理</strong>：创建和管理各类账户</li>
          <li><strong>交易记录</strong>：记录和查看所有财务交易</li>
          <li><strong>财务分析</strong>：查看收支趋势和账户分析</li>
          <li><strong>知识发现</strong>：基于粗糙集的智能财务洞察</li>
        </ul>
        <h4>快速开始：</h4>
        <ol>
          <li>首先在"账户管理"中创建必要的账户</li>
          <li>在"交易记录"中添加您的财务交易</li>
          <li>查看"财务分析"了解财务状况</li>
          <li>使用"知识发现"获得智能洞察</li>
        </ol>
      </div>
      <template #footer>
        <el-button @click="helpVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { House, CreditCard, List, TrendCharts, DataAnalysis, QuestionFilled } from '@element-plus/icons-vue'

const helpVisible = ref(false)

const showHelp = () => {
  helpVisible.value = true
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
}

.logo {
  padding: 20px;
  text-align: center;
  color: #bfcbd9;
  border-bottom: 1px solid #434c5e;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
}

.sidebar-menu {
  border: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-content h3 {
  margin: 0;
  color: #303133;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}

.help-content ul, .help-content ol {
  padding-left: 20px;
}

.help-content li {
  margin-bottom: 8px;
  line-height: 1.6;
}
</style>
