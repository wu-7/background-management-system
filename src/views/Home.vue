<template>
  <div>
    <el-button @click="logout">退出</el-button>
  </div>
</template>

<script>

  // import Cpn from './Cpn'  // 引入Cpn组件 Cpn.vue
  export default {
    name:'',
    props:[''],
    data () {
      return {

      };
    },

    components: {},

    computed: {},

    beforeMount() {},

    mounted() {},

    methods: {
      // 退出功能
      // 销毁本地的token即可，并且跳转到登录页
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
    },

    watch: {}

  }

</script>
<style scoped lang="less">

</style>