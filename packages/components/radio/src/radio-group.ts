import { buildProps } from '@element-plus/utils'
import { useAriaProps, useSizeProp } from '@element-plus/hooks'
import { radioEmits } from './radio'

import type { ExtractPropTypes } from 'vue'
import type RadioGroup from './radio-group.vue'

/**
 * RadioGroup 组件属性定义
 * 用于管理一组 Radio 或 RadioButton 组件
 */
export const radioGroupProps = buildProps({
  /**
   * @description 原生 id 属性
   */
  id: {
    type: String,
    default: undefined,
  },
  /**
   * @description 单选按钮组或带边框单选框的尺寸
   */
  size: useSizeProp,
  /**
   * @description 是否禁用嵌套的单选框
   */
  disabled: Boolean,
  /**
   * @description 绑定值
   */
  modelValue: {
    type: [String, Number, Boolean],
    default: undefined,
  },
  /**
   * @description 按钮激活时的边框和背景色
   */
  fill: {
    type: String,
    default: '',
  },
  /**
   * @description 按钮激活时的字体颜色
   */
  textColor: {
    type: String,
    default: '',
  },
  /**
   * @description 原生 name 属性
   */
  name: {
    type: String,
    default: undefined,
  },
  /**
   * @description 是否触发表单验证
   */
  validateEvent: {
    type: Boolean,
    default: true,
  },
  ...useAriaProps(['ariaLabel']),
} as const)

/** RadioGroup 组件属性类型 */
export type RadioGroupProps = ExtractPropTypes<typeof radioGroupProps>

/** RadioGroup 组件事件定义，继承自 Radio 组件的事件 */
export const radioGroupEmits = radioEmits
/** RadioGroup 组件事件类型 */
export type RadioGroupEmits = typeof radioGroupEmits
/** RadioGroup 组件实例类型 */
export type RadioGroupInstance = InstanceType<typeof RadioGroup> & unknown
