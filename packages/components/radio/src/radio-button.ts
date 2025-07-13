import { buildProps } from '@element-plus/utils'
import { radioPropsBase } from './radio'

import type { ExtractPropTypes } from 'vue'
import type RadioButton from './radio-button.vue'

/**
 * RadioButton 组件属性定义
 * 继承 Radio 组件的基础属性
 * RadioButton 是 Radio 的按钮样式变体
 */
export const radioButtonProps = buildProps({
  ...radioPropsBase,
} as const)

/** RadioButton 组件属性类型 */
export type RadioButtonProps = ExtractPropTypes<typeof radioButtonProps>
/** RadioButton 组件实例类型 */
export type RadioButtonInstance = InstanceType<typeof RadioButton> & unknown
