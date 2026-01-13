<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

defineProps<{
  show: boolean
}>()

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="handleClose">
        <div class="modal-content">
          <button class="modal-close" @click="handleClose">
            &times;
          </button>

          <div class="modal-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="2" />
              <path d="M32 18V38" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              <circle cx="32" cy="46" r="2" fill="currentColor" />
            </svg>
          </div>

          <h2 class="modal-title">Out of Credits</h2>

          <p class="modal-text">
            You've used all your building credits. Purchase more with <span class="token-name">$CRYSTAL</span> tokens to continue creating amazing 3D worlds.
          </p>

          <div class="modal-actions">
            <button class="btn-primary" disabled>
              <span class="btn-content">
                <span>Buy Credits</span>
                <span class="coming-soon">Coming Soon</span>
              </span>
            </button>

            <button class="btn-secondary" @click="handleClose">
              Close
            </button>
          </div>

          <div class="token-info">
            <span class="token-badge">$CRYSTAL</span>
            <span class="token-text">Token integration coming soon</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 40px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.5);
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.8);
}

.modal-icon {
  color: var(--crystal-purple);
  margin-bottom: 20px;
}

.modal-title {
  font-family: 'DrukMedium', sans-serif;
  font-size: 28px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0 0 16px;
  color: #000;
}

.modal-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.7);
  margin: 0 0 24px;
}

.token-name {
  color: var(--crystal-purple);
  font-weight: 600;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-primary {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--crystal-purple), var(--crystal-pink));
  border: none;
  border-radius: 12px;
  color: white;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.coming-soon {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
}

.btn-secondary {
  width: 100%;
  padding: 14px 24px;
  background: transparent;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: rgba(0, 0, 0, 0.7);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: rgba(0, 0, 0, 0.3);
  color: #000;
}

.token-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.token-badge {
  background: linear-gradient(135deg, var(--crystal-purple), var(--crystal-pink));
  color: white;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.token-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.5);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}
</style>
