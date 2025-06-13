import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/css/global.css'

console.log('开始创建Vue应用...')

const app = createApp(App)



console.log('配置路由和插件...')
app.use(router)
app.use(ElementPlus)

console.log('注册Element Plus图标...')

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

console.log('挂载应用到#app...')
app.mount('#app')

console.log('Vue应用启动完成！')
