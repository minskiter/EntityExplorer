import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    name: "Entry",
    path: "",
    component: () => import("@/modules/Nav/nav.vue")
  },
  {
    name: "Tree",
    path: "/tree",
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
