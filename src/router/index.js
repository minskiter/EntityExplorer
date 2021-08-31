import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    name: "Tree",
    path: "",
    component: () => import("@/modules/Tree/Tree.vue")
  },
  {
    name: "Editor",
    path: "/editor",
    component: () => import("@/modules/Editor/Editor.vue")
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
