import { defineStore } from 'pinia'
import type { AgentState, ThoughtEntry, Command } from '~/types'

const DEFAULT_CREDITS = 10
const CREDITS_STORAGE_KEY = 'crystal_agent_credits'

// Load credits from localStorage
function loadCredits(): number {
  if (typeof window === 'undefined') return DEFAULT_CREDITS
  const stored = localStorage.getItem(CREDITS_STORAGE_KEY)
  if (stored) {
    const parsed = parseInt(stored, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed
    }
  }
  return DEFAULT_CREDITS
}

// Save credits to localStorage
function saveCredits(credits: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CREDITS_STORAGE_KEY, credits.toString())
}

export const useAgentStore = defineStore('agent', {
  state: (): AgentState => ({
    isRunning: false,
    isPaused: false,
    goal: '',
    thoughts: [],
    commandHistory: [],
    speed: 1500, // ms between commands
    error: null,
    credits: DEFAULT_CREDITS,
    maxCredits: DEFAULT_CREDITS,
    showCreditModal: false,
  }),

  getters: {
    latestThought: (state): ThoughtEntry | null => {
      return state.thoughts.length > 0 ? state.thoughts[state.thoughts.length - 1] : null
    },

    completedCommands: (state): number => {
      return state.thoughts.filter((t) => t.status === 'completed').length
    },

    isComplete: (state): boolean => {
      const latest = state.thoughts[state.thoughts.length - 1]
      return latest?.command.action === 'complete'
    },

    hasCredits: (state): boolean => {
      return state.credits > 0
    },

    creditPercentage: (state): number => {
      return Math.round((state.credits / state.maxCredits) * 100)
    },
  },

  actions: {
    setGoal(goal: string) {
      this.goal = goal
    },

    start() {
      this.isRunning = true
      this.isPaused = false
      this.error = null
    },

    pause() {
      this.isPaused = true
    },

    resume() {
      this.isPaused = false
    },

    stop() {
      this.isRunning = false
      this.isPaused = false
    },

    setSpeed(speed: number) {
      this.speed = speed
    },

    addThought(thought: string, command: Command) {
      const entry: ThoughtEntry = {
        id: `thought_${Date.now()}`,
        thought,
        command,
        timestamp: Date.now(),
        status: 'pending',
      }
      this.thoughts.push(entry)
      return entry.id
    },

    updateThoughtStatus(id: string, status: ThoughtEntry['status']) {
      const thought = this.thoughts.find((t) => t.id === id)
      if (thought) {
        thought.status = status
      }
    },

    addCommand(command: Command) {
      this.commandHistory.push(command)
    },

    setError(error: string | null) {
      this.error = error
      if (error) {
        this.isRunning = false
      }
    },

    reset() {
      this.isRunning = false
      this.isPaused = false
      this.goal = ''
      this.thoughts = []
      this.commandHistory = []
      this.error = null
    },

    useCredit() {
      if (this.credits > 0) {
        this.credits--
        saveCredits(this.credits)
        return true
      }
      return false
    },

    openCreditModal() {
      this.showCreditModal = true
    },

    closeCreditModal() {
      this.showCreditModal = false
    },

    resetCredits() {
      this.credits = DEFAULT_CREDITS
      saveCredits(this.credits)
    },

    initCredits() {
      this.credits = loadCredits()
    },
  },
})
