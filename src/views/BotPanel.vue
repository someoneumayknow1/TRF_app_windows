<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Bot Panel</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-subtitle-1 grey--text">Admin-only bot management panel.</div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class BotPanel extends Vue {}
</script>
