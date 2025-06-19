// 导入按钮组件
import type Button from './button.vue'
// 导入按钮组组件
import type ButtonGroup from './button-group.vue'

/**
 * 按钮组件实例类型
 * 用于获取按钮组件的实例类型，包含组件的所有方法和属性
 * 例如：const buttonRef = ref<ButtonInstance>() 用于模板引用
 */
export type ButtonInstance = InstanceType<typeof Button> & unknown

/**
 * 按钮组组件实例类型
 * 用于获取按钮组组件的实例类型，包含组件的所有方法和属性
 * 例如：const buttonGroupRef = ref<ButtonGroupInstance>() 用于模板引用
 */
export type ButtonGroupInstance = InstanceType<typeof ButtonGroup> & unknown
