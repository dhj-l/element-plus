<template>
  <!-- 
    动态组件，根据tag属性渲染不同的HTML元素
    默认为button元素，也可以是a、div等其他元素
  -->
  <component
    :is="tag"
    ref="_ref"
    v-bind="_props"
    :class="buttonKls"
    :style="buttonStyle"
    @click="handleClick"
  >
    <!-- 加载状态显示 -->
    <template v-if="loading">
      <!-- 如果有自定义加载插槽，优先使用 -->
      <slot v-if="$slots.loading" name="loading" />
      <!-- 否则显示默认的加载图标 -->
      <el-icon v-else :class="ns.is('loading')">
        <component :is="loadingIcon" />
      </el-icon>
    </template>
    <!-- 非加载状态下的图标显示 -->
    <el-icon v-else-if="icon || $slots.icon">
      <!-- 如果传入了icon属性，显示对应图标 -->
      <component :is="icon" v-if="icon" />
      <!-- 否则显示icon插槽内容 -->
      <slot v-else name="icon" />
    </el-icon>
    <!-- 
      按钮文本内容
      当shouldAddSpace为true时，添加expand类用于在中文字符间插入空格
    -->
    <span
      v-if="$slots.default"
      :class="{ [ns.em('text', 'expand')]: shouldAddSpace }"
    >
      <slot />
    </span>
  </component>
</template>

<script lang="ts" setup>
// 导入Vue组合式API函数
import { computed } from 'vue'
// 导入图标组件
import { ElIcon } from '@element-plus/components/icon'
// 导入命名空间hook，用于创建BEM规范的CSS类名
import { useNamespace } from '@element-plus/hooks'
// 导入按钮逻辑hook
import { useButton } from './use-button'
// 导入按钮的事件定义和属性定义
import { buttonEmits, buttonProps } from './button'
// 导入按钮自定义样式hook
import { useButtonCustomStyle } from './button-custom'

// 定义组件选项
defineOptions({
  // 组件名称，用于Vue DevTools显示和调试
  name: 'ElButton',
})

// 定义组件props，基于buttonProps配置
const props = defineProps(buttonProps)
// 定义组件事件发射器
const emit = defineEmits(buttonEmits)

/**
 * 生成按钮的自定义样式
 * 主要用于处理自定义颜色的按钮样式
 * 例如：color="#ff0000" 时生成对应的hover、active等状态样式
 */
const buttonStyle = useButtonCustomStyle(props)
console.log(buttonStyle.value)

// 获取命名空间，用于生成CSS类名
const ns = useNamespace('button')

/**
 * 使用按钮逻辑hook，获取按钮相关的响应式数据和方法
 * 包括尺寸、类型、禁用状态、DOM引用、点击处理等
 */
const {
  _ref, // 按钮DOM元素引用
  _size, // 计算后的按钮尺寸
  _type, // 计算后的按钮类型
  _disabled, // 计算后的禁用状态
  _props, // 动态属性对象
  _plain, // 计算后的朴素样式状态
  _round, // 计算后的圆角状态
  shouldAddSpace, // 是否需要在中文字符间添加空格
  handleClick, // 点击事件处理函数
} = useButton(props, emit)

/**
 * 计算按钮的CSS类名数组
 * 使用BEM命名规范生成类名，包含各种状态和修饰符
 * 例如：['el-button', 'el-button--primary', 'el-button--large', 'is-disabled']
 */
const buttonKls = computed(() => [
  ns.b(), // 基础类名：el-button
  ns.m(_type.value), // 类型修饰符：el-button--primary
  ns.m(_size.value), // 尺寸修饰符：el-button--large
  ns.is('disabled', _disabled.value), // 禁用状态：is-disabled
  ns.is('loading', props.loading), // 加载状态：is-loading
  ns.is('plain', _plain.value), // 朴素样式：is-plain
  ns.is('round', _round.value), // 圆角样式：is-round
  ns.is('circle', props.circle), // 圆形样式：is-circle
  ns.is('text', props.text), // 文本样式：is-text
  ns.is('link', props.link), // 链接样式：is-link
  ns.is('has-bg', props.bg), // 背景样式：is-has-bg
])

/**
 * 暴露组件内部的数据和方法给父组件
 * 通过模板引用可以访问这些属性和方法
 * 例如：buttonRef.value.size 获取按钮尺寸
 */
defineExpose({
  /** 按钮的HTML元素引用 */
  ref: _ref,
  /** 按钮的尺寸 */
  size: _size,
  /** 按钮的类型 */
  type: _type,
  /** 按钮的禁用状态 */
  disabled: _disabled,
  /** 是否在中文字符间添加空格 */
  shouldAddSpace,
})
</script>
