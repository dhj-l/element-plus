import type { InjectionKey } from 'vue'
import type { RadioGroupProps } from './radio-group'

/**
 * RadioGroup 上下文接口
 * 继承 RadioGroupProps 并添加 changeEvent 方法
 * 用于在 RadioGroup 和其子组件之间共享状态和方法
 */
export interface RadioGroupContext extends RadioGroupProps {
  /** 值变更事件处理函数 */
  changeEvent: (val: RadioGroupProps['modelValue']) => void
}

/**
 * RadioGroup 依赖注入的键
 * 用于在组件树中传递 RadioGroupContext
 */
export const radioGroupKey: InjectionKey<RadioGroupContext> =
  Symbol('radioGroupKey')
