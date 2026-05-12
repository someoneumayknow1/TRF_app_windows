<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-2">Settings</h1>
    <div class="text-subtitle-1 grey--text text--lighten-1 mb-6">Configure your Bar 3 desktop application.</div>

    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h6 mb-4">Server Connection</div>
      <v-text-field
        v-model="serverUrl"
        label="Bar 3 Server URL"
        placeholder="https://your-bar3-server.com"
        outlined
        dense
        :rules="[urlRule]"
        hint="The URL of your bar3-server instance"
        persistent-hint
        class="mb-4"
      />
      <v-btn color="primary" :loading="saving" @click="saveServerUrl">
        <v-icon left>mdi-content-save</v-icon>
        Save
      </v-btn>
      <v-alert v-if="saveSuccess" type="success" dense class="mt-4">
        Server URL saved! Reload the app to apply.
      </v-alert>
      <v-alert v-if="saveError" type="error" dense class="mt-4">
        {{ saveError }}
      </v-alert>
    </v-card>

    <v-card class="pa-6 mt-4" dark color="#1A1A1A">
      <div class="text-h6 mb-4">Notifications</div>
      <v-switch
        v-model="notificationsEnabled"
        label="Enable Desktop Notifications"
        color="primary"
        @change="toggleNotifications"
      />
      <v-btn color="secondary" outlined small @click="testNotification" class="mt-2">
        <v-icon left small>mdi-bell</v-icon>
        Test Notification
      </v-btn>
    </v-card>

    <v-card class="pa-6 mt-4" dark color="#1A1A1A">
      <div class="text-h6 mb-2">Account</div>
      <v-btn color="error" outlined @click="logout">
        <v-icon left>mdi-logout</v-icon>
        Sign Out (Discord)
      </v-btn>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { discordAuth } from '@/utilities/discordAuth'
import { clearServerUrlCache } from '@/utilities/serverUrls'
import { showNotification } from '@/utilities/notifications'

@Component
export default class Settings extends Vue {
  serverUrl = ''
  saving = false
  saveSuccess = false
  saveError = ''
  notificationsEnabled = true

  urlRule(v: string): boolean | string {
    try {
      new URL(v)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  }

  async created() {
    if (typeof window !== 'undefined' && window.electronAPI) {
      this.serverUrl = await window.electronAPI.getServerUrl()
    }
    this.notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false'
  }

  async saveServerUrl() {
    this.saving = true
    this.saveSuccess = false
    this.saveError = ''
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.setServerUrl(this.serverUrl)
        clearServerUrlCache()
        this.$store.commit('setServerUrl', this.serverUrl)
        this.saveSuccess = true
      }
    } catch (e) {
      this.saveError = (e as Error)?.message || 'Failed to save'
    } finally {
      this.saving = false
    }
  }

  toggleNotifications(value: boolean) {
    localStorage.setItem('notificationsEnabled', String(value))
  }

  testNotification() {
    showNotification({
      title: 'Bar 3',
      body: 'Desktop notifications are working!'
    })
  }

  async logout() {
    await discordAuth.logout()
  }
}
</script>
