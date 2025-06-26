import { computed, inject, ref } from 'vue'
import { UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { useFormDisabled, useFormSize } from '@element-plus/components/form'
import { useDeprecated } from '@element-plus/hooks'
import { isPropAbsent } from '@element-plus/utils'
import { radioGroupKey } from './constants'

import type { RadioButtonProps } from './radio-button'
import type { SetupContext } from 'vue'
import type { RadioEmits, RadioProps } from './radio'

/**
 * Radio 组件的组合式函数
 * 提供 Radio 和 RadioButton 组件的核心逻辑
 *
 * @param props - Radio 或 RadioButton 组件的属性
 * @param emit - 事件发射器（可选）
 * @returns 返回 Radio 组件所需的响应式数据和方法
 */
export const useRadio = (
  props: RadioProps | RadioButtonProps,
  emit?: SetupContext<RadioEmits>['emit']
) => {
  /** Radio 输入框的引用 */
  const radioRef = ref<HTMLInputElement>()
  /** 注入的 RadioGroup 上下文 */
  const radioGroup = inject(radioGroupKey, undefined)
  /** 是否在 RadioGroup 中 */
  const isGroup = computed(() => !!radioGroup)

  /**
   * 实际值的计算属性
   * 在 2.x 版本中，如果没有 props.value，props.label 将作为 props.value
   * 在 3.x 版本中，将移除此计算属性，直接使用 props.value
   */
  const actualValue = computed(() => {
    if (!isPropAbsent(props.value)) {
      return props.value
    }
    return props.label
  })

  /**
   * 双向绑定的值
   * 如果在 RadioGroup 中，使用 RadioGroup 的 modelValue
   * 否则使用组件自身的 modelValue
   */
  const modelValue = computed<RadioProps['modelValue']>({
    get() {
      return isGroup.value ? radioGroup!.modelValue : props.modelValue!
    },
    set(val) {
      if (isGroup.value) {
        // 在 RadioGroup 中时，调用 RadioGroup 的 changeEvent
        radioGroup!.changeEvent(val)
      } else {
        // 独立使用时，直接触发 update:modelValue 事件
        emit && emit(UPDATE_MODEL_EVENT, val)
      }
      // 同步原生 input 的 checked 状态
      radioRef.value!.checked = props.modelValue === actualValue.value
    },
  })

  /** 组件尺寸，优先使用 RadioGroup 的尺寸 */
  const size = useFormSize(computed(() => radioGroup?.size))
  /** 禁用状态，优先使用 RadioGroup 的禁用状态 */
  const disabled = useFormDisabled(computed(() => radioGroup?.disabled))
  /** 焦点状态 */
  const focus = ref(false)

  /**
   * Tab 索引
   * 如果禁用或在 RadioGroup 中且不是当前选中项，则设为 -1
   */
  const tabIndex = computed(() => {
    return disabled.value ||
      (isGroup.value && modelValue.value !== actualValue.value)
      ? -1
      : 0
  })

  // 废弃警告：label 作为 value 的用法
  useDeprecated(
    {
      from: 'label act as value',
      replacement: 'value',
      version: '3.0.0',
      scope: 'el-radio',
      ref: 'https://element-plus.org/en-US/component/radio.html',
    },
    computed(() => isGroup.value && isPropAbsent(props.value))
  )

  return {
    /** Radio 输入框的引用 */
    radioRef,
    /** 是否在 RadioGroup 中 */
    isGroup,
    /** RadioGroup 上下文 */
    radioGroup,
    /** 焦点状态 */
    focus,
    /** 组件尺寸 */
    size,
    /** 禁用状态 */
    disabled,
    /** Tab 索引 */
    tabIndex,
    /** 双向绑定的值 */
    modelValue,
    /** 实际值 */
    actualValue,
  }
}
