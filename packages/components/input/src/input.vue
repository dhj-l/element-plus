<template>
  <!-- 输入框容器：根据类型隐藏 hidden 类型的输入框 -->
  <div
    v-show="type !== 'hidden'"
    :class="containerKls"
    :style="containerStyle"
    :role="containerRole"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 普通输入框（非 textarea） -->
    <template v-if="type !== 'textarea'">
      <!-- 前置内容插槽 -->
      <div v-if="slots.prepend" :class="nsInput.be('group', 'prepend')">
        <slot name="prepend" />
      </div>

      <!-- 输入框包装器 -->
      <div ref="wrapperRef" :class="wrapperKls">
        <!-- 前缀区域：前缀插槽或前缀图标 -->
        <span v-if="slots.prefix || prefixIcon" :class="nsInput.e('prefix')">
          <span :class="nsInput.e('prefix-inner')">
            <!-- 前缀插槽内容 -->
            <slot name="prefix" />
            <!-- 前缀图标 -->
            <ElIcon v-if="prefixIcon" :class="nsInput.e('icon')">
              <component :is="prefixIcon" />
            </ElIcon>
          </span>
        </span>

        <!-- 原生输入框元素 -->
        <input
          :id="inputId"
          ref="input"
          :class="nsInput.e('inner')"
          v-bind="attrs"
          :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
          :disabled="inputDisabled"
          :formatter="formatter"
          :parser="parser"
          :readonly="readonly"
          :autocomplete="autocomplete"
          :tabindex="tabindex"
          :aria-label="ariaLabel"
          :placeholder="placeholder"
          :style="inputStyle"
          :form="form"
          :autofocus="autofocus"
          @compositionstart="handleCompositionStart"
          @compositionupdate="handleCompositionUpdate"
          @compositionend="handleCompositionEnd"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @change="handleChange"
          @keydown="handleKeydown"
        />

        <!-- 后缀区域：包含各种功能按钮和状态显示 -->
        <span v-if="suffixVisible" :class="nsInput.e('suffix')">
          <span :class="nsInput.e('suffix-inner')">
            <!-- 后缀插槽和后缀图标：当没有清除、密码切换、字数限制时显示 -->
            <template
              v-if="!showClear || !showPwdVisible || !isWordLimitVisible"
            >
              <!-- 后缀插槽内容 -->
              <slot name="suffix" />
              <!-- 后缀图标 -->
              <ElIcon v-if="suffixIcon" :class="nsInput.e('icon')">
                <component :is="suffixIcon" />
              </ElIcon>
            </template>
            <!-- 清除按钮 -->
            <ElIcon
              v-if="showClear"
              :class="[nsInput.e('icon'), nsInput.e('clear')]"
              @mousedown.prevent="NOOP"
              @click="clear"
            >
              <CircleClose />
            </ElIcon>
            <!-- 密码可见性切换按钮 -->
            <ElIcon
              v-if="showPwdVisible"
              :class="[nsInput.e('icon'), nsInput.e('password')]"
              @click="handlePasswordVisible"
            >
              <component :is="passwordIcon" />
            </ElIcon>
            <!-- 字数统计显示 -->
            <span v-if="isWordLimitVisible" :class="nsInput.e('count')">
              <span :class="nsInput.e('count-inner')">
                {{ textLength }} / {{ maxlength }}
              </span>
            </span>
            <!-- 表单验证状态图标 -->
            <ElIcon
              v-if="validateState && validateIcon && needStatusIcon"
              :class="[
                nsInput.e('icon'),
                nsInput.e('validateIcon'),
                nsInput.is('loading', validateState === 'validating'),
              ]"
            >
              <component :is="validateIcon" />
            </ElIcon>
          </span>
        </span>
      </div>

      <!-- 后置内容插槽 -->
      <div v-if="slots.append" :class="nsInput.be('group', 'append')">
        <slot name="append" />
      </div>
    </template>

    <!-- 文本域 -->
    <template v-else>
      <!-- 原生文本域元素 -->
      <textarea
        :id="inputId"
        ref="textarea"
        :class="nsTextarea.e('inner')"
        v-bind="attrs"
        :tabindex="tabindex"
        :disabled="inputDisabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :style="textareaStyle"
        :aria-label="ariaLabel"
        :placeholder="placeholder"
        :form="form"
        :autofocus="autofocus"
        :rows="rows"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown="handleKeydown"
      />
      <!-- 文本域字数统计 -->
      <span
        v-if="isWordLimitVisible"
        :style="countStyle"
        :class="nsInput.e('count')"
      >
        {{ textLength }} / {{ maxlength }}
      </span>
    </template>
  </div>
</template>

<script lang="ts" setup>
// Vue 核心功能导入
import {
  computed, // 计算属性
  nextTick, // 下一个 DOM 更新周期
  onMounted, // 组件挂载生命周期钩子
  ref, // 响应式引用
  shallowRef, // 浅层响应式引用
  toRef, // 将响应式对象的属性转换为 ref
  useAttrs as useRawAttrs, // 获取原始属性
  useSlots, // 获取组件插槽
  watch, // 监听器
} from 'vue'
// VueUse 工具库
import { useResizeObserver } from '@vueuse/core' // 监听元素尺寸变化
// Lodash 工具函数
import { isNil } from 'lodash-unified' // 判断是否为 null/undefined
// Element Plus 图标组件
import { ElIcon } from '@element-plus/components/icon'
// Element Plus 图标
import {
  CircleClose, // 圆形关闭图标
  Hide as IconHide, // 隐藏图标
  View as IconView, // 查看图标
} from '@element-plus/icons-vue'
// Element Plus 表单相关 hooks
import {
  useFormDisabled, // 表单禁用状态
  useFormItem, // 表单项上下文
  useFormItemInputId, // 表单项输入框 ID
  useFormSize, // 表单尺寸
} from '@element-plus/components/form'
// Element Plus 工具函数
import {
  NOOP, // 空操作函数
  ValidateComponentsMap, // 验证状态图标映射
  debugWarn, // 调试警告
  isClient, // 是否为客户端环境
  isObject, // 判断是否为对象
} from '@element-plus/utils'
// Element Plus hooks
import {
  useAttrs, // 获取组件属性
  useComposition, // 输入法组合事件处理
  useCursor, // 光标位置控制
  useFocusController, // 焦点控制
  useNamespace, // 命名空间
} from '@element-plus/hooks'
// Element Plus 常量
import {
  CHANGE_EVENT, // change 事件名
  INPUT_EVENT, // input 事件名
  UPDATE_MODEL_EVENT, // 更新模型值事件名
} from '@element-plus/constants'
// 文本域高度计算工具
import { calcTextareaHeight } from './utils'
// 输入框组件的属性和事件定义
import { inputEmits, inputProps } from './input'

// Vue 类型导入
import type { StyleValue } from 'vue'

// 输入框目标元素类型
type TargetElement = HTMLInputElement | HTMLTextAreaElement

// 组件名称常量
const COMPONENT_NAME = 'ElInput'
// 定义组件选项
defineOptions({
  name: COMPONENT_NAME, // 组件名称
  inheritAttrs: false, // 不继承父组件的属性到根元素
})
// 定义组件属性
const props = defineProps(inputProps)
// 定义组件事件
const emit = defineEmits(inputEmits)

// 获取原始属性（包括 class 和 style）
const rawAttrs = useRawAttrs()
// 获取组件属性
const attrs = useAttrs()
// 获取组件插槽
const slots = useSlots()

// 容器样式类名计算属性
const containerKls = computed(() => [
  // 根据类型选择基础样式类
  props.type === 'textarea' ? nsTextarea.b() : nsInput.b(),
  // 尺寸修饰符
  nsInput.m(inputSize.value),
  // 禁用状态
  nsInput.is('disabled', inputDisabled.value),
  // 超出字数限制状态
  nsInput.is('exceed', inputExceed.value),
  {
    // 输入框组合（前置/后置内容）
    [nsInput.b('group')]: slots.prepend || slots.append,
    // 前缀样式
    [nsInput.m('prefix')]: slots.prefix || props.prefixIcon,
    // 后缀样式
    [nsInput.m('suffix')]:
      slots.suffix || props.suffixIcon || props.clearable || props.showPassword,
    // 密码清除按钮样式
    [nsInput.bm('suffix', 'password-clear')]:
      showClear.value && showPwdVisible.value,
    // 隐藏输入框样式
    [nsInput.b('hidden')]: props.type === 'hidden',
  },
  // 继承的 class 属性
  rawAttrs.class,
])

// 包装器样式类名计算属性
const wrapperKls = computed(() => [
  // 包装器基础样式
  nsInput.e('wrapper'),
  // 焦点状态样式
  nsInput.is('focus', isFocused.value),
])

// 表单相关上下文
const { form: elForm, formItem: elFormItem } = useFormItem()
// 表单项输入框 ID
const { inputId } = useFormItemInputId(props, {
  formItemContext: elFormItem,
})
// 输入框尺寸（继承表单尺寸）
const inputSize = useFormSize()
// 输入框禁用状态（继承表单禁用状态）
const inputDisabled = useFormDisabled()
// 输入框命名空间
const nsInput = useNamespace('input')
// 文本域命名空间
const nsTextarea = useNamespace('textarea')

// 输入框元素引用
const input = shallowRef<HTMLInputElement>()
// 文本域元素引用
const textarea = shallowRef<HTMLTextAreaElement>()

// 鼠标悬停状态
const hovering = ref(false)
// 密码可见状态
const passwordVisible = ref(false)
// 字数统计样式
const countStyle = ref<StyleValue>()
// 文本域计算后的样式
const textareaCalcStyle = shallowRef(props.inputStyle)

// 当前激活的输入元素引用（input 或 textarea）
const _ref = computed(() => input.value || textarea.value)

// 焦点控制器：wrapperRef 用于 text 类型，handleFocus 和 handleBlur 用于 textarea 类型
const { wrapperRef, isFocused, handleFocus, handleBlur } = useFocusController(
  _ref,
  {
    // 聚焦前检查：如果禁用则阻止聚焦
    beforeFocus() {
      return inputDisabled.value
    },
    // 失焦后处理：触发表单验证
    afterBlur() {
      if (props.validateEvent) {
        elFormItem?.validate?.('blur').catch((err) => debugWarn(err))
      }
    },
  }
)

// 是否需要显示状态图标
const needStatusIcon = computed(() => elForm?.statusIcon ?? false)
// 验证状态
const validateState = computed(() => elFormItem?.validateState || '')
// 验证状态图标
const validateIcon = computed(
  () => validateState.value && ValidateComponentsMap[validateState.value]
)
// 密码显示/隐藏图标
const passwordIcon = computed(() =>
  passwordVisible.value ? IconView : IconHide
)
// 容器样式
const containerStyle = computed<StyleValue>(() => [
  rawAttrs.style as StyleValue,
])
// 文本域样式
const textareaStyle = computed<StyleValue>(() => [
  props.inputStyle, // 用户自定义样式
  textareaCalcStyle.value, // 计算后的样式（自动调整高度）
  { resize: props.resize }, // 调整大小属性
])
// 原生输入框值（确保为字符串）
const nativeInputValue = computed(() =>
  isNil(props.modelValue) ? '' : String(props.modelValue)
)
// 是否显示清除按钮
const showClear = computed(
  () =>
    props.clearable && // 启用清除功能
    !inputDisabled.value && // 非禁用状态
    !props.readonly && // 非只读状态
    !!nativeInputValue.value && // 有输入值
    (isFocused.value || hovering.value) // 聚焦或悬停状态
)
// 是否显示密码可见性切换按钮
const showPwdVisible = computed(
  () => props.showPassword && !inputDisabled.value && !!nativeInputValue.value
)
// 是否显示字数限制
const isWordLimitVisible = computed(
  () =>
    props.showWordLimit && // 启用字数限制显示
    !!props.maxlength && // 设置了最大长度
    (props.type === 'text' || props.type === 'textarea') && // 文本或文本域类型
    !inputDisabled.value && // 非禁用状态
    !props.readonly && // 非只读状态
    !props.showPassword // 非密码类型
)
// 当前文本长度
const textLength = computed(() => nativeInputValue.value.length)
// 是否超出字数限制
const inputExceed = computed(
  () =>
    // 如果初始值长度大于最大长度，显示超出样式
    !!isWordLimitVisible.value && textLength.value > Number(props.maxlength)
)
// 后缀区域是否可见
const suffixVisible = computed(
  () =>
    !!slots.suffix || // 有后缀插槽
    !!props.suffixIcon || // 有后缀图标
    showClear.value || // 显示清除按钮
    props.showPassword || // 显示密码切换
    isWordLimitVisible.value || // 显示字数限制
    (!!validateState.value && needStatusIcon.value) // 显示验证状态图标
)

// 光标位置控制：记录和设置光标位置
const [recordCursor, setCursor] = useCursor(input)

// 监听文本域尺寸变化
useResizeObserver(textarea, (entries) => {
  // 初始化文本域尺寸
  onceInitSizeTextarea()
  // 如果不显示字数限制或调整模式不是 both，则返回
  if (!isWordLimitVisible.value || props.resize !== 'both') return
  const entry = entries[0]
  const { width } = entry.contentRect
  // 调整字数统计位置：right: 100% - width + padding(15) + right(6)
  countStyle.value = {
    right: `calc(100% - ${width + 15 + 6}px)`,
  }
})

// 调整文本域高度
const resizeTextarea = () => {
  const { type, autosize } = props

  // 只在客户端环境、文本域类型且元素存在时执行
  if (!isClient || type !== 'textarea' || !textarea.value) return

  if (autosize) {
    // 获取最小和最大行数
    const minRows = isObject(autosize) ? autosize.minRows : undefined
    const maxRows = isObject(autosize) ? autosize.maxRows : undefined
    // 计算文本域高度
    const textareaStyle = calcTextareaHeight(textarea.value, minRows, maxRows)

    // 如果显示滚动条，文本域需要比计算高度更多的空间
    // 如果在这种情况下设置文本域高度，滚动条不会隐藏
    // 所以需要先隐藏滚动条，然后在下一个 tick 中重置
    // 参见：https://github.com/element-plus/element-plus/issues/8825
    textareaCalcStyle.value = {
      overflowY: 'hidden',
      ...textareaStyle,
    }

    nextTick(() => {
      // 注意：强制重绘以确保上面设置的样式被应用
      textarea.value!.offsetHeight
      textareaCalcStyle.value = textareaStyle
    })
  } else {
    // 非自动调整大小时，只设置最小高度
    textareaCalcStyle.value = {
      minHeight: calcTextareaHeight(textarea.value).minHeight,
    }
  }
}

// 创建只执行一次的初始化调整大小函数
const createOnceInitResize = (resizeTextarea: () => void) => {
  let isInit = false
  return () => {
    // 如果已初始化或未启用自动调整大小，则返回
    if (isInit || !props.autosize) return
    // 检查元素是否隐藏
    const isElHidden = textarea.value?.offsetParent === null
    if (!isElHidden) {
      resizeTextarea()
      isInit = true
    }
  }
}
// 修复：https://github.com/element-plus/element-plus/issues/12074
const onceInitSizeTextarea = createOnceInitResize(resizeTextarea)

// 设置原生输入框值
const setNativeInputValue = () => {
  const input = _ref.value
  // 如果有格式化函数，则格式化值
  const formatterValue = props.formatter
    ? props.formatter(nativeInputValue.value)
    : nativeInputValue.value
  // 如果输入框不存在或值相同，则返回
  if (!input || input.value === formatterValue) return
  input.value = formatterValue
}

// 处理输入事件
const handleInput = async (event: Event) => {
  // 记录光标位置
  recordCursor()

  let { value } = event.target as TargetElement

  // 如果同时设置了格式化和解析函数，先解析值
  if (props.formatter && props.parser) {
    value = props.parser(value)
  }

  // 输入法组合期间不应触发 input 事件
  // 参见：https://github.com/ElemeFE/element/issues/10516
  if (isComposing.value) return

  // 修复 IE 兼容性问题的 hack
  // 当不再支持 IE 时应移除以下行
  // 参见：https://github.com/ElemeFE/element/issues/8548
  if (value === nativeInputValue.value) {
    setNativeInputValue()
    return
  }

  // 触发模型值更新和输入事件
  emit(UPDATE_MODEL_EVENT, value)
  emit(INPUT_EVENT, value)

  // 确保原生输入框值受控
  // 参见：https://github.com/ElemeFE/element/issues/12850
  await nextTick()
  setNativeInputValue()
  setCursor()
}

// 处理值变化事件
const handleChange = (event: Event) => {
  let { value } = event.target as TargetElement

  // 如果同时设置了格式化和解析函数，先解析值
  if (props.formatter && props.parser) {
    value = props.parser(value)
  }
  // 触发变化事件
  emit(CHANGE_EVENT, value)
}

// 输入法组合事件处理
const {
  isComposing, // 是否正在输入法组合
  handleCompositionStart, // 开始组合事件处理
  handleCompositionUpdate, // 组合更新事件处理
  handleCompositionEnd, // 结束组合事件处理
} = useComposition({ emit, afterComposition: handleInput })

// 切换密码可见性
const handlePasswordVisible = () => {
  recordCursor()
  passwordVisible.value = !passwordVisible.value
  // 原生输入框需要一点时间重新获得焦点
  setTimeout(setCursor)
}

// 聚焦输入框
const focus = () => _ref.value?.focus()

// 失焦输入框
const blur = () => _ref.value?.blur()

// 处理鼠标离开事件
const handleMouseLeave = (evt: MouseEvent) => {
  hovering.value = false
  emit('mouseleave', evt)
}

// 处理鼠标进入事件
const handleMouseEnter = (evt: MouseEvent) => {
  hovering.value = true
  emit('mouseenter', evt)
}

// 处理键盘按下事件
const handleKeydown = (evt: KeyboardEvent) => {
  emit('keydown', evt)
}

// 选中输入框内容
const select = () => {
  _ref.value?.select()
}

// 清空输入框
const clear = () => {
  emit(UPDATE_MODEL_EVENT, '') // 更新模型值为空
  emit(CHANGE_EVENT, '') // 触发变化事件
  emit('clear') // 触发清空事件
  emit(INPUT_EVENT, '') // 触发输入事件
}

// 监听模型值变化
watch(
  () => props.modelValue,
  () => {
    // 下一个 tick 调整文本域大小
    nextTick(() => resizeTextarea())
    // 如果启用验证事件，触发表单验证
    if (props.validateEvent) {
      elFormItem?.validate?.('change').catch((err) => debugWarn(err))
    }
  }
)

// 原生输入框值显式设置
// 模板中不使用 v-model / :value
// 参见：https://github.com/ElemeFE/element/issues/14521
watch(nativeInputValue, () => setNativeInputValue())

// 当在 <input> 和 <textarea> 之间切换时，
// 更新 DOM 相关的值和样式
// 参见：https://github.com/ElemeFE/element/issues/14857
watch(
  () => props.type,
  async () => {
    await nextTick()
    setNativeInputValue()
    resizeTextarea()
  }
)

// 组件挂载时的初始化
onMounted(() => {
  // 如果只设置了解析器而没有格式化器，发出警告
  if (!props.formatter && props.parser) {
    debugWarn(
      COMPONENT_NAME,
      'If you set the parser, you also need to set the formatter.'
    )
  }
  // 设置原生输入框值
  setNativeInputValue()
  // 下一个 tick 调整文本域大小
  nextTick(resizeTextarea)
})

// 暴露组件实例方法和属性
defineExpose({
  /** @description HTML input 元素 */
  input,
  /** @description HTML textarea 元素 */
  textarea,
  /** @description HTML 元素，input 或 textarea */
  ref: _ref,
  /** @description 文本域样式 */
  textareaStyle,

  /** @description 来自 props 的自动调整大小配置（用于单元测试） */
  autosize: toRef(props, 'autosize'),

  /** @description 是否正在输入法组合 */
  isComposing,

  /** @description HTML input 元素原生聚焦方法 */
  focus,
  /** @description HTML input 元素原生失焦方法 */
  blur,
  /** @description HTML input 元素原生选中方法 */
  select,
  /** @description 清空输入框值 */
  clear,
  /** @description 调整文本域大小 */
  resizeTextarea,
})
</script>
