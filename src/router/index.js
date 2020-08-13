import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import('@/views/Login.vue')
const Home = () => import('@/views/home/Home.vue')
const Welcome = () => import('@/views/home/Welcome.vue')
const Users = () => import('@/views/home/user/Users.vue')

Vue.use(VueRouter)

const routes = [{
  path: '/',
  redirect: '/login'
},{
  path: '/login',
  component: Login
},{
  path: '/home',
  component: Home,
  redirect: '/welcome',
  children: [{
    path: '/welcome',
    component: Welcome
  },{
    path: '/users',
    component: Users
  }]
}]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if(to.path === '/login') return next()
  // 获取token来判断是否登录
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})


export default router
