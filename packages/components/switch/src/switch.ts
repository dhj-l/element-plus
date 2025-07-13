/**
 * Switch 开关组件的类型定义和属性配置
 * 提供开关组件的所有属性、事件和类型定义
 *
 * Switch 开关组件用于表示两种相互对立的状态间的切换，多用于触发「开/关」
 *
 * @example 基础用法
 * <template>
 *   <el-switch v-model="value" />
 * </template>
 *
 * <script setup>
 * import { ref } from 'vue'
 * const value = ref(true)
 * </script>
 *
 * @example 自定义值
 * <template>
 *   <el-switch
 *     v-model="status"
 *     active-value="published"
 *     inactive-value="draft"
 *     active-text="已发布"
 *     inactive-text="草稿"
 *   />
 * </template>
 *
 * @example 禁用状态
 * <template>
 *   <el-switch v-model="value" disabled />
 * </template>
 *
 * @example 加载状态
 * <template>
 *   <el-switch v-model="value" loading />
 * </template>
 *
 * @example 不同尺寸
 * <template>
 *   <el-switch v-model="value" size="large" />
 *   <el-switch v-model="value" size="default" />
 *   <el-switch v-model="value" size="small" />
 * </template>
 *
 * @example 阻止切换
 * <template>
 *   <el-switch v-model="value" :before-change="beforeChange" />
 * </template>
 *
 * <script setup>
 * const beforeChange = () => {
 *   return new Promise((resolve) => {
 *     setTimeout(() => {
 *       resolve(Math.random() > 0.5)
 *     }, 1000)
 *   })
 * }
 * </script>
 */

import {
  buildProps,
  definePropType,
  iconPropType,
  isBoolean,
  isNumber,
  isString,
  isValidComponentSize,
} from '@element-plus/utils'
import {
  CHANGE_EVENT,
  INPUT_EVENT,
  UPDATE_MODEL_EVENT,
} from '@element-plus/constants'
import { useAriaProps } from '@element-plus/hooks'

import type { ComponentSize } from '@element-plus/constants'
import type Switch from './switch.vue'
import type { ExtractPropTypes, PropType } from 'vue'

/**
 * Switch 开关组件的属性定义
 * 定义了开关组件的所有可配置属性
 */
export const switchProps = buildProps({
  /**
   * @description 绑定值，应该等于 active-value 或 inactive-value，默认为 boolean 类型
   * @description binding value, it should be equivalent to either `active-value` or `inactive-value`, by default it's `boolean` type
   */
  modelValue: {
    type: [Boolean, String, Number],
    default: false,
  },
  /**
   * @description 是否禁用开关
   * @description whether Switch is disabled
   */
  disabled: Boolean,
  /**
   * @description 是否显示加载状态
   * @description whether Switch is in loading state
   */
  loading: Boolean,
  /**
   * @description 开关的尺寸
   * @description size of Switch
   */
  size: {
    type: String as PropType<ComponentSize>,
    validator: isValidComponentSize,
  },
  /**
   * @description 开关的宽度（像素）
   * @description width of Switch
   */
  width: {
    type: [String, Number],
    default: '',
  },
  /**
   * @description 是否在点内显示图标或文本，文本只会渲染第一个字符
   * @description whether icon or text is displayed inside dot, only the first character will be rendered for text
   *
   * @example
   * // 在开关内部显示文字提示
   * <el-switch
   *   v-model="value"
   *   inline-prompt
   *   active-text="开"
   *   inactive-text="关"
   * />
   *
   * // 在开关内部显示图标
   * <el-switch
   *   v-model="value"
   *   inline-prompt
   *   :active-icon="Check"
   *   :inactive-icon="Close"
   * />
   */
  inlinePrompt: Boolean,
  /**
   * @description 关闭状态下在操作区域显示的图标组件
   * @description component of the icon displayed in action when in `off` state
   */
  inactiveActionIcon: {
    type: iconPropType,
  },
  /**
   * @description 打开状态下在操作区域显示的图标组件
   * @description component of the icon displayed in action when in `on` state
   */
  activeActionIcon: {
    type: iconPropType,
  },
  /**
   * @description 打开状态下显示的图标组件，会覆盖 active-text
   * @description component of the icon displayed when in `on` state, overrides `active-text`
   */
  activeIcon: {
    type: iconPropType,
  },
  /**
   * @description 关闭状态下显示的图标组件，会覆盖 inactive-text
   * @description component of the icon displayed when in `off` state, overrides `inactive-text`
   */
  inactiveIcon: {
    type: iconPropType,
  },
  /**
   * @description 打开状态下显示的文字
   * @description text displayed when in `on` state
   */
  activeText: {
    type: String,
    default: '',
  },
  /**
   * @description 关闭状态下显示的文字
   * @description text displayed when in `off` state
   */
  inactiveText: {
    type: String,
    default: '',
  },
  /**
   * @description 打开状态的值
   * @description switch value when in `on` state
   *
   * @example
   * // 使用布尔值（默认）
   * <el-switch v-model="value" /> // activeValue: true, inactiveValue: false
   *
   * // 使用字符串
   * <el-switch v-model="status" active-value="enabled" inactive-value="disabled" />
   *
   * // 使用数字
   * <el-switch v-model="level" :active-value="1" :inactive-value="0" />
   */
  activeValue: {
    type: [Boolean, String, Number],
    default: true,
  },
  /**
   * @description 关闭状态的值
   * @description switch value when in `off` state
   *
   * @example
   * // 配合 activeValue 使用，定义开关的两种状态值
   * // 当开关关闭时，v-model 绑定的值将是 inactiveValue
   */
  inactiveValue: {
    type: [Boolean, String, Number],
    default: false,
  },
  /**
   * @description 开关对应的 input 的 name 属性
   * @description input name of Switch
   */
  name: {
    type: String,
    default: '',
  },
  /**
   * @description 改变开关状态时是否触发表单的校验
   * @description whether to trigger form validation
   */
  validateEvent: {
    type: Boolean,
    default: true,
  },
  /**
   * @description 开关状态改变前的钩子，返回 false 或返回 Promise 且被 reject 则停止切换
   * @description before-change hook before the switch state changes. If `false` is returned or a `Promise` is returned and then is rejected, will stop switching
   *
   * @example
   * // 同步验证
   * const beforeChange = () => {
   *   return confirm('确定要切换开关状态吗？')
   * }
   *
   * // 异步验证
   * const beforeChange = () => {
   *   return new Promise((resolve) => {
   *     // 模拟 API 调用
   *     setTimeout(() => {
   *       const hasPermission = checkUserPermission()
   *       resolve(hasPermission)
   *     }, 1000)
   *   })
   * }
   *
   * // 使用方式
   * <el-switch :before-change="beforeChange" v-model="value" />
   */
  beforeChange: {
    type: definePropType<() => Promise<boolean> | boolean>(Function),
  },
  /**
   * @description input 的 id 属性
   * @description id for input
   */
  id: String,
  /**
   * @description input 的 tabindex 属性
   * @description tabindex for input
   */
  tabindex: {
    type: [String, Number],
  },
  // 继承无障碍访问属性
  ...useAriaProps(['ariaLabel']),
} as const)

/**
 * Switch 组件属性类型
 * 从 switchProps 中提取的 TypeScript 类型定义
 */
export type SwitchProps = ExtractPropTypes<typeof switchProps>

/**
 * Switch 组件事件定义
 * 定义了开关组件可以触发的所有事件及其参数验证
 *
 * 事件触发顺序：input -> update:modelValue -> change
 */
export const switchEmits = {
  /**
   * 当绑定值变化时触发的事件（用于 v-model 双向绑定）
   * @param val 新的绑定值
   *
   * @example
   * // 在父组件中使用 v-model
   * <el-switch v-model="switchValue" />
   * // 等价于
   * <el-switch
   *   :model-value="switchValue"
   *   @update:model-value="switchValue = $event"
   * />
   */
  [UPDATE_MODEL_EVENT]: (val: boolean | string | number) =>
    isBoolean(val) || isString(val) || isNumber(val),
  /**
   * 开关状态发生变化时的回调函数
   * @param val 新的开关状态值
   *
   * @example
   * // 监听开关状态变化
   * <el-switch v-model="value" @change="handleChange" />
   *
   * const handleChange = (val) => {
   *   console.log('开关状态改变为:', val)
   *   // 可以在这里执行业务逻辑，如发送 API 请求
   * }
   */
  [CHANGE_EVENT]: (val: boolean | string | number) =>
    isBoolean(val) || isString(val) || isNumber(val),
  /**
   * 输入值变化时触发的事件（保持与原生 input 元素行为一致）
   * @param val 新的输入值
   *
   * @example
   * // 通常用于表单验证或实时响应
   * <el-switch v-model="value" @input="handleInput" />
   *
   * const handleInput = (val) => {
   *   // 实时处理输入变化
   *   validateForm()
   * }
   */
  [INPUT_EVENT]: (val: boolean | string | number) =>
    isBoolean(val) || isString(val) || isNumber(val),
}

/**
 * Switch 组件事件类型
 * 从 switchEmits 中提取的 TypeScript 类型定义
 */
export type SwitchEmits = typeof switchEmits

/**
 * Switch 组件实例类型
 * 用于获取组件实例的 TypeScript 类型定义
 */
export type SwitchInstance = InstanceType<typeof Switch> & unknown
