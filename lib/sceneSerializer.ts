import * as THREE from 'three'
import type { SceneState, SceneObject } from '~/types'

// Serialize a Three.js scene to a JSON-compatible format
export function serializeScene(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
): SceneState {
  const objects: SceneObject[] = []

  scene.traverse((object) => {
    // Skip non-mesh objects (except lights) and helpers
    if (object.name.endsWith('_helper')) return
    if (!object.userData?.type) return

    const sceneObject: SceneObject = {
      id: object.name,
      type: object.userData.type,
      name: object.userData.displayName || object.name,
      position: {
        x: Math.round(object.position.x * 100) / 100,
        y: Math.round(object.position.y * 100) / 100,
        z: Math.round(object.position.z * 100) / 100,
      },
      rotation: {
        x: Math.round(object.rotation.x * 100) / 100,
        y: Math.round(object.rotation.y * 100) / 100,
        z: Math.round(object.rotation.z * 100) / 100,
      },
      scale: {
        x: Math.round(object.scale.x * 100) / 100,
        y: Math.round(object.scale.y * 100) / 100,
        z: Math.round(object.scale.z * 100) / 100,
      },
    }

    // Add material info for meshes
    if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
      const material = object.material
      sceneObject.material = {
        color: '#' + material.color.getHexString(),
        metalness: material.metalness,
        roughness: material.roughness,
        emissive: '#' + material.emissive.getHexString(),
        emissiveIntensity: material.emissiveIntensity,
      }
    }

    // Add light info
    if (object.userData.lightType) {
      sceneObject.lightType = object.userData.lightType
      if (object instanceof THREE.PointLight || object instanceof THREE.DirectionalLight) {
        sceneObject.lightColor = '#' + object.color.getHexString()
        sceneObject.lightIntensity = object.intensity
      }
    }

    // Add geometry info
    if (object instanceof THREE.Mesh) {
      const geo = object.geometry
      if (geo instanceof THREE.BoxGeometry) {
        sceneObject.geometry = {
          width: geo.parameters.width,
          height: geo.parameters.height,
          depth: geo.parameters.depth,
        }
      } else if (geo instanceof THREE.SphereGeometry) {
        sceneObject.geometry = { radius: geo.parameters.radius }
      } else if (geo instanceof THREE.CylinderGeometry) {
        sceneObject.geometry = {
          radius: geo.parameters.radiusTop,
          height: geo.parameters.height,
        }
      } else if (geo instanceof THREE.ConeGeometry) {
        sceneObject.geometry = {
          radius: geo.parameters.radius,
          height: geo.parameters.height,
        }
      } else if (geo instanceof THREE.PlaneGeometry) {
        sceneObject.geometry = {
          width: geo.parameters.width,
          height: geo.parameters.height,
        }
      }
    }

    objects.push(sceneObject)
  })

  // Get camera target (where it's looking)
  const target = new THREE.Vector3()
  camera.getWorldDirection(target)
  target.multiplyScalar(10).add(camera.position)

  // Get background color
  let backgroundColor = '#0a0a0f'
  if (scene.background instanceof THREE.Color) {
    backgroundColor = '#' + scene.background.getHexString()
  }

  // Get fog info
  let fogInfo = undefined
  if (scene.fog instanceof THREE.Fog) {
    fogInfo = {
      color: '#' + scene.fog.color.getHexString(),
      near: scene.fog.near,
      far: scene.fog.far,
    }
  }

  // Get ambient light intensity
  let ambientIntensity = 0.3
  scene.traverse((object) => {
    if (object instanceof THREE.AmbientLight) {
      ambientIntensity = object.intensity
    }
  })

  return {
    objects,
    camera: {
      position: {
        x: Math.round(camera.position.x * 100) / 100,
        y: Math.round(camera.position.y * 100) / 100,
        z: Math.round(camera.position.z * 100) / 100,
      },
      target: {
        x: Math.round(target.x * 100) / 100,
        y: Math.round(target.y * 100) / 100,
        z: Math.round(target.z * 100) / 100,
      },
    },
    environment: {
      backgroundColor,
      fog: fogInfo,
      ambientIntensity,
    },
  }
}

// Format scene state as a readable string for the agent
export function formatSceneForAgent(state: SceneState): string {
  const lines: string[] = []

  lines.push('=== CURRENT SCENE ===')
  lines.push(`Objects: ${state.objects.length}`)
  lines.push(`Camera: (${state.camera.position.x}, ${state.camera.position.y}, ${state.camera.position.z})`)
  lines.push(`Background: ${state.environment.backgroundColor}`)

  if (state.objects.length > 0) {
    lines.push('')
    lines.push('Objects in scene:')
    for (const obj of state.objects) {
      const pos = `(${obj.position.x}, ${obj.position.y}, ${obj.position.z})`
      const color = obj.material?.color || obj.lightColor || 'N/A'
      lines.push(`  - ${obj.name} [${obj.type}] at ${pos}, color: ${color}`)
    }
  } else {
    lines.push('')
    lines.push('Scene is empty. Start building!')
  }

  return lines.join('\n')
}
