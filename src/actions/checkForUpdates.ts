import store from '@/store';

export default async function checkForUpdates(): Promise<void> {
  try {
    const res = await fetch('https://api.github.com/repos/TheonlyGlaernisch/bar3-server/releases/latest');
    if (!res.ok) return;
    const release = await res.json();
    store.commit('setNewUpdate', release);
  } catch {
    // ignore
  }
}
