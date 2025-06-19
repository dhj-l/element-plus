// 导入尺寸属性工具函数
import { useSizeProp } from '@element-plus/hooks'
// 导入构建属性工具函数
import { buildProps } from '@element-plus/utils'
// 导入按钮类型常量
import { buttonTypes } from './button'

import type { ExtractPropTypes } from 'vue'

/**
 * 按钮组组件的属性定义
 * 用于统一控制按钮组内所有按钮的样式
 */
export const buttonGroupProps = buildProps({
  /**
   * 控制按钮组内所有按钮的尺寸
   * 可选值：'large'（大）、'default'（默认）、'small'（小）
   * 例如：size="large" 让组内所有按钮都显示为大尺寸
   */
  size: useSizeProp,

  /**
   * 控制按钮组内所有按钮的类型
   * 统一设置按钮的颜色主题
   * 例如：type="primary" 让组内所有按钮都显示为主要按钮样式
   */
  type: {
    type: String,
    values: buttonTypes,
    default: '',
  },
} as const)

/**
 * 按钮组组件的Props类型
 * 从buttonGroupProps中提取出的TypeScript类型定义
 * 用于组件内部和外部的类型检查
 */
export type ButtonGroupProps = ExtractPropTypes<typeof buttonGroupProps>
