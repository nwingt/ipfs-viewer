import Vue from 'vue';
import Router from 'vue-router';
import Upload from './views/Upload.vue';
import View from './views/View.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Upload,
    },
    {
      path: '/',
      name: 'upload',
      component: Upload,
    },
    {
      path: '/view/:hash',
      name: 'view',
      component: View,
    },
  ],
});
