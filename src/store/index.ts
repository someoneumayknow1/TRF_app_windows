import Vue from 'vue'
import Vuex from 'vuex'
import { GitHubRelease } from '@/types'
import { resolveServerUrl } from '@/utilities/serverUrls'
import { getApiKey } from '@/utilities/apiKey'

Vue.use(Vuex)

import analytics from './modules/analytics'

export default new Vuex.Store({
  state: {
    isApplicationOn: false,
    serverUrl: '',
    sentMessages: [] as any[],
    lastRefreshed: 0,
    packageVersion: process.env.PACKAGE_VERSION || '0',
    serverVersion: '',
    apiDetails: { used: 0, max: 0 },
    newUpdate: null as null | GitHubRelease,
    isLoggedIn: false, // initialized async via loadApiKeyState action
    isDiscordAuthed: false,
    isAdmin: false,
    isBotAuthed: false,
  },
  getters: {
    applicationOn: (state) => state.isApplicationOn,
    serverUrl: (state) => state.serverUrl,
    isLoggedIn: (state) => state.isLoggedIn,
    isDiscordAuthed: (state) => state.isDiscordAuthed,
    isAdmin: (state) => state.isAdmin,
    isBotAuthed: (state) => state.isBotAuthed,
    sentMessages: (state) => state.sentMessages,
    appVersion: (state) => state.packageVersion,
    serverVersion: (state) => state.serverVersion,
    apiDetails: (state) => state.apiDetails,
    lastRefreshed: (state) => state.lastRefreshed,
    newUpdate: (state) => state.newUpdate,
  },
  mutations: {
    setApplicationState(state, isOn: boolean) { state.isApplicationOn = isOn },
    setServerUrl(state, url: string) { state.serverUrl = url },
    setLoggedIn(state, isLoggedIn: boolean) { state.isLoggedIn = isLoggedIn },
    setDiscordAuthed(state, value: boolean) { state.isDiscordAuthed = value },
    setIsAdmin(state, value: boolean) { state.isAdmin = value },
    setBotAuthed(state, value: boolean) { state.isBotAuthed = value },
    setSentMessages(state, msgs: any[]) { state.sentMessages = msgs },
    setAPIDetails(state, details: { used: number; max: number }) { state.apiDetails = details },
    setLastRefreshed(state, time: number) { state.lastRefreshed = time },
    setNewUpdate(state, update: GitHubRelease) { state.newUpdate = update },
    setServerVersion(state, v: string) { state.serverVersion = v },
  },
  actions: {
    async loadServerUrl({ commit }) {
      const url = await resolveServerUrl();
      commit('setServerUrl', url);
    },
    async loadApiKeyState({ commit }) {
      const key = await getApiKey();
      commit('setLoggedIn', !!key);
    }
  },
  modules: { analytics }
})
