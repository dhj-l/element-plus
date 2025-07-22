/**
 * Element Plus Form 表单组件类型定义
 *
 * 本文件定义了表单组件相关的所有 TypeScript 类型，包括：
 * - 表单验证规则类型
 * - 表单上下文类型
 * - 表单项上下文类型
 * - 路径类型工具
 * - 验证回调类型
 *
 * 这些类型确保了表单组件的类型安全和开发体验
 */

// Vue 核心类型
import type { SetupContext, UnwrapRef } from 'vue'
// async-validator 验证库类型
import type {
  RuleItem,
  ValidateError,
  ValidateFieldsError,
} from 'async-validator'
// Element Plus 常量类型
import type { ComponentSize } from '@element-plus/constants'
// Element Plus 工具类型
import type { Arrayable } from '@element-plus/utils'
// VueUse 工具类型
import type { MaybeRef } from '@vueuse/core'
// 表单项相关类型
import type {
  FormItemProp,
  FormItemProps,
  FormItemValidateState,
} from './form-item'
// 表单相关类型
import type { FormEmits, FormProps } from './form'
// 表单工具函数类型
import type { useFormLabelWidth } from './utils'

// 表单标签宽度上下文类型
export type FormLabelWidthContext = ReturnType<typeof useFormLabelWidth>

/**
 * 表单项验证规则接口
 * 扩展了 async-validator 的 RuleItem，添加了触发器配置
 */
export interface FormItemRule extends RuleItem {
  /**
   * 验证触发时机
   * @example trigger: 'blur' | trigger: ['blur', 'change']
   */
  trigger?: Arrayable<string>
}

// ===== 路径类型工具 =====
// 这些类型用于生成对象属性的类型安全路径字符串

/** 基础类型（不可进一步访问属性的类型） */
type Primitive = null | undefined | string | number | boolean | symbol | bigint

/** 浏览器原生对象类型 */
type BrowserNativeObject = Date | FileList | File | Blob | RegExp

/**
 * 检查是否为元组类型
 * 元组有固定长度，数组长度可变
 *
 * @example
 * IsTuple<[1, 2, 3]> => true  // 元组
 * IsTuple<Array[number]> => false  // 数组
 */
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true

/**
 * 数组方法键类型
 * 排除数组原型方法，只保留索引键
 */
type ArrayMethodKey = keyof any[]

/**
 * 元组索引键类型
 * 获取元组的所有索引键（'0', '1', '2' 等）
 *
 * @example
 * TupleKey<[1, 2, 3]> => '0' | '1' | '2'
 */
type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, ArrayMethodKey>

/**
 * 数组索引键类型
 * 数组的索引是 number 类型
 */
type ArrayKey = number

/**
 * 路径构建辅助类型
 * 递归构建对象属性路径字符串
 *
 * @param K 当前键
 * @param V 当前值类型
 */
type PathImpl<K extends string | number, V> = V extends
  | Primitive
  | BrowserNativeObject
  ? `${K}` // 基础类型，路径结束
  : `${K}` | `${K}.${Path<V>}` // 对象类型，继续递归

/**
 * 路径收集类型
 * 收集类型 T 的所有可能路径
 *
 * @see {@link FieldPath}
 */
type Path<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKey<T>]-?: PathImpl<Exclude<K, symbol>, T[K]>
      }[TupleKey<T>] // 元组：使用固定索引
    : PathImpl<ArrayKey, V> // 数组：使用数字索引
  : {
      [K in keyof T]-?: PathImpl<Exclude<K, symbol>, T[K]>
    }[keyof T] // 对象：使用属性键

/**
 * 字段路径类型
 * 生成对象所有属性路径的联合类型，用于类型安全的属性访问
 *
 * @example
 * type User = { profile: { name: string; age: number }; tags: string[] }
 * FieldPath<User> => 'profile' | 'tags' | 'profile.name' | 'profile.age' | 'tags.0' | 'tags.1' ...
 */
type FieldPath<T> = T extends object ? Path<T> : never
/**
 * 表单验证规则类型
 * 根据表单数据模型自动推导可用的字段路径
 *
 * @template T 表单数据模型类型
 * @example
 * type UserForm = { username: string; profile: { email: string } }
 * FormRules<UserForm> => {
 *   username?: FormItemRule | FormItemRule[]
 *   'profile.email'?: FormItemRule | FormItemRule[]
 * }
 */
export type FormRules<
  T extends MaybeRef<Record<string, any> | string> = string
> = Partial<
  Record<
    UnwrapRef<T> extends string ? UnwrapRef<T> : FieldPath<UnwrapRef<T>>,
    Arrayable<FormItemRule>
  >
>

/** 表单验证结果类型 */
export type FormValidationResult = Promise<boolean>

/**
 * 表单验证回调函数类型
 * @param isValid 验证是否通过
 * @param invalidFields 验证失败的字段信息
 */
export type FormValidateCallback = (
  isValid: boolean,
  invalidFields?: ValidateFieldsError
) => Promise<void> | void

/**
 * 表单验证失败信息接口
 */
export interface FormValidateFailure {
  /** 验证错误数组 */
  errors: ValidateError[] | null
  /** 验证失败的字段映射 */
  fields: ValidateFieldsError
}

/**
 * 表单上下文类型
 * 包含表单的所有属性、方法和状态管理功能
 */
export type FormContext = FormProps &
  UnwrapRef<FormLabelWidthContext> & {
    /** 事件发射器 */
    emit: SetupContext<FormEmits>['emit']

    /** 根据属性名获取表单项上下文 */
    getField: (prop: FormItemProp) => FormItemContext | undefined

    /** 添加表单项到管理列表 */
    addField: (field: FormItemContext) => void

    /** 从管理列表中移除表单项 */
    removeField: (field: FormItemContext) => void

    /** 重置指定字段或所有字段 */
    resetFields: (props?: Arrayable<FormItemProp>) => void

    /** 清除指定字段或所有字段的验证状态 */
    clearValidate: (props?: Arrayable<FormItemProp>) => void

    /** 验证指定字段或所有字段 */
    validateField: (
      props?: Arrayable<FormItemProp>,
      callback?: FormValidateCallback
    ) => FormValidationResult
  }

/**
 * 表单项上下文接口
 * 包含表单项的所有属性、状态和方法
 */
export interface FormItemContext extends FormItemProps {
  /** 表单项的 DOM 元素引用 */
  $el: HTMLDivElement | undefined

  /** 表单项尺寸 */
  size: ComponentSize

  /** 验证错误信息 */
  validateMessage: string

  /** 验证状态 */
  validateState: FormItemValidateState

  /** 是否为表单组（有标签但无关联控件） */
  isGroup: boolean

  /** 标签的唯一 ID */
  labelId: string

  /** 关联的输入框 ID 数组 */
  inputIds: string[]

  /** 是否有标签 */
  hasLabel: boolean

  /** 字段当前值 */
  fieldValue: any

  /** 属性路径字符串 */
  propString: string

  /** 添加输入框 ID */
  addInputId: (id: string) => void

  /** 移除输入框 ID */
  removeInputId: (id: string) => void

  /** 验证表单项 */
  validate: (
    trigger: string,
    callback?: FormValidateCallback
  ) => FormValidationResult

  /** 重置字段值 */
  resetField(): void

  /** 清除验证状态 */
  clearValidate(): void
}
