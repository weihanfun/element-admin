<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索、添加用户 -->
      <el-row :gutter="15">
        <el-col :span="6">
          <el-input class="search" clearable @clear="getGoodsList" placeholder="请输入内容" v-model="params.query">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表数据 -->
      <el-table :data="goodList" border stripe>
         <el-table-column label="#" type="index"></el-table-column>
         <el-table-column label="商品名称" prop="goods_name"></el-table-column>
         <el-table-column width="130" label="商品价格(元)" prop="goods_price"></el-table-column>
         <el-table-column width="130" label="商品重量" prop="goods_weight"></el-table-column>
         <el-table-column width="150" label="创建时间" prop="add_time">
             <template slot-scope="scopt">
                 {{scopt.row.add_time | dateFormat}}
             </template>
         </el-table-column>
         <el-table-column width="230" label="操作">
            <template slot-scope="scope">
               <el-button size="small" type="primary" icon="el-icon-edit">编辑</el-button>
               <el-button @click="removeById(scope.row.goods_id)" size="small" type="danger" icon="el-icon-delete">删除</el-button>
            </template>
         </el-table-column>
      </el-table>
      
    </el-card>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="params.pagenum"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="params.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

  </div>
</template>

<script>
export default {

created(){
  this.getGoodsList()
},

data() {
    return {
        params: {
            query:'',
            pagenum:1,
            pagesize:10
        },
        goodList:[],
        total:0
    }
},

methods: {
    //获取商品列表数据
    async getGoodsList(){
      let {data:res} = await this.$http.get('goods',{params:this.params});
      if(res.meta.status !== 200){return this.$message.error('获取商品列表数据失败')}
      this.goodList = res.data.goods
      this.total = res.data.total
    //   console.log(res.data);
      
    },

    //添加商品按钮
    addGoods(){
        this.$router.push('/goods/add')
    },
    
    
    //分页点击每页显示多少
    handleSizeChange(newSize){
        // console.log(newSize);
        this.params.pagesize = newSize;
        this.getGoodsList();
       
    },
    
    //分页切换页码
    handleCurrentChange(newPage){
        // console.log(newPage);
        this.params.pagenum = newPage;
        this.getGoodsList();
    },
    
    //删除商品按钮
    async removeById(id){
      console.log(id);
      let confirmRes = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=> err )
      
      if(confirmRes !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      let {data : res} = await this.$http.delete(`goods/${id}`)
      if(res.meta.status !== 200){return this.$message.error('删除商品失败')}
      this.$message.success('删除商品成功')
      this.getGoodsList();
    }

},
}
</script>

<style scoped>

</style>