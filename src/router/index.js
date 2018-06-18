import Vue from 'vue'
import Router from 'vue-router'

import Userinfo from '@/components/User/Userinfo'
import AdminUser from '@/components/Admin/AdminUser'
import myTask from '@/components/Task/myTask'
import AllProjects from '@/components/Task/AllProjects'
import myGantt from '@/components/Task/myGantt'
import Home from '@/components/Task/Home'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/myspace',
      name: 'Userinfo',
      component: Userinfo
    },

    {
      path: '/admin',
      name: 'admin',
      component: AdminUser
    },

    {
      path: '/projects',
      name: 'projects',
      component: AllProjects,

    },
    {
      path:'/projects/:projectId',
      name:'myTask',
      component:myTask,
      props: true
    },
    {
      path:'/gantt/:projectId',
      name:'gantt',
      component:myGantt,
      props:true
    }

  ]
})
