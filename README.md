# vue-router 实现原理简单复现

**tip: 未实现嵌套关系，同时只能在 hash 模式下**

> 首先我们先捋一下 vue-router 都做什么了

1. 当引入 vue-router 的时候，会自动多出两个组件（router-link 以及 router-view）

2. 当使用 router-link 的时候，页面会根据 to 属性跳转到不同的页面

3. 当路由跳转的时候，页面会变化，也就是引入 router-view 的地方内容会自动更新

4. ...后面还有很多功能，等后面自己再次深入的研究时再拓展

- 这里只实现了最基础的逻辑

> 当把这些转换成代码又该如何实现呢？

**1. 首先我们需要初始化一个 VueRouter 的类**

```js
// 这里声明一个Vue
let Vue;

class VueRouter {}
```

**2. 使用 constructor 属性返回对创建此对象的数组函数的引用**

```js
// 会接收一个options的配置项
constructor(options) {
  // 然后需要创建一些我们需要用到的属性
  this.$options = options; // 我们需要拿到传入的配置项
  this.routerMap = {}; // 初始化一个 path(路径)和router(路由)的一个映射对象
  // 创建一个响应式的值，来存储当前的路径（我们可以直接使用Vue自带响应式原理来实现）
  this.app = new Vue({
    data: {
        current: '/'    // 保存当前地址路径
    }
  })
}
```

**3. 初始化, 在初始化内部需要做几件事**

```js
init() {
  // 1. 需要绑定浏览器事件，监听地址栏变化
 this.bindEvents()

  // 2. 解析路由的配置，同时对上面path和router的映射对象routerMap赋值
  this.createRouterMap(this.$options)

  // 3. 创建router-view和router-link组件
  this.createComponent()
}
```

_下面一步步进行实现_

3.1 绑定浏览器事件

```js
bindEvents() {
  // 当路由处于hash模式下的时候，可以监听到#后面路径的变化
  window.addEventListener('hashchange', this.pathChange.bind(this))
  window.addEventListener('load', this.pathChange.bind(this))
}

pathChange() { // 地址栏发生改变的时候我们需要给current进行赋值
  this.app.current = window.location.hash.slice(1) || '/'
}
```

3.2 解析路由配置

```js
this.createRouterMap(options) {
  options.routes.forEach(item => {
      this.routerMap[item.path] = item
  })
}
```

3.3 创建 router-view 和 router-link 组件

```js
Vue.component("router-link", {
  props: {
    to: String,
  },
  // h ===> createElement
  render(h) {
    // router-link 其实就是a标签
    return h("a", { attrs: { href: `#${this.to}` } }, this.$slots.default);
  },
});

Vue.component("router-view", {
  render: (h) => {
    let Component;
    if (this.routerMap[this.app.current]) {
      Component = this.routerMap[this.app.current].component;
    }
    // 这里render直接传找到的匹配当前路由的组件实例
    return h(Component);
  },
});
```

**4. 把 VueRouter 注册为插件**

_变成插件以后就可以使用 Vue.use(VueRouter)了_

```js
VueRouter.install = function(_Vue) {
  // 这里接收的 _Vue 就是 vue实例
  // 从这边我们对第一步声明的Vue进行赋值
  Vue = _vue;

  // 使用 mixin 混入 拓展Vue
  Vue.mixin({
    // 混入的mixin在每个组件中都会执行
    beforeCreate() {
      // 这里是指定在每个组件创建之前钩子中执行的事情
      /**
       * 因为我们并不要所有的都执行，只在根组件中执行，所以我们需要有一步判断
       * 这也就是我们在项目的main.js中使用这个方法引入router的原因
       * new Vue({
       *   router,
       *   render: h => h(App),
       * }).$mount('#app')
       */
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router;
        // 这里执行第3步的初始化
        this.$options.router.init();
      }
    },
  });
};
```

**到这里，已经 VueRouter 已经算是完成了**

> 然后我们自己在根目录创建一个 router.js 文件

```js
// 引入vue和自己写的VueRouter插件
import Vue from "vue";
import VueRouter from "./my-vue-router";
import Home from "./components/home";
import About from "./components/about";

// use一下
Vue.use(VueRouter);

// new 一个 VueRouter，再导出
// routes填写路由配置香
export default new VueRouter({
  routes: [
    { path: "/Home", component: Home },
    { path: "/About", component: About },
  ],
});
```

最后在 main.js 中引入 router.js 并挂载到 app 上

```js
import router from "./router";

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
```

暂时只学到了这个程度，等更深入的研究以后，继续补充...
