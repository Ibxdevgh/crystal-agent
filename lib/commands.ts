import * as THREE from 'three'
import type { Command, SceneObject, MaterialParams } from '~/types'

// Generate unique IDs for objects
let objectCounter = 0
export function generateId(): string {
  return `obj_${++objectCounter}_${Date.now()}`
}

// Create a Three.js material from params
export function createMaterial(params: MaterialParams): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(params.color),
    metalness: params.metalness ?? 0.1,
    roughness: params.roughness ?? 0.5,
    emissive: params.emissive ? new THREE.Color(params.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: params.emissiveIntensity ?? 0,
    opacity: params.opacity ?? 1,
    transparent: params.transparent ?? false,
  })
}

// Command executors
export const commandExecutors = {
  createBox(
    scene: THREE.Scene,
    params: {
      position?: { x: number; y: number; z: number }
      size?: { x: number; y: number; z: number }
      color?: string
      name?: string
    }
  ): SceneObject {
    const { position = { x: 0, y: 0, z: 0 }, size = { x: 1, y: 1, z: 1 }, color = '#888888', name } = params

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    const material = createMaterial({ color })
    const mesh = new THREE.Mesh(geometry, material)

    const id = generateId()
    mesh.name = id
    mesh.position.set(position.x, position.y, position.z)
    mesh.userData = { type: 'box', displayName: name || 'Box' }

    scene.add(mesh)

    return {
      id,
      type: 'box',
      name: name || 'Box',
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: { color },
      geometry: { width: size.x, height: size.y, depth: size.z },
    }
  },

  createSphere(
    scene: THREE.Scene,
    params: {
      position?: { x: number; y: number; z: number }
      radius?: number
      color?: string
      name?: string
    }
  ): SceneObject {
    const { position = { x: 0, y: 0, z: 0 }, radius = 0.5, color = '#888888', name } = params

    const geometry = new THREE.SphereGeometry(radius, 32, 32)
    const material = createMaterial({ color })
    const mesh = new THREE.Mesh(geometry, material)

    const id = generateId()
    mesh.name = id
    mesh.position.set(position.x, position.y, position.z)
    mesh.userData = { type: 'sphere', displayName: name || 'Sphere' }

    scene.add(mesh)

    return {
      id,
      type: 'sphere',
      name: name || 'Sphere',
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: { color },
      geometry: { radius },
    }
  },

  createCylinder(
    scene: THREE.Scene,
    params: {
      position?: { x: number; y: number; z: number }
      radius?: number
      height?: number
      color?: string
      name?: string
    }
  ): SceneObject {
    const { position = { x: 0, y: 0, z: 0 }, radius = 0.5, height = 1, color = '#888888', name } = params

    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32)
    const material = createMaterial({ color })
    const mesh = new THREE.Mesh(geometry, material)

    const id = generateId()
    mesh.name = id
    mesh.position.set(position.x, position.y, position.z)
    mesh.userData = { type: 'cylinder', displayName: name || 'Cylinder' }

    scene.add(mesh)

    return {
      id,
      type: 'cylinder',
      name: name || 'Cylinder',
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: { color },
      geometry: { radius, height },
    }
  },

  createPlane(
    scene: THREE.Scene,
    params: {
      position?: { x: number; y: number; z: number }
      size?: { x: number; y: number }
      color?: string
      name?: string
    }
  ): SceneObject {
    const { position = { x: 0, y: 0, z: 0 }, size = { x: 10, y: 10 }, color = '#444444', name } = params

    const geometry = new THREE.PlaneGeometry(size.x, size.y)
    const material = createMaterial({ color })
    const mesh = new THREE.Mesh(geometry, material)

    const id = generateId()
    mesh.name = id
    mesh.position.set(position.x, position.y, position.z)
    mesh.rotation.x = -Math.PI / 2 // Lay flat by default
    mesh.userData = { type: 'plane', displayName: name || 'Plane' }

    scene.add(mesh)

    return {
      id,
      type: 'plane',
      name: name || 'Plane',
      position,
      rotation: { x: -Math.PI / 2, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: { color },
      geometry: { width: size.x, height: size.y },
    }
  },

  createCone(
    scene: THREE.Scene,
    params: {
      position?: { x: number; y: number; z: number }
      radius?: number
      height?: number
      color?: string
      name?: string
    }
  ): SceneObject {
    const { position = { x: 0, y: 0, z: 0 }, radius = 0.5, height = 1, color = '#888888', name } = params

    const geometry = new THREE.ConeGeometry(radius, height, 32)
    const material = createMaterial({ color })
    const mesh = new THREE.Mesh(geometry, material)

    const id = generateId()
    mesh.name = id
    mesh.position.set(position.x, position.y, position.z)
    mesh.userData = { type: 'cone', displayName: name || 'Cone' }

    scene.add(mesh)

    return {
      id,
      type: 'cone',
      name: name || 'Cone',
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: { color },
      geometry: { radius, height },
    }
  },

  addPointLight(
    scene: THREE.Scene,
    params: {
      position?: { x: number; y: number; z: number }
      color?: string
      intensity?: number
      name?: string
    }
  ): SceneObject {
    const { position = { x: 0, y: 5, z: 0 }, color = '#ffffff', intensity = 1, name } = params

    const light = new THREE.PointLight(new THREE.Color(color), intensity, 50)
    const id = generateId()
    light.name = id
    light.position.set(position.x, position.y, position.z)
    light.userData = { type: 'light', lightType: 'point', displayName: name || 'Point Light' }

    scene.add(light)

    // Add helper sphere to visualize light
    const helper = new THREE.Mesh(
      new THREE.SphereGeometry(0.1),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
    )
    helper.position.copy(light.position)
    helper.name = `${id}_helper`
    scene.add(helper)

    return {
      id,
      type: 'light',
      name: name || 'Point Light',
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      lightType: 'point',
      lightColor: color,
      lightIntensity: intensity,
    }
  },

  addDirectionalLight(
    scene: THREE.Scene,
    params: {
      position?: { x: number; y: number; z: number }
      color?: string
      intensity?: number
      name?: string
    }
  ): SceneObject {
    const { position = { x: 5, y: 10, z: 5 }, color = '#ffffff', intensity = 1, name } = params

    const light = new THREE.DirectionalLight(new THREE.Color(color), intensity)
    const id = generateId()
    light.name = id
    light.position.set(position.x, position.y, position.z)
    light.userData = { type: 'light', lightType: 'directional', displayName: name || 'Directional Light' }

    scene.add(light)

    return {
      id,
      type: 'light',
      name: name || 'Directional Light',
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      lightType: 'directional',
      lightColor: color,
      lightIntensity: intensity,
    }
  },

  setMaterial(
    scene: THREE.Scene,
    params: {
      objectId: string
      color?: string
      metalness?: number
      roughness?: number
      emissive?: string
      emissiveIntensity?: number
    }
  ): boolean {
    const object = scene.getObjectByName(params.objectId) as THREE.Mesh
    if (!object || !object.material) return false

    const material = object.material as THREE.MeshStandardMaterial
    if (params.color) material.color.set(params.color)
    if (params.metalness !== undefined) material.metalness = params.metalness
    if (params.roughness !== undefined) material.roughness = params.roughness
    if (params.emissive) material.emissive.set(params.emissive)
    if (params.emissiveIntensity !== undefined) material.emissiveIntensity = params.emissiveIntensity

    return true
  },

  moveObject(
    scene: THREE.Scene,
    params: { objectId: string; position: { x: number; y: number; z: number } }
  ): boolean {
    const object = scene.getObjectByName(params.objectId)
    if (!object) return false

    object.position.set(params.position.x, params.position.y, params.position.z)

    // Move helper if it's a light
    const helper = scene.getObjectByName(`${params.objectId}_helper`)
    if (helper) helper.position.copy(object.position)

    return true
  },

  rotateObject(
    scene: THREE.Scene,
    params: { objectId: string; rotation: { x: number; y: number; z: number } }
  ): boolean {
    const object = scene.getObjectByName(params.objectId)
    if (!object) return false

    object.rotation.set(params.rotation.x, params.rotation.y, params.rotation.z)
    return true
  },

  scaleObject(
    scene: THREE.Scene,
    params: { objectId: string; scale: { x: number; y: number; z: number } }
  ): boolean {
    const object = scene.getObjectByName(params.objectId)
    if (!object) return false

    object.scale.set(params.scale.x, params.scale.y, params.scale.z)
    return true
  },

  deleteObject(scene: THREE.Scene, params: { objectId: string }): boolean {
    const object = scene.getObjectByName(params.objectId)
    if (!object) return false

    scene.remove(object)

    // Remove helper if exists
    const helper = scene.getObjectByName(`${params.objectId}_helper`)
    if (helper) scene.remove(helper)

    return true
  },

  setBackgroundColor(scene: THREE.Scene, params: { color: string }): boolean {
    scene.background = new THREE.Color(params.color)
    return true
  },

  addFog(scene: THREE.Scene, params: { color: string; near?: number; far?: number }): boolean {
    const { color, near = 10, far = 50 } = params
    scene.fog = new THREE.Fog(new THREE.Color(color), near, far)
    return true
  },
}

// Execute a command
export function executeCommand(scene: THREE.Scene, command: Command): SceneObject | boolean | null {
  const executor = commandExecutors[command.action as keyof typeof commandExecutors]
  if (!executor) {
    console.warn(`Unknown command: ${command.action}`)
    return null
  }

  try {
    // Type assertion needed because command.params is generic Record<string, any>
    // but each executor has specific parameter types
    return (executor as (scene: THREE.Scene, params: any) => SceneObject | boolean)(scene, command.params)
  } catch (error) {
    console.error(`Error executing command ${command.action}:`, error)
    return null
  }
}
