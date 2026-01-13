<script setup lang="ts">
import { useWallet } from '~/composables/useWallet'

const wallet = useWallet()

// NOTE: We intentionally do NOT auto-check connection on mount
// to avoid triggering wallet popups (especially Phantom).
// Wallet only opens when user explicitly clicks "Connect Wallet"
</script>

<template>
  <div class="wallet-button-wrapper">
    <!-- Connect Button - Crystal Agency bracket style -->
    <button
      v-if="!wallet.isConnected.value"
      class="btn-bracket wallet-btn"
      :disabled="wallet.isConnecting.value"
      @click="wallet.connect"
    >
      [<span v-if="wallet.isConnecting.value">Connecting...</span>
      <span v-else>Connect Wallet</span>]
    </button>

    <!-- Connected State -->
    <div v-else class="wallet-connected">
      <span class="address-dot" />
      <span class="wallet-address">{{ wallet.shortAddress.value }}</span>
      <button class="disconnect-btn" @click="wallet.disconnect">
        [x]
      </button>
    </div>

    <!-- Error tooltip -->
    <div v-if="wallet.error.value" class="wallet-error">
      {{ wallet.error.value }}
    </div>
  </div>
</template>

<style scoped>
.wallet-button-wrapper {
  position: relative;
}

.wallet-btn {
  cursor: none;
}

.wallet-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-connected {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.39px;
  text-transform: uppercase;
}

.address-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

.wallet-address {
  color: #000;
}

.disconnect-btn {
  background: transparent;
  border: none;
  color: #000;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  cursor: none;
  transition: 0.3s ease-in-out;
}

.disconnect-btn:hover {
  color: #f87171;
}

.wallet-error {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  padding: 8px 12px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 6px;
  color: #f87171;
  font-size: 11px;
  white-space: nowrap;
}
</style>
