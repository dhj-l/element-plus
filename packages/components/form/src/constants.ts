/**
 * Element Plus Form 表单组件常量定义
 *
 * 本文件定义了表单组件中使用的依赖注入键（Injection Keys）
 * 这些键用于在组件树中传递表单和表单项的上下文信息
 */

// Vue 依赖注入类型
import type { InjectionKey } from 'vue'
// 表单上下文类型
import type { FormContext, FormItemContext } from './types'

/**
 * 表单上下文注入键
 * 用于在表单组件树中传递表单的上下文信息
 * 包括表单的配置、验证方法、字段管理等功能
 */
export const formContextKey: InjectionKey<FormContext> =
  Symbol('formContextKey')

/**
 * 表单项上下文注入键
 * 用于在表单项组件树中传递表单项的上下文信息
 * 包括表单项的状态、验证信息、输入框管理等功能
 */
export const formItemContextKey: InjectionKey<FormItemContext> =
  Symbol('formItemContextKey')
