<template>
  <div class="composition-demo">
    <h2>Vue组件组合演示</h2>
    
    <!-- 1. 基本组件组合 -->
    <div class="section">
      <h3>1. 父子组件通信</h3>
      <ChildComponent 
        :message="parentMessage"
        :count="count"
        @increment="handleIncrement"
        @custom-event="handleCustomEvent"
      />
    </div>
    
    <!-- 2. 插槽组合 -->
    <div class="section">
      <h3>2. 插槽内容组合</h3>
      <SlotDemo>
        <!-- 默认插槽 -->
        <p>这是传递给默认插槽的内容</p>
        
        <!-- 具名插槽 -->
        <template #header>
          <h4>这是header插槽内容</h4>
        </template>
        
        <!-- 作用域插槽 -->
        <template #item="{ item, index }">
          <div class="custom-item">
            {{ index }}: {{ item.name }} - {{ item.value }}
          </div>
        </template>
      </SlotDemo>
    </div>
    
    <!-- 3. 动态组件 -->
    <div class="section">
      <h3>3. 动态组件切换</h3>
      <div class="tabs">
        <button 
          v-for="tab in tabs"
          :key="tab"
          @click="currentTab = tab"
          :class="{ active: currentTab === tab }"
        >
          {{ tab }}
        </button>
      </div>
      <component :is="currentTab" :data="dynamicData" />
    </div>
    
    <!-- 4. 条件渲染 -->
    <div class="section">
      <h3>4. 条件渲染组合</h3>
      <button @click="showModal = !showModal">
        {{ showModal ? '隐藏' : '显示' }}模态框
      </button>
      
      <teleport to="body">
        <div v-if="showModal" class="modal-overlay" @click="showModal = false">
          <div class="modal" @click.stop>
            <h4>模态框组件</h4>
            <p>这是通过teleport渲染到body的模态框</p>
            <button @click="showModal = false">关闭</button>
          </div>
        </div>
      </teleport>
    </div>
    
    <!-- 5. 列表渲染 -->
    <div class="section">
      <h3>5. 列表组件组合</h3>
      <transition-group name="list" tag="div" class="item-list">
        <ItemComponent
          v-for="item in items"
          :key="item.id"
          :item="item"
          @remove="removeItem"
        />
      </transition-group>
      <button @click="addItem">添加项目</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, provide, onMounted } from 'vue'

// 导入子组件
import ChildComponent from './ChildComponent.vue'
import SlotDemo from './SlotDemo.vue'
import ItemComponent from './ItemComponent.vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'

// 1. 响应式数据
const parentMessage = ref('来自父组件的消息')
const count = ref(0)
const currentTab = ref('TabA')
const showModal = ref(false)

// 2. 复杂数据结构
const items = reactive([
  { id: 1, name: '项目1', value: 100 },
  { id: 2, name: '项目2', value: 200 },
  { id: 3, name: '项目3', value: 300 }
])

const tabs = ['TabA', 'TabB']
const dynamicData = reactive({
  content: '动态组件数据',
  timestamp: Date.now()
})

// 3. 计算属性
const totalValue = computed(() => 
  items.reduce((sum, item) => sum + item.value, 0)
)

// 4. 依赖注入
provide('globalData', {
  theme: 'dark',
  api: '/api/v1'
})

// 5. 事件处理
const handleIncrement = () => {
  count.value++
}

const handleCustomEvent = (data) => {
  console.log('收到自定义事件:', data)
  parentMessage.value = `更新消息: ${data}`
}

const addItem = () => {
  const newId = Math.max(...items.map(i => i.id)) + 1
  items.push({
    id: newId,
    name: `项目${newId}`,
    value: Math.floor(Math.random() * 1000)
  })
}

const removeItem = (id) => {
  const index = items.findIndex(item => item.id === id)
  if (index > -1) {
    items.splice(index, 1)
  }
}

// 6. 生命周期
onMounted(() => {
  console.log('CompositionDemo组件已挂载')
  console.log('当前组件实例的渲染函数执行完成')
})
</script>

<style scoped>
.composition-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.tabs {
  margin-bottom: 20px;
}

.tabs button {
  padding: 8px 16px;
  margin-right: 8px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.tabs button.active {
  background: #409eff;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.item-list {
  min-height: 100px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.custom-item {
  padding: 8px;
  margin: 4px 0;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
