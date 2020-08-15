<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <el-table :data="userlist" :stripe="true" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @click="editDialogClosed">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

  // import Cpn from './Cpn'  // 引入Cpn组件 Cpn.vue
  export default {
    name:'',
    props:[''],
    data () {
      // 自定义邮箱的验证规则
      var checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if(regEmail.test(value)) {
          return callback()
        }else {
          callback(new Error('请输入合法的邮箱'))
        }
      }
      // 自定义手机号码的验证规则
      var checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if(regMobile.test(value)) {
          return callback()
        }else {
          callback(new Error('请输入合法的手机号码'))
        }
      }
      return {
        // 获取用户列表的参数对象
        queryInfo: {
          // 查询参数
          query: '',
          // 当前的页数
          pagenum: 1,
          // 每页显示多少条数据
          pagesize: 2
        },
        userlist: [],
        total: 0,
        // 对话框的显示与否
        addDialogVisible: false,
        // 添加用户的数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 添加用户的验证规则
        addFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur'}
          ]
        },
        editDialogVisible: false,
        editForm: {
          username: '',
          email: '',
          mobile: '',
          id: ''
        },
        editFormRules: {
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur'}
          ]
        },
        setRoleDialogVisible: false,
        userInfo: {},
        roleList: [], // 所有角色数据列表
        selectRoleId: '' // 已选中的角色id
      };
    },

    components: {},

    computed: {},

    beforeMount() {},

    mounted() {},

    methods: {
      // 获取用户列表
      async getUserList() {
        const {data: res} = await this.$http.get('users', {params: this.queryInfo})
        if(res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败！')
        }
        this.userlist = res.data.users
        this.total = res.data.total
      },
      // 监听pagesize改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      // 监听页码值改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum =  newPage
        this.getUserList()
      },
      // 用户状态改变
      async userStateChanged(userinfo) {
        // 修改用户状态（保持前后端数据一致）
        const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        if(res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error('更新用户状态失败！')
        }
        this.$message.success('更新用户状态成功！')
      },
      // 添加用户表单重置
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 添加用户表单预验证
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$http.post('users', this.addForm)
          if(res.meta.status !== 201) {
            return this.$message.error('添加用户失败！')
          }
          this.$message.success('添加用户成功！')
          this.addDialogVisible = false
          this.getUserList()
        })
      },
      // 编辑用户信息
      async showEditDialog(id) {
        this.editDialogVisible = true
        const {data: res} = await this.$http.get('users/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('查询用户失败！')
        }
        this.editForm = res.data
      },
      // 监听编辑用户信息关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 修改用户预验证
      editUser() {
        this.$refs.editFormRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$http.put('users/' + this.editForm.id, {email: this.editForm.email, mobile: this.editForm.mobile})
          if(res.meta.status !== 200) {
            return this.$message.error('修改用户失败!')
          }
          this.$message.success('修改用户成功！')
          this.editDialogVisible = false
          this.getUserList()
        })
      },
      // 删除用户
      async removeUserById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户点击了确认，则返回字符串 confirm
        // 如果用户点击了取消，则返回字符串 cancel
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('users/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除用户成功！')
        this.getUserList()
      },
      // 分配角色
      async setRole(userInfo) {
        this.userInfo = userInfo
        // 获取所有角色
        const {data: res} = await this.$http.get('roles')
        if(res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败！')
        }
        this.roleList = res.data
        console.log('this.roleList', this.roleList)
        this.setRoleDialogVisible = true
      },
      async saveRoleInfo() {
        if(!this.selectRoleId) {
          return this.$message.error('请选择要分配的角色')
        }
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectRoleId})
        if(res.meta.status !== 200) {
          return this.$message.error('分配角色失败！')
        }
        this.setRoleDialogVisible = false
        this.getUserList()
      },
      // 重置分配角色对话框的选择器
      setRoleDialogClosed() {
        this.selectRoleId = ''
        this.userInfo = {}
      }
    },

    created() {
      this.getUserList()
    },

    watch: {}

  }

</script>
<style scoped>

</style>