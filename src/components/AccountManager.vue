<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Account</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h6 mb-4">Politics & War API Key</div>
      <v-text-field
        v-model="apiKey"
        label="API Key"
        outlined
        dense
        :type="showKey ? 'text' : 'password'"
        :append-icon="showKey ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append="showKey = !showKey"
        class="mb-2"
      />
      <v-btn color="primary" @click="saveApiKey">
        <v-icon left>mdi-content-save</v-icon>
        Save API Key
      </v-btn>
      <v-alert v-if="saved" type="success" dense class="mt-4">API key saved!</v-alert>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getApiKey, setApiKey } from '@/utilities/apiKey'

@Component
export default class AccountManager extends Vue {
  apiKey = ''
  showKey = false
  saved = false

  async created() {
    this.apiKey = await getApiKey()
  }

  async saveApiKey() {
    await setApiKey(this.apiKey)
    this.$store.commit('setLoggedIn', !!this.apiKey)
    this.saved = true
    setTimeout(() => { this.saved = false }, 3000)
  }
}
</script>
