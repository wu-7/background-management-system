<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList" :stripe="true" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  // 不同的角色有不同的权限，通过给用户分配角色从而来分配权限
  // import Cpn from './Cpn'  // 引入Cpn组件 Cpn.vue
  export default {
    name:'',
    props:[''],
    data () {
      return {
        // 权限列表
        rightsList: []
      };
    },

    components: {},

    computed: {},

    beforeMount() {},

    mounted() {},

    methods: {
      async getRightsList() {
        const {data: res} = await this.$http.get('rights/list')
        if(res.meta.status !== 200) {
          return this.$message.error('获取权限列表失败！')
        }
        this.rightsList = res.data
      }
    },

    created() {
      // 获取权限列表
      this.getRightsList()
    },

    watch: {}

  }

</script>
<style scoped>

</style>