<script setup lang="ts">
import { ref, watch, onMounted, useTemplateRef } from 'vue'
import { useData, useRoute } from 'vitepress'
import { giscusConfig } from './giscus.config'

const route = useRoute()
const { isDark } = useData()
const container = useTemplateRef('container')

const giscusTheme = () => (isDark.value ? 'dark' : 'light')

const buildScript = () => {
  const script = document.createElement('script')
  const attributes = {
    src: 'https://giscus.app/client.js',
    'data-repo': giscusConfig.repo,
    'data-repo-id': giscusConfig.repoId,
    'data-category': giscusConfig.category,
    'data-category-id': giscusConfig.categoryId,
    'data-mapping': 'pathname',
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': giscusTheme(),
    'data-lang': 'en',
    crossorigin: 'anonymous',
    async: 'true'
  }

  Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value))

  return script
}

const render = () => {
  const host = container.value

  if (!host) {
    return
  }

  host.innerHTML = ''
  host.appendChild(buildScript())
}

const postThemeToFrame = () => {
  const frame = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  const message = { giscus: { setConfig: { theme: giscusTheme() } } }

  frame?.contentWindow?.postMessage(message, 'https://giscus.app')
}

onMounted(render)
watch(() => route.path, render)
watch(isDark, postThemeToFrame)
</script>

<template>
  <div class="comments">
    <hr class="comments__rule" />
    <h2 class="comments__heading">Comments &amp; feedback</h2>
    <div ref="container" />
  </div>
</template>

<style scoped>
.comments {
  margin-block-start: 48px;
}

.comments__rule {
  margin-block-end: 24px;
}

.comments__heading {
  margin-block-end: 16px;
  font-size: 1.1rem;
}
</style>
