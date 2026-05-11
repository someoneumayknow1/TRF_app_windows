<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Analytics</h1>
    <v-progress-circular v-if="loading" indeterminate color="primary" />
    <div v-else>
      <v-card class="pa-4 mb-4" dark color="#1A1A1A">
        <div class="text-h6 mb-2">Link Clicks</div>
        <v-list dense>
          <v-list-item v-for="link in analytics.links" :key="link.shortId">
            <v-list-item-content>
              <v-list-item-title>{{ link.shortId }}: {{ link.clickCount }} clicks</v-list-item-title>
              <v-list-item-subtitle>{{ link.url }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <div v-if="!analytics.links.length" class="text--secondary">No link analytics yet.</div>
      </v-card>
      <v-card class="pa-4" dark color="#1A1A1A">
        <div class="text-h6 mb-2">Message Views</div>
        <v-list dense>
          <v-list-item v-for="msg in analytics.messages" :key="msg.messageId">
            <v-list-item-content>
              <v-list-item-title>{{ msg.messageId }}: {{ msg.viewCount }} views</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <div v-if="!analytics.messages.length" class="text--secondary">No message analytics yet.</div>
      </v-card>
    </div>
    <v-alert v-if="error" type="error" dense class="mt-4">{{ error }}</v-alert>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { v2Api } from '@/utilities/v2Api'

@Component
export default class Analytics extends Vue {
  loading = true
  error = ''
  analytics = { links: [] as any[], messages: [] as any[] }

  async created() {
    try {
      this.analytics = await v2Api.getMyAnalytics()
    } catch (e: any) {
      this.error = e.message || 'Failed to load analytics'
    } finally {
      this.loading = false
    }
  }
}
</script>
