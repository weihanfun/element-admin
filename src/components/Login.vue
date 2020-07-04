<template>
  <div class="login_continer">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录表单区 -->
      <el-form ref="formRef" :model="loginForm" label-width="0px" class="login_form" :rules="rules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" prefix-icon="el-icon-info" v-model="loginForm.password"></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },

      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ]
      }


    };
  },

  methods: {
      reset(){
          this.$refs.formRef.resetFields();        
      },

      login(){
          this.$refs.formRef.validate(async isVali=>{
            //   console.log(isVali);
              if(!isVali) return;
              
              let {data} =  await this.$http.post('login',this.loginForm)
            //   console.log(data.data.token);
              if(data.meta.status !== 200) return this.$message({type:'warning',message:'用户名或密码错误'})
              this.$message({type:'success',message:'登录成功'})
              window.sessionStorage.setItem('token',data.data.token)
              this.$router.push('/home')
          })
      }
  },
};
</script>

<style scoped>
.login_continer {
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
}

.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
}
img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #eee;
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>