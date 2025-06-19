<template>
  <!-- 按钮组容器，使用BEM命名规范的CSS类 -->
  <div :class="ns.b('group')">
    <!-- 插槽：放置按钮组内的按钮 -->
    <slot />
  </div>
</template>

<script lang="ts" setup>
// 导入Vue组合式API函数
import { provide, reactive, toRef } from 'vue'
// 导入命名空间hook，用于生成CSS类名
import { useNamespace } from '@element-plus/hooks'
// 导入按钮组属性定义
import { buttonGroupProps } from './button-group'
// 导入按钮组上下文key
import { buttonGroupContextKey } from './constants'

// 定义组件选项，设置组件名称
defineOptions({
  name: 'ElButtonGroup',
})

// 定义组件props
const props = defineProps(buttonGroupProps)

/**
 * 向子组件提供按钮组上下文
 * 子按钮可以通过inject获取这些数据，实现统一的样式控制
 * 使用reactive确保数据的响应性
 */
provide(
  buttonGroupContextKey,
  reactive({
    // 将props.size转换为响应式引用，子按钮可以获取到统一的尺寸设置
    size: toRef(props, 'size'),
    // 将props.type转换为响应式引用，子按钮可以获取到统一的类型设置
    type: toRef(props, 'type'),
  })
)

// 获取命名空间，用于生成CSS类名
const ns = useNamespace('button')
</script>
