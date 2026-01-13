<script setup lang="ts">
import { useAgentStore } from '~/stores/agent'

const store = useAgentStore()

const emit = defineEmits<{
  pause: []
  stop: []
  export: []
  clear: []
}>()

const speedOptions = [
  { label: '0.5x', value: 3000 },
  { label: '1x', value: 1500 },
  { label: '2x', value: 750 },
  { label: '3x', value: 500 },
]

const currentSpeedLabel = computed(() => {
  const option = speedOptions.find((o) => o.value === store.speed)
  return option?.label || '1x'
})

function setSpeed(value: number) {
  store.setSpeed(value)
}
</script>

<template>
  <div class="control-panel">
    <div class="controls-left">
      <!-- Play/Pause button -->
      <button
        v-if="store.isRunning"
        class="control-btn"
        :class="{ active: store.isPaused }"
        @click="emit('pause')"
      >
        <span v-if="store.isPaused" class="btn-icon">|&gt;</span>
        <span v-else class="btn-icon">||</span>
        <span class="btn-label">{{ store.isPaused ? 'Resume' : 'Pause' }}</span>
      </button>

      <!-- Stop button -->
      <button
        v-if="store.isRunning"
        class="control-btn danger"
        @click="emit('stop')"
      >
        <span class="btn-icon">[]</span>
        <span class="btn-label">Stop</span>
      </button>

      <!-- Speed selector -->
      <div v-if="store.isRunning" class="speed-selector">
        <span class="speed-label">Speed:</span>
        <div class="speed-options">
          <button
            v-for="option in speedOptions"
            :key="option.value"
            class="speed-option"
            :class="{ active: store.speed === option.value }"
            @click="setSpeed(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Clear button (when not running) -->
      <button
        v-if="!store.isRunning && store.thoughts.length > 0"
        class="control-btn"
        @click="emit('clear')"
      >
        <span class="btn-icon">x</span>
        <span class="btn-label">Clear</span>
      </button>
    </div>

    <div class="controls-right">
      <!-- Export button -->
      <button
        class="control-btn export"
        :disabled="store.thoughts.length === 0"
        @click="emit('export')"
      >
        <span class="btn-icon">[^]</span>
        <span class="btn-label">Export GLB</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--crystal-darker);
  border-top: 1px solid rgba(227, 146, 254, 0.1);
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn.active {
  background: rgba(227, 146, 254, 0.2);
  border-color: var(--crystal-purple);
  color: var(--crystal-purple);
}

.control-btn.danger:hover {
  background: rgba(248, 113, 113, 0.2);
  border-color: #f87171;
  color: #f87171;
}

.control-btn.export {
  background: rgba(227, 146, 254, 0.1);
  border-color: rgba(227, 146, 254, 0.3);
  color: var(--crystal-purple);
}

.control-btn.export:hover:not(:disabled) {
  background: rgba(227, 146, 254, 0.2);
  border-color: var(--crystal-purple);
}

.btn-icon {
  font-weight: bold;
  font-size: 11px;
}

.speed-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.speed-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.speed-options {
  display: flex;
  gap: 4px;
}

.speed-option {
  padding: 4px 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.speed-option:hover {
  color: white;
}

.speed-option.active {
  background: rgba(227, 146, 254, 0.2);
  border-color: var(--crystal-purple);
  color: var(--crystal-purple);
}
</style>
