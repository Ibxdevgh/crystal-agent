import type * as THREE from 'three'

// Scene object representation
export interface SceneObject {
  id: string
  type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'cone' | 'light' | 'group'
  name: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  material?: MaterialParams
  lightType?: 'point' | 'directional' | 'spot' | 'ambient'
  lightIntensity?: number
  lightColor?: string
  geometry?: GeometryParams
}

export interface GeometryParams {
  width?: number
  height?: number
  depth?: number
  radius?: number
  radiusTop?: number
  radiusBottom?: number
  segments?: number
}

export interface MaterialParams {
  color: string
  metalness?: number
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
  opacity?: number
  transparent?: boolean
}

// Scene state for serialization
export interface SceneState {
  objects: SceneObject[]
  camera: {
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
  }
  environment: {
    backgroundColor: string
    fog?: {
      color: string
      near: number
      far: number
    }
    ambientIntensity: number
  }
}

// Commands that the agent can execute
export interface Command {
  action: string
  params: Record<string, any>
}

export interface AgentResponse {
  thought: string
  command: Command
}

// Agent state
export interface AgentState {
  isRunning: boolean
  isPaused: boolean
  goal: string
  thoughts: ThoughtEntry[]
  commandHistory: Command[]
  speed: number // ms between commands
  error: string | null
  credits: number
  maxCredits: number
  showCreditModal: boolean
}

export interface ThoughtEntry {
  id: string
  thought: string
  command: Command
  timestamp: number
  status: 'pending' | 'executing' | 'completed' | 'error'
}

// API request/response
export interface AgentRequest {
  sceneState: SceneState
  goal: string
  history: Command[]
}

// Wallet state
export interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
}

// Command definitions for the agent
export const AVAILABLE_COMMANDS = [
  'createBox',
  'createSphere',
  'createCylinder',
  'createPlane',
  'createCone',
  'addPointLight',
  'addDirectionalLight',
  'addSpotLight',
  'setMaterial',
  'moveObject',
  'rotateObject',
  'scaleObject',
  'deleteObject',
  'setBackgroundColor',
  'addFog',
  'moveCamera',
  'complete',
] as const

export type CommandName = typeof AVAILABLE_COMMANDS[number]
