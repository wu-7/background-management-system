<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" :stripe="true" border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightsById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']">
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag 
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightsById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRolesById(scope.row.id)">删除</el-button>
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @click="editDialogClosed">
      <el-form
        :model="editForm"
        ref="editFormRef"
        label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
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
      return {
        rolesList: [], // 角色列表数据
        addForm: {
          roleName: '',
          roleDesc: ''
        },
        addFormRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        addDialogVisible: false,
        editForm: {
          roleName: '',
          roleDesc: '',
          roleId: ''
        },
        editDialogVisible: false,
        setRightDialogVisible: false, // 分配权限的对话框显示与否
        rightsList: [],
        // 树形控件的绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        defKeys: [], // 默认选中的节点id值数组
        roleId: '', // 当前分配权限的角色id
      };
    },

    components: {},

    computed: {},

    beforeMount() {},

    mounted() {},

    methods: {
      // 获取角色列表数据
      async getRolesList() {
        const {data: res} = await this.$http.get('roles')
        if(res.meta.status !== 200) {
          return this.$message.error('查询角色列表失败！')
        }
        this.rolesList = res.data
      },
      // 添加用户表单重置
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 添加用户表单预验证
      addRole() {
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$http.post('roles', this.addForm)
          if(res.meta.status !== 201) {
            return this.$message.error('添加角色失败！')
          }
          this.$message.success('添加角色成功！')
          this.addDialogVisible = false
          this.getRolesList()
        })
      },
      // 编辑用户信息
      async showEditDialog(id) {
        this.editDialogVisible = true
        const {data: res} = await this.$http.get('roles/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('查询角色失败！')
        }
        this.editForm = res.data
      },
      // 修改用户预验证
      editRoles() {
        this.$refs.editFormRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$http.put('roles/' + this.editForm.roleId, {roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc})
          if(res.meta.status !== 200) {
            return this.$message.error('修改角色失败!')
          }
          this.$message.success('修改角色成功！')
          this.editDialogVisible = false
          this.getRolesList()
        })
      },
      // 删除角色
      async removeRolesById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户点击了确认，则返回字符串 confirm
        // 如果用户点击了取消，则返回字符串 cancel
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('roles/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('删除角色失败！')
        }
        this.$message.success('删除角色成功！')
        this.getRolesList()
      },
      // 删除权限
      async removeRightsById(role, rightId) {
        // 这里传参不传roleId是因为需要给role.children = res.data，而不是重新获取新数据
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户点击了确认，则返回字符串 confirm
        // 如果用户点击了取消，则返回字符串 cancel
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        this.$message.success('删除权限成功！') 
        // this.getRolesList() // 不这样写是因为，这样会重新渲染，导致下拉菜单合闭
        role.children = res.data
      },
      // 分配权限
      async showSetRightDialog(role) {
        this.roleId = role.id // 保存当前分配权限的角色id
        const {data: res} = await this.$http.get('rights/tree')
        if(res.meta.status !== 200) {
          return this.$message.error('获取权限数据失败！')
        }
        this.rightsList = res.data
        // 递归回去三级节点
        this.getLeafKeys(role, this.defKeys)

        this.setRightDialogVisible = true
      },
      // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
      getLeafKeys(node, arr) {
        // 如果当前 node 节点不包含children属性，则其为三级节点
        if(!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      // 监听分配权限对话框的关闭
      setRightDialogClosed() {
        this.defKeys = [] // 每次关闭对话框，需清空defKefs数组
      },
      // 点击为角色分配权限
      async allotRights() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
        if(res.meta.status !== 200) {
          return this.$message.error('分配权限失败！')
        }
        this.$message.success('分配权限成功！')
        this.getRolesList()
        this.setRightDialogVisible = false
      },
      // 监听编辑用户信息关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
    },

    created() {
      this.getRolesList()
    },

    watch: {}

  }

</script>
<style scoped lang="less">
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>