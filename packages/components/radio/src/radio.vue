<template>
  <!-- 
    Radio 组件的根元素，使用 label 标签实现点击标签选中功能
    label 标签的优势：点击标签文本也能触发 radio 选中
  -->
  <label
    :class="[
      ns.b(), // 基础样式类名，例如：'el-radio'
      ns.is('disabled', disabled), // 禁用状态样式，例如：'is-disabled'
      ns.is('focus', focus), // 聚焦状态样式，例如：'is-focus'
      ns.is('bordered', border), // 边框样式，例如：'is-bordered'
      ns.is('checked', modelValue === actualValue), // 选中状态样式，例如：'is-checked'
      ns.m(size), // 尺寸修饰符样式，例如：'el-radio--large'
    ]"
  >
    <!-- 
      Radio 输入框容器
      包含原生 input 和自定义样式的圆圈
    -->
    <span
      :class="[
        ns.e('input'), // 输入框容器样式，例如：'el-radio__input'
        ns.is('disabled', disabled), // 禁用状态样式
        ns.is('checked', modelValue === actualValue), // 选中状态样式
      ]"
    >
      <!-- 
        原生 radio 输入框
        通过 CSS 隐藏，但保留功能性（键盘导航、屏幕阅读器支持）
      -->
      <input
        ref="radioRef"
        v-model="modelValue"
        :class="ns.e('original')"
        :value="actualValue"
        :name="name || radioGroup?.name"
        :disabled="disabled"
        :checked="modelValue === actualValue"
        type="radio"
        @focus="focus = true"
        @blur="focus = false"
        @change="handleChange"
        @click.stop
      />
      <!-- 
        Radio 的视觉样式圆圈
        用于替代原生 radio 的默认样式，提供自定义的视觉效果
      -->
      <span :class="ns.e('inner')" />
      <!-- 内圆样式，例如：'el-radio__inner' -->
    </span>
    <!-- 
      Radio 的标签文本容器
      支持插槽内容或 label 属性文本
    -->
    <span :class="ns.e('label')" @keydown.stop>
      <!-- 标签样式，例如：'el-radio__label'，阻止键盘事件冒泡 -->
      <slot>
        <!-- 插槽：允许自定义标签内容 -->
        {{ label }}
        <!-- 默认内容：显示 label 属性的值 -->
      </slot>
    </span>
  </label>
</template>

<script lang="ts" setup>
// 从 Vue 核心库导入 nextTick 函数，用于在 DOM 更新后执行回调
import { nextTick } from 'vue'
// 从 Element Plus hooks 导入命名空间工具，用于生成 BEM 规范的 CSS 类名
import { useNamespace } from '@element-plus/hooks'
// 从 Element Plus 常量库导入变更事件常量，确保事件名称的一致性
import { CHANGE_EVENT } from '@element-plus/constants'
// 从当前目录导入 radio 组件的属性定义和事件定义
import { radioEmits, radioProps } from './radio'
// 从当前目录导入 radio 组合式函数，封装了 radio 的核心逻辑
import { useRadio } from './use-radio'

/**
 * 定义组件选项
 * name: 组件名称，用于 Vue DevTools 调试和组件识别
 */
defineOptions({
  name: 'ElRadio', // 组件名称，遵循 Element Plus 命名规范
})

/**
 * 定义组件属性
 * 使用 radioProps 对象定义所有可接受的 props
 * 包括：modelValue, size, disabled, label, value, name, border 等
 */
const props = defineProps(radioProps)

/**
 * 定义组件事件
 * 使用 radioEmits 对象定义所有可触发的事件
 * 包括：update:modelValue, change 等
 */
const emit = defineEmits(radioEmits)

/**
 * 获取命名空间工具
 * 用于生成符合 BEM 规范的 CSS 类名
 * 例如：ns.b() -> 'el-radio', ns.e('input') -> 'el-radio__input'
 */
const ns = useNamespace('radio')

/**
 * 使用 Radio 组合式函数获取响应式数据和方法
 * 解构获取：
 * - radioRef: radio 输入框的模板引用
 * - radioGroup: 父级 radio-group 组件的上下文（如果存在）
 * - focus: 聚焦状态的响应式引用
 * - size: 组件尺寸（继承自 radio-group 或使用自身的 size）
 * - disabled: 禁用状态（继承自 radio-group 或使用自身的 disabled）
 * - modelValue: 当前选中值的响应式引用
 * - actualValue: 当前 radio 的实际值（label 或 value）
 */
const { radioRef, radioGroup, focus, size, disabled, modelValue, actualValue } =
  useRadio(props, emit)

/**
 * 处理 Radio 值变更事件
 * 当用户点击或通过键盘选择 radio 时触发
 *
 * 使用 nextTick 的原因：
 * 1. 确保 DOM 更新完成后再触发 change 事件
 * 2. 保证事件触发时，modelValue 已经是最新值
 * 3. 避免在 DOM 更新过程中触发事件可能导致的问题
 *
 * 示例：当用户从 radio A 切换到 radio B 时
 * 1. modelValue 更新为 B 的值
 * 2. DOM 重新渲染，A 取消选中，B 被选中
 * 3. nextTick 回调执行，触发 change 事件，传递 B 的值
 */
function handleChange() {
  nextTick(() => emit(CHANGE_EVENT, modelValue.value)) // 在下一个 tick 触发 change 事件，传递当前选中的值
}
</script>
