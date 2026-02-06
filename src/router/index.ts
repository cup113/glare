import { createRouter, createWebHistory } from 'vue-router'
import ArenaView from '@/views/ArenaView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'arena',
      component: ArenaView,
    },
  ],
})

export default router