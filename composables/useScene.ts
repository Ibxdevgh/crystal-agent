import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { serializeScene, formatSceneForAgent } from '~/lib/sceneSerializer'
import { executeCommand } from '~/lib/commands'
import type { Command, SceneState } from '~/types'

export function useScene() {
  const scene = shallowRef<THREE.Scene | null>(null)
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
  const controls = shallowRef<OrbitControls | null>(null)
  const container = ref<HTMLElement | null>(null)
  const isInitialized = ref(false)

  let animationId: number | null = null

  // Initialize the Three.js scene
  function initScene(containerEl: HTMLElement) {
    container.value = containerEl

    // Create scene
    const newScene = new THREE.Scene()
    newScene.background = new THREE.Color(0xf0f4ff)
    scene.value = newScene

    // Create camera
    const aspect = containerEl.clientWidth / containerEl.clientHeight
    const newCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
    newCamera.position.set(15, 12, 15)
    newCamera.lookAt(0, 0, 0)
    camera.value = newCamera

    // Create renderer
    const newRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    newRenderer.setSize(containerEl.clientWidth, containerEl.clientHeight)
    newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    newRenderer.shadowMap.enabled = true
    newRenderer.shadowMap.type = THREE.PCFSoftShadowMap
    newRenderer.toneMapping = THREE.ACESFilmicToneMapping
    newRenderer.toneMappingExposure = 1
    containerEl.appendChild(newRenderer.domElement)
    renderer.value = newRenderer

    // Create orbit controls
    const newControls = new OrbitControls(newCamera, newRenderer.domElement)
    newControls.enableDamping = true
    newControls.dampingFactor = 0.05
    newControls.minDistance = 5
    newControls.maxDistance = 100
    newControls.maxPolarAngle = Math.PI / 2 + 0.1
    controls.value = newControls

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    newScene.add(ambientLight)

    // Add default directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    newScene.add(directionalLight)

    // Add grid helper (subtle)
    const gridHelper = new THREE.GridHelper(30, 30, 0xb4a0cc, 0xd4c8e0)
    gridHelper.position.y = -0.01
    newScene.add(gridHelper)

    // Start animation loop
    animate()

    // Handle resize
    window.addEventListener('resize', handleResize)

    isInitialized.value = true
  }

  // Animation loop
  function animate() {
    animationId = requestAnimationFrame(animate)

    if (controls.value) {
      controls.value.update()
    }

    if (renderer.value && scene.value && camera.value) {
      renderer.value.render(scene.value, camera.value)
    }
  }

  // Handle window resize
  function handleResize() {
    if (!container.value || !camera.value || !renderer.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    camera.value.aspect = width / height
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(width, height)
  }

  // Execute a command on the scene
  function runCommand(command: Command) {
    if (!scene.value) return null
    return executeCommand(scene.value, command)
  }

  // Get serialized scene state
  function getSceneState(): SceneState | null {
    if (!scene.value || !camera.value) return null
    return serializeScene(scene.value, camera.value)
  }

  // Get formatted scene state for agent
  function getSceneStateForAgent(): string {
    const state = getSceneState()
    if (!state) return 'Scene not initialized'
    return formatSceneForAgent(state)
  }

  // Clear all user-created objects from scene
  function clearScene() {
    if (!scene.value) return

    const objectsToRemove: THREE.Object3D[] = []
    scene.value.traverse((object) => {
      if (object.userData?.type) {
        objectsToRemove.push(object)
      }
      if (object.name.endsWith('_helper')) {
        objectsToRemove.push(object)
      }
    })

    objectsToRemove.forEach((obj) => scene.value?.remove(obj))

    // Reset background
    scene.value.background = new THREE.Color(0xf0f4ff)
    scene.value.fog = null
  }

  // Export scene as GLB
  async function exportGLB(): Promise<Blob> {
    if (!scene.value) throw new Error('Scene not initialized')

    const exporter = new GLTFExporter()

    return new Promise((resolve, reject) => {
      exporter.parse(
        scene.value!,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(new Blob([result], { type: 'application/octet-stream' }))
          } else {
            resolve(new Blob([JSON.stringify(result)], { type: 'application/json' }))
          }
        },
        (error) => reject(error),
        { binary: true }
      )
    })
  }

  // Download GLB file
  async function downloadGLB(filename = 'crystal-world.glb') {
    const blob = await exportGLB()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  // Move camera smoothly to a position
  function moveCamera(position: { x: number; y: number; z: number }, lookAt?: { x: number; y: number; z: number }) {
    if (!camera.value || !controls.value) return

    // Animate camera position
    const startPos = camera.value.position.clone()
    const endPos = new THREE.Vector3(position.x, position.y, position.z)

    const startTarget = controls.value.target.clone()
    const endTarget = lookAt
      ? new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z)
      : new THREE.Vector3(0, 0, 0)

    let t = 0
    const duration = 1000 // ms
    const startTime = Date.now()

    function animateCamera() {
      const elapsed = Date.now() - startTime
      t = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3)

      camera.value!.position.lerpVectors(startPos, endPos, eased)
      controls.value!.target.lerpVectors(startTarget, endTarget, eased)

      if (t < 1) {
        requestAnimationFrame(animateCamera)
      }
    }

    animateCamera()
  }

  // Cleanup
  function dispose() {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }

    window.removeEventListener('resize', handleResize)

    if (renderer.value && container.value) {
      container.value.removeChild(renderer.value.domElement)
      renderer.value.dispose()
    }

    controls.value?.dispose()

    scene.value = null
    camera.value = null
    renderer.value = null
    controls.value = null
    isInitialized.value = false
  }

  return {
    scene,
    camera,
    renderer,
    controls,
    isInitialized,
    initScene,
    runCommand,
    getSceneState,
    getSceneStateForAgent,
    clearScene,
    exportGLB,
    downloadGLB,
    moveCamera,
    dispose,
  }
}
