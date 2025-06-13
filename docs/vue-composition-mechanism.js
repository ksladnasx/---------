// Vue组件组合渲染机制示例

/**
 * 1. 组件定义和注册
 * Vue组件本质上是一个包含模板、逻辑和样式的对象
 */

// 父组件定义
const ParentComponent = {
  template: `
    <div class="parent">
      <h1>{{ title }}</h1>
      <!-- 子组件使用 -->
      <child-component 
        :data="childData" 
        @event="handleChildEvent"
      />
      <!-- 插槽内容 -->
      <slot-component>
        <template #header>
          <h2>插槽标题</h2>
        </template>
      </slot-component>
    </div>
  `,
  data() {
    return {
      title: '父组件',
      childData: { message: 'Hello from parent' }
    }
  },
  methods: {
    handleChildEvent(data) {
      console.log('收到子组件事件:', data)
    }
  },
  // 注册子组件
  components: {
    ChildComponent,
    SlotComponent
  }
}

/**
 * 2. Virtual DOM树构建
 * Vue会将模板编译成render函数，生成Virtual DOM
 */

// 编译后的render函数（简化版）
function render() {
  return h('div', { class: 'parent' }, [
    h('h1', this.title),
    h(ChildComponent, {
      props: { data: this.childData },
      on: { event: this.handleChildEvent }
    }),
    h(SlotComponent, {
      slots: {
        header: () => h('h2', '插槽标题')
      }
    })
  ])
}

/**
 * 3. 组件实例化和组合
 * Vue会递归地实例化组件树
 */

class ComponentInstance {
  constructor(component, props, parent) {
    this.component = component
    this.props = props
    this.parent = parent
    this.children = []
    this.vnode = null
    this.el = null
  }
  
  // 渲染组件
  render() {
    // 1. 执行组件的render函数
    this.vnode = this.component.render.call(this)
    
    // 2. 处理子组件
    this.processChildren(this.vnode)
    
    // 3. 生成真实DOM
    this.el = this.createDOM(this.vnode)
    
    return this.el
  }
  
  // 处理子组件
  processChildren(vnode) {
    if (vnode.children) {
      vnode.children.forEach(child => {
        if (child.component) {
          // 创建子组件实例
          const childInstance = new ComponentInstance(
            child.component, 
            child.props, 
            this
          )
          this.children.push(childInstance)
          // 递归渲染子组件
          child.el = childInstance.render()
        }
      })
    }
  }
}
