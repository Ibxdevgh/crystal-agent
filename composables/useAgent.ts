import { useAgentStore } from '~/stores/agent'
import { useScene } from '~/composables/useScene'
import type { Command, AgentResponse } from '~/types'

export function useAgent() {
  const store = useAgentStore()
  const scene = useScene()

  let abortController: AbortController | null = null

  // Call the agent API
  async function callAgent(sceneState: string, goal: string, history: Command[]): Promise<AgentResponse> {
    abortController = new AbortController()

    const response = await $fetch<AgentResponse>('/api/agent', {
      method: 'POST',
      body: {
        sceneState,
        goal,
        history,
      },
      signal: abortController.signal,
    })

    return response
  }

  // Main agent loop
  async function runAgentLoop() {
    if (!scene.isInitialized.value) {
      store.setError('Scene not initialized')
      return
    }

    // Check credits before starting
    if (!store.hasCredits) {
      store.openCreditModal()
      return
    }

    store.start()

    while (store.isRunning && !store.isPaused) {
      try {
        // Check credits before each command
        if (!store.hasCredits) {
          store.openCreditModal()
          store.stop()
          break
        }

        // Get current scene state
        const sceneState = scene.getSceneStateForAgent()

        // Call agent
        const response = await callAgent(sceneState, store.goal, store.commandHistory)

        // Check if we should stop
        if (!store.isRunning) break

        // Add thought to store
        const thoughtId = store.addThought(response.thought, response.command)
        store.updateThoughtStatus(thoughtId, 'executing')

        // Execute command
        if (response.command.action === 'complete') {
          store.updateThoughtStatus(thoughtId, 'completed')
          store.stop()
          break
        }

        const result = scene.runCommand(response.command)

        if (result !== null) {
          store.addCommand(response.command)
          store.updateThoughtStatus(thoughtId, 'completed')
          // Use a credit for successful command
          store.useCredit()
        } else {
          store.updateThoughtStatus(thoughtId, 'error')
        }

        // Wait before next command
        await new Promise((resolve) => setTimeout(resolve, store.speed))

        // Check pause state
        while (store.isPaused && store.isRunning) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Safety limit
        if (store.commandHistory.length >= 50) {
          store.setError('Reached maximum command limit (50)')
          break
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          break
        }
        console.error('Agent error:', error)
        store.setError(error.message || 'Unknown error')
        break
      }
    }

    store.stop()
  }

  // Start building
  function startBuilding(goal: string) {
    store.reset()
    scene.clearScene()
    store.setGoal(goal)
    runAgentLoop()
  }

  // Pause/resume
  function togglePause() {
    if (store.isPaused) {
      store.resume()
    } else {
      store.pause()
    }
  }

  // Stop completely
  function stopBuilding() {
    if (abortController) {
      abortController.abort()
    }
    store.stop()
  }

  // Intervene with a new instruction
  async function intervene(instruction: string) {
    if (!store.isRunning) return

    // Pause current loop
    store.pause()

    // Append instruction to goal
    store.goal = `${store.goal}\n\nAdditional instruction: ${instruction}`

    // Resume
    store.resume()
  }

  return {
    store,
    scene,
    startBuilding,
    togglePause,
    stopBuilding,
    intervene,
  }
}
