import { createRouter, createWebHistory } from 'vue-router'
import DashboardNew from '@/views/DashboardNew.vue'
import TestDashboard from '@/views/TestDashboard.vue'
import Accounts from '@/views/Accounts.vue'
import Transactions from '@/views/Transactions.vue'
import Analysis from '@/views/Analysis.vue'
import KnowledgeDiscovery from '@/views/KnowledgeDiscovery.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardNew, // 使用新的Dashboard
    meta: { title: '仪表板' }
  },
  {
    path: '/test',
    name: 'TestDashboard',
    component: TestDashboard,
    meta: { title: '测试页面' }
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: Accounts,
    meta: { title: '账户管理' }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions,
    meta: { title: '交易记录' }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: Analysis,
    meta: { title: '财务分析' }
  },
  {
    path: '/knowledge',
    name: 'KnowledgeDiscovery',
    component: KnowledgeDiscovery,
    meta: { title: '知识发现' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
