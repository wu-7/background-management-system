<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="~@/assets/logo.png" alt="">
      </div>
      <!-- 表单区域 -->
      <el-form
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  // import Cpn from './Cpn'  // 引入Cpn组件 Cpn.vue
  export default {
    name:'Login',
    props:[''],
    data () {
      return {
        // 登录表单的数据绑定对象
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        // 表单验证规则对象
        loginFormRules: {
          username: [
            { required: true, message: '请输入登录名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        }
      };
    },

    components: {},

    computed: {},

    beforeMount() {},

    mounted() {},

    methods: {
      // 登录验证
      login() {
        this.$refs.loginFormRef.validate(async valid => {
          if(!valid) return
          // 将获取到的数据的data提取出来，并重命名为res
          const { data: res } = await this.$http.post("login", this.loginForm)
          if(res.meta.status !== 200) return this.$message.error("登录失败！")
          this.$message.success("登录成功！")
          // 将登录成功之后的token保存到客户端sessionStorage中
          window.sessionStorage.setItem('token', res.data.token)
          // 通过编程式导航跳转到后台主页，路由地址是 /home
          this.$router.push('/home')
        })
      },
      // 表单重置
      reset() {
        this.$refs.loginFormRef.resetFields()
      }
    },

    watch: {}

  }

</script>
<style scoped lang="less">
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  width: 100%;
  padding: 0 20px;
  bottom: 0;
  box-sizing: border-box;
  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>