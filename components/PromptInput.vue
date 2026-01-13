<script setup lang="ts">
const emit = defineEmits<{
  submit: [goal: string]
}>()

const props = defineProps<{
  disabled?: boolean
}>()

const prompt = ref('')

const placeholders = [
  'Build me a floating island with waterfalls...',
  'Create a cyberpunk city at night...',
  'Design a mystical forest with glowing mushrooms...',
  'Construct a futuristic space station...',
  'Make an underwater temple with coral...',
]

const placeholder = ref(placeholders[0])

// Rotate placeholder
let placeholderIndex = 0
onMounted(() => {
  setInterval(() => {
    placeholderIndex = (placeholderIndex + 1) % placeholders.length
    placeholder.value = placeholders[placeholderIndex]
  }, 4000)
})

function handleSubmit() {
  if (prompt.value.trim() && !props.disabled) {
    emit('submit', prompt.value.trim())
    prompt.value = ''
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="prompt-input">
    <div class="input-wrapper">
      <span class="input-prefix">&gt;</span>
      <input
        v-model="prompt"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input-field"
        @keydown="handleKeydown"
      />
      <button
        class="submit-btn"
        :disabled="!prompt.trim() || disabled"
        @click="handleSubmit"
      >
        <span class="btn-text">Build</span>
        <span class="btn-icon">-&gt;</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.prompt-input {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-wrapper:focus-within {
  border-color: var(--crystal-purple);
  box-shadow: 0 0 0 2px rgba(227, 146, 254, 0.15);
}

.input-prefix {
  color: var(--crystal-purple);
  font-weight: bold;
  font-size: 16px;
}

.input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #000;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
}

.input-field::placeholder {
  color: rgba(0, 0, 0, 0.35);
}

.input-field:disabled {
  opacity: 0.5;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--crystal-purple), var(--crystal-pink));
  border: none;
  border-radius: 6px;
  color: white;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(227, 146, 254, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  opacity: 0.7;
}
</style>
