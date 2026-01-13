<script setup lang="ts">
import { useAgentStore } from '~/stores/agent'

const store = useAgentStore()

const terminalRef = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new thoughts are added
watch(
  () => store.thoughts.length,
  () => {
    nextTick(() => {
      if (terminalRef.value) {
        terminalRef.value.scrollTop = terminalRef.value.scrollHeight
      }
    })
  }
)

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return '...'
    case 'executing':
      return '>'
    case 'completed':
      return '+'
    case 'error':
      return 'x'
    default:
      return '-'
  }
}

function getStatusClass(status: string) {
  return {
    pending: 'text-gray-500',
    executing: 'text-yellow-400',
    completed: 'text-crystal-purple',
    error: 'text-red-400',
  }[status] || ''
}

function formatCommand(command: { action: string; params: Record<string, any> }) {
  const paramsStr = Object.entries(command.params)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `${key}: {...}`
      }
      return `${key}: ${value}`
    })
    .join(', ')

  return `${command.action}(${paramsStr})`
}
</script>

<template>
  <div class="agent-terminal">
    <div class="terminal-header">
      <div class="terminal-title">
        <span class="terminal-icon">&gt;_</span>
        <span>Agent Terminal</span>
      </div>
      <div class="terminal-stats">
        <span class="stat">{{ store.completedCommands }} cmds</span>
      </div>
    </div>

    <div ref="terminalRef" class="terminal-content">
      <!-- Initial state -->
      <div v-if="store.thoughts.length === 0 && !store.isRunning" class="terminal-empty">
        <p class="text-gray-500">Waiting for instructions...</p>
        <p class="text-gray-600 text-sm mt-2">Enter a prompt to start building</p>
      </div>

      <!-- Goal display -->
      <div v-if="store.goal" class="terminal-goal">
        <span class="goal-label">GOAL:</span>
        <span class="goal-text">{{ store.goal }}</span>
      </div>

      <!-- Thoughts -->
      <div
        v-for="entry in store.thoughts"
        :key="entry.id"
        class="terminal-entry"
        :class="getStatusClass(entry.status)"
      >
        <div class="entry-header">
          <span class="entry-icon">{{ getStatusIcon(entry.status) }}</span>
          <span class="entry-thought">{{ entry.thought }}</span>
        </div>
        <div class="entry-command">
          <code>{{ formatCommand(entry.command) }}</code>
        </div>
      </div>

      <!-- Running indicator -->
      <div v-if="store.isRunning && !store.isPaused" class="terminal-running">
        <span class="running-dot" />
        <span>Thinking...</span>
      </div>

      <!-- Paused indicator -->
      <div v-if="store.isPaused" class="terminal-paused">
        <span>PAUSED</span>
      </div>

      <!-- Error -->
      <div v-if="store.error" class="terminal-error">
        <span class="error-icon">!</span>
        <span>{{ store.error }}</span>
      </div>

      <!-- Completion message -->
      <div v-if="store.isComplete" class="terminal-complete">
        <span class="complete-icon">*</span>
        <span>World building complete!</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agent-terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--crystal-dark);
  border-left: 1px solid rgba(227, 146, 254, 0.2);
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(227, 146, 254, 0.2);
}

.terminal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.terminal-icon {
  color: var(--crystal-purple);
}

.terminal-stats {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.terminal-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-size: 13px;
  line-height: 1.5;
}

.terminal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.terminal-goal {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(227, 146, 254, 0.1);
  border-radius: 6px;
  border-left: 3px solid var(--crystal-purple);
}

.goal-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--crystal-purple);
  margin-bottom: 4px;
}

.goal-text {
  color: white;
}

.terminal-entry {
  margin-bottom: 12px;
  padding-left: 16px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s;
}

.terminal-entry.text-crystal-purple {
  border-left-color: var(--crystal-purple);
}

.terminal-entry.text-yellow-400 {
  border-left-color: #facc15;
}

.terminal-entry.text-red-400 {
  border-left-color: #f87171;
}

.entry-header {
  display: flex;
  gap: 8px;
}

.entry-icon {
  flex-shrink: 0;
  width: 16px;
  font-weight: bold;
}

.entry-thought {
  color: rgba(255, 255, 255, 0.9);
}

.entry-command {
  margin-top: 4px;
  padding-left: 24px;
}

.entry-command code {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'IBM Plex Mono', monospace;
}

.terminal-running {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--crystal-purple);
  animation: fadeIn 0.3s;
}

.running-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--crystal-purple);
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.terminal-paused {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(250, 204, 21, 0.2);
  color: #facc15;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.terminal-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 6px;
  color: #f87171;
  margin-top: 12px;
}

.error-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f87171;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

.terminal-complete {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(227, 146, 254, 0.1);
  border-radius: 6px;
  color: var(--crystal-purple);
  margin-top: 12px;
}

.complete-icon {
  font-size: 18px;
}
</style>
