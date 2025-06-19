import { computed, getCurrentInstance, inject, ref, unref } from 'vue'

import type { InjectionKey, Ref } from 'vue'

export const defaultNamespace = 'el'
const statePrefix = 'is-'

const _bem = (
  namespace: string,
  block: string,
  blockSuffix: string,
  element: string,
  modifier: string
) => {
  let cls = `${namespace}-${block}`
  if (blockSuffix) {
    cls += `-${blockSuffix}`
  }
  if (element) {
    cls += `__${element}`
  }
  if (modifier) {
    cls += `--${modifier}`
  }
  return cls
}

export const namespaceContextKey: InjectionKey<Ref<string | undefined>> =
  Symbol('namespaceContextKey')

export const useGetDerivedNamespace = (
  namespaceOverrides?: Ref<string | undefined>
) => {
  const derivedNamespace =
    namespaceOverrides ||
    (getCurrentInstance()
      ? inject(namespaceContextKey, ref(defaultNamespace))
      : ref(defaultNamespace))
  const namespace = computed(() => {
    return unref(derivedNamespace) || defaultNamespace
  })
  return namespace
}

/**
 * 命名空间 Hook - 用于生成 BEM 风格的 CSS 类名和 CSS 变量
 *
 * @param block 块名称，通常是组件名称（如 'button', 'input' 等）
 * @param namespaceOverrides 可选的命名空间覆盖，用于自定义命名空间前缀
 * @returns 返回包含各种类名生成函数和 CSS 变量生成函数的对象
 */
export const useNamespace = (
  block: string,
  namespaceOverrides?: Ref<string | undefined>
) => {
  // 获取派生的命名空间，通常是 'el'
  const namespace = useGetDerivedNamespace(namespaceOverrides)

  /**
   * 生成块级类名
   * @param blockSuffix 块后缀，可选
   * @returns 生成的类名，如 'el-button' 或 'el-button--large'
   */
  const b = (blockSuffix = '') =>
    _bem(namespace.value, block, blockSuffix, '', '')

  /**
   * 生成元素类名
   * @param element 元素名称
   * @returns 生成的类名，如 'el-button__inner'
   */
  const e = (element?: string) =>
    element ? _bem(namespace.value, block, '', element, '') : ''

  /**
   * 生成修饰符类名
   * @param modifier 修饰符名称
   * @returns 生成的类名，如 'el-button--primary'
   */
  const m = (modifier?: string) =>
    modifier ? _bem(namespace.value, block, '', '', modifier) : ''

  /**
   * 生成块后缀 + 元素的类名
   * @param blockSuffix 块后缀
   * @param element 元素名称
   * @returns 生成的类名，如 'el-button-group__item'
   */
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element
      ? _bem(namespace.value, block, blockSuffix, element, '')
      : ''

  /**
   * 生成元素 + 修饰符的类名
   * @param element 元素名称
   * @param modifier 修饰符名称
   * @returns 生成的类名，如 'el-button__inner--disabled'
   */
  const em = (element?: string, modifier?: string) =>
    element && modifier
      ? _bem(namespace.value, block, '', element, modifier)
      : ''

  /**
   * 生成块后缀 + 修饰符的类名
   * @param blockSuffix 块后缀
   * @param modifier 修饰符名称
   * @returns 生成的类名，如 'el-button-group--vertical'
   */
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier
      ? _bem(namespace.value, block, blockSuffix, '', modifier)
      : ''

  /**
   * 生成完整的 BEM 类名（块后缀 + 元素 + 修饰符）
   * @param blockSuffix 块后缀
   * @param element 元素名称
   * @param modifier 修饰符名称
   * @returns 生成的类名，如 'el-button-group__item--active'
   */
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier
      ? _bem(namespace.value, block, blockSuffix, element, modifier)
      : ''

  /**
   * 生成状态类名（is- 前缀）
   * 支持两种调用方式：
   * 1. is('active') - 默认为 true
   * 2. is('active', false) - 明确指定状态
   */
  const is: {
    (name: string, state: boolean | undefined): string
    (name: string): string
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0]! : true
    return name && state ? `${statePrefix}${name}` : ''
  }

  /**
   * 生成 CSS 变量样式对象（全局级别）
   * @param object 包含变量名和值的对象
   * @returns CSS 变量样式对象，如 { '--el-color-primary': '#409eff' }
   */
  const cssVar = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${key}`] = object[key]
      }
    }
    return styles
  }

  /**
   * 生成 CSS 变量样式对象（块级别）
   * @param object 包含变量名和值的对象
   * @returns CSS 变量样式对象，如 { '--el-button-color': '#409eff' }
   */
  const cssVarBlock = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${block}-${key}`] = object[key]
      }
    }
    return styles
  }

  /**
   * 生成 CSS 变量名（全局级别）
   * @param name 变量名
   * @returns CSS 变量名，如 '--el-color-primary'
   */
  const cssVarName = (name: string) => `--${namespace.value}-${name}`

  /**
   * 生成 CSS 变量名（块级别）
   * @param name 变量名
   * @returns CSS 变量名，如 '--el-button-color'
   */
  const cssVarBlockName = (name: string) =>
    `--${namespace.value}-${block}-${name}`

  return {
    namespace, // 命名空间值
    b, // 块类名生成器
    e, // 元素类名生成器
    m, // 修饰符类名生成器
    be, // 块后缀+元素类名生成器
    em, // 元素+修饰符类名生成器
    bm, // 块后缀+修饰符类名生成器
    bem, // 完整BEM类名生成器
    is, // 状态类名生成器
    // CSS 变量相关
    cssVar, // 全局CSS变量样式生成器
    cssVarName, // 全局CSS变量名生成器
    cssVarBlock, // 块级CSS变量样式生成器
    cssVarBlockName, // 块级CSS变量名生成器
  }
}

export type UseNamespaceReturn = ReturnType<typeof useNamespace>
