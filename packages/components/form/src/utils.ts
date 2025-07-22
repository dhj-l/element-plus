/**
 * Element Plus Form 表单组件工具函数
 *
 * 本文件提供了表单组件中使用的工具函数，包括：
 * - 标签宽度自动计算
 * - 字段过滤功能
 *
 * 这些工具函数用于支持表单的高级功能和优化用户体验
 */

// Vue 3 核心功能
import { computed, ref } from 'vue'
// Element Plus 工具函数
import { debugWarn, ensureArray, isArray } from '@element-plus/utils'

// Element Plus 工具类型
import type { Arrayable } from '@element-plus/utils'
// 表单上下文类型
import type { FormItemContext } from './types'
// 表单项属性类型
import type { FormItemProp } from './form-item'

// 调试作用域标识
const SCOPE = 'ElForm'

/**
 * 表单标签宽度管理 Hook
 *
 * 用于自动计算表单标签的最佳宽度，确保所有标签对齐
 * 当表单项的标签宽度设置为 'auto' 时，会自动计算所有标签的最大宽度
 *
 * @returns 返回标签宽度管理相关的方法和计算属性
 *
 * @example
 * ```vue
 * <script setup>
 * const { autoLabelWidth, registerLabelWidth, deregisterLabelWidth } = useFormLabelWidth()
 *
 * // autoLabelWidth.value 会自动计算为最大标签宽度，如 '120px'
 * </script>
 * ```
 */
export function useFormLabelWidth() {
  // 存储所有标签宽度的数组
  const potentialLabelWidthArr = ref<number[]>([])

  /**
   * 自动计算的标签宽度
   * 取所有注册标签宽度的最大值
   */
  const autoLabelWidth = computed(() => {
    if (!potentialLabelWidthArr.value.length) return '0'
    const max = Math.max(...potentialLabelWidthArr.value)
    return max ? `${max}px` : ''
  })

  /**
   * 获取指定宽度在数组中的索引
   * @param width 标签宽度值
   * @returns 索引位置，未找到返回 -1
   */
  function getLabelWidthIndex(width: number) {
    const index = potentialLabelWidthArr.value.indexOf(width)
    if (index === -1 && autoLabelWidth.value === '0') {
      debugWarn(SCOPE, `unexpected width ${width}`)
    }
    return index
  }

  /**
   * 注册标签宽度
   * @param val 新的标签宽度值
   * @param oldVal 旧的标签宽度值（用于更新）
   */
  function registerLabelWidth(val: number, oldVal: number) {
    if (val && oldVal) {
      // 更新现有宽度
      const index = getLabelWidthIndex(oldVal)
      potentialLabelWidthArr.value.splice(index, 1, val)
    } else if (val) {
      // 添加新宽度
      potentialLabelWidthArr.value.push(val)
    }
  }

  /**
   * 注销标签宽度
   * @param val 要移除的标签宽度值
   */
  function deregisterLabelWidth(val: number) {
    const index = getLabelWidthIndex(val)
    if (index > -1) {
      potentialLabelWidthArr.value.splice(index, 1)
    }
  }

  return {
    /** 自动计算的标签宽度 */
    autoLabelWidth,
    /** 注册标签宽度 */
    registerLabelWidth,
    /** 注销标签宽度 */
    deregisterLabelWidth,
  }
}

/**
 * 过滤表单字段
 *
 * 根据指定的属性名数组过滤表单项上下文列表
 * 用于实现部分字段的验证、重置等操作
 *
 * @param fields 表单项上下文数组
 * @param props 要过滤的属性名（支持字符串、字符串数组或嵌套路径）
 * @returns 过滤后的表单项上下文数组
 *
 * @example
 * ```typescript
 * const allFields = [userField, emailField, passwordField]
 *
 * // 过滤单个字段
 * const userFields = filterFields(allFields, 'username')
 *
 * // 过滤多个字段
 * const loginFields = filterFields(allFields, ['username', 'password'])
 *
 * // 过滤嵌套字段
 * const profileFields = filterFields(allFields, ['user.profile.name', 'user.profile.email'])
 *
 * // 如果不指定属性名，返回所有字段
 * const allFieldsAgain = filterFields(allFields, [])
 * ```
 */
export const filterFields = (
  fields: FormItemContext[],
  props: Arrayable<FormItemProp>
) => {
  // 标准化属性名数组，将数组路径转换为点分隔的字符串
  const normalized = ensureArray(props).map((prop) =>
    isArray(prop) ? prop.join('.') : prop
  )

  // 如果指定了属性名，则过滤匹配的字段；否则返回所有字段
  return normalized.length > 0
    ? fields.filter(
        (field) => field.propString && normalized.includes(field.propString)
      )
    : fields
}
