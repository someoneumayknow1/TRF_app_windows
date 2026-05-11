<template>
  <v-card class="pa-4" dark color="#1A1A1A" min-width="280">
    <div class="text-subtitle-1 mb-2">Recent Messages</div>
    <v-list dense>
      <v-list-item v-for="(msg, i) in recentMessages" :key="i">
        <v-list-item-content>
          <v-list-item-title>{{ msg.nation && msg.nation.nation }}</v-list-item-title>
          <v-list-item-subtitle :class="msg.successful ? 'success--text' : 'error--text'">
            {{ msg.successful ? 'Sent' : 'Failed: ' + msg.error }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <div v-if="!recentMessages.length" class="text--secondary">No messages sent yet.</div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class MessagesSentCard extends Vue {
  get recentMessages() {
    return (this.$store.getters.sentMessages || []).slice(-5).reverse()
  }
}
</script>
