// 导入输入框组件类型
import type Input from './input.vue'

/**
 * 输入框组件实例的类型定义
 * 使用 InstanceType 工具类型获取组件实例的类型
 * 包含组件的所有公开方法和属性
 */
export type InputInstance = InstanceType<typeof Input> & unknown
