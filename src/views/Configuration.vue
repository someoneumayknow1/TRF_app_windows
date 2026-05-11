<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Configuration</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h6 mb-4">Application Settings</div>
      <v-text-field v-model="config.messageSubject" label="Message Subject" outlined dense class="mb-2" />
      <v-btn color="primary" :loading="saving" @click="save">
        <v-icon left>mdi-content-save</v-icon>
        Save Configuration
      </v-btn>
      <v-alert v-if="saved" type="success" dense class="mt-4">Configuration saved!</v-alert>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import getConfig from '@/actions/getConfig'
import sendConfig from '@/actions/sendConfig'

@Component
export default class Configuration extends Vue {
  config: any = { messageSubject: '' }
  saving = false
  saved = false

  async created() {
    const cfg = await getConfig()
    if (cfg) this.config = cfg
  }

  async save() {
    this.saving = true
    await sendConfig(this.config)
    this.saving = false
    this.saved = true
    setTimeout(() => { this.saved = false }, 3000)
  }
}
</script>
