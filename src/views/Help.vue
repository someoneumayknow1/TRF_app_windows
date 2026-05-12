<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Help</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h6 mb-2">Getting Started</div>
      <ol class="body-1" style="line-height:2">
        <li>Go to <b>Settings</b> and configure your bar3-server URL.</li>
        <li>Log in with Discord via the login page.</li>
        <li>Go to <b>Account</b> and enter your Politics &amp; War API key.</li>
        <li>Go to <b>Message Creator</b> to set up your recruitment message.</li>
        <li>Enable automation using the toggle in the top bar.</li>
      </ol>
      <v-divider class="my-4" />
      <div class="text-h6 mb-2">Notifications</div>
      <p class="body-1">
        Desktop notifications will appear when messages are sent by the automation.
        You can test and toggle notifications in <b>Settings</b>.
      </p>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Help extends Vue {}
</script>
