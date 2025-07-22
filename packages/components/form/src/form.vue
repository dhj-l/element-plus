<!-- 
  Element Plus Form 表单组件
  用于数据录入、校验和提交的表单容器
-->
<template>
  <!-- 表单容器，绑定样式类和引用 -->
  <form ref="formRef" :class="formClasses">
    <!-- 表单内容插槽，用于放置表单项 -->
    <slot />
  </form>
</template>

<script lang="ts" setup>
// Vue 3 核心功能导入
import { computed, provide, reactive, ref, toRefs, watch } from 'vue'
// Element Plus 工具函数
import { debugWarn, isFunction } from '@element-plus/utils'
// Element Plus 钩子函数
import { useNamespace } from '@element-plus/hooks'
// 表单相关钩子和工具
import { useFormSize } from './hooks'
import { formContextKey } from './constants'
import { formEmits, formProps } from './form'
import { filterFields, useFormLabelWidth } from './utils'

// 类型导入
import type { ValidateFieldsError } from 'async-validator'
import type { Arrayable } from '@element-plus/utils'
import type {
  FormContext,
  FormItemContext,
  FormValidateCallback,
  FormValidationResult,
} from './types'
import type { FormItemProp } from './form-item'

// 组件名称常量
const COMPONENT_NAME = 'ElForm'
// 定义组件选项
defineOptions({
  name: COMPONENT_NAME,
})
// 定义组件属性
const props = defineProps(formProps)
// 定义组件事件
const emit = defineEmits(formEmits)

// 表单DOM引用
const formRef = ref<HTMLElement>()
// 表单项上下文数组，用于管理所有表单项
const fields = reactive<FormItemContext[]>([])

// 获取表单尺寸
const formSize = useFormSize()
// 获取命名空间，用于生成CSS类名
const ns = useNamespace('form')
// 计算表单的CSS类名
const formClasses = computed(() => {
  const { labelPosition, inline } = props
  return [
    ns.b(), // 基础类名
    ns.m(formSize.value || 'default'), // 尺寸修饰符
    {
      [ns.m(`label-${labelPosition}`)]: labelPosition, // 标签位置修饰符
      [ns.m('inline')]: inline, // 行内表单修饰符
    },
  ]
})

/**
 * 根据属性名获取表单项
 * @param prop 表单项属性名
 * @returns 表单项上下文
 */
const getField: FormContext['getField'] = (prop) => {
  return filterFields(fields, [prop])[0]
}

/**
 * 添加表单项到管理列表
 * @param field 表单项上下文
 */
const addField: FormContext['addField'] = (field) => {
  fields.push(field)
}

/**
 * 从管理列表中移除表单项
 * @param field 表单项上下文
 */
const removeField: FormContext['removeField'] = (field) => {
  if (field.prop) {
    fields.splice(fields.indexOf(field), 1)
  }
}

/**
 * 重置表单项的值和验证状态
 * @param properties 要重置的表单项属性名数组，为空则重置所有
 */
const resetFields: FormContext['resetFields'] = (properties = []) => {
  if (!props.model) {
    debugWarn(COMPONENT_NAME, 'model is required for resetFields to work.')
    return
  }
  // 过滤指定的表单项并重置
  filterFields(fields, properties).forEach((field) => field.resetField())
}

/**
 * 清除表单项的验证信息
 * @param props 要清除验证的表单项属性名数组，为空则清除所有
 */
const clearValidate: FormContext['clearValidate'] = (props = []) => {
  filterFields(fields, props).forEach((field) => field.clearValidate())
}

/**
 * 计算表单是否可验证
 * 需要有model属性才能进行验证
 */
const isValidatable = computed(() => {
  const hasModel = !!props.model
  if (!hasModel) {
    debugWarn(COMPONENT_NAME, 'model is required for validate to work.')
  }
  return hasModel
})

/**
 * 获取需要验证的表单项
 * @param props 表单项属性名数组
 * @returns 过滤后的表单项数组
 */
const obtainValidateFields = (props: Arrayable<FormItemProp>) => {
  if (fields.length === 0) return []

  const filteredFields = filterFields(fields, props)
  if (!filteredFields.length) {
    debugWarn(COMPONENT_NAME, 'please pass correct props!')
    return []
  }
  return filteredFields
}

/**
 * 验证整个表单
 * @param callback 验证完成后的回调函数
 * @returns 验证结果Promise
 */
const validate = async (
  callback?: FormValidateCallback
): FormValidationResult => validateField(undefined, callback)

/**
 * 执行表单项验证的核心逻辑
 * @param props 要验证的表单项属性名数组
 * @returns 验证是否通过
 */
const doValidateField = async (
  props: Arrayable<FormItemProp> = []
): Promise<boolean> => {
  if (!isValidatable.value) return false

  const fields = obtainValidateFields(props)
  if (fields.length === 0) return true

  let validationErrors: ValidateFieldsError = {}
  // 遍历所有表单项进行验证
  for (const field of fields) {
    try {
      await field.validate('')
      // 如果验证状态为错误，重置该字段
      if (field.validateState === 'error') field.resetField()
    } catch (fields) {
      // 收集验证错误信息
      validationErrors = {
        ...validationErrors,
        ...(fields as ValidateFieldsError),
      }
    }
  }

  if (Object.keys(validationErrors).length === 0) return true
  return Promise.reject(validationErrors)
}

/**
 * 验证指定的表单项
 * @param modelProps 要验证的表单项属性名数组
 * @param callback 验证完成后的回调函数
 * @returns 验证结果Promise
 */
const validateField: FormContext['validateField'] = async (
  modelProps = [],
  callback
) => {
  let result = false
  const shouldThrow = !isFunction(callback)
  try {
    result = await doValidateField(modelProps)
    // 当结果为false时，表示字段不可验证
    if (result === true) {
      await callback?.(result)
    }
    return result
  } catch (e) {
    if (e instanceof Error) throw e

    const invalidFields = e as ValidateFieldsError

    // 如果开启了滚动到错误项功能
    if (props.scrollToError) {
      // 表单项可能基于判断条件动态渲染，invalidFields中的顺序是不确定的
      // 因此，通过直接查找渲染的元素来确定第一个有错误的表单字段
      if (formRef.value) {
        const formItem = formRef.value!.querySelector(
          `.${ns.b()}-item.is-error`
        )
        formItem?.scrollIntoView(props.scrollIntoViewOptions)
      }
    }
    !result && (await callback?.(false, invalidFields))
    return shouldThrow && Promise.reject(invalidFields)
  }
}

/**
 * 滚动到指定的表单项
 * @param prop 表单项属性名
 */
const scrollToField = (prop: FormItemProp) => {
  const field = getField(prop)
  if (field) {
    field.$el?.scrollIntoView(props.scrollIntoViewOptions)
  }
}

// 监听验证规则变化
watch(
  () => props.rules,
  () => {
    // 如果开启了规则变化时验证，则重新验证表单
    if (props.validateOnRuleChange) {
      validate().catch((err) => debugWarn(err))
    }
  },
  { deep: true, flush: 'post' } // 深度监听，在DOM更新后执行
)

// 向子组件提供表单上下文
provide(
  formContextKey,
  reactive({
    ...toRefs(props), // 响应式的props
    emit, // 事件发射器

    // 表单操作方法
    resetFields,
    clearValidate,
    validateField,
    getField,
    addField,
    removeField,

    ...useFormLabelWidth(), // 标签宽度相关功能
  })
)

// 暴露组件的公共API
defineExpose({
  /**
   * 验证整个表单，接收回调函数或返回Promise
   */
  validate,
  /**
   * 验证指定的表单项
   */
  validateField,
  /**
   * 重置指定表单项并移除验证结果
   */
  resetFields,
  /**
   * 清除指定表单项的验证信息
   */
  clearValidate,
  /**
   * 滚动到指定的表单项
   */
  scrollToField,
  /**
   * 获取表单项上下文
   */
  getField,
  /**
   * 所有表单项上下文数组
   */
  fields,
})
</script>
