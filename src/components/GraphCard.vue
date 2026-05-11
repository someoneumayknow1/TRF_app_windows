<template>
  <v-card class="pa-4" dark color="#1A1A1A" min-width="280">
    <div class="text-subtitle-1 mb-2">{{ title }}</div>
    <div class="text-h4 primary--text">{{ value }}</div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class GraphCard extends Vue {
  @Prop({ default: 'messagesSentOverTime' }) graphType!: string

  get title(): string {
    if (this.graphType === 'apiRequests') return 'API Requests'
    return 'Messages Sent'
  }

  get value(): string {
    if (this.graphType === 'apiRequests') {
      const d = this.$store.getters.apiDetails
      return `${d.used} / ${d.max}`
    }
    return String(this.$store.getters.sentMessages.length)
  }
}
</script>
