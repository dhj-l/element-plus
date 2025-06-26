<template>
  <!-- RadioButton 组件的根元素，使用 label 标签实现点击标签选中功能 -->
  <label
    :class="[
      ns.b('button'),
      ns.is('active', modelValue === actualValue),
      ns.is('disabled', disabled),
      ns.is('focus', focus),
      ns.bm('button', size),
    ]"
  >
    <!-- 原生 radio 输入框，隐藏但保持功能 -->
    <input
      ref="radioRef"
      v-model="modelValue"
      :class="ns.be('button', 'original-radio')"
      :value="actualValue"
      type="radio"
      :name="name || radioGroup?.name"
      :disabled="disabled"
      @focus="focus = true"
      @blur="focus = false"
      @click.stop
    />
    <!-- RadioButton 的按钮样式容器 -->
    <span
      :class="ns.be('button', 'inner')"
      :style="modelValue === actualValue ? activeStyle : {}"
      @keydown.stop
    >
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useNamespace } from '@element-plus/hooks'
import { useRadio } from './use-radio'
import { radioButtonProps } from './radio-button'

import type { CSSProperties } from 'vue'

// 定义组件名称
defineOptions({
  name: 'ElRadioButton',
})

// 定义组件属性
const props = defineProps(radioButtonProps)

// 获取命名空间
const ns = useNamespace('radio')
// 使用 Radio 组合式函数获取响应式数据和方法
const { radioRef, focus, size, disabled, modelValue, radioGroup, actualValue } =
  useRadio(props)

/**
 * 激活状态的样式
 * 当 RadioButton 被选中时应用的自定义样式
 * 包括背景色、边框色、阴影和文字颜色
 */
const activeStyle = computed<CSSProperties>(() => {
  return {
    backgroundColor: radioGroup?.fill || '',
    borderColor: radioGroup?.fill || '',
    boxShadow: radioGroup?.fill ? `-1px 0 0 0 ${radioGroup.fill}` : '',
    color: radioGroup?.textColor || '',
  }
})
</script>
