/**
 * Element Plus Form 表单组件的属性定义和类型声明
 * 包含表单的所有配置选项和事件定义
 */

// Element Plus 常量和工具函数导入
import { componentSizes } from '@element-plus/constants'
import {
  buildProps,
  definePropType,
  isArray,
  isBoolean,
  isString,
} from '@element-plus/utils'

// Vue 和本地类型导入
import type { ExtractPropTypes } from 'vue'
import type { FormItemProp } from './form-item'
import type { FormRules } from './types'

// 表单元属性定义（可被其他组件继承的基础属性）
export const formMetaProps = buildProps({
  /**
   * 控制表单内组件的尺寸
   * 可选值：'large' | 'default' | 'small'
   */
  size: {
    type: String,
    values: componentSizes,
  },
  /**
   * 是否禁用表单内的所有组件
   * 设置为 true 时，会覆盖内部组件的 disabled 属性
   */
  disabled: Boolean,
} as const)

// 表单组件完整属性定义
export const formProps = buildProps({
  ...formMetaProps, // 继承元属性
  /**
   * 表单数据对象
   * 用于双向绑定表单项的值
   */
  model: Object,
  /**
   * 表单验证规则
   * 定义各个字段的验证逻辑
   */
  rules: {
    type: definePropType<FormRules>(Object),
  },
  /**
   * 标签的位置
   * 'left' | 'right' | 'top'
   * 设置为 'left' 或 'right' 时，需要设置 label-width 属性
   */
  labelPosition: {
    type: String,
    values: ['left', 'right', 'top'],
    default: 'right',
  },
  /**
   * 必填字段星号的位置
   * 'left' | 'right'
   */
  requireAsteriskPosition: {
    type: String,
    values: ['left', 'right'],
    default: 'left',
  },
  /**
   * 标签的宽度
   * 例如：'50px'、'auto'
   * 所有直接子表单项都会继承此值
   */
  labelWidth: {
    type: [String, Number],
    default: '',
  },
  /**
   * 标签的后缀
   * 通常用于添加冒号等符号
   */
  labelSuffix: {
    type: String,
    default: '',
  },
  /**
   * 是否为行内表单
   * 设置为 true 时，表单项会水平排列
   */
  inline: Boolean,
  /**
   * 是否在表单项内显示错误信息
   * 设置为 true 时，错误信息会显示在表单项内部
   */
  inlineMessage: Boolean,
  /**
   * 是否显示验证结果的状态图标
   * 显示成功、警告、错误等状态的图标
   */
  statusIcon: Boolean,
  /**
   * 是否显示错误信息
   * 控制验证失败时是否显示错误提示
   */
  showMessage: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否在验证规则改变时触发验证
   * 当 rules 属性发生变化时是否重新验证
   */
  validateOnRuleChange: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否隐藏必填字段标签旁的红色星号
   * 设置为 true 时，不显示必填标识
   */
  hideRequiredAsterisk: Boolean,
  /**
   * 验证失败时是否滚动到第一个错误的表单项
   * 便于用户快速定位错误位置
   */
  scrollToError: Boolean,
  /**
   * 验证失败时滚动的配置选项
   * 基于 scrollIntoView 的配置参数
   */
  scrollIntoViewOptions: {
    type: [Object, Boolean],
    default: true,
  },
} as const)
// 导出表单属性类型
export type FormProps = ExtractPropTypes<typeof formProps>
export type FormMetaProps = ExtractPropTypes<typeof formMetaProps>

// 表单组件事件定义
export const formEmits = {
  /**
   * 表单验证事件
   * @param prop 表单项的属性名
   * @param isValid 验证是否通过
   * @param message 验证消息
   *
   * 当任一表单项被校验后触发
   * 用于监听表单验证状态的变化
   */
  validate: (prop: FormItemProp, isValid: boolean, message: string) =>
    (isArray(prop) || isString(prop)) &&
    isBoolean(isValid) &&
    isString(message),
}
export type FormEmits = typeof formEmits
