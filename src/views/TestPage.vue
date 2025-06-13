<template>
  <div style="background-color: green; color: white; padding: 30px; margin: 20px;">
    <h1 style="font-size: 36px;">🎉 测试页面正常工作！</h1>
    <p style="font-size: 18px;">当前时间: {{ new Date().toLocaleString() }}</p>
    
    <div style="margin: 20px 0;">
      <button @click="count++" style="padding: 15px 30px; background: blue; color: white; border: none; font-size: 16px;">
        点击计数: {{ count }}
      </button>
    </div>
    
    <div style="margin: 20px 0;">
      <h3>测试API连接</h3>
      <button @click="testAPI" style="padding: 10px 20px; background: orange; color: white; border: none;">
        测试后端API
      </button>
      <p v-if="apiResult" style="margin-top: 10px; font-size: 16px;">{{ apiResult }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const apiResult = ref('')

const testAPI = async () => {
  try {
    const response = await fetch('/api/accounts')
    const data = await response.json()
    apiResult.value = `成功获取 ${data.length} 个账户`
  } catch (error) {
    apiResult.value = `错误: ${error.message}`
  }
}
</script>
