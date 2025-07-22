/**
 * 表单项相关的组合式函数
 *
 * 提供表单项的上下文获取和输入框 ID 管理功能
 * 主要用于表单控件组件中获取表单和表单项的上下文信息
 */
// Vue 3 核心功能
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  ref,
  toRef,
  watch,
} from 'vue'
// Element Plus 工具函数
import { useId } from '@element-plus/hooks/use-id'
// 表单相关常量
import { formContextKey, formItemContextKey } from '../constants'

// 类型导入
import type { ComputedRef, Ref, WatchStopHandle } from 'vue'
import type { FormItemContext } from '../types'

/**
 * 获取表单和表单项的上下文
 *
 * 通过依赖注入获取当前组件所在的表单和表单项上下文
 * 用于表单控件组件中访问表单的配置和表单项的状态
 *
 * @returns 包含表单和表单项上下文的对象
 * @example
 * ```ts
 * const { form, formItem } = useFormItem()
 *
 * // 访问表单配置
 * const formSize = form?.size
 * const formDisabled = form?.disabled
 *
 * // 访问表单项状态
 * const validateState = formItem?.validateState
 * const validateMessage = formItem?.validateMessage
 * ```
 */
export const useFormItem = () => {
  // 注入表单上下文
  const form = inject(formContextKey, undefined)
  // 注入表单项上下文
  const formItem = inject(formItemContextKey, undefined)
  return {
    form,
    formItem,
  }
}

/**
 * 表单项输入框通用属性类型
 *
 * 定义了表单控件组件的通用属性接口
 */
export type IUseFormItemInputCommonProps = {
  /** 输入框的 ID */
  id?: string
  /** 输入框的标签 */
  label?: string | number | boolean | Record<string, any>
  /** 输入框的无障碍标签 */
  ariaLabel?: string | number | boolean | Record<string, any>
}

/**
 * 管理表单项输入框的 ID
 *
 * 自动生成和管理输入框的 ID，处理与表单项的关联关系
 * 确保输入框与表单项标签的正确关联，支持无障碍访问
 *
 * @param props 组件属性，包含 id、label、ariaLabel 等
 * @param options 配置选项
 * @param options.formItemContext 表单项上下文
 * @param options.disableIdGeneration 是否禁用 ID 自动生成
 * @param options.disableIdManagement 是否禁用 ID 管理
 * @returns 包含 isLabeledByFormItem 和 inputId 的对象
 *
 * @example
 * ```ts
 * const { isLabeledByFormItem, inputId } = useFormItemInputId(
 *   props,
 *   { formItemContext }
 * )
 *
 * // 在模板中使用
 * <input :id="inputId" :aria-labelledby="isLabeledByFormItem ? formItemContext?.labelId : undefined" />
 * ```
 */
export const useFormItemInputId = (
  props: Partial<IUseFormItemInputCommonProps>,
  {
    formItemContext,
    disableIdGeneration,
    disableIdManagement,
  }: {
    formItemContext?: FormItemContext
    disableIdGeneration?: ComputedRef<boolean> | Ref<boolean>
    disableIdManagement?: ComputedRef<boolean> | Ref<boolean>
  }
) => {
  // 设置默认值：如果未提供禁用选项，则默认启用 ID 生成和管理
  if (!disableIdGeneration) {
    disableIdGeneration = ref<boolean>(false)
  }
  if (!disableIdManagement) {
    disableIdManagement = ref<boolean>(false)
  }
  // 输入框的 ID
  const inputId = ref<string>()
  // ID 监听器的停止函数
  let idUnwatch: WatchStopHandle | undefined = undefined
  /**
   * 判断输入框是否应该由表单项标签进行标记
   *
   * 当满足以下条件时返回 true：
   * 1. 组件本身没有 label 或 ariaLabel 属性
   * 2. 存在表单项上下文
   * 3. 表单项的输入框 ID 数组存在且长度不超过 1
   *
   * 这用于无障碍访问，确定是否需要使用表单项的标签来标记输入框
   */
  const isLabeledByFormItem = computed<boolean>(() => {
    return !!(
      !(props.label || props.ariaLabel) &&
      formItemContext &&
      formItemContext.inputIds &&
      formItemContext.inputIds?.length <= 1
    )
  })
  // 组件挂载时设置 ID 监听器
  onMounted(() => {
    // 监听 props.id 和 disableIdGeneration 的变化
    idUnwatch = watch(
      [toRef(props, 'id'), disableIdGeneration] as any,
      ([id, disableIdGeneration]: [string, boolean]) => {
        // 如果没有提供 ID 且未禁用 ID 生成，则自动生成一个唯一 ID
        const newId = id ?? (!disableIdGeneration ? useId().value : undefined)
        // 如果 ID 发生变化，更新输入框 ID 并管理表单项的 ID 列表
        if (newId !== inputId.value) {
          if (formItemContext?.removeInputId) {
            // 移除旧的 ID
            inputId.value && formItemContext.removeInputId(inputId.value)
            // 如果未禁用 ID 管理且有新 ID，则添加到表单项的 ID 列表中
            if (!disableIdManagement?.value && !disableIdGeneration && newId) {
              formItemContext.addInputId(newId)
            }
          }
          // 更新当前输入框 ID
          inputId.value = newId
        }
      },
      { immediate: true } // 立即执行一次
    )
  })

  // 组件卸载时清理资源
  onUnmounted(() => {
    // 停止 ID 监听器
    idUnwatch && idUnwatch()
    // 从表单项的 ID 列表中移除当前输入框 ID
    if (formItemContext?.removeInputId) {
      inputId.value && formItemContext.removeInputId(inputId.value)
    }
  })

  return {
    /** 是否应该由表单项标签进行标记 */
    isLabeledByFormItem,
    /** 输入框的 ID */
    inputId,
  }
}
