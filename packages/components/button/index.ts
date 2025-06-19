// 导入组件安装工具函数
import { withInstall, withNoopInstall } from '@element-plus/utils'
// 导入按钮组件
import Button from './src/button.vue'
// 导入按钮组组件
import ButtonGroup from './src/button-group.vue'

import type { SFCWithInstall } from '@element-plus/utils'

/**
 * Element Plus 按钮组件
 * 支持多种类型、尺寸和状态的按钮
 * 同时包含ButtonGroup子组件用于按钮分组
 * 例如：app.use(ElButton) 全局注册按钮组件
 */
export const ElButton: SFCWithInstall<typeof Button> & {
  ButtonGroup: typeof ButtonGroup
} = withInstall(Button, {
  ButtonGroup,
})

/**
 * Element Plus 按钮组组件
 * 用于将多个按钮组合在一起，统一控制样式
 * 例如：app.use(ElButtonGroup) 全局注册按钮组组件
 */
export const ElButtonGroup: SFCWithInstall<typeof ButtonGroup> =
  withNoopInstall(ButtonGroup)

// 默认导出按钮组件
export default ElButton

// 导出按钮相关的所有类型和常量
export * from './src/button'
// 导出按钮组上下文相关的类型和常量
export * from './src/constants'
// 导出组件实例类型
export type { ButtonInstance, ButtonGroupInstance } from './src/instance'
