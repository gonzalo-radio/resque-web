import pluginVue from 'eslint-plugin-vue'
export default [
  // add more generic rulesets here, such as:
  // js.configs.recommended,
  ...pluginVue.configs['flat/essential'], // matches the project's original vue3-essential level
  {
    rules: {
      // Views/components here are intentionally single-word (Home, Queues, ...)
      'vue/multi-word-component-names': 'off',
    }
  }
]
