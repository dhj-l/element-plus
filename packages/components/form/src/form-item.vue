<!-- 
  Element Plus FormItem 表单项组件
  用于包装表单控件，提供标签、验证和布局功能
-->
<template>
  <!-- 表单项容器 -->
  <div
    ref="formItemRef"
    :class="formItemClasses"
    :role="isGroup ? 'group' : undefined"
    :aria-labelledby="isGroup ? labelId : undefined"
  >
    <!-- 标签包装器，处理自动宽度和响应式布局 -->
    <form-label-wrap
      :is-auto-width="labelStyle.width === 'auto'"
      :update-all="formContext?.labelWidth === 'auto'"
    >
      <!-- 动态标签组件，根据是否有关联输入框决定使用 label 或 div -->
      <component
        :is="labelFor ? 'label' : 'div'"
        v-if="hasLabel"
        :id="labelId"
        :for="labelFor"
        :class="ns.e('label')"
        :style="labelStyle"
      >
        <!-- 标签内容插槽，支持自定义标签显示 -->
        <slot name="label" :label="currentLabel">
          {{ currentLabel }}
        </slot>
      </component>
    </form-label-wrap>

    <!-- 表单项内容区域 -->
    <div :class="ns.e('content')" :style="contentStyle">
      <!-- 表单控件插槽 -->
      <slot />
      <!-- 错误信息过渡动画组 -->
      <transition-group :name="`${ns.namespace.value}-zoom-in-top`">
        <!-- 错误信息插槽，支持自定义错误显示 -->
        <slot v-if="shouldShowError" name="error" :error="validateMessage">
          <div :class="validateClasses">
            {{ validateMessage }}
          </div>
        </slot>
      </transition-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Vue 3 核心功能导入
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  toRefs,
  useSlots,
  watch,
} from 'vue'
// 第三方库导入
import AsyncValidator from 'async-validator'
import { clone } from 'lodash-unified'
import { refDebounced } from '@vueuse/core'
// Element Plus 工具函数
import {
  addUnit,
  ensureArray,
  getProp,
  isArray,
  isBoolean,
  isFunction,
} from '@element-plus/utils'
// Element Plus 钩子函数
import { useId, useNamespace } from '@element-plus/hooks'
// 表单相关导入
import { useFormSize } from './hooks'
import { formItemProps } from './form-item'
import FormLabelWrap from './form-label-wrap'
import { formContextKey, formItemContextKey } from './constants'

// 类型导入
import type { CSSProperties } from 'vue'
import type { RuleItem } from 'async-validator'
import type { Arrayable } from '@element-plus/utils'
import type {
  FormItemContext,
  FormItemRule,
  FormValidateFailure,
} from './types'
import type { FormItemValidateState } from './form-item'

// 定义组件选项
defineOptions({
  name: 'ElFormItem',
})
// 定义组件属性
const props = defineProps(formItemProps)
// 获取插槽
const slots = useSlots()

// 注入表单上下文
const formContext = inject(formContextKey, undefined)
// 注入父级表单项上下文（用于嵌套表单项）
const parentFormItemContext = inject(formItemContextKey, undefined)

// 获取表单项尺寸
const _size = useFormSize(undefined, { formItem: false })
// 获取命名空间
const ns = useNamespace('form-item')

// 生成唯一的标签ID
const labelId = useId().value
// 关联的输入框ID数组
const inputIds = ref<string[]>([])

// 验证状态
const validateState = ref<FormItemValidateState>('')
// 防抖的验证状态，避免频繁更新
const validateStateDebounced = refDebounced(validateState, 100)
// 验证错误信息
const validateMessage = ref('')
// 表单项DOM引用
const formItemRef = ref<HTMLDivElement>()
// 字段初始值，用于重置
let initialValue: any = undefined
// 是否正在重置字段标志
let isResettingField = false

// 计算标签位置，优先使用组件自身的设置
const labelPosition = computed(
  () => props.labelPosition || formContext?.labelPosition
)

// 计算标签样式
const labelStyle = computed<CSSProperties>(() => {
  // 顶部标签不需要设置宽度
  if (labelPosition.value === 'top') {
    return {}
  }

  const labelWidth = addUnit(props.labelWidth || formContext?.labelWidth || '')
  if (labelWidth) return { width: labelWidth }
  return {}
})

// 计算内容区域样式
const contentStyle = computed<CSSProperties>(() => {
  // 顶部标签或行内表单不需要左边距
  if (labelPosition.value === 'top' || formContext?.inline) {
    return {}
  }
  // 嵌套表单项且无标签和标签宽度时不设置样式
  if (!props.label && !props.labelWidth && isNested) {
    return {}
  }
  const labelWidth = addUnit(props.labelWidth || formContext?.labelWidth || '')
  // 无标签时设置左边距以对齐其他有标签的表单项
  if (!props.label && !slots.label) {
    return { marginLeft: labelWidth }
  }
  return {}
})

// 计算表单项的CSS类名
const formItemClasses = computed(() => [
  ns.b(), // 基础类名
  ns.m(_size.value), // 尺寸修饰符
  ns.is('error', validateState.value === 'error'), // 错误状态
  ns.is('validating', validateState.value === 'validating'), // 验证中状态
  ns.is('success', validateState.value === 'success'), // 成功状态
  ns.is('required', isRequired.value || props.required), // 必填状态
  ns.is('no-asterisk', formContext?.hideRequiredAsterisk), // 隐藏星号
  // 星号位置
  formContext?.requireAsteriskPosition === 'right'
    ? 'asterisk-right'
    : 'asterisk-left',
  {
    [ns.m('feedback')]: formContext?.statusIcon, // 状态图标反馈
    [ns.m(`label-${labelPosition.value}`)]: labelPosition.value, // 标签位置
  },
])

// 计算是否使用行内错误信息显示
const _inlineMessage = computed(() =>
  isBoolean(props.inlineMessage)
    ? props.inlineMessage
    : formContext?.inlineMessage || false
)

// 计算验证错误信息的CSS类名
const validateClasses = computed(() => [
  ns.e('error'), // 错误基础类名
  { [ns.em('error', 'inline')]: _inlineMessage.value }, // 行内错误样式
])

// 计算属性路径字符串
const propString = computed(() => {
  if (!props.prop) return ''
  return isArray(props.prop) ? props.prop.join('.') : props.prop
})

// 计算是否有标签
const hasLabel = computed<boolean>(() => {
  return !!(props.label || slots.label)
})

// 计算标签关联的表单控件ID
const labelFor = computed<string | undefined>(() => {
  return (
    props.for ?? (inputIds.value.length === 1 ? inputIds.value[0] : undefined)
  )
})

// 计算是否为表单组（有标签但无关联控件）
const isGroup = computed<boolean>(() => {
  return !labelFor.value && hasLabel.value
})

// 是否为嵌套表单项
const isNested = !!parentFormItemContext

// 计算字段值
const fieldValue = computed(() => {
  const model = formContext?.model
  if (!model || !props.prop) {
    return
  }
  return getProp(model, props.prop).value
})

// 计算标准化的验证规则
const normalizedRules = computed(() => {
  const { required } = props

  const rules: FormItemRule[] = []

  // 添加组件自身的验证规则
  if (props.rules) {
    rules.push(...ensureArray(props.rules))
  }

  // 添加表单级别的验证规则
  const formRules = formContext?.rules
  if (formRules && props.prop) {
    const _rules = getProp<Arrayable<FormItemRule> | undefined>(
      formRules,
      props.prop
    ).value
    if (_rules) {
      rules.push(...ensureArray(_rules))
    }
  }

  // 处理必填属性
  if (required !== undefined) {
    const requiredRules = rules
      .map((rule, i) => [rule, i] as const)
      .filter(([rule]) => Object.keys(rule).includes('required'))

    if (requiredRules.length > 0) {
      // 更新现有的必填规则
      for (const [rule, i] of requiredRules) {
        if (rule.required === required) continue
        rules[i] = { ...rule, required }
      }
    } else {
      // 添加新的必填规则
      rules.push({ required })
    }
  }

  return rules
})

// 计算是否启用验证
const validateEnabled = computed(() => normalizedRules.value.length > 0)

/**
 * 根据触发器过滤验证规则
 * @param trigger 触发器类型（如 'blur', 'change'）
 * @returns 过滤后的验证规则数组
 */
const getFilteredRule = (trigger: string) => {
  const rules = normalizedRules.value
  return (
    rules
      .filter((rule) => {
        // 如果规则没有指定触发器或传入的触发器为空，则包含该规则
        if (!rule.trigger || !trigger) return true
        if (isArray(rule.trigger)) {
          return rule.trigger.includes(trigger)
        } else {
          return rule.trigger === trigger
        }
      })
      // 排除触发器属性，只保留验证规则
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ trigger, ...rule }): RuleItem => rule)
  )
}

// 计算是否为必填字段
const isRequired = computed(() =>
  normalizedRules.value.some((rule) => rule.required)
)

// 计算是否应该显示错误信息
const shouldShowError = computed(
  () =>
    validateStateDebounced.value === 'error' &&
    props.showMessage &&
    (formContext?.showMessage ?? true)
)

// 计算当前显示的标签文本
const currentLabel = computed(
  () => `${props.label || ''}${formContext?.labelSuffix || ''}`
)

/**
 * 设置验证状态
 * @param state 验证状态
 */
const setValidationState = (state: FormItemValidateState) => {
  validateState.value = state
}

/**
 * 验证失败时的处理函数
 * @param error 验证错误信息
 */
const onValidationFailed = (error: FormValidateFailure) => {
  const { errors, fields } = error
  if (!errors || !fields) {
    console.error(error)
  }

  setValidationState('error')
  validateMessage.value = errors
    ? errors?.[0]?.message ?? `${props.prop} is required`
    : ''

  // 向表单组件发送验证失败事件
  formContext?.emit('validate', props.prop!, false, validateMessage.value)
}

/**
 * 验证成功时的处理函数
 */
const onValidationSucceeded = () => {
  setValidationState('success')
  // 向表单组件发送验证成功事件
  formContext?.emit('validate', props.prop!, true, '')
}

/**
 * 执行验证逻辑
 * @param rules 验证规则数组
 * @returns Promise<true> 验证结果
 */
const doValidate = async (rules: RuleItem[]): Promise<true> => {
  const modelName = propString.value
  // 创建验证器实例
  const validator = new AsyncValidator({
    [modelName]: rules,
  })
  return validator
    .validate({ [modelName]: fieldValue.value }, { firstFields: true })
    .then(() => {
      onValidationSucceeded()
      return true as const
    })
    .catch((err: FormValidateFailure) => {
      onValidationFailed(err)
      return Promise.reject(err)
    })
}

/**
 * 验证表单项
 * @param trigger 触发器类型
 * @param callback 验证完成后的回调函数
 * @returns Promise 验证结果
 */
const validate: FormItemContext['validate'] = async (trigger, callback) => {
  // 如果正在重置字段或没有属性名，跳过验证
  if (isResettingField || !props.prop) {
    return false
  }

  const hasCallback = isFunction(callback)
  // 如果未启用验证，直接返回false
  if (!validateEnabled.value) {
    callback?.(false)
    return false
  }

  // 获取符合触发条件的验证规则
  const rules = getFilteredRule(trigger)
  if (rules.length === 0) {
    callback?.(true)
    return true
  }

  // 设置验证状态为验证中
  setValidationState('validating')

  return doValidate(rules)
    .then(() => {
      callback?.(true)
      return true as const
    })
    .catch((err: FormValidateFailure) => {
      const { fields } = err
      callback?.(false, fields)
      return hasCallback ? false : Promise.reject(fields)
    })
}

/**
 * 清除验证状态和错误信息
 */
const clearValidate: FormItemContext['clearValidate'] = () => {
  setValidationState('')
  validateMessage.value = ''
  isResettingField = false
}

/**
 * 重置字段值到初始状态
 */
const resetField: FormItemContext['resetField'] = async () => {
  const model = formContext?.model
  if (!model || !props.prop) return

  const computedValue = getProp(model, props.prop)

  // 防止重置时触发验证
  isResettingField = true

  computedValue.value = clone(initialValue)

  await nextTick()
  clearValidate()

  isResettingField = false
}

/**
 * 添加输入框ID到数组中
 * @param id 输入框ID
 */
const addInputId: FormItemContext['addInputId'] = (id: string) => {
  if (!inputIds.value.includes(id)) {
    inputIds.value.push(id)
  }
}

/**
 * 从数组中移除输入框ID
 * @param id 输入框ID
 */
const removeInputId: FormItemContext['removeInputId'] = (id: string) => {
  inputIds.value = inputIds.value.filter((listId) => listId !== id)
}

// 监听错误信息属性变化
watch(
  () => props.error,
  (val) => {
    validateMessage.value = val || ''
    setValidationState(val ? 'error' : '')
  },
  { immediate: true }
)

// 监听验证状态属性变化
watch(
  () => props.validateStatus,
  (val) => setValidationState(val || '')
)

// 创建表单项上下文对象
const context: FormItemContext = reactive({
  ...toRefs(props),
  $el: formItemRef,
  size: _size,
  validateMessage,
  validateState,
  labelId,
  inputIds,
  isGroup,
  hasLabel,
  fieldValue,
  addInputId,
  removeInputId,
  resetField,
  clearValidate,
  validate,
  propString,
})

// 向子组件提供表单项上下文
provide(formItemContextKey, context)

// 组件挂载时的初始化
onMounted(() => {
  if (props.prop) {
    // 将当前表单项添加到表单的字段列表
    formContext?.addField(context)
    // 保存初始值用于重置
    initialValue = clone(fieldValue.value)
  }
})

// 组件卸载时的清理
onBeforeUnmount(() => {
  // 从表单的字段列表中移除当前表单项
  formContext?.removeField(context)
})

// 暴露给父组件的公共API
defineExpose({
  /**
   * @description 表单项尺寸
   */
  size: _size,
  /**
   * @description 验证错误信息
   */
  validateMessage,
  /**
   * @description 验证状态
   */
  validateState,
  /**
   * @description 验证表单项
   */
  validate,
  /**
   * @description 清除验证状态
   */
  clearValidate,
  /**
   * @description 重置字段值并清除验证结果
   */
  resetField,
})
</script>
