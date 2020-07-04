import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login.vue';
import Home from '@/components/Home.vue';
// import Welcome from '@/components/Welcome.vue';
import Users from '@/components/user/Users.vue';
import Rights from '@/components/power/Rights.vue';
import Roles from '@/components/power/Roles.vue';
import Cate from '@/components/goods/Cate.vue';
import Params from '@/components/goods/Params.vue';
import Goods from '@/components/goods/Goods.vue';
import Add from '@/components/goods/Add.vue';
import Order from '@/components/order/Order.vue';
import Reports from '@/components/reports/Reports.vue';



const originalPush = Router.prototype.push
   Router.prototype.push = function push(location) {
   return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router);

const routes = [
   {path:'/',redirect:'/login'},
   {path:'/login',name:'login',component:Login},
   {path:'/home',name:'home',component:Home, redirect:'/users' ,children:[
    //    {path:'/welcome',name:'welcome',component:Welcome},
       {path:'/users',name:'users',component:Users},
       {path:'/rights',name:'rights',component:Rights},
       {path:'/roles',name:'roles',component:Roles},
       {path:'/categories',name:'cate',component:Cate},
       {path:'/params',name:'params',component:Params},
       {path:'/goods',name:'goods',component:Goods},
       {path:'/goods/add',name:'add',component:Add},
       {path:'/orders',name:'orders',component:Order},
       {path:'/reports',name:'reports',component:Reports},
   ]},
]

const router =  new Router({routes})

router.beforeEach((to,from,next)=>{
    if(to.path == '/login') return next();
    const token = window.sessionStorage.getItem('token')
    if(!token) return next('/login')
    next();
})


export default router