import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    name: "Tree",
    path: "",
    component: () => import("@/views/Tree.vue")
  },
  {
    name: "Editor",
    path: "/editor",
    component: () => import("@/views/Editor.vue")
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
