<script setup lang="ts">
import { onMounted } from 'vue'
import { codeLanguage, setCodeLanguage, CODE_LANGUAGE_STORAGE_KEY } from './codeLanguage'

onMounted(() => {
  const stored = localStorage.getItem(CODE_LANGUAGE_STORAGE_KEY)

  if (stored === 'csharp' || stored === 'ts') {
    codeLanguage.value = stored
  }
})
</script>

<template>
  <div class="code-toggle">
    <div class="code-toggle__tabs" role="tablist" aria-label="Code language">
      <button
        type="button"
        role="tab"
        class="code-toggle__tab"
        :class="{ 'code-toggle__tab--active': codeLanguage === 'csharp' }"
        :aria-selected="codeLanguage === 'csharp'"
        @click="setCodeLanguage('csharp')"
      >
        C#
      </button>
      <button
        type="button"
        role="tab"
        class="code-toggle__tab"
        :class="{ 'code-toggle__tab--active': codeLanguage === 'ts' }"
        :aria-selected="codeLanguage === 'ts'"
        @click="setCodeLanguage('ts')"
      >
        TypeScript
      </button>
    </div>

    <div v-show="codeLanguage === 'csharp'" class="code-toggle__panel">
      <slot name="csharp" />
    </div>
    <div v-show="codeLanguage === 'ts'" class="code-toggle__panel">
      <slot name="ts" />
    </div>
  </div>
</template>

<style scoped>
.code-toggle {
  margin-block: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.code-toggle__tabs {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  background: var(--vp-c-bg-soft);
  border-block-end: 1px solid var(--vp-c-divider);
}

.code-toggle__tab {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.2s, background-color 0.2s;
}

.code-toggle__tab:hover {
  color: var(--vp-c-text-1);
}

.code-toggle__tab--active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.code-toggle__panel :deep(div[class*='language-']) {
  margin: 0;
  border-radius: 0;
}
</style>
