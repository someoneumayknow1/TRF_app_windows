<template>
  <v-app style="background: #0f0f0f;">
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="5" lg="4">
            <v-card class="pa-8" dark color="#1A1A1A" style="border-radius: 16px !important;">
              <div class="text-center">
                <v-progress-circular indeterminate color="#5865F2" size="56" class="mb-4" />
                <div class="text-h6 white--text font-weight-medium mb-2">Signing you in…</div>
                <div class="body-2 text--secondary">Please wait a moment.</div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { discordAuth } from '@/utilities/discordAuth'
import { normalizeReturnTo } from '@/utilities/serverUrls'

@Component
export default class DiscordCallback extends Vue {
  async created() {
    const authed = await discordAuth.isAuthed()
    if (!authed) {
      this.$router.replace('/discord-login?error=' + encodeURIComponent('Sign-in failed. Please try again.'))
      return
    }
    this.$store.commit('setDiscordAuthed', true)
    const target = normalizeReturnTo(this.$route.query.returnTo) || '/'
    this.$router.replace(target)
  }
}
</script>
