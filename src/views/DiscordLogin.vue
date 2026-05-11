<template>
  <v-app style="background: #0f0f0f;">
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="5" lg="4">
            <v-card class="discord-login-card pa-8" dark color="#1A1A1A">
              <div class="text-center mb-6">
                <div class="text-h5 white--text font-weight-bold mb-1">TRF Bar 3</div>
                <div class="text--secondary body-2">
                  You must verify your Discord membership before accessing this application.
                </div>
              </div>

              <v-alert v-if="error" type="error" dense class="mb-4">
                {{ error }}
                <div v-if="errorHint" class="caption mt-1">{{ errorHint }}</div>
                <div v-if="errorCode" class="caption mt-1">Error code: {{ errorCode }}</div>
              </v-alert>

              <v-btn block large color="#5865F2" dark class="discord-btn" :loading="loading" @click="login">
                <v-icon left>mdi-discord</v-icon>
                Login with Discord
              </v-btn>

              <div class="text-center mt-4 caption text--secondary">
                Access is restricted to authorized Discord members only.
              </div>
              <div class="text-center mt-2">
                <v-btn text small color="grey" @click="$router.push('/settings')">
                  <v-icon left small>mdi-cog</v-icon>
                  Server Settings
                </v-btn>
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
export default class DiscordLogin extends Vue {
  error = ''
  errorCode = ''
  errorHint = ''
  loading = false

  private mapAuthError(rawError: string): string {
    this.errorCode = ''
    this.errorHint = ''
    const normalized = rawError.toLowerCase()
    if (normalized.startsWith('role_check_failed')) {
      this.errorCode = rawError
      this.errorHint = 'If you already have the correct role, this is usually a temporary backend issue.'
      return 'Role verification is temporarily unavailable. Please try again in a moment.'
    }
    if (normalized === 'no_role') return 'Your Discord account does not currently have access to Bar 3.'
    if (normalized === 'auth_failed') return 'Discord sign-in failed. Please try again.'
    if (normalized === 'no_code') return 'No authorization code received from Discord. Please try again.'
    return rawError
  }

  created() {
    discordAuth.isAuthed().then(authed => {
      if (authed) this.$router.replace('/')
    })
    const queryError = this.$route.query.error
    if (typeof queryError === 'string' && queryError) {
      this.error = this.mapAuthError(queryError)
    }
  }

  async login() {
    this.loading = true
    this.error = ''
    try {
      await discordAuth.redirectToDiscord(normalizeReturnTo(this.$route.query.returnTo))
      // After redirectToDiscord returns (Electron), re-check auth
      const authed = await discordAuth.isAuthed()
      if (authed) {
        this.$store.commit('setDiscordAuthed', true)
        const target = normalizeReturnTo(this.$route.query.returnTo) || '/dashboard'
        this.$router.replace(target)
      } else {
        this.error = 'Authentication failed. Please try again.'
      }
    } catch (e: any) {
      this.error = e.message || 'An error occurred during login.'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.discord-login-card {
  border: 1px solid rgba(88, 101, 242, 0.3) !important;
  border-radius: 16px !important;
}
.discord-btn {
  border-radius: 8px !important;
  font-weight: 600;
  letter-spacing: 0.03em;
}
</style>
