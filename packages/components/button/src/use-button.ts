// 导入Vue相关的组合式API函数
import { Text, computed, inject, ref, useSlots } from 'vue'
// 导入表单相关的hooks：禁用状态、表单项、尺寸控制
import {
  useFormDisabled,
  useFormItem,
  useFormSize,
} from '@element-plus/components/form'
// 导入全局配置hook
import { useGlobalConfig } from '@element-plus/components/config-provider'
// 导入废弃警告hook
import { useDeprecated } from '@element-plus/hooks'
// 导入按钮组上下文key
import { buttonGroupContextKey } from './constants'

// 导入Vue类型定义
import type { SetupContext } from 'vue'
// 导入按钮组件的事件和属性类型
import type { ButtonEmits, ButtonProps } from './button'

/**
 * 按钮组件的逻辑hook
 * 处理按钮的状态管理、样式计算、事件处理等核心逻辑
 * @param props 按钮组件的props
 * @param emit 事件发射器，用于触发按钮事件
 * @returns 返回按钮相关的响应式数据、计算属性和方法
 */
export const useButton = (
  props: ButtonProps,
  emit: SetupContext<ButtonEmits>['emit']
) => {
  /**
   * 废弃警告：text类型按钮将在3.0.0版本中被移除
   * 建议使用link类型替代text类型
   */
  useDeprecated(
    {
      from: 'type.text',
      replacement: 'link',
      version: '3.0.0',
      scope: 'props',
      ref: 'https://element-plus.org/en-US/component/button.html#button-attributes',
    },
    computed(() => props.type === 'text')
  )

  // 注入按钮组的上下文，如果不在按钮组内则为undefined
  const buttonGroupContext = inject(buttonGroupContextKey, undefined)
  // 获取全局按钮配置
  const globalConfig = useGlobalConfig('button')
  // 获取表单项相关信息，包含表单实例
  const { form } = useFormItem()
  // 计算按钮尺寸，优先使用按钮组的尺寸设置
  const _size = useFormSize(computed(() => buttonGroupContext?.size))
  // 获取表单禁用状态
  const _disabled = useFormDisabled()
  // 按钮DOM元素的引用
  const _ref = ref<HTMLButtonElement>()
  // 获取插槽内容
  const slots = useSlots()

  /**
   * 计算按钮类型
   * 优先级：props.type > 按钮组类型 > 全局配置类型 > 空字符串
   * 例如：在按钮组中设置type="primary"，组内所有按钮都会是primary类型
   */
  const _type = computed(
    () =>
      props.type || buttonGroupContext?.type || globalConfig.value?.type || ''
  )

  /**
   * 是否自动在中文字符间插入空格
   * 优先级：props.autoInsertSpace > 全局配置 > false
   * 用于提升中文按钮文本的视觉效果
   */
  const autoInsertSpace = computed(
    () => props.autoInsertSpace ?? globalConfig.value?.autoInsertSpace ?? false
  )

  /**
   * 是否为朴素按钮样式
   * 优先级：props.plain > 全局配置 > false
   * 朴素按钮有边框但背景透明
   */
  const _plain = computed(
    () => props.plain ?? globalConfig.value?.plain ?? false
  )

  /**
   * 是否为圆角按钮样式
   * 优先级：props.round > 全局配置 > false
   * 圆角按钮显示为圆角矩形
   */
  const _round = computed(
    () => props.round ?? globalConfig.value?.round ?? false
  )

  /**
   * 计算动态属性对象
   * 当tag为'button'时，返回原生button元素需要的属性
   * 包括禁用状态、自动聚焦、原生类型等
   */
  const _props = computed(() => {
    if (props.tag === 'button') {
      return {
        // ARIA无障碍属性，表示按钮是否禁用
        ariaDisabled: _disabled.value || props.loading,
        // 原生disabled属性，控制按钮是否可交互
        disabled: _disabled.value || props.loading,
        // 是否自动获取焦点
        autofocus: props.autofocus,
        // 原生button的type属性（button/submit/reset）
        type: props.nativeType,
      }
    }
    // 非button元素时返回空对象
    return {}
  })

  /**
   * 判断是否需要在中文字符间添加空格
   * 条件：
   * 1. autoInsertSpace为true
   * 2. 默认插槽只有一个节点
   * 3. 该节点是文本节点
   * 4. 文本内容恰好是两个连续的中文字符
   * 例如："确定" 会在字符间添加空格变成 "确 定"
   */
  const shouldAddSpace = computed(() => {
    const defaultSlot = slots.default?.()
    if (autoInsertSpace.value && defaultSlot?.length === 1) {
      const slot = defaultSlot[0]
      if (slot?.type === Text) {
        const text = slot.children as string
        // 使用Unicode正则表达式匹配两个连续的中文字符
        return /^\p{Unified_Ideograph}{2}$/u.test(text.trim())
      }
    }
    return false
  })

  /**
   * 处理按钮点击事件
   * 包含禁用状态检查、表单重置逻辑、事件发射等
   * @param evt 鼠标点击事件对象
   */
  const handleClick = (evt: MouseEvent) => {
    // 如果按钮被禁用或正在加载，阻止事件冒泡并返回
    if (_disabled.value || props.loading) {
      evt.stopPropagation()
      return
    }
    // 如果是reset类型的按钮，重置所在的表单
    if (props.nativeType === 'reset') {
      form?.resetFields()
    }
    // 发射click事件给父组件
    emit('click', evt)
  }

  /**
   * 返回按钮hook的所有响应式数据和方法
   * 供按钮组件使用的完整API
   */
  return {
    _disabled, // 计算后的禁用状态
    _size, // 计算后的按钮尺寸
    _type, // 计算后的按钮类型
    _ref, // 按钮DOM元素引用
    _props, // 动态属性对象
    _plain, // 计算后的朴素样式状态
    _round, // 计算后的圆角状态
    shouldAddSpace, // 是否需要在中文字符间添加空格
    handleClick, // 点击事件处理函数
  }
}
