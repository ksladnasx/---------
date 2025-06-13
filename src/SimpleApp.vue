<template>
  <div style="background-color: red; color: white; padding: 50px; font-size: 24px;">
    <h1>测试应用</h1>
    <p>如果你看到这个红色背景，说明Vue应用正常工作！</p>
    <button @click="handleClick" style="padding: 10px; background: blue; color: white; border: none;">
      点击测试 ({{ count }})
    </button>
    <router-view style="margin-top: 20px; background: yellow; padding: 20px;" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const handleClick = () => {
  count.value++
  console.log('按钮被点击了', count.value)
}
</script>
