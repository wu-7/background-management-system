import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message } from 'element-ui'
/* 按需导入组件，并全局注册使用 */
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 弹框提示组件必须挂载到vue的原型上，使用时直接this.$message
Vue.prototype.$message = Message