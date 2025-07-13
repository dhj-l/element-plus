<template>
  <!-- RadioGroup 组件的根容器 -->
  <div
    :id="groupId"
    ref="radioGroupRef"
    :class="ns.b('group')"
    role="radiogroup"
    :aria-label="!isLabeledByFormItem ? ariaLabel || 'radio-group' : undefined"
    :aria-labelledby="isLabeledByFormItem ? formItem!.labelId : undefined"
  >
    <!-- 插槽：用于放置 Radio 或 RadioButton 组件 -->
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue'
import { useFormItem, useFormItemInputId } from '@element-plus/components/form'
import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { useId, useNamespace } from '@element-plus/hooks'
import { debugWarn } from '@element-plus/utils'
import { radioGroupEmits, radioGroupProps } from './radio-group'
import { radioGroupKey } from './constants'

import type { RadioGroupProps } from './radio-group'

// 定义组件名称
defineOptions({
  name: 'ElRadioGroup',
})

// 定义组件属性
const props = defineProps(radioGroupProps)
// 定义组件事件
const emit = defineEmits(radioGroupEmits)

// 获取命名空间
const ns = useNamespace('radio')
// 生成唯一 ID
const radioId = useId()
// RadioGroup 容器的引用
const radioGroupRef = ref<HTMLDivElement>()
// 表单项相关功能
const { formItem } = useFormItem()
// 获取输入框 ID 和是否被表单项标记
const { inputId: groupId, isLabeledByFormItem } = useFormItemInputId(props, {
  formItemContext: formItem,
})

/**
 * 值变更事件处理函数
 * 先触发 update:modelValue 事件，然后在下一个 tick 触发 change 事件
 * @param value - 新的值
 */
const changeEvent = (value: RadioGroupProps['modelValue']) => {
  emit(UPDATE_MODEL_EVENT, value)
  nextTick(() => emit(CHANGE_EVENT, value))
}

// 组件挂载后的初始化逻辑
onMounted(() => {
  // 查找所有 radio 输入框
  const radios =
    radioGroupRef.value!.querySelectorAll<HTMLInputElement>('[type=radio]')
  const firstLabel = radios[0]
  // 如果没有选中的 radio 且存在第一个 radio，则设置其 tabIndex 为 0
  if (!Array.from(radios).some((radio) => radio.checked) && firstLabel) {
    firstLabel.tabIndex = 0
  }
})

/**
 * 计算 name 属性
 * 优先使用 props.name，否则使用生成的 radioId
 */
const name = computed(() => {
  return props.name || radioId.value
})

// 向子组件提供 RadioGroup 上下文
provide(
  radioGroupKey,
  reactive({
    ...toRefs(props),
    changeEvent,
    name,
  })
)

// 监听 modelValue 变化，触发表单验证
watch(
  () => props.modelValue,
  () => {
    if (props.validateEvent) {
      formItem?.validate('change').catch((err) => debugWarn(err))
    }
  }
)
</script>
