<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">About</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h5 mb-2">TRF Bar 3 Desktop</div>
      <div class="text-subtitle-1 grey--text mb-4">Version {{ version }}</div>
      <div class="body-1 mb-4">
        Bar 3 is an automatic recruitment application for Politics and War.
        This is the Windows desktop version, connecting to the bar3-server API.
      </div>
      <v-divider class="mb-4" />
      <div class="caption grey--text">
        Original bar3-server by bsnk-dev / TheonlyGlaernisch.<br>
        Desktop app wrapper for Windows with Discord auth and notifications.
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class About extends Vue {
  get version() { return this.$store.getters.appVersion }
}
</script>
