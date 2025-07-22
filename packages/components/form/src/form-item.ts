/**
 * Element Plus Form Item 表单项组件
 *
 * 表单项组件用于包装表单控件，提供标签、验证、错误信息显示等功能
 *
 * 主要功能：
 * - 标签显示和定位
 * - 表单验证
 * - 错误信息展示
 * - 字段重置
 * - 尺寸控制
 *
 * 使用示例：
 * ```vue
 * <el-form-item label="用户名" prop="username" :rules="[{ required: true, message: '请输入用户名' }]">
 *   <el-input v-model="form.username" />
 * </el-form-item>
 *
 * <el-form-item label="邮箱" prop="email" label-width="80px">
 *   <el-input v-model="form.email" type="email" />
 * </el-form-item>
 *
 * <el-form-item label="年龄" prop="age" :inline-message="true">
 *   <el-input-number v-model="form.age" />
 * </el-form-item>
 * ```
 */

// Element Plus 常量
import { componentSizes } from '@element-plus/constants'
// Element Plus 工具函数
import { buildProps, definePropType } from '@element-plus/utils'

// Vue 类型
import type { ExtractPropTypes } from 'vue'
// Element Plus 工具类型
import type { Arrayable } from '@element-plus/utils'
// 表单验证规则类型
import type { FormItemRule } from './types'

// 表单项验证状态枚举
export const formItemValidateStates = [
  '', // 无状态
  'error', // 验证错误
  'validating', // 验证中
  'success', // 验证成功
] as const

// 表单项验证状态类型
export type FormItemValidateState = typeof formItemValidateStates[number]

// 表单项属性路径类型（可以是字符串或字符串数组）
export type FormItemProp = Arrayable<string>

// 表单项组件属性定义
export const formItemProps = buildProps({
  /**
   * @description 标签文本
   * @example label="用户名"
   */
  label: String,

  /**
   * @description 标签宽度，支持像素值、百分比或 'auto'
   * @example labelWidth="100px" | labelWidth="auto" | labelWidth={100}
   */
  labelWidth: {
    type: [String, Number],
    default: '',
  },

  /**
   * @description 标签位置
   * - 'left': 左对齐（需要设置 labelWidth）
   * - 'right': 右对齐（需要设置 labelWidth）
   * - 'top': 顶部对齐
   * - '': 继承表单的 labelPosition
   * @example labelPosition="top"
   */
  labelPosition: {
    type: String,
    values: ['left', 'right', 'top', ''],
    default: '',
  },

  /**
   * @description 表单域 model 字段，在使用 validate、resetFields 方法时必填
   * 支持嵌套属性路径，如 'user.name' 或 ['user', 'name']
   * @example prop="username" | prop="user.profile.name" | prop={['user', 'addresses', 0, 'street']}
   */
  prop: {
    type: definePropType<FormItemProp>([String, Array]),
  },

  /**
   * @description 是否为必填项
   * 如果不设置，将根据验证规则自动判断
   * @example :required="true"
   */
  required: {
    type: Boolean,
    default: undefined,
  },

  /**
   * @description 表单验证规则
   * 基于 async-validator 库，支持单个规则对象或规则数组
   * @example :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]"
   * @example :rules="{ required: true, min: 3, max: 10, message: '长度在 3 到 10 个字符' }"
   */
  rules: {
    type: definePropType<Arrayable<FormItemRule>>([Object, Array]),
  },

  /**
   * @description 表单域验证错误信息
   * 设置该值会使表单域变为验证失败状态，并显示该错误信息
   * @example error="用户名不能为空"
   */
  error: String,

  /**
   * @description 表单域验证状态
   * 手动设置验证状态，通常用于自定义验证场景
   * @example validateStatus="error" | validateStatus="success"
   */
  validateStatus: {
    type: String,
    values: formItemValidateStates,
  },

  /**
   * @description 原生 label 标签的 for 属性
   * 用于关联表单控件，提升无障碍访问性
   * @example for="username-input"
   */
  for: String,

  /**
   * @description 以行内形式展示校验信息
   * - true: 行内显示
   * - false: 块级显示
   * - string: 自定义错误信息并行内显示
   * @example :inlineMessage="true" | inlineMessage="自定义错误信息"
   */
  inlineMessage: {
    type: [String, Boolean],
    default: '',
  },

  /**
   * @description 是否显示校验错误信息
   * @example :showMessage="false"
   */
  showMessage: {
    type: Boolean,
    default: true,
  },

  /**
   * @description 用于控制该表单域下组件的尺寸
   * 可选值：'large' | 'default' | 'small'
   * @example size="large"
   */
  size: {
    type: String,
    values: componentSizes,
  },
} as const)
// 表单项组件属性类型
export type FormItemProps = ExtractPropTypes<typeof formItemProps>
