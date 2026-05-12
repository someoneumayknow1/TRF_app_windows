<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-2">Message Creator</h1>
    <div class="text-subtitle-1 grey--text text--lighten-1 mb-4">Create and configure your recruitment message.</div>
    <v-card class="pa-6" dark color="#1A1A1A">
      <v-text-field v-model="subject" label="Subject" outlined dense class="mb-2" />
      <v-textarea v-model="body" label="Message Body (HTML)" outlined rows="10" class="mb-4" />
      <v-btn color="primary" :loading="saving" @click="save">
        <v-icon left>mdi-content-save</v-icon>
        Save Message
      </v-btn>
      <v-alert v-if="saved" type="success" dense class="mt-4">Message saved!</v-alert>
      <v-alert v-if="error" type="error" dense class="mt-4">{{ error }}</v-alert>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import getConfig from '@/actions/getConfig'
import sendConfig from '@/actions/sendConfig'

@Component
export default class MessageCreator extends Vue {
  subject = ''
  body = ''
  saving = false
  saved = false
  error = ''

  async created() {
    const cfg = await getConfig()
    if (cfg) {
      this.subject = cfg.messageSubject || ''
      this.body = cfg.messageHTML || ''
    }
  }

  async save() {
    this.saving = true
    this.error = ''
    const ok = await sendConfig({ messageSubject: this.subject, messageHTML: this.body })
    this.saving = false
    if (ok) {
      this.saved = true
      setTimeout(() => { this.saved = false }, 3000)
    } else {
      this.error = 'Failed to save. Check your server connection.'
    }
  }
}
</script>
