<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>

      <!-- 选择商品分类区域  -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类 :</span>
          <!--  级联选择框  -->
          <el-cascader v-model="selectedArr" @change ="selectChange" clearable :options="categoriesList" :props="categoriesProps" ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab导航 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">

        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button :disabled="isBtnDisabled" type="primary" @click="ShowAddDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
               <template slot-scope="scope">
                 <!-- 参数tag循环 -->
                 <el-tag closable @close="handleClose(index,scope.row)" v-for="(item,index) in scope.row.attr_vals" :key="index">{{item}}</el-tag>
                 <!-- New Tag -->
                 <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
               </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="showEdit(scope.row)" icon="el-icon-edit">编辑</el-button>
                <el-button @click="deleteParams(scope.row)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button :disabled="isBtnDisabled" type="primary" @click="ShowAddDialog">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
               <template slot-scope="scope">
                 <!-- 参数tag循环 -->
                 <el-tag closable @close="handleClose(index,scope.row)" v-for="(item,index) in scope.row.attr_vals" :key="index">{{item}}</el-tag>
                 <!-- New Tag -->
                 <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
               </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showEdit(scope.row)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button @click="deleteParams(scope.row)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
     </el-tabs>

    </el-card>

    <!-- 添加参数的dialog -->
    <el-dialog @close="closeDialog" :close-on-click-modal="false"  :title="'添加' + dialogTitle" :visible.sync="addDialogVisible" width="50%">
     
      <el-form :model="addForm" :rules="addRules" ref="addRef" label-width="100px">
       <el-form-item :label="dialogTitle" prop="attr_name">
         <el-input v-model="addForm.attr_name"></el-input>
       </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog @close="closeEditDialog" :close-on-click-modal="false"  :title="'添加' + dialogTitle" :visible.sync="editDialogVisible" width="50%">
     
      <el-form :model="editForm" :rules="addRules" ref="editRef" label-width="100px">
       <el-form-item :label="dialogTitle" prop="attr_name">
         <el-input v-model="editForm.attr_name"></el-input>
       </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCategories();
  },

  data() {
    return {
       categoriesList:[],
       categoriesProps:{
         expandTrigger:'hover',
         value:'cat_id',
         label:'cat_name',
         children:'children'
       },
       selectedArr:[],     //级联选择器选中的项组成的数组
       activeName:'many', 
       manyTableData:[],
       onlyTableData:[],
       
       addDialogVisible:false,
       //添加参数的表单数据
       addForm:{},
       addRules:{
         attr_name:[
            { required: true, message: "请输入参数名称", trigger: "blur" }
         ]
       },
       
       editDialogVisible:false,
       editForm:{},
       
    };
  },
  
  computed: {
    //按钮的禁用启用
    isBtnDisabled() {
      if(this.selectedArr.length !== 3){return true}
      return false
    },

    //当前选中的三级分类id
    cateId(){
      if(this.selectedArr.length === 3){
        return this.selectedArr[2]
      }
      return null
    },

    //动态计算dialog标题
    dialogTitle(){
      if(this.activeName === 'many'){
        return '动态参数'
      }else{
        return '静态属性'
      }
    }

  },

  methods: {
    //获取级联选择器数据
    async getCategories() {
      let {data:res} = await this.$http.get('categories',{data:{type:3}})
      if(res.meta.status !== 200){return this.$message.error('获取商品分类列表数据失败')}
      this.categoriesList = res.data
      // console.log(res);      
    },
    
    //获取动态参数或静态属性
    async getParamsData(){
      // console.log(this.selectedArr);      
      let {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}});
      // console.log(res.data);
      res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') :[]
          //添加新属性，控制new tag显示与隐藏
          item.inputVisible = false;
          //添加新属性，获取文本框输入的值
          item.inputValue = '';
      });
      console.log(res.data);
      if(this.activeName == 'many'){
        this.manyTableData = res.data
      }else{
        this.onlyTableData = res.data
      }
      // console.log(this.activeName);
      
    },

    //级联选择器选择事件
    async selectChange(){
       this.getParamsData()
             
    },
    
    //tab导航点击事件
    handleClick(){
      // console.log(this.activeName);
      this.getParamsData()
    },
    
    //打开添加dialog
    ShowAddDialog(){
      this.addDialogVisible = true
    },
    
    //监听dialog关闭
    closeDialog(){
      this.$refs.addRef.resetFields()
    },
    
    //点击添加属性面板dialog的确定按钮
    async addParams(){
      let vali = await this.$refs.addRef.validate().catch(err=>err)
      if(vali == false){return this.$message.error('验证不通过')}
      let {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
        attr_name:this.addForm.attr_name,
        attr_sel:this.activeName
      })
      if(res.meta.status !== 201){return this.$message.error('添加属性失败');}
      this.$message.success('添加属性成功');
      this.getParamsData();
      this.addDialogVisible = false

      console.log(res);
      

    },
    
    //点击打开编辑对话框
    showEdit(row){
      // console.log(row);
      this.getParamsData();
      this.editForm = row
      // this.editForm.attr_name = row.attr_name
      console.log(this.editForm);
      
      this.editDialogVisible = true
    },

    //点击编辑属性面板dialog的确定按钮
    async editParams(){
      let vali = await this.$refs.editRef.validate().catch(err=>err);
      if(vali == false){return this.$message.error('验证不通过')}
      let {data:res} = await this.$http.put(`categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`,{
        attr_name:this.editForm.attr_name,
        attr_sel:this.activeName
      })
      if(res.meta.status !== 200){return this.$message.error('更新失败')}
      this.$message.success('更新属性名字成功')
      this.getParamsData()
      this.editDialogVisible = false
      // console.log(res);
      
    },
    
    //监听编辑对话框关闭
    closeEditDialog(){
      this.$refs.editRef.resetFields()
    },

    //监听删除参数按钮
    async deleteParams(row){
      console.log(row);
      let confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=> err )
      
      if(confirmRes !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      let {data:res} = await this.$http.delete(`categories/${row.cat_id}/attributes/${row.attr_id}`)
      if(res.meta.status !== 200){return this.$message.success('删除参数成功')}
      this.getParamsData();
      // console.log(res);
      
    },
    
    //监听New Tag文本输入框失去焦点或按下回车
    async handleInputConfirm(row){
      if(row.inputValue.trim().length === 0){
        row.inputValue = ''
        row.inputVisible = false;
        this.$message.error('不能只输入空格')
        return
      }
      //如果没有return
      row.attr_vals.push(row.inputValue.trim());  
      row.inputValue = '';
      row.inputVisible = false;
      this.saveAttr(row)
      this.$message.success('新增选项成功');    
    },
    
    //监听点击New Tag
    showInput(row){
      row.inputVisible = true
      this.$nextTick(()=>{
          this.$refs.saveTagInput.$refs.input.focus();
          // console.log(this.$refs.saveTagInput);
          
        });
    },
    
    //发起请求修改后的参数选项
    async saveAttr(row){
      let {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' ')
      })
      // console.log(res);
      if(res.meta.status !== 200){return this.$message.error('添加属性失败')}
    },


    //监听tag关闭按钮
    handleClose(i,row){
      // console.log(i);
      // console.log(row);
      row.attr_vals.splice(i,1)
      this.saveAttr(row)
      this.$message.success('删除选项成功');
    }
  }
};
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader{
  margin-left: 15px; 
}
.el-tag{
  margin: 0 10px;
}
.input-new-tag{
  width: 120px;
}
</style>