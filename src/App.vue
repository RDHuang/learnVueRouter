<template>
  <div id="app">
    <router-link to="/About">About</router-link>
    <br />
    <router-link to="/Home">Home</router-link>
    <br />
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>
