import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import Comments from './Comments.vue'
import CodeToggle from './CodeToggle.vue'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-after': () => h(Comments)
    }),
  enhanceApp({ app }) {
    app.component('CodeToggle', CodeToggle)
  }
} satisfies Theme
