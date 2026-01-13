<script setup lang="ts">
import { useScene } from '~/composables/useScene'

const props = defineProps<{
  scene: ReturnType<typeof useScene>
}>()

const canvasContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  if (canvasContainer.value) {
    props.scene.initScene(canvasContainer.value)
  }
})

onUnmounted(() => {
  props.scene.dispose()
})
</script>

<template>
  <div class="world-canvas">
    <div ref="canvasContainer" class="canvas-container" />

    <!-- Overlay with scene info -->
    <div class="scene-overlay">
      <div class="scene-info">
        <span class="label">CRYSTAL AGENT</span>
        <span class="status" :class="{ active: scene.isInitialized.value }">
          {{ scene.isInitialized.value ? 'LIVE' : 'INITIALIZING' }}
        </span>
      </div>
    </div>

    <!-- Grid lines decoration -->
    <div class="grid-decoration">
      <div class="grid-line horizontal" />
      <div class="grid-line vertical" />
    </div>
  </div>
</template>

<style scoped>
.world-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--crystal-darker);
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

.canvas-container :deep(canvas) {
  display: block;
}

.scene-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: none;
}

.scene-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.label {
  color: rgba(255, 255, 255, 0.5);
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.3);
}

.status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.status.active {
  color: var(--crystal-purple);
}

.status.active::before {
  background: var(--crystal-purple);
  box-shadow: 0 0 10px var(--crystal-purple);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.grid-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(227, 146, 254, 0.1),
    transparent
  );
}

.grid-line.horizontal {
  bottom: 30%;
  left: 0;
  right: 0;
  height: 1px;
}

.grid-line.vertical {
  top: 0;
  bottom: 0;
  right: 30%;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(227, 146, 254, 0.1),
    transparent
  );
}
</style>
