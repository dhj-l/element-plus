// 导入尺寸属性工具函数
import { useSizeProp } from '@element-plus/hooks'
// 导入构建属性、定义属性类型、图标属性类型等工具函数
import { buildProps, definePropType, iconPropType } from '@element-plus/utils'
// 导入默认的加载图标
import { Loading } from '@element-plus/icons-vue'

import type { Component, ExtractPropTypes } from 'vue'

/**
 * 按钮类型常量数组
 * 定义了所有可用的按钮类型
 * 例如：'primary'（主要按钮）、'success'（成功按钮）、'danger'（危险按钮）等
 */
export const buttonTypes = [
  'default', // 默认按钮
  'primary', // 主要按钮（蓝色）
  'success', // 成功按钮（绿色）
  'warning', // 警告按钮（橙色）
  'info', // 信息按钮（灰色）
  'danger', // 危险按钮（红色）
  /**
   * @deprecated
   * Text type will be deprecated in the next major version (3.0.0)
   */
  'text', // 文本按钮（已废弃，建议使用link）
  '', // 空字符串，表示默认类型
] as const

/**
 * 原生按钮类型常量数组
 * 对应HTML button元素的type属性值
 * 例如：'submit'（提交表单）、'reset'（重置表单）、'button'（普通按钮）
 */
export const buttonNativeTypes = ['button', 'submit', 'reset'] as const

/**
 * 按钮组件的属性定义
 * 使用buildProps工具函数构建，确保类型安全和运行时验证
 */
export const buttonProps = buildProps({
  /**
   * 按钮尺寸
   * 可选值：'large'（大）、'default'（默认）、'small'（小）
   * 例如：size="large" 显示大尺寸按钮
   */
  size: useSizeProp,

  /**
   * 是否禁用按钮
   * 禁用后按钮不可点击，样式变灰
   * 例如：disabled 或 :disabled="true"
   */
  disabled: Boolean,

  /**
   * 按钮类型，决定按钮的颜色主题
   * 例如：type="primary" 显示蓝色主要按钮
   */
  type: {
    type: String,
    values: buttonTypes,
    default: '',
  },

  /**
   * 按钮图标
   * 可以是图标组件或图标名称
   * 例如：:icon="Edit" 显示编辑图标
   */
  icon: {
    type: iconPropType,
  },

  /**
   * 原生button的type属性
   * 用于表单提交等场景
   * 例如：native-type="submit" 用于提交表单
   */
  nativeType: {
    type: String,
    values: buttonNativeTypes,
    default: 'button',
  },

  /**
   * 是否显示加载状态
   * 加载时按钮不可点击并显示加载图标
   * 例如：:loading="isSubmitting"
   */
  loading: Boolean,

  /**
   * 自定义加载图标
   * 默认使用Loading图标
   * 例如：:loading-icon="CustomLoadingIcon"
   */
  loadingIcon: {
    type: iconPropType,
    default: () => Loading,
  },

  /**
   * 是否为朴素按钮
   * 朴素按钮有边框，背景透明
   * 例如：plain 显示朴素风格按钮
   */
  plain: {
    type: Boolean,
    default: undefined,
  },

  /**
   * 是否为文本按钮（已废弃）
   * 建议使用link属性替代
   * 例如：text 显示文本样式按钮
   */
  text: Boolean,

  /**
   * 是否为链接按钮
   * 链接按钮没有边框和背景，类似超链接
   * 例如：link 显示链接样式按钮
   */
  link: Boolean,

  /**
   * 是否显示背景色
   * 通常与text或link配合使用
   * 例如：bg 为文本按钮添加背景
   */
  bg: Boolean,

  /**
   * 是否自动获取焦点
   * 页面加载时自动聚焦到此按钮
   * 例如：autofocus 自动聚焦
   */
  autofocus: Boolean,

  /**
   * 是否为圆角按钮
   * 显示圆角矩形样式
   * 例如：round 显示圆角按钮
   */
  round: {
    type: Boolean,
    default: undefined,
  },

  /**
   * 是否为圆形按钮
   * 通常用于图标按钮
   * 例如：circle 显示圆形按钮
   */
  circle: Boolean,

  /**
   * 自定义按钮颜色
   * 可以是任何有效的CSS颜色值
   * 例如：color="#ff0000" 或 color="red"
   */
  color: String,

  /**
   * 是否为暗色模式
   * 影响自定义颜色的计算
   * 例如：dark 适配暗色主题
   */
  dark: Boolean,

  /**
   * 是否自动在中文字符间插入空格
   * 提升中文显示效果
   * 例如：:auto-insert-space="false" 禁用自动插入空格
   */
  autoInsertSpace: {
    type: Boolean,
    default: undefined,
  },

  /**
   * 自定义元素标签
   * 可以渲染为其他HTML元素或Vue组件
   * 例如：tag="a" 渲染为链接元素
   */
  tag: {
    type: definePropType<string | Component>([String, Object]),
    default: 'button',
  },
} as const)
export const buttonEmits = {
  click: (evt: MouseEvent) => evt instanceof MouseEvent,
}

/**
 * 按钮组件的Props类型
 * 从buttonProps中提取出的TypeScript类型定义
 * 用于组件内部和外部的类型检查
 */
export type ButtonProps = ExtractPropTypes<typeof buttonProps>
export type ButtonEmits = typeof buttonEmits

/**
 * 按钮类型的联合类型
 * 包含所有可用的按钮类型：'default' | 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'text' | ''
 * 例如：const btnType: ButtonType = 'primary'
 */
export type ButtonType = ButtonProps['type']

/**
 * 原生按钮类型的联合类型
 * 包含HTML button元素的type属性值：'button' | 'submit' | 'reset'
 * 例如：const nativeType: ButtonNativeType = 'submit'
 */
export type ButtonNativeType = ButtonProps['nativeType']

export interface ButtonConfigContext {
  type?: string
  plain?: boolean
  round?: boolean
  autoInsertSpace?: boolean
}
