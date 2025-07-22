/**
 * Element Plus Form 表单通用属性 Hooks
 *
 * 本文件提供了表单组件中常用的属性管理 hooks，包括：
 * - 尺寸管理（useFormSize）
 * - 禁用状态管理（useFormDisabled）
 *
 * 这些 hooks 实现了属性的优先级继承机制：
 * 组件属性 > 回退值 > 表单项 > 表单 > 全局配置 > 默认值
 */

// Vue 3 核心功能
import { computed, inject, ref, unref } from 'vue'
// Element Plus 全局尺寸 Hook
import { useGlobalSize } from '@element-plus/hooks/use-size'
// Element Plus 属性 Hook
import { useProp } from '@element-plus/hooks/use-prop'
// 表单上下文注入键
import { formContextKey, formItemContextKey } from '../constants'

// Element Plus 常量类型
import type { ComponentSize } from '@element-plus/constants'
// VueUse 工具类型
import type { MaybeRef } from '@vueuse/core'

/**
 * 表单尺寸管理 Hook
 *
 * 按优先级顺序获取组件尺寸，实现尺寸的层级继承
 * 优先级：组件属性 > 回退值 > 表单项 > 表单 > 全局配置 > 默认值
 *
 * @param fallback 回退尺寸值
 * @param ignore 忽略特定来源的配置对象
 * @returns 计算后的组件尺寸
 *
 * @example
 * ```vue
 * <script setup>
 * // 基础用法
 * const size = useFormSize()
 *
 * // 指定回退值
 * const sizeWithFallback = useFormSize('large')
 *
 * // 忽略表单级别的尺寸设置
 * const sizeIgnoreForm = useFormSize(undefined, { form: true })
 *
 * // 忽略多个来源
 * const sizeCustom = useFormSize('default', {
 *   form: true,
 *   global: true
 * })
 * </script>
 * ```
 */
export const useFormSize = (
  fallback?: MaybeRef<ComponentSize | undefined>,
  ignore: Partial<Record<'prop' | 'form' | 'formItem' | 'global', boolean>> = {}
) => {
  // 空引用，用于忽略特定来源
  const emptyRef = ref(undefined)

  // 获取各个来源的尺寸值
  const size = ignore.prop ? emptyRef : useProp<ComponentSize>('size')
  const globalConfig = ignore.global ? emptyRef : useGlobalSize()
  const form = ignore.form
    ? { size: undefined }
    : inject(formContextKey, undefined)
  const formItem = ignore.formItem
    ? { size: undefined }
    : inject(formItemContextKey, undefined)

  // 按优先级返回尺寸值
  return computed(
    (): ComponentSize =>
      size.value || // 组件自身的 size 属性
      unref(fallback) || // 指定的回退值
      formItem?.size || // 表单项的 size
      form?.size || // 表单的 size
      globalConfig.value || // 全局配置的 size
      '' // 默认值（空字符串表示 default）
  )
}

/**
 * 表单禁用状态管理 Hook
 *
 * 按优先级顺序获取组件禁用状态，实现禁用状态的层级继承
 * 优先级：组件属性 > 回退值 > 表单 > 默认值（false）
 *
 * @param fallback 回退禁用状态值
 * @returns 计算后的禁用状态
 *
 * @example
 * ```vue
 * <script setup>
 * // 基础用法
 * const disabled = useFormDisabled()
 *
 * // 指定回退值
 * const disabledWithFallback = useFormDisabled(true)
 *
 * // 响应式回退值
 * const isLoading = ref(false)
 * const disabledWhenLoading = useFormDisabled(isLoading)
 * </script>
 * ```
 */
export const useFormDisabled = (fallback?: MaybeRef<boolean | undefined>) => {
  // 获取组件自身的 disabled 属性
  const disabled = useProp<boolean>('disabled')
  // 获取表单上下文
  const form = inject(formContextKey, undefined)

  // 按优先级返回禁用状态
  return computed(
    () =>
      disabled.value || // 组件自身的 disabled 属性
      unref(fallback) || // 指定的回退值
      form?.disabled || // 表单的 disabled 状态
      false // 默认值（不禁用）
  )
}

// ===== 向后兼容性导出 =====
// 这些导出用于防止破坏性变更，保持 API 的向后兼容性

/** @deprecated 请使用 useFormSize 替代 */
export const useSize = useFormSize

/** @deprecated 请使用 useFormDisabled 替代 */
export const useDisabled = useFormDisabled
