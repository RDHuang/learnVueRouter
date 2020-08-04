import Vue from "vue";
import VueRouter from "./vue-router";
import Home from "./components/home";
import About from "./components/about";

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    { path: "/Home", component: Home },
    { path: "/About", component: About },
  ],
});
