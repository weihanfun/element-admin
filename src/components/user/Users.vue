<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索、添加用户 -->
      <el-row :gutter="15">
        <el-col :span="8">
          <el-input clearable @clear="clear" placeholder="请输入内容" v-model="params.query">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUser">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChang(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              @click="showEditDialog(scope.row)"
              size="mini"
              type="primary"
              icon="el-icon-edit"
            ></el-button>
            <el-button
              @click="removeUser(scope.row)"
              size="mini"
              type="danger"
              icon="el-icon-delete"
            ></el-button>
            <el-tooltip
              :enterable="false"
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
            >
              <el-button
                @click="setRoleOpenDialog(scope.row)"
                size="mini"
                type="warning"
                icon="el-icon-setting"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 添加用户的对话框 -->
      <el-dialog
        @close="addDialogClosed"
        :close-on-click-modal="false"
        title="添加用户"
        :visible.sync="addUserVisible"
        width="50%"
      >
        <!-- 内容主体 -->
        <el-form
          status-icon
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addUserVisible = false">取 消</el-button>
          <el-button type="primary" @click="postAddUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户的对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        :close-on-click-modal="false"
        @close="editDialogClosed"
      >
        <!-- 内容 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名称">
            <el-input v-model="editUserName" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogPost">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>

    <!-- 分配权限dialog -->
    <el-dialog
      :close-on-click-modal="false"
      title="分配权限"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClose"
    >
      <div class="setRoleDiv">
        <p>用户名称 : {{setRoleUserInfo.username}}</p>
        <p>角色名称 : {{setRoleUserInfo.role_name}}</p>
        <p>
          分配角色 : 
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList();
  },

  data() {
    //验证邮箱的rule
    var checkEmail = (rule, value, cb) => {
      //设置正则
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      //如果正则验证通过， 调用cb回调函数， 通过验证
      if (regEmail.test(value)) {
        return cb();
      }
      //如果正则不通过， 则返回信息
      cb(new Error("请输入合法的邮箱"));
    };
    //验证手机号的rule
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确的手机号"));
    };

    return {
      params: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      addUserVisible: false,

      //添加用户表单的数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },

      //添加用户表单的rules
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },

      //修改用户dialog隐藏和显示
      editDialogVisible: false,

      //修改用户的表单
      editForm: {},
      //修改用户dialog的用户名
      editUserName: "",
      //修改用户dialog的rules
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },

      setRoleDialogVisible: false, //分配权限dialog显示隐藏
      setRoleUserInfo: {},
      roleList: [],
      selectRoleId:'',  //已选中角色id值

    };
  },

  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.params
      });
      // console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表数据失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },

    //监听pagesize的方法
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.params.pagesize = newSize;
      this.getUserList();
    },

    //监听页码值改变时间
    handleCurrentChange(num) {
      //  console.log(num);
      this.params.pagenum = num;
      this.getUserList();
    },

    //监听 switch 状态改变
    async userStateChang(userinfo) {
      //  console.log(userinfo.mg_state);
      let { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功！");
    },

    //搜索框清空按钮
    clear() {
      //  console.log(123);
      this.params.query = "";
      this.getUserList();
    },

    //打开添加用户dialog按钮
    addUser() {
      this.addUserVisible = true;
    },

    //点击按钮提交添加用户
    postAddUser() {
      this.$refs.addFormRef.validate(async isVali => {
        // console.log(isVali);
        if (!isVali) return;
        //可以发起添加用户的网络请求
        let { data: res } = await this.$http.post("users", this.addForm);
        // console.log(res);
        if (res.meta.status !== 201) this.$message.error("添加用户失败");
        this.$message.success("添加用户成功");
        this.addUserVisible = false;
        this.getUserList();
      });
    },

    //监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    //打开修改用户dialog
    showEditDialog(row) {
      this.editDialogVisible = true;
      console.log(row);
      let obj = {
        id: row.id,
        email: row.email,
        mobile: row.mobile
      };
      this.editUserName = row.username;
      this.editForm = obj;
      // console.log(this.editForm);
    },

    //修改用户dialog的提交按钮
    editDialogPost() {
      console.log(this.editForm);

      this.$refs.editFormRef.validate(async isVali => {
        if (!isVali) return;

        let { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          this.editForm
        );
        if (res.meta.status !== 200)
          return this.$message.error("修改用户信息失败");
        this.$message.success("修改用户信息成功");
        this.getUserList();
        this.editDialogVisible = false;
        // console.log(res);
      });
    },

    //监听修改用户关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    //监听删除用户按钮
    async removeUser(row) {
      //  console.log(row.id);
      let confirmRes = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmRes !== "confirm") {
        return this.$message.info("已取消删除");
      }
      let { data: res } = await this.$http.delete("users/" + row.id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getUserList();
      // console.log(res);
    },

    //打开分配权限dialog
    async setRoleOpenDialog(row) {
      this.setRoleUserInfo = row;
       console.log(this.setRoleUserInfo);
      let { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      // console.log(res.data);

      this.roleList = res.data;
      this.setRoleDialogVisible = true;
    },
    
    //提交分配后的角色按钮
    async saveRoleInfo(){
     if(!this.selectRoleId){return this.$message.error('请选择要分配的角色')}
     let id = this.setRoleUserInfo.id
     let {data:res} = await this.$http.put(`users/${id}/role`,{rid: this.selectRoleId})
    //  console.log(res);
     if(res.meta.status !== 200){return this.$message.error('分配角色失败')}
     this.$message.success('分配角色成功')
     this.getUserList();
     this.setRoleDialogVisible = false
    },
    
    //监听关闭分配角色dialog
    setRoleDialogClose(){
      this.roleList = {};
      this.selectRoleId =''
    }
  }
};
</script>

<style scoped>
.setRoleDiv p{
   margin: 25px;
   font-size: 15px;
   font-weight: 600;
}
</style>