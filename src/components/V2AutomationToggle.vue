<template>
  <v-switch
    v-model="applicationOn"
    :label="applicationOn ? 'Automation ON' : 'Automation OFF'"
    color="primary"
    hide-details
    dense
    class="mt-0"
    @change="toggleAutomation"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { v2Api } from '@/utilities/v2Api'

@Component
export default class V2AutomationToggle extends Vue {
  get applicationOn(): boolean { return this.$store.getters.applicationOn }
  set applicationOn(val: boolean) { this.$store.commit('setApplicationState', val) }

  async toggleAutomation(val: boolean) {
    try {
      await v2Api.setAutomationState(val)
    } catch (e) {
      // revert on error
      this.$store.commit('setApplicationState', !val)
    }
  }
}
</script>
