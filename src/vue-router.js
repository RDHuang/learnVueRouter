let Vue;

class VueRouter {
  constructor(options) {
    this.$options = options;

    // 创建一个路由path和route映射
    this.routeMap = {};

    // 将来当前路径current需要响应式
    // 利用vue的响应式原理可以实现
    this.app = new Vue({
      data: {
        current: "/",
      },
    });
  }

  init() {
    // 绑定浏览器事件
    this.bindEvents();
    // 解析路由配置
    this.createRouteMap(this.$options);
    // 创建router-link 和 router-view
    this.initComponent();
  }
  bindEvents() {
    window.addEventListener("hashchange", this.onHashChange.bind(this), false);
    window.addEventListener("load", this.onHashChange.bind(this), false);
  }
  onHashChange() {
    this.app.current = window.location.hash.slice(1) || "/";
  }
  createRouteMap(options) {
    options.routes.forEach((item) => {
      this.routeMap[item.path] = item;
    });
  }
  initComponent() {
    Vue.component("router-link", {
      props: {
        to: String,
      },
      render(h) {
        return h("a", { attrs: { href: `#${this.to}` } }, this.$slots.default);
        // return <a href={this.to}>{this.$slots.default}</a>;
      },
    });

    Vue.component("router-view", {
      render: (h) => {
        let Comp;
        if (this.routeMap[this.app.current]) {
          Comp = this.routeMap[this.app.current].component;
        }
        return h(Comp);
      },
    });
  }
}

// 把vueRouter变成插件

VueRouter.install = function(_Vue) {
  Vue = _Vue;
  // 混入任务
  Vue.mixin({
    beforeCreate() {
      // 这里的代码将来会在外面初始化的时候被调用
      // 这样我们就实现了Vue拓展
      // this指向Vue实例
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router;
        this.$options.router.init();
      }
    },
  });
};

export default VueRouter;
