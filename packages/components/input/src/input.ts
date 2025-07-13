// 导入 Element Plus 工具函数和类型定义
import {
  buildProps, // 构建组件属性的工具函数
  definePropType, // 定义属性类型的工具函数
  iconPropType, // 图标属性类型
  isString, // 字符串类型检查函数
  mutable, // 创建可变对象的工具函数
} from '@element-plus/utils'
// 导入更新模型值的事件常量
import { UPDATE_MODEL_EVENT } from '@element-plus/constants'
// 导入可访问性属性和尺寸属性的 hooks
import { useAriaProps, useSizeProp } from '@element-plus/hooks'

// 导入 Vue 类型定义
import type { ExtractPropTypes, StyleValue } from 'vue'

/**
 * 输入框自动调整大小的类型定义
 * 可以是布尔值或包含最小/最大行数的对象
 */
export type InputAutoSize = { minRows?: number; maxRows?: number } | boolean

/**
 * 输入框组件的属性定义
 * 使用 buildProps 工具函数构建属性配置对象
 */
export const inputProps = buildProps({
  /**
   * @description 原生 input 元素的 id 属性
   */
  id: {
    type: String,
    default: undefined,
  },
  /**
   * @description 输入框尺寸大小
   */
  size: useSizeProp,
  /**
   * @description 是否禁用输入框
   */
  disabled: Boolean,
  /**
   * @description 绑定值，支持 v-model 双向绑定
   */
  modelValue: {
    type: definePropType<string | number | null | undefined>([
      String,
      Number,
      Object,
    ]),
    default: '',
  },
  /**
   * @description 最大输入长度，与原生 input 的 maxlength 属性相同
   */
  maxlength: {
    type: [String, Number],
  },
  /**
   * @description 最小输入长度，与原生 input 的 minlength 属性相同
   */
  minlength: {
    type: [String, Number],
  },
  /**
   * @description 输入框类型，如 text、password、textarea 等
   */
  type: {
    type: String,
    default: 'text',
  },
  /**
   * @description 控制 textarea 的可调整大小方向
   */
  resize: {
    type: String,
    values: ['none', 'both', 'horizontal', 'vertical'],
  },
  /**
   * @description textarea 是否自适应内容高度
   */
  autosize: {
    type: definePropType<InputAutoSize>([Boolean, Object]),
    default: false,
  },
  /**
   * @description 原生 input 的自动完成属性
   */
  autocomplete: {
    type: String,
    default: 'off',
  },
  /**
   * @description 格式化函数，用于格式化输入内容的显示
   */
  formatter: {
    type: Function,
  },
  /**
   * @description 解析函数，用于解析输入内容的实际值
   */
  parser: {
    type: Function,
  },
  /**
   * @description 输入框占位符文本
   */
  placeholder: {
    type: String,
  },
  /**
   * @description 原生 input 的 form 属性，指定所属表单
   */
  form: {
    type: String,
  },
  /**
   * @description 是否只读
   */
  readonly: Boolean,
  /**
   * @description 是否显示清除按钮
   */
  clearable: Boolean,
  /**
   * @description 是否显示密码切换按钮
   */
  showPassword: Boolean,
  /**
   * @description 是否显示字数统计
   */
  showWordLimit: Boolean,
  /**
   * @description 后缀图标
   */
  suffixIcon: {
    type: iconPropType,
  },
  /**
   * @description 前缀图标
   */
  prefixIcon: {
    type: iconPropType,
  },
  /**
   * @description 容器角色，内部属性，供选择器组件使用
   */
  containerRole: {
    type: String,
    default: undefined,
  },
  /**
   * @description 输入框的 tab 键顺序
   */
  tabindex: {
    type: [String, Number],
    default: 0,
  },
  /**
   * @description 是否触发表单验证
   */
  validateEvent: {
    type: Boolean,
    default: true,
  },
  /**
   * @description 输入框或文本域元素的样式
   */
  inputStyle: {
    type: definePropType<StyleValue>([Object, Array, String]),
    default: () => mutable({} as const),
  },
  /**
   * @description 原生 input 的自动聚焦属性
   */
  autofocus: Boolean,
  /**
   * @description textarea 的行数
   */
  rows: {
    type: Number,
    default: 2,
  },
  // 扩展可访问性属性
  ...useAriaProps(['ariaLabel']),
} as const)

/**
 * 输入框组件属性的类型定义
 */
export type InputProps = ExtractPropTypes<typeof inputProps>

/**
 * 输入框组件的事件定义
 * 定义了组件可以触发的所有事件及其验证函数
 */
export const inputEmits = {
  // v-model 更新事件
  [UPDATE_MODEL_EVENT]: (value: string) => isString(value),
  // 输入事件，在用户输入时触发
  input: (value: string) => isString(value),
  // 值改变事件，在输入框失去焦点或用户按下回车时触发
  change: (value: string) => isString(value),
  // 获得焦点事件
  focus: (evt: FocusEvent) => evt instanceof FocusEvent,
  // 失去焦点事件
  blur: (evt: FocusEvent) => evt instanceof FocusEvent,
  // 清除按钮点击事件
  clear: () => true,
  // 鼠标离开事件
  mouseleave: (evt: MouseEvent) => evt instanceof MouseEvent,
  // 鼠标进入事件
  mouseenter: (evt: MouseEvent) => evt instanceof MouseEvent,
  // 键盘按下事件
  // 注意：当浏览器自动填充时，keydown 事件是 Event 实例，而不是 KeyboardEvent
  // 相关 bug 报告：https://github.com/element-plus/element-plus/issues/6665
  keydown: (evt: KeyboardEvent | Event) => evt instanceof Event,
  // 输入法开始组合事件
  compositionstart: (evt: CompositionEvent) => evt instanceof CompositionEvent,
  // 输入法组合更新事件
  compositionupdate: (evt: CompositionEvent) => evt instanceof CompositionEvent,
  // 输入法组合结束事件
  compositionend: (evt: CompositionEvent) => evt instanceof CompositionEvent,
}

/**
 * 输入框组件事件的类型定义
 */
export type InputEmits = typeof inputEmits
