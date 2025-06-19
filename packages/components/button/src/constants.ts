// 导入Vue的依赖注入类型
import type { InjectionKey } from 'vue'
// 导入按钮组件的Props类型
import type { ButtonProps } from './button'

/**
 * 按钮组上下文接口
 * 定义了按钮组向子按钮传递的数据结构
 * 用于统一控制按钮组内所有按钮的样式
 */
export interface ButtonGroupContext {
  /**
   * 按钮组统一设置的尺寸
   * 会覆盖单个按钮的size属性
   * 例如：size="large" 让组内所有按钮都显示为大尺寸
   */
  size?: ButtonProps['size']

  /**
   * 按钮组统一设置的类型
   * 会覆盖单个按钮的type属性
   * 例如：type="primary" 让组内所有按钮都显示为主要按钮样式
   */
  type?: ButtonProps['type']
}

/**
 * 按钮组上下文的依赖注入key
 * 用于在按钮组和子按钮之间传递上下文数据
 * 使用Symbol确保key的唯一性，避免命名冲突
 */
export const buttonGroupContextKey: InjectionKey<ButtonGroupContext> = Symbol(
  'buttonGroupContextKey'
)
