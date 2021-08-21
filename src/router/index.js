import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    name:"Tree",
    path:"",
    component:()=>import("@/views/Tree.vue")
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
