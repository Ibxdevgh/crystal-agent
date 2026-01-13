import { ref, computed } from 'vue'

// Simple wallet connection without full wagmi setup for MVP
// Can be expanded to use @wagmi/vue for full functionality

export function useWallet() {
  const address = ref<string | null>(null)
  const chainId = ref<number | null>(null)
  const isConnecting = ref(false)
  const error = ref<string | null>(null)

  const isConnected = computed(() => !!address.value)

  const shortAddress = computed(() => {
    if (!address.value) return null
    return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
  })

  async function connect() {
    if (typeof window === 'undefined') return

    const ethereum = (window as any).ethereum
    if (!ethereum) {
      error.value = 'MetaMask not installed'
      return
    }

    isConnecting.value = true
    error.value = null

    try {
      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length > 0) {
        address.value = accounts[0]

        // Get chain ID
        const chainIdHex = await ethereum.request({
          method: 'eth_chainId',
        })
        chainId.value = parseInt(chainIdHex, 16)

        // Listen for account changes
        ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            address.value = accounts[0]
          } else {
            disconnect()
          }
        })

        // Listen for chain changes
        ethereum.on('chainChanged', (chainIdHex: string) => {
          chainId.value = parseInt(chainIdHex, 16)
        })
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err)
      error.value = err.message || 'Failed to connect wallet'
    } finally {
      isConnecting.value = false
    }
  }

  function disconnect() {
    address.value = null
    chainId.value = null
    error.value = null
  }

  // Check if already connected on mount
  async function checkConnection() {
    if (typeof window === 'undefined') return

    const ethereum = (window as any).ethereum
    if (!ethereum) return

    try {
      const accounts = await ethereum.request({
        method: 'eth_accounts',
      })

      if (accounts.length > 0) {
        address.value = accounts[0]

        const chainIdHex = await ethereum.request({
          method: 'eth_chainId',
        })
        chainId.value = parseInt(chainIdHex, 16)
      }
    } catch (err) {
      console.error('Failed to check wallet connection:', err)
    }
  }

  return {
    address,
    chainId,
    isConnected,
    isConnecting,
    shortAddress,
    error,
    connect,
    disconnect,
    checkConnection,
  }
}
