<template>
  <v-alert v-if="newUpdate" type="info" dense dismissible>
    New version {{ newUpdate.tag_name }} available!
    <a :href="newUpdate.html_url" target="_blank">View release</a>
  </v-alert>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class UpdateAvailableBanner extends Vue {
  get newUpdate() { return this.$store.getters.newUpdate }
}
</script>
