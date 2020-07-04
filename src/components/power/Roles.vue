<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-button type="primary" @click="addRoleOpenDialog">添加角色</el-button>

      <!-- 角色列表表格 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',index1 == 0 ? 'bdtop':'','vcenter']"
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[index2 == 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="openEditRoleDialog(scope.row)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button @click="deleteRole(scope.row)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限dialog -->
    <el-dialog title="分配权限" :visible.sync="setRightdialogVisible" width="50%">
      <!-- 树形控件 -->
      <el-tree
        ref="treeRef"
        :default-checked-keys="defKeys"
        node-key="id"
        show-checkbox
        default-expand-all
        :data="rightsList"
        :props="treeProps"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色dialog -->
    <el-dialog :close-on-click-modal="false" @close="closeEditRoleDialog" title="编辑角色信息" :visible.sync="editRoleDialogVisible" width="50%">
      <!-- 编辑角色form -->
      <el-form
        :model="editRoleInfo"
        :rules="editRoleRules"
        ref="editRoleRef"
        label-width="100px"
      >
        <el-form-item label="角色名称 : " prop="roleName">
          <el-input v-model="editRoleInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述 : " prop="roleDesc">
          <el-input v-model="editRoleInfo.roleDesc"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button>取 消</el-button>
        <el-button @click="putRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色dialog -->
    <el-dialog :close-on-click-modal="false" title="添加角色" @close="closeAddRoleDialog" :visible.sync="addRoleDialogVisible" width="50%">    
     <el-form :model="addRoleInfo" :rules="editRoleRules" ref="addRoleRef" label-width="100px">
       <el-form-item label="角色名称 : " prop="roleName">
         <el-input v-model="addRoleInfo.roleName"></el-input>
       </el-form-item>
       <el-form-item label="角色描述 : " prop="roleDesc">
         <el-input v-model="addRoleInfo.roleDesc"></el-input>
       </el-form-item>
     </el-form>
     <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button @click="PostaddRole">确 定</el-button>
     </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  created() {
    this.getRolesList();
  },

  data() {
    return {
      rolesList: [], //所有角色的数据

      setRightdialogVisible: false, //分配权限dialog开关
      

      rightsList: [], //所有权限的数据
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      defKeys: [], //默认选中的节点的id值
      roleId: "", //打开分配权限dialog，当前的角色id
      
      editRoleDialogVisible: false, //编辑角色信息dialog开关
      editRoleInfo:{}, //当前打开编辑dialog的角色信息
      editRoleId:'',  //当前打开编辑dialog的角色Id
      editRoleRules:{
        roleName:[
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ]
       },
      
      addRoleDialogVisible:false,  //添加角色信息dialog开关
      addRoleInfo:{}             //当前打开添加角色dialog的角色信息
    };
  },

  methods: {
    async getRolesList() {
      let { data: res } = await this.$http.get("roles");
      // console.log(res.data);
      this.rolesList = res.data;
    },

    //根据id删除对应的权限
    async removeRightById(role, rightId) {
      //   console.log(roleId,rightId);
      let res = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (res !== "confirm") {
        return this.$message.info("取消了删除");
      }

      const { data: res2 } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res2.meta.status !== 200) {
        return this.$message.erroe("删除权限失败");
      }
      role.children = res2.data;
    },

    //打开分配权限dialog
    async showSetRightDialog(role) {
      this.roleId = role.id;
      this.defKeys = []; //初始化id数组

      let { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败");
      }
      this.rightsList = res.data;

      // console.log(res.data);

      //获取三级节点的id
      this.getLeafKeys(role, this.defKeys);

      this.setRightdialogVisible = true;
    },

    //通过递归函数，获取角色下所有三级权限id
    getLeafKeys(node, arr) {
      //如果当前节点不包含children属性,则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },

    //监听分配权限dialog关闭
    // rightDialogClose(){
    //   this.defKeys = []
    // }

    //分配权限确定按钮
    async allotRights() {
      let subarr = this.$refs.treeRef.getCheckedKeys(); //获取选中的节点的id
      let arr = this.$refs.treeRef.getHalfCheckedKeys(); //获取半选中的节点的id
      const keys = [...subarr, ...arr];
      // console.log(keys);
      const idStr = keys.join(",");
      console.log(idStr);
      let { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      });
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败");
      }
      this.$message.success("分配权限成功");
      this.getRolesList();
      this.setRightdialogVisible = false;
    },

    //打开编辑角色信息dialog
    openEditRoleDialog(row) {
      // console.log(row);
      this.editRoleId = row.id
      this.editRoleInfo = row
      this.editRoleDialogVisible = true;
    },
    
    //关闭角色编辑dialog
    closeEditRoleDialog(){
    this.$refs.editRoleRef.resetFields()
    },
    
    //提交修改的角色
    async putRoleInfo(){
     let valid = await this.$refs.editRoleRef.validate().catch(err=>err)
     if(valid == false){return this.$message.error('修改角色信息失败')}
     //  console.log(valid);
     let {data:res} = await this.$http.put(`roles/${this.editRoleId}`,{roleName:this.editRoleInfo.roleName,roleDesc:this.editRoleInfo.roleDesc})
     //  console.log(res);
     if(res.meta.status !== 200){return this.$message.error('修改角色信息失败')} 
     this.$message.success('修改角色信息成功');
     this.getRolesList()
     this. editRoleDialogVisible = false
    },
    
    //打开添加角色dialog
    addRoleOpenDialog(){
      this.addRoleDialogVisible = true
    },
    
    //关闭添加角色dialog
    closeAddRoleDialog(){
      this.$refs.addRoleRef.resetFields()
    },
    
    //点击添加角色确定按钮
    async PostaddRole(){
      console.log(this.addRoleInfo);

      let vali =  await this.$refs.addRoleRef.validate().catch(err=>err)
      if(vali == false){return this.$message.error('角色名验证不通过')}
      
      let {roleName,roleDesc} = this.addRoleInfo
      // this.$http.post('roles',{roleName:this.addRoleInfo.roleName, roleDesc:this.addRoleInfo.roleDesc})
      let {data:res} = await this.$http.post('roles',{roleName, roleDesc})
      console.log(res);
      if(res.meta.status !== 201){return this.$message.error('创建角色失败')}
      this.$message.success('创建角色成功')
      this.getRolesList()
      this.addRoleDialogVisible = false
    },
    
    //删除角色按钮
    async deleteRole(row){
      console.log(row.id);
      let confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err=> err )
      
      if(confirmRes !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      let {data : res} = await this.$http.delete(`roles/${row.id}`)
      if(res.meta.status !== 200){return this.$message.error('删除角色失败')}
      this.$message.success('删除角色成功')
      this.getRolesList()
      // console.log(res);
    }
  }
};
</script>

<style scoped>
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
