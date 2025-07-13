import { buildProps, isBoolean, isNumber, isString } from '@element-plus/utils'
import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { useSizeProp } from '@element-plus/hooks'

import type { ExtractPropTypes } from 'vue'
import type Radio from './radio.vue'

/**
 * Radio 组件基础属性定义
 * 包含 Radio 和 RadioButton 组件共用的属性
 */
export const radioPropsBase = buildProps({
  /**
   * @description 绑定值
   */
  modelValue: {
    type: [String, Number, Boolean],
    default: undefined,
  },
  /**
   * @description Radio 的尺寸
   */
  size: useSizeProp,
  /**
   * @description 是否禁用
   */
  disabled: Boolean,
  /**
   * @description Radio 的标签
   */
  label: {
    type: [String, Number, Boolean],
    default: undefined,
  },
  /**
   * @description Radio 的值
   */
  value: {
    type: [String, Number, Boolean],
    default: undefined,
  },
  /**
   * @description 原生 name 属性
   */
  name: {
    type: String,
    default: undefined,
  },
})

/**
 * Radio 组件属性定义
 * 继承基础属性并添加 border 属性
 */
export const radioProps = buildProps({
  ...radioPropsBase,
  /**
   * @description 是否显示边框
   */
  border: Boolean,
} as const)

/**
 * Radio 组件事件定义
 * 包含 update:modelValue 和 change 事件的验证函数
 */
export const radioEmits = {
  [UPDATE_MODEL_EVENT]: (val: string | number | boolean | undefined) =>
    isString(val) || isNumber(val) || isBoolean(val),
  [CHANGE_EVENT]: (val: string | number | boolean | undefined) =>
    isString(val) || isNumber(val) || isBoolean(val),
}

/** Radio 组件属性类型 */
export type RadioProps = ExtractPropTypes<typeof radioProps>
/** Radio 组件事件类型 */
export type RadioEmits = typeof radioEmits
/** Radio 组件实例类型 */
export type RadioInstance = InstanceType<typeof Radio> & unknown
