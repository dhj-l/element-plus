// 导入 Element Plus 工具函数
import { isFirefox, isNumber } from '@element-plus/utils'

/**
 * 隐藏的 textarea 元素，用于计算文本高度
 * 全局变量，避免重复创建 DOM 元素
 */
let hiddenTextarea: HTMLTextAreaElement | undefined = undefined

/**
 * 隐藏元素的样式配置
 * 用于创建不可见的测量元素
 */
const HIDDEN_STYLE = {
  height: '0', // 高度为 0
  visibility: 'hidden', // 不可见
  overflow: isFirefox() ? '' : 'hidden', // Firefox 浏览器特殊处理溢出
  position: 'absolute', // 绝对定位
  'z-index': '-1000', // 层级最低
  top: '0', // 顶部位置
  right: '0', // 右侧位置
}

/**
 * 需要复制到隐藏元素的样式属性列表
 * 这些样式会影响文本的渲染和高度计算
 */
const CONTEXT_STYLE = [
  'letter-spacing', // 字符间距
  'line-height', // 行高
  'padding-top', // 上内边距
  'padding-bottom', // 下内边距
  'font-family', // 字体族
  'font-weight', // 字体粗细
  'font-size', // 字体大小
  'text-rendering', // 文本渲染
  'text-transform', // 文本转换
  'width', // 宽度
  'text-indent', // 文本缩进
  'padding-left', // 左内边距
  'padding-right', // 右内边距
  'border-width', // 边框宽度
  'box-sizing', // 盒模型
]

/**
 * 节点样式信息的类型定义
 */
type NodeStyle = {
  contextStyle: string[][] // 上下文样式数组，每项包含 [属性名, 属性值]
  boxSizing: string // 盒模型类型
  paddingSize: number // 内边距总大小（上下）
  borderSize: number // 边框总大小（上下）
}

/**
 * textarea 高度信息的类型定义
 */
type TextAreaHeight = {
  height: string // 计算出的高度
  minHeight?: string // 最小高度（可选）
}

/**
 * 计算目标元素的样式信息
 * @param targetElement 目标元素
 * @returns 包含样式信息的对象
 */
function calculateNodeStyling(targetElement: Element): NodeStyle {
  // 获取元素的计算样式
  const style = window.getComputedStyle(targetElement)

  // 获取盒模型类型
  const boxSizing = style.getPropertyValue('box-sizing')

  // 计算上下内边距总和
  const paddingSize =
    Number.parseFloat(style.getPropertyValue('padding-bottom')) +
    Number.parseFloat(style.getPropertyValue('padding-top'))

  // 计算上下边框总和
  const borderSize =
    Number.parseFloat(style.getPropertyValue('border-bottom-width')) +
    Number.parseFloat(style.getPropertyValue('border-top-width'))

  // 提取需要的上下文样式
  const contextStyle = CONTEXT_STYLE.map((name) => [
    name,
    style.getPropertyValue(name),
  ])

  return { contextStyle, paddingSize, borderSize, boxSizing }
}

/**
 * 计算 textarea 的自适应高度
 * 通过创建隐藏的 textarea 元素来测量内容所需的高度
 * @param targetElement 目标 textarea 元素
 * @param minRows 最小行数，默认为 1
 * @param maxRows 最大行数，可选
 * @returns 包含高度信息的对象
 */
export function calcTextareaHeight(
  targetElement: HTMLTextAreaElement,
  minRows = 1,
  maxRows?: number
): TextAreaHeight {
  // 如果隐藏的 textarea 不存在，则创建一个
  if (!hiddenTextarea) {
    hiddenTextarea = document.createElement('textarea')
    document.body.appendChild(hiddenTextarea)
  }

  // 获取目标元素的样式信息
  const { paddingSize, borderSize, boxSizing, contextStyle } =
    calculateNodeStyling(targetElement)

  // 将目标元素的样式应用到隐藏元素
  contextStyle.forEach(([key, value]) =>
    hiddenTextarea?.style.setProperty(key, value)
  )

  // 应用隐藏样式，确保元素不可见且不影响布局
  Object.entries(HIDDEN_STYLE).forEach(([key, value]) =>
    hiddenTextarea?.style.setProperty(key, value, 'important')
  )

  // 设置隐藏元素的内容为目标元素的值或占位符
  hiddenTextarea.value = targetElement.value || targetElement.placeholder || ''

  // 获取内容的滚动高度
  let height = hiddenTextarea.scrollHeight
  const result = {} as TextAreaHeight

  // 根据盒模型调整高度
  if (boxSizing === 'border-box') {
    // border-box：需要加上边框大小
    height = height + borderSize
  } else if (boxSizing === 'content-box') {
    // content-box：需要减去内边距大小
    height = height - paddingSize
  }

  // 清空内容，计算单行高度
  hiddenTextarea.value = ''
  const singleRowHeight = hiddenTextarea.scrollHeight - paddingSize

  // 处理最小行数限制
  if (isNumber(minRows)) {
    let minHeight = singleRowHeight * minRows
    if (boxSizing === 'border-box') {
      minHeight = minHeight + paddingSize + borderSize
    }
    height = Math.max(minHeight, height)
    result.minHeight = `${minHeight}px`
  }

  // 处理最大行数限制
  if (isNumber(maxRows)) {
    let maxHeight = singleRowHeight * maxRows
    if (boxSizing === 'border-box') {
      maxHeight = maxHeight + paddingSize + borderSize
    }
    height = Math.min(maxHeight, height)
  }

  // 设置最终高度
  result.height = `${height}px`

  // 清理隐藏元素
  hiddenTextarea.parentNode?.removeChild(hiddenTextarea)
  hiddenTextarea = undefined

  return result
}
