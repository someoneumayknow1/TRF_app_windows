import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '@/views/Home.vue'
import Configuration from '@/views/Configuration.vue'
import MessageCreator from '@/views/MessageCreator.vue'
import Analytics from '@/views/Analytics.vue'
import AccountManager from '@/components/AccountManager.vue'
import About from '@/views/About.vue'
import Help from '@/views/Help.vue'
import DiscordLogin from '@/views/DiscordLogin.vue'
import DiscordCallback from '@/views/DiscordCallback.vue'
import BotPanel from '@/views/BotPanel.vue'
import Settings from '@/views/Settings.vue'
import { discordAuth } from '@/utilities/discordAuth'
import { normalizeReturnTo } from '@/utilities/serverUrls'

Vue.use(VueRouter)

const DISCORD_PUBLIC_PATHS = ['/discord-login', '/auth/discord/callback', '/settings']

const routes: Array<RouteConfig> = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Home },
  { path: '/automation', name: 'Automation', component: MessageCreator },
  { path: '/config', name: 'Configuration', component: Configuration },
  { path: '/message-creator', name: 'Message Creator', component: MessageCreator },
  { path: '/analytics', name: 'Analytics', component: Analytics },
  { path: '/account', name: 'Account', component: AccountManager },
  { path: '/about', name: 'About', component: About },
  { path: '/help', name: 'Help', component: Help },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/discord-login', name: 'Discord Login', component: DiscordLogin },
  { path: '/auth/discord/callback', name: 'Discord Callback', component: DiscordCallback },
  { path: '/bot', name: 'Bot Panel', component: BotPanel, meta: { requiresBotAuth: true } },
]

const router = new VueRouter({
  mode: 'hash', // Use hash mode for Electron (no server-side routing needed)
  routes
})

router.beforeEach(async (to, _from, next) => {
  if (DISCORD_PUBLIC_PATHS.includes(to.path)) {
    next()
    return
  }

  const authed = await discordAuth.isAuthed()
  if (!authed) {
    next(`/discord-login?returnTo=${encodeURIComponent(to.fullPath)}`)
    return
  }

  if (to.meta?.requiresBotAuth) {
    const session = await discordAuth.getSession()
    if (!session.isAdmin) {
      next('/dashboard')
      return
    }
  }

  if (to.query.returnTo) {
    const returnTo = normalizeReturnTo(to.query.returnTo)
    if (returnTo) {
      next({ path: returnTo, replace: true })
      return
    }
  }

  next()
})

export default router
