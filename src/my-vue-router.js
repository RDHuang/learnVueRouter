let Vue;

// 创建一个VueRouter的泪
class VueRouter {
  constructor(options) {
    // 接收一个配置项
    // 给Vuerouter赋值配置项
    this.$options = options;
    // 创建一个path和router的映射对象
    this.routerMap = {};
    // 创建一个响应式的值，用来存储当前路径 (可以直接使用vue的响应原理实现)
    this.app = new Vue({
      data: {
        current: "/",
      },
    });
  }

  // 项目需要初始化
  init() {
    // 绑定浏览器事件，改变current的值
    this.bindEvents();

    // 解析路由配置，同时给 path和router做映射
    this.createRouterMap(this.$options);

    // 创建router-view 和router-link
    this.createComponent();
  }

  bindEvents() {
    window.addEventListener("hashchange", this.pathChange.bind(this));
    window.addEventListener("load", this.pathChange.bind(this));
  }
  // 路径变化方法
  pathChange() {
    this.app.current = window.location.hash.slice(1) || "/";
  }

  createRouterMap(options) {
    options.routes.forEach((item) => {
      this.routerMap[item.path] = item;
    });
  }

  createComponent() {
    Vue.component("router-link", {
      props: {
        to: String,
      },
      render(h) {
        return h("a", { attrs: { href: `#${this.to}` } }, this.$slots.default);
      },
    });
    Vue.component("router-view", {
      render: (h) => {
        // 需要把this指向Vuerouter实例
        let Component;
        // 判断当前路径是否存在在配置中
        if (this.routerMap[this.app.current]) {
          Component = this.routerMap[this.app.current].component;
        }
        return h(Component);
      },
    });
  }
}

// 把vuerouter变成插件

VueRouter.install = function(_Vue) {
  Vue = _Vue;
  // 拓展混入
  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router;
        this.$options.router.init();
      }
    },
  });
};

export default VueRouter;
