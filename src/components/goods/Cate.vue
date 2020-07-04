<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card v-loading="loading">
      <!-- 添加分类按钮 -->
      <el-button type="primary" @click="addCateOpen">添加分类</el-button>

      <tree-table border index-text="#" show-index :expand-type="false" :selection-type="false" :data="CateList" :columns="columns" class="treeTable">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i v-if="scope.row.cat_deleted === false" class="el-icon-success" style="color:green"></i>
          <i v-else class="el-icon-error" style="color:red"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level == 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类dialog -->
    <el-dialog @close="addCateDialogClose" :close-on-click-modal="false" title="添加分类信息" :visible.sync="addCateDialogVisible" width="50%">
      
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateRef" label-width="100px">
        <el-form-item label="分类名称 : " prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类 : " >
          <!-- 级联选择器 -->
          <!--options:数据源   -->
          <el-cascader change-on-select clearable @change="parentCateChanged" v-model="selectedKeys" :options="parentCateList" :props="cascaderProps"></el-cascader>
          </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button @click="addCatePost">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getGoodsCate();
  },

  data() {
    return {
      loading:true,
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      CateList: [],
      total: 0, //总条数

      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],

      addCateDialogVisible: false, //分类dialog显示隐藏

      //要添加分类的表单数据
      addCateForm:{
        cat_name:'',
        cat_pid:0,
        cat_level:0
      },
      //分类的rule
      addCateFormRules:{
        cat_name:[
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ]
      },
      parentCateList:[],   //添加分类的级联组件数据
      //级联组件cascader配置项
      cascaderProps:{
        expandTrigger: 'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      selectedKeys:[]  //级联组件选中的一级和二级项组成的数组
    };
  },

  methods: {
    async getGoodsCate() {
      let { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类数据失败");
      }
      this.CateList = res.data.result;
      this.total = res.data.total;
      console.log(res.data);
      this.loading = false
    },

    //监听page改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getGoodsCate();
    },

    //监听pageNum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsCate();
    },

    //打开分类dialog按钮
    addCateOpen() {
      this.getParentCateList()
      this.addCateDialogVisible = true;
      
    },

    //获取父级分类的数据列表
    async getParentCateList(){
      let {data:res} = await this.$http.get('categories',{params:{type:2}})
      if(res.meta.status !== 200 ){return this.$message.error('获取父级分类数据失败')}
      this.parentCateList = res.data
      // console.log(res.data);
      
    },
    
    //选择项发生变化触发
    parentCateChanged(){
     console.log(this.selectedKeys);
     console.log(this.selectedKeys.length);
    //  console.log(this.addCateForm);
     if(this.selectedKeys.length > 0){
      this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length -1]
      //  console.log(this.addCateForm.cat_pid);
      this.addCateForm.cat_level = this.selectedKeys.length
      return
     }else{
       this.addCateForm.cat_pid = 0;
       this.addCateForm.cat_pid = 0;
     }
   
    },
    
    //添加分类确定按钮
    async addCatePost(){
      console.log(this.addCateForm);
      let val = await this.$refs.addCateRef.validate().catch(err=>err)
      if(val == false){return this.$message.error('请输入分类名称')}
      const {data:res} = await this.$http.post('categories',this.addCateForm)
      if(res.meta.status !== 201){return this.$message.error('添加分类失败')}
      this.$message.success('添加分类成功');
      this.getGoodsCate();
      this.addCateDialogVisible = false;
      // console.log(res);
      
    },
    
    //添加分类dialog关闭时的事件
    addCateDialogClose(){
     this.$refs.addCateRef.resetFields();
     this.selectedKeys = [];
     this.addCateForm.cat_level = 0;
     this.addCateForm.cat_pid = 0;
    }
  }
};
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>