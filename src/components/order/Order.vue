<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="params.query">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表table -->
      <el-table :data="userList" border stripe>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="订单编号" prop="order_number"></el-table-column>
          <el-table-column label="订单价格" prop="order_price" width="80"></el-table-column>
          <el-table-column label="是否付款" width="90">
              <template slot-scope="scope">
                  <el-button v-if="!scope.row.order_pay" type="primary" plain size="small">已付款</el-button>
                  <el-button v-else type="danger" plain size="small">未付款</el-button>
              </template>
          </el-table-column>
          <el-table-column label="是否发货" prop="is_send" width="80"></el-table-column>
          <el-table-column label="下单时间" width="180">
              <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
          </el-table-column>
          <el-table-column label="操作" width="180">
              <template>
                  <el-button @click="showCityEdit" type="primary" icon="el-icon-edit" size="mini"></el-button>
                  <el-button @click="showkuaidi" type="success" icon="el-icon-position" size="mini"></el-button>
              </template>
          </el-table-column>
      </el-table>

    </el-card>
    
    <!-- 修改地址dialog -->
    <el-dialog :close-on-click-modal="false" @close="closeCityDialog" title="修改地址" :visible.sync="cityDialogVisible" width="50%">
     
     <el-form
       :model="addressDate"
       :rules="addressRules"
       ref="addressDateRef"
       label-width="100px"
     >
       <el-form-item label="省市区/县 : " prop="address1">
         <el-cascader v-model="addressDate.address1" :options="cityDate"></el-cascader>
       </el-form-item>
       <el-form-item label="详细地址 : " prop="address2">
         <el-input v-model="addressDate.address2"></el-input>
       </el-form-item>
     </el-form>

     <span slot="footer" class="dialog-footer">
          <el-button @click="cityDialogVisible = false">取 消</el-button>
          <el-button>确 定</el-button>
     </span>
    </el-dialog>
    
    <!-- 物流信息dialog -->
    <el-dialog :close-on-click-modal="false" title="物流信息" :visible.sync="kuaidiVisible" width="50%">
     
     <!-- 时间线 -->
     <el-timeline>
        <el-timeline-item
        v-for="(activity, index) in kuaidiInfo"
        :key="index"
        :timestamp="activity.time">
        {{activity.context}}
        </el-timeline-item>
     </el-timeline>

     <span slot="footer" class="dialog-footer">
          <el-button>取 消</el-button>
          <el-button>确 定</el-button>
     </span>
    </el-dialog>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="params.pagenum"
      :page-sizes="[10, 20, 30, 50]"
      :page-size="100"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
import cityDate from './citydata'
export default {
  created() {
    this.getOrdersList();
  },

  data() {
    return {
      params: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },

      userList: [], //获取到的订单列表数据
      total:0,

      cityDialogVisible:false,
      addressDate:{
          address1:[],
          address2:''
      },
      addressRules:{
          address1:[
              { required: true, message: "请选择城市", trigger: "blur" },
          ],
          address2:[
              { required: true, message: "请输入详细地址", trigger: "blur" },
          ],
      },
      cityDate,

      kuaidiVisible:false,
      kuaidiInfo:[]
    };
  },

  methods: {
    async getOrdersList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.params
      });
      if(res.meta.status !== 200){return this.$message.error('获取订单列表数据失败');}
      this.userList = res.data.goods;
      this.total = res.data.total;
      console.log(res);
    },
    
    //点击每页几页按钮
    handleSizeChange(newSize){
        // console.log(newSize);
        this.params.pagesize = newSize
        this.getOrdersList();
    },

    //切换页码按钮
    handleCurrentChange(newNum){
    //    console.log(newNum);
       this.params.pagenum = newNum
       this.getOrdersList();
    },

    //关闭dialog时的钩子
    closeCityDialog(){
     this.$refs.addressDateRef.resetFields()
    },
    
    //点击修改地址按钮
    showCityEdit(){
     this.cityDialogVisible = true
    },
    
    //点击物流信息按钮
    async showkuaidi(){
      const {data:res} = await this.$http.get('/kuaidi/804909574412544580')
      if(res.meta.status !== 200){return this.$message.error('获取物流信息失败')}
      this.kuaidiInfo = res.data
    //   console.log(res);
      
      this.kuaidiVisible = true
    }
  }
};
</script>

<style scoped>
.el-cascader{
    width: 100%;
}
</style>