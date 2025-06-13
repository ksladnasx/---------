<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 修改后的侧边栏 -->
      <el-aside 
        :width="isCollapse || isMobile ? '64px' : '250px'" 
        class="sidebar"
        :class="{ 'mobile-collapse': isMobile }"
      >
        <div class="logo" @click="toggleCollapse">
          <h2 v-show="!isCollapse && !isMobile">智能记账系统</h2>
          <h2 v-show="isCollapse || isMobile">记账</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          class="sidebar-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :collapse="isCollapse || isMobile"
          :collapse-transition="false"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <template #title>仪表板</template>
          </el-menu-item>
          <el-menu-item index="/accounts">
            <el-icon><CreditCard /></el-icon>
            <template #title>账户管理</template>
          </el-menu-item>
          <el-menu-item index="/transactions">
            <el-icon><List /></el-icon>
            <template #title>交易记录</template>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <el-icon><TrendCharts /></el-icon>
            <template #title>财务分析</template>
          </el-menu-item>
          <el-menu-item index="/knowledge">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>知识发现</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 修改后的头部 -->
        <el-header class="header">
          <div class="header-content">
            <div class="header-left">
              <el-button 
                @click="toggleCollapse" 
                :icon="isCollapse || isMobile ? Expand : Fold" 
                circle 
                size="small"
                class="collapse-btn"
              />
              <h3>{{ $route.meta.title || '智能个人会计系统' }}</h3>
            </div>
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { 
  House, CreditCard, List, TrendCharts, DataAnalysis, 
  QuestionFilled, Fold, Expand 
} from '@element-plus/icons-vue'

const helpVisible = ref(false)
const isCollapse = ref(false)
const windowWidth = ref(window.innerWidth)

// 计算是否为移动设备
const isMobile = computed(() => windowWidth.value <= 768)

// 从本地存储加载折叠状态
onMounted(() => {
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState) {
    isCollapse.value = savedState === 'true'
  }
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

// 移除监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// 处理窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

const showHelp = () => {
  helpVisible.value = true
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
  // 保存状态到本地存储
  localStorage.setItem('sidebarCollapsed', isCollapse.value.toString())
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s ease;
}

/* 移动设备下的侧边栏样式 */
.sidebar.mobile-collapse {
  position: fixed;
  z-index: 1000;
  height: 100vh;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.logo {
  padding: 20px;
  text-align: center;
  color: #bfcbd9;
  border-bottom: 1px solid #434c5e;
  cursor: pointer;
  transition: all 0.3s;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  transition: all 0.3s;
}

.sidebar-menu {
  border: none;
}

/* 确保菜单在折叠状态下只显示图标 */
.el-menu--collapse .el-submenu__title span,
.el-menu--collapse .el-menu-item span {
  display: none;
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

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h3 {
  margin: 0;
  color: #303133;
}

.collapse-btn {
  margin-right: 10px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}

/* 响应式设计 - 当屏幕宽度小于768px时自动折叠侧边栏 */
@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 64px;
    transition: margin-left 0.3s ease;
  }
  
  .sidebar:not(.mobile-collapse) {
    transform: translateX(-100%);
  }
  
  .sidebar.mobile-collapse {
    transform: translateX(0);
  }
}

.help-content ul, .help-content ol {
  padding-left: 20px;
}

.help-content li {
  margin-bottom: 8px;
  line-height: 1.6;
}
</style>