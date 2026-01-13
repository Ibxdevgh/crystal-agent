<script setup lang="ts">
import { useAgent } from '~/composables/useAgent'
import { useAgentStore } from '~/stores/agent'

const { scene, startBuilding, togglePause, stopBuilding } = useAgent()
const store = useAgentStore()

// Custom cursor
const cursorPos = ref({ x: 0, y: 0 })

onMounted(() => {
  document.addEventListener('mousemove', (e) => {
    cursorPos.value = { x: e.clientX, y: e.clientY }
  })
  // Load credits from localStorage
  store.initCredits()
})

// Handle prompt submission
function handleSubmit(goal: string) {
  startBuilding(goal)
}

// Handle pause/resume
function handlePause() {
  togglePause()
}

// Handle stop
function handleStop() {
  stopBuilding()
}

// Handle export
async function handleExport() {
  try {
    await scene.downloadGLB('crystal-world.glb')
  } catch (error) {
    console.error('Export failed:', error)
  }
}

// Handle clear
function handleClear() {
  store.reset()
  scene.clearScene()
}

// Handle credit modal close
function handleCloseCreditModal() {
  store.closeCreditModal()
}
</script>

<template>
  <div class="crystal-agent">
    <!-- Custom Cursor -->
    <div
      id="cursor"
      :style="{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` }"
    >
      <div class="wrapper" />
    </div>

    <!-- Left Sidebar - Tech Labels -->
    <div class="left-sidebar">
      <div class="tech-stack">
        <span class="cross" />
        <span class="cross" />
        <span class="tech-label">AI</span>
        <span class="cross" />
        <span class="cross" />
        <span class="tech-label">3D</span>
        <span class="cross" />
        <span class="cross" />
        <span class="tech-label">WEB3</span>
        <span class="cross" />
        <span class="cross" />
      </div>
    </div>

    <!-- Right Sidebar - Progress -->
    <div class="right-sidebar">
      <div class="progress-indicator">
        <svg width="15" height="30" viewBox="0 0 15 30" fill="none">
          <line x1="7.5" y1="0" x2="7.5" y2="30" stroke="black" stroke-width="1"/>
          <line x1="0" y1="15" x2="15" y2="15" stroke="black" stroke-width="1"/>
        </svg>
        <p class="progress-text">{{ store.completedCommands }}</p>
        <svg width="15" height="30" viewBox="0 0 15 30" fill="none">
          <line x1="7.5" y1="0" x2="7.5" y2="30" stroke="black" stroke-width="1"/>
          <line x1="0" y1="15" x2="15" y2="15" stroke="black" stroke-width="1"/>
        </svg>
      </div>
    </div>

    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="header-logo">
          <a href="https://crystalagency.io" class="logo-link">
            <span class="font-druk text-2xl">Crystal</span>
            <span class="font-druk text-2xl text-purple-500">Agent</span>
          </a>
        </div>
        <div class="header-menu">
          <div class="credits-display">
            <span class="credits-label">Credits</span>
            <span class="credits-value">{{ store.credits }}/{{ store.maxCredits }}</span>
          </div>
          <a href="https://crystalagency.io" class="btn-bracket">
            [<span>Agency</span>]
          </a>
          <WalletButton />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- 3D Canvas Area -->
      <div class="canvas-area">
        <WorldCanvas :scene="scene" />

        <!-- Scene Status Overlay -->
        <div class="scene-status">
          <span class="status-label">AUTONOMOUS WORLD BUILDER</span>
          <span
            class="status-indicator"
            :class="{ active: store.isRunning }"
          >
            {{ store.isRunning ? (store.isPaused ? 'PAUSED' : 'BUILDING') : 'READY' }}
          </span>
        </div>
      </div>

      <!-- Terminal Panel -->
      <div class="terminal-panel terminal-dark">
        <div class="terminal-header">
          <span class="terminal-title">&gt;_ Agent Terminal</span>
          <span class="terminal-count">{{ store.completedCommands }} cmds</span>
        </div>

        <div class="terminal-body">
          <!-- Empty State -->
          <div v-if="store.thoughts.length === 0 && !store.isRunning" class="terminal-empty">
            <p>Waiting for instructions...</p>
            <p class="text-sm opacity-50 mt-2">Enter a prompt below to start building</p>
          </div>

          <!-- Goal -->
          <div v-if="store.goal" class="terminal-goal">
            <span class="goal-label">GOAL</span>
            <span class="goal-text">{{ store.goal }}</span>
          </div>

          <!-- Thoughts List -->
          <div
            v-for="entry in store.thoughts"
            :key="entry.id"
            class="thought"
            :class="entry.status"
          >
            <div class="thought-content">
              <span class="thought-icon">
                {{ entry.status === 'completed' ? '+' : entry.status === 'executing' ? '>' : '...' }}
              </span>
              <span>{{ entry.thought }}</span>
            </div>
            <code class="thought-command">{{ entry.command.action }}</code>
          </div>

          <!-- Running Indicator -->
          <div v-if="store.isRunning && !store.isPaused" class="terminal-running">
            <span class="running-dot" />
            <span>Thinking...</span>
          </div>

          <!-- Error -->
          <div v-if="store.error" class="terminal-error">
            <span>! {{ store.error }}</span>
          </div>

          <!-- Complete -->
          <div v-if="store.isComplete" class="terminal-complete">
            <span>* World building complete!</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Controls -->
    <footer class="footer">
      <!-- Prompt Input -->
      <div class="prompt-section">
        <PromptInput
          :disabled="store.isRunning"
          @submit="handleSubmit"
        />
      </div>

      <!-- Control Buttons -->
      <div class="controls-section">
        <div class="controls-left">
          <button
            v-if="store.isRunning"
            class="btn-bracket"
            @click="handlePause"
          >
            [<span>{{ store.isPaused ? 'Resume' : 'Pause' }}</span>]
          </button>
          <button
            v-if="store.isRunning"
            class="btn-bracket"
            @click="handleStop"
          >
            [<span>Stop</span>]
          </button>
          <button
            v-if="!store.isRunning && store.thoughts.length > 0"
            class="btn-bracket"
            @click="handleClear"
          >
            [<span>Clear</span>]
          </button>

          <!-- Speed Controls -->
          <div v-if="store.isRunning" class="speed-controls">
            <span class="speed-label">Speed:</span>
            <button
              class="btn-speed"
              :class="{ active: store.speed === 3000 }"
              @click="store.setSpeed(3000)"
            >
              0.5x
            </button>
            <button
              class="btn-speed"
              :class="{ active: store.speed === 1500 }"
              @click="store.setSpeed(1500)"
            >
              1x
            </button>
            <button
              class="btn-speed"
              :class="{ active: store.speed === 750 }"
              @click="store.setSpeed(750)"
            >
              2x
            </button>
          </div>
        </div>

        <!-- Export Button (Circle Style) -->
        <button
          class="btn-circle export-btn"
          :disabled="store.thoughts.length === 0"
          @click="handleExport"
        >
          <div class="child">
            <span class="elem elem-1">[</span>
            <span class="elem elem-2">]</span>
            <span class="elem elem-3">[</span>
            <span class="elem elem-4">]</span>
            <div class="circle">
              <div class="inner-circle">
                <p>Export<br>GLB</p>
              </div>
            </div>
          </div>
        </button>
      </div>
    </footer>

    <!-- Credit Modal -->
    <CreditModal
      :show="store.showCreditModal"
      @close="handleCloseCreditModal"
    />
  </div>
</template>

<style scoped>
.crystal-agent {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Sidebars */
.left-sidebar {
  position: fixed;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tech-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.right-sidebar {
  position: fixed;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
}

.progress-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 65px;
  padding: 0 20px;
  z-index: 30;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-link {
  display: flex;
  gap: 8px;
  text-decoration: none;
  color: #000;
}

.header-menu {
  display: flex;
  align-items: center;
  gap: 16px;
}

.credits-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.credits-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(0, 0, 0, 0.5);
}

.credits-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--crystal-purple);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  padding: 80px 50px 200px;
  gap: 20px;
  overflow: hidden;
  min-height: 0;
}

.canvas-area {
  flex: 1;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.scene-status {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 12px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.status-label {
  color: rgba(0, 0, 0, 0.5);
  font-weight: 500;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(0, 0, 0, 0.4);
}

.status-indicator::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
}

.status-indicator.active {
  color: var(--crystal-purple);
}

.status-indicator.active::before {
  background: var(--crystal-purple);
  box-shadow: 0 0 10px var(--crystal-purple);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Terminal Panel */
.terminal-panel {
  width: 380px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  max-height: calc(100vh - 300px);
  overflow: hidden;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.terminal-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--crystal-purple);
}

.terminal-count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.terminal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  font-size: 13px;
  min-height: 0;
}

.terminal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
}

.terminal-goal {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(227, 146, 254, 0.1);
  border-radius: 8px;
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
  color: #000;
}

.thought-content {
  display: flex;
  gap: 8px;
  color: rgba(0, 0, 0, 0.85);
}

.thought-icon {
  flex-shrink: 0;
  width: 16px;
  font-weight: bold;
  color: var(--crystal-purple);
}

.thought-command {
  display: block;
  margin-top: 4px;
  padding-left: 24px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.4);
}

.terminal-running {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--crystal-purple);
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

.terminal-error {
  padding: 12px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 8px;
  color: #f87171;
  margin-top: 12px;
}

.terminal-complete {
  padding: 12px;
  background: rgba(227, 146, 254, 0.1);
  border-radius: 8px;
  color: var(--crystal-purple);
  margin-top: 12px;
}

/* Footer */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 50px;
  z-index: 20;
}

.prompt-section {
  margin-bottom: 16px;
}

.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.speed-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.speed-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(0, 0, 0, 0.5);
  margin-right: 4px;
}

.btn-speed {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-speed:hover {
  border-color: var(--crystal-purple);
  color: var(--crystal-purple);
}

.btn-speed.active {
  background: var(--crystal-purple);
  border-color: var(--crystal-purple);
  color: white;
}

.export-btn {
  background: transparent;
  border: none;
  cursor: none;
}

.export-btn:disabled {
  opacity: 0.3;
  pointer-events: none;
}

/* Responsive */
@media (max-width: 1024px) {
  .left-sidebar,
  .right-sidebar {
    display: none;
  }

  .main-content {
    padding: 80px 20px 200px;
  }

  .terminal-panel {
    width: 320px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 80px 8px 280px;
  }

  .canvas-area {
    height: 40vh;
  }

  .terminal-panel {
    width: 100%;
    height: 30vh;
  }

  .footer {
    padding: 16px 8px;
  }

  .export-btn .circle {
    width: 80px;
    height: 80px;
  }

  .export-btn .inner-circle {
    width: 72px;
    height: 72px;
  }
}
</style>
