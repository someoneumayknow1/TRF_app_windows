export default {
  namespaced: true,
  state: {
    campaigns: [] as any[],
  },
  getters: {
    campaigns: (state: any) => state.campaigns,
  },
  mutations: {
    setCampaigns(state: any, campaigns: any[]) { state.campaigns = campaigns },
  },
  actions: {},
}
