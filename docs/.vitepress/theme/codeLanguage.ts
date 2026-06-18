import { ref } from 'vue'

export type CodeLanguage = 'ts' | 'csharp'

export const CODE_LANGUAGE_STORAGE_KEY = 'preferred-code-language'

// Default for SSR + first paint; the real preference is loaded in onMounted
// to avoid a hydration mismatch.
export const codeLanguage = ref<CodeLanguage>('csharp')

export const setCodeLanguage = (language: CodeLanguage) => {
  codeLanguage.value = language

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CODE_LANGUAGE_STORAGE_KEY, language)
  }
}
