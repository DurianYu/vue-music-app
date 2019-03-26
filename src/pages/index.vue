<template lang="html">
  <div class="index h-100">
    <main>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive" />
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" />
    </main>
    <footer>
      <bottom-navbar />
    </footer>
  </div>
</template>

<script>
export default {
  components: {
    bottomNavbar: () =>
      import(/* webpackChunkName: 'bottom-navbar' */ '@/components/bottom-navbar')
  },
  data() {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
main {
  height: 100%;
  overflow: auto;
  padding-bottom: 56px;
  > div {
    height: 100%;
    background: #f4f4f4;
    overflow: auto;
  }
}

footer {
  position: absolute;
  width: 100%;
  bottom: 0;
}
</style>
