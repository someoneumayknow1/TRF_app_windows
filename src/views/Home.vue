<template>
  <div class="home view-small-inner-wrapper view-padding-inner-wrapper">
    <h1>Dashboard</h1>
    <div class="text-subtitle-1 grey--text text--lighten-1">Last refreshed {{ refreshedSecondsAgo }} second{{ refreshedSecondsAgo !== 1 ? 's' : '' }} ago</div>
    <div class="dashboard-cards-container mt-6">
      <graph-card class="dashboard-card" graphType="messagesSentOverTime" />
      <graph-card class="dashboard-card" graphType="apiRequests" />
      <messages-sent-card class="dashboard-card" />
    </div>
    <v-btn fab fixed color="primary" dark bottom right @click="refreshData">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import GraphCard from '@/components/GraphCard.vue'
import MessagesSentCard from '@/components/MessagesSentCard.vue'
import getAppData from '@/actions/getAppData'
import { getPwApiKeyDetails } from '@/utilities/pwApi'
import { showNotification } from '@/utilities/notifications'
import { getApiKey } from '@/utilities/apiKey'
import checkForUpdates from '@/actions/checkForUpdates'

@Component({ components: { GraphCard, MessagesSentCard } })
export default class Home extends Vue {
  refreshedSecondsAgo = 0
  private refreshTimer: ReturnType<typeof setTimeout> | null = null

  get lastRefreshed() { return this.$store.getters.lastRefreshed }

  scheduleRefreshDisplay() {
    this.refreshTimer = setTimeout(() => {
      this.refreshedSecondsAgo = Math.floor((Date.now() - this.lastRefreshed) / 1000)
      this.scheduleRefreshDisplay()
    }, 1000)
  }

  beforeDestroy() {
    if (this.refreshTimer !== null) clearTimeout(this.refreshTimer)
  }

  async fetchApiDetails() {
    const apiKey = await getApiKey()
    if (!apiKey) return

    const data = await getAppData()
    if (data) {
      const prevCount = this.$store.getters.sentMessages.length
      this.$store.commit('setSentMessages', data.sentMessages)
      // Show notification if automation sent new messages
      if (data.sentMessages && data.sentMessages.length > prevCount && prevCount > 0) {
        showNotification({
          title: 'Bar 3 - Messages Sent',
          body: `${data.sentMessages.length - prevCount} new message(s) sent by automation.`
        })
      }
    }

    const details = await getPwApiKeyDetails(apiKey).catch(() => ({ used: 0, max: 0 }))
    if (details.max > 0) {
      this.$store.commit('setAPIDetails', details)
    } else if (data && data.apiDetails.max > 0) {
      this.$store.commit('setAPIDetails', data.apiDetails)
    }
  }

  async refreshData() {
    this.$store.commit('setLastRefreshed', Date.now())
    await this.fetchApiDetails()
  }

  async mounted() {
    this.scheduleRefreshDisplay()
    await this.refreshData()
    await checkForUpdates()
  }
}
</script>

<style scoped>
.dashboard-cards-container {
  display: flex;
  flex-wrap: wrap;
}
.dashboard-card {
  margin-top: 16px;
}
@media only screen and (min-width: 450px) {
  .dashboard-card { margin-right: 16px; }
}
</style>
