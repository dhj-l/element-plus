<!-- Switch 开关组件模板 -->
<template>
  <!-- 开关容器，包含点击事件处理 -->
  <div :class="switchKls" @click.prevent="switchValue">
    <!-- 
      隐藏的 checkbox 输入框，用于表单提交和无障碍访问
      
      为什么需要这个隐藏的 input：
      1. 表单提交：确保开关的值能被表单正确收集和提交
      2. 无障碍访问：为屏幕阅读器提供语义化的开关控件
      3. 键盘导航：支持 Tab 键聚焦和 Enter 键操作
      4. 浏览器兼容：利用原生 checkbox 的成熟特性
      
      ARIA 属性说明：
      - role="switch"：告诉辅助技术这是一个开关控件
      - aria-checked：当前的选中状态
      - aria-disabled：是否禁用
      - aria-label：开关的标签文本
    -->
    <input
      :id="inputId"
      ref="input"
      :class="ns.e('input')"
      type="checkbox"
      role="switch"
      :aria-checked="checked"
      :aria-disabled="switchDisabled"
      :aria-label="ariaLabel"
      :name="name"
      :true-value="activeValue"
      :false-value="inactiveValue"
      :disabled="switchDisabled"
      :tabindex="tabindex"
      @change="handleChange"
      @keydown.enter="switchValue"
    />
    <!-- 左侧标签（关闭状态的图标或文字） -->
    <span
      v-if="!inlinePrompt && (inactiveIcon || inactiveText)"
      :class="labelLeftKls"
    >
      <!-- 关闭状态图标 -->
      <el-icon v-if="inactiveIcon">
        <component :is="inactiveIcon" />
      </el-icon>
      <!-- 关闭状态文字 -->
      <span v-if="!inactiveIcon && inactiveText" :aria-hidden="checked">{{
        inactiveText
      }}</span>
    </span>
    <!-- 
      开关核心区域 - 这是用户看到的主要视觉元素
      
      结构说明：
      1. core：开关的主体容器，包含背景色和圆角样式
      2. inner：内联提示区域（可选），显示在开关内部的文字或图标
      3. action：操作按钮，即用户点击的圆形滑块
      
      渲染优先级：
      - 如果 loading=true，显示加载图标
      - 否则根据 checked 状态显示对应的 action 图标
      - 如果启用 inlinePrompt，在背景中显示提示内容
    -->
    <span ref="core" :class="ns.e('core')" :style="coreStyle">
      <!-- 内联提示（在开关内部显示图标或文字） -->
      <div v-if="inlinePrompt" :class="ns.e('inner')">
        <!-- 图标模式：根据开关状态显示不同图标 -->
        <template v-if="activeIcon || inactiveIcon">
          <el-icon :class="ns.is('icon')">
            <component :is="checked ? activeIcon : inactiveIcon" />
          </el-icon>
        </template>
        <!-- 文字模式：根据开关状态显示不同文字 -->
        <template v-else-if="activeText || inactiveText">
          <span :class="ns.is('text')" :aria-hidden="!checked">
            {{ checked ? activeText : inactiveText }}
          </span>
        </template>
      </div>
      <!-- 
        开关操作按钮 - 用户实际操作的滑块部分
        
        显示逻辑：
        1. 优先显示加载状态（loading=true 时）
        2. 然后显示插槽内容（支持自定义操作图标）
        3. 最后显示默认的 action 图标
      -->
      <div :class="ns.e('action')">
        <!-- 加载状态图标 -->
        <el-icon v-if="loading" :class="ns.is('loading')">
          <loading />
        </el-icon>
        <!-- 激活状态的操作插槽（支持自定义内容） -->
        <slot v-else-if="checked" name="active-action">
          <el-icon v-if="activeActionIcon">
            <component :is="activeActionIcon" />
          </el-icon>
        </slot>
        <!-- 非激活状态的操作插槽（支持自定义内容） -->
        <slot v-else-if="!checked" name="inactive-action">
          <el-icon v-if="inactiveActionIcon">
            <component :is="inactiveActionIcon" />
          </el-icon>
        </slot>
      </div>
    </span>
    <!-- 右侧标签（打开状态的图标或文字） -->
    <span
      v-if="!inlinePrompt && (activeIcon || activeText)"
      :class="labelRightKls"
    >
      <!-- 打开状态图标 -->
      <el-icon v-if="activeIcon">
        <component :is="activeIcon" />
      </el-icon>
      <!-- 打开状态文字 -->
      <span v-if="!activeIcon && activeText" :aria-hidden="!checked">{{
        activeText
      }}</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
/**
 * Switch 开关组件
 * 表示两种相互对立的状态间的切换，多用于触发「开/关」
 */

// Vue 核心功能导入
import { computed, nextTick, onMounted, ref, watch } from 'vue'
// 工具函数导入
import {
  addUnit,
  debugWarn,
  isBoolean,
  isPromise,
  throwError,
} from '@element-plus/utils'
// Element Plus 组件导入
import ElIcon from '@element-plus/components/icon'
// 表单相关 Hooks 导入
import {
  useFormDisabled,
  useFormItem,
  useFormItemInputId,
  useFormSize,
} from '@element-plus/components/form'
// 图标导入
import { Loading } from '@element-plus/icons-vue'
// 常量导入
import {
  CHANGE_EVENT,
  INPUT_EVENT,
  UPDATE_MODEL_EVENT,
} from '@element-plus/constants'
// Hooks 导入
import { useNamespace } from '@element-plus/hooks'
// 组件属性和事件定义导入
import { switchEmits, switchProps } from './switch'

// TypeScript 类型导入
import type { CSSProperties } from 'vue'

// 组件名称常量
const COMPONENT_NAME = 'ElSwitch'

// 组件选项定义
defineOptions({
  name: COMPONENT_NAME,
})

// 组件属性和事件定义
const props = defineProps(switchProps)
const emit = defineEmits(switchEmits)

// Hooks 使用
const { formItem } = useFormItem() // 表单项上下文
const switchSize = useFormSize() // 组件尺寸
const ns = useNamespace('switch') // 命名空间

// 输入框 ID 生成
const { inputId } = useFormItemInputId(props, {
  formItemContext: formItem,
})

// 响应式数据
const switchDisabled = useFormDisabled(computed(() => props.loading)) // 禁用状态（考虑表单禁用和加载状态）
const isControlled = ref(props.modelValue !== false) // 是否为受控组件（有传入 modelValue 则为受控）
const input = ref<HTMLInputElement>() // 隐藏的 checkbox 输入框引用
const core = ref<HTMLSpanElement>() // 开关核心区域的 DOM 引用

// 计算属性

/**
 * 开关容器样式类名
 */
const switchKls = computed(() => [
  ns.b(), // 基础类名
  ns.m(switchSize.value), // 尺寸修饰符
  ns.is('disabled', switchDisabled.value), // 禁用状态
  ns.is('checked', checked.value), // 选中状态
])

/**
 * 左侧标签样式类名
 */
const labelLeftKls = computed(() => [
  ns.e('label'), // 标签元素
  ns.em('label', 'left'), // 左侧位置
  ns.is('active', !checked.value), // 激活状态（关闭时激活）
])

/**
 * 右侧标签样式类名
 */
const labelRightKls = computed(() => [
  ns.e('label'), // 标签元素
  ns.em('label', 'right'), // 右侧位置
  ns.is('active', checked.value), // 激活状态（打开时激活）
])

/**
 * 核心区域样式
 */
const coreStyle = computed<CSSProperties>(() => ({
  width: addUnit(props.width), // 设置开关宽度
}))

// 监听器

/**
 * 监听 modelValue 变化，标记为受控组件
 *
 * 受控组件的概念：
 * - 当父组件传入 modelValue 时，组件变为受控模式
 * - 受控模式下，组件的状态完全由父组件控制
 * - 这确保了数据流的单向性和可预测性
 */
watch(
  () => props.modelValue,
  () => {
    isControlled.value = true
  }
)

/**
 * 实际值 - 根据是否为受控组件返回对应的值
 *
 * 受控组件概念：
 * - 受控组件：值由父组件通过 v-model 或 :model-value 控制
 * - 非受控组件：组件内部自己管理状态
 *
 * @example
 * // 受控组件用法
 * <el-switch v-model="switchValue" /> // isControlled.value = true
 *
 * // 非受控组件用法（不推荐）
 * <el-switch /> // isControlled.value = false，使用默认值 false
 */
const actualValue = computed(() => {
  return isControlled.value ? props.modelValue : false
})

/**
 * 选中状态 - 判断当前值是否等于激活值
 *
 * 逻辑说明：
 * - 当 actualValue 等于 activeValue 时，开关处于"打开"状态
 * - 当 actualValue 等于 inactiveValue 时，开关处于"关闭"状态
 *
 * @example
 * // 假设 activeValue="on", inactiveValue="off"
 * // 当 modelValue="on" 时，checked.value 为 true
 * // 当 modelValue="off" 时，checked.value 为 false
 */
const checked = computed(() => actualValue.value === props.activeValue)

// 初始化检查：如果当前值不在有效值范围内，设置为非激活值
// 这个检查确保组件的值始终是有效的（要么是 activeValue，要么是 inactiveValue）
// 如果传入了无效值，会自动修正为 inactiveValue（关闭状态）
if (![props.activeValue, props.inactiveValue].includes(actualValue.value)) {
  emit(UPDATE_MODEL_EVENT, props.inactiveValue)
  emit(CHANGE_EVENT, props.inactiveValue)
  emit(INPUT_EVENT, props.inactiveValue)
}

/**
 * 监听选中状态变化，同步到 DOM 并触发表单验证
 *
 * 这个监听器的作用：
 * 1. 保持 DOM 中 checkbox 的 checked 状态与组件状态同步
 * 2. 在状态变化时触发表单验证（如果启用了 validateEvent）
 *
 * 为什么需要同步 DOM 状态：
 * - 确保屏幕阅读器等辅助技术能正确识别开关状态
 * - 保持与原生 checkbox 行为一致
 * - 支持表单序列化和提交
 */
watch(checked, (val) => {
  // 同步 DOM 中 checkbox 的选中状态
  input.value!.checked = val

  // 触发表单验证（如果在表单中且启用了验证）
  if (props.validateEvent) {
    formItem?.validate?.('change').catch((err) => debugWarn(err))
  }
})

// 方法定义

/**
 * 处理开关状态变化
 * 触发相关事件并更新 DOM 状态
 *
 * 执行步骤：
 * 1. 计算新的值（当前是选中状态则切换到非选中值，反之亦然）
 * 2. 依次触发三个事件：update:modelValue、change、input
 * 3. 在下一个 tick 更新 DOM 中 checkbox 的 checked 状态
 *
 * @example
 * // 在父组件中监听事件
 * <el-switch
 *   v-model="switchValue"
 *   @change="handleSwitchChange"
 *   @input="handleSwitchInput"
 * />
 *
 * const handleSwitchChange = (val) => {
 *   console.log('开关状态改变:', val) // true 或 false
 * }
 */
const handleChange = () => {
  // 计算新值：如果当前是选中状态，则切换到非选中值；否则切换到选中值
  const val = checked.value ? props.inactiveValue : props.activeValue

  // 触发 v-model 更新事件
  emit(UPDATE_MODEL_EVENT, val)
  // 触发 change 事件（用于监听状态变化）
  emit(CHANGE_EVENT, val)
  // 触发 input 事件（保持与原生 input 元素行为一致）
  emit(INPUT_EVENT, val)

  // 在下一个 DOM 更新周期同步 checkbox 的选中状态
  // 确保 DOM 状态与数据状态保持一致
  nextTick(() => {
    input.value!.checked = checked.value
  })
}

/**
 * 切换开关值
 * 处理 beforeChange 钩子和状态切换逻辑
 *
 * 执行流程：
 * 1. 检查是否禁用，如果禁用则直接返回
 * 2. 如果没有 beforeChange 钩子，直接执行状态切换
 * 3. 如果有 beforeChange 钩子，先执行钩子函数
 * 4. 根据钩子返回值决定是否继续切换
 *
 * @example
 * // 使用 beforeChange 钩子
 * const beforeChange = () => {
 *   return new Promise((resolve) => {
 *     // 模拟异步验证
 *     setTimeout(() => {
 *       const canChange = confirm('确定要切换开关状态吗？')
 *       resolve(canChange)
 *     }, 100)
 *   })
 * }
 */
const switchValue = () => {
  // 如果开关被禁用，直接返回，不执行任何操作
  if (switchDisabled.value) return

  const { beforeChange } = props
  // 如果没有设置 beforeChange 钩子，直接切换状态
  if (!beforeChange) {
    handleChange()
    return
  }

  // 执行 beforeChange 钩子函数
  const shouldChange = beforeChange()

  // 验证 beforeChange 返回值类型
  // 必须返回 boolean 或 Promise<boolean>
  const isPromiseOrBool = [
    isPromise(shouldChange),
    isBoolean(shouldChange),
  ].includes(true)
  if (!isPromiseOrBool) {
    throwError(
      COMPONENT_NAME,
      'beforeChange must return type `Promise<boolean>` or `boolean`'
    )
  }

  // 处理 Promise 返回值
  if (isPromise(shouldChange)) {
    shouldChange
      .then((result) => {
        // 只有当 Promise resolve 为 true 时才切换状态
        if (result) {
          handleChange()
        }
      })
      .catch((e) => {
        // 如果 Promise 被 reject，记录警告但不切换状态
        debugWarn(COMPONENT_NAME, `some error occurred: ${e}`)
      })
  } else if (shouldChange) {
    // 如果返回 true，执行状态切换
    handleChange()
  }
  // 如果返回 false，不执行任何操作
}

/**
 * 聚焦到输入框
 */
const focus = (): void => {
  input.value?.focus?.()
}

// 生命周期

/**
 * 组件挂载后同步 checkbox 状态
 */
onMounted(() => {
  input.value!.checked = checked.value
})

// 暴露给父组件的方法和属性
// 通过 ref 获取组件实例后可以调用这些方法和访问这些属性
// 例如：const switchRef = ref(); switchRef.value.focus()
defineExpose({
  /**
   * @description 手动聚焦到开关组件
   * @example
   * // 在父组件中使用
   * const switchRef = ref()
   * const handleFocus = () => {
   *   switchRef.value.focus() // 聚焦到开关组件
   * }
   * // 模板中：<el-switch ref="switchRef" />
   */
  focus,
  /**
   * @description 开关是否被选中（只读属性）
   * @returns {boolean} 返回当前开关的选中状态
   * @example
   * // 在父组件中获取开关状态
   * const switchRef = ref()
   * const getStatus = () => {
   *   console.log(switchRef.value.checked) // true 或 false
   * }
   */
  checked,
})
</script>
