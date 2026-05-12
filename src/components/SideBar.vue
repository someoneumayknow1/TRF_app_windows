<template>
  <v-navigation-drawer v-model="open" app dark color="#141414" :mini-variant="!open && !$vuetify.breakpoint.mobile">
    <v-list dense nav>
      <v-list-item v-for="item in items" :key="item.title" :to="item.path" link>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class SideBar extends Vue {
  @Prop({ default: false }) value!: boolean
  @Prop({ default: false }) disabled!: boolean

  get open(): boolean { return this.value }
  set open(val: boolean) { this.$emit('input', val) }

  get isAdmin(): boolean { return this.$store.getters.isAdmin }

  get items() {
    const base = [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', path: '/dashboard' },
      { title: 'Message Creator', icon: 'mdi-email-edit', path: '/message-creator' },
      { title: 'Configuration', icon: 'mdi-tune', path: '/config' },
      { title: 'Analytics', icon: 'mdi-chart-line', path: '/analytics' },
      { title: 'Account', icon: 'mdi-account', path: '/account' },
      { title: 'Help', icon: 'mdi-help-circle', path: '/help' },
      { title: 'About', icon: 'mdi-information', path: '/about' },
      { title: 'Settings', icon: 'mdi-cog', path: '/settings' },
    ]
    if (this.isAdmin) {
      base.push({ title: 'Bot Panel', icon: 'mdi-robot', path: '/bot' })
    }
    return base
  }
}
</script>
