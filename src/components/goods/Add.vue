<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
        <!-- 提示信息 -->
        <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
        <!-- 步骤条 -->
        <div class="steps_wrap">
        <el-steps align-center :space="200" :active="activeIndex -0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
        </el-steps>
        </div>
        <!-- tab标签区 -->
        <el-form label-position="top" :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-tabs @tab-click="tabClicked" :before-leave="beforeTabLeave" v-model="activeIndex" :tab-position="'left'">
            <el-tab-pane label="基本信息" name="0">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="addForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                    <el-input type="number" v-model="addForm.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="addForm.goods_weight"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input type="number" v-model="addForm.goods_number"></el-input>
                </el-form-item>
                <el-form-item label="商品分类" prop="goods_cat">
                  <el-cascader clearable @change ="handleChange" v-model="addForm.goods_cat" :options="cateList" :props="cateProps" ></el-cascader>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <el-form-item :label="item.attr_name" v-for="(item) in manyTableData" :key="item.attr_id"> 
                <el-checkbox-group @change="changeGroup" v-model="item.attr_vals">
                    <el-checkbox border :label="item" v-for="(item,index) in item.attr_vals" :key="index"></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
                <el-form-item :label="item.attr_name" v-for="(item,index) in onlyTableData" :key="index">
                  <el-input v-model="item.attr_vals"></el-input>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
                <el-upload
                    class="upload-demo"
                    :headers="headers"
                    :action="actionURL"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    :on-success="onSuccess"
                    :on-progress="onProgress"
                    list-type="picture">
                    <el-button size="small" type="primary">点击上传</el-button>                    
                </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
                <!-- 富文本编辑内容 -->
                <quill-editor v-model="addForm.goods_introduce">
                </quill-editor>
                <!-- 添加商品按钮 -->
                <el-button @click="add" type="primary" class="btnAdd">添加商品</el-button>
            </el-tab-pane>
        </el-tabs>
        </el-form>
    </el-card>

    <!-- 图片预览dialog -->
    <el-dialog
        title="图片预览"
        :visible.sync="dialogVisible"
        width="50%">
        <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
    created(){
        this.getCateList()
    },

    data() {
        return {
            activeIndex: '0',   //步骤条默认选中的index
            addForm:{
               goods_name:'',
               goods_price:1,
               goods_weight:1,
               goods_number:1,
               goods_cat:[],
               pics:[],
               goods_introduce:'',
               attrs:[]
            }, 
            //添加商品验证规则
            addFormRules:{
                goods_name:[
                    { required: true, message: "请输入商品名称", trigger: "blur" },
                ],
                goods_price:[
                     { required: true, message: "请输入价格", trigger: "blur" },
                ],
                goods_weight:[
                     { required: true, message: "请输入重量", trigger: "blur" },
                ],
                goods_number:[
                     { required: true, message: "请输入数量", trigger: "blur" },
                ],
                goods_cat:[
                    { required: true, message: "请选择商品分类", trigger: "blur" },
                ]
            },

            //分类数据
            cateList:[],
            //级联选择器配置对象
            cateProps:{
                expandTrigger:'hover',
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            
            //商品参数面板数据
            manyTableData:[],
            //商品属性面板数据
            onlyTableData:[],

            actionURL:'http://127.0.0.1:8888/api/private/v1/upload',
            headers:{Authorization:sessionStorage.getItem('token')},
            previewPath:'',
            dialogVisible:false,

            afterTab1or2:[]
        }
    },
    
    computed: {
        cateId() {
            if(this.addForm.goods_cat.length !== 3){
             return
            }
            return this.addForm.goods_cat[2]
        }
    },

    methods: {
        async getCateList() {
            let {data:res} = await this.$http.get('categories');
            if(res.meta.status !== 200){return this.$message.error('获取商品分类数据失败')}
            this.cateList = res.data
            // console.log(this.cateList);
            
        },
        
        //级联选择器选择时候触发的方法
        handleChange(){
          if(this.addForm.goods_cat.length !== 3){
               this.addForm.goods_cat = []
          }
          console.log(this.addForm.goods_cat);
          //console.log(this.cateId);        
        },
        
        //tab切换的钩子函数
        beforeTabLeave(activeName){
            if(this.activeIndex == 0 && this.addForm.goods_cat.length !== 3){
            this.$message.error('请选择商品分类')
            return false
            }
            let i1 = this.afterTab1or2.findIndex(item=>item == 1)
            // let i2 = this.afterTab1or2.findIndex(item=>item == 2)
            if(activeName !== '1' && i1 == -1){
                this.$message.error('请先进入“商品参数”页面和“商品属性”页面')
                return false                
            }
            // console.log('activeName==='+activeName);
            // console.log('oldActiveName'+oldActiveName);
            // console.log(this.afterTab1or2);
            
        },
        

        //点击tab的方法
        async tabClicked(){
          //console.log(this.activeIndex);
          if(this.activeIndex == '1'){
            console.log('动态参数面板');
            let i = this.afterTab1or2.findIndex(item=>item == 1)
            if(i == -1){this.afterTab1or2.push(1)}
            let {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                params:{sel:'many'}
            })
            if(res.meta.status !== 200){return this.$message.error('获取动态参数失败')}
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals.length == 0 ? [] : item.attr_vals.split(' ')
            });
            this.manyTableData = res.data
            // console.log(res.data);          
          }else if(this.activeIndex == '2'){
              console.log('商品属性面板');
              let i = this.afterTab1or2.findIndex(item=>item == 2)
              if(i == -1){this.afterTab1or2.push(2)}
              let {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                params:{sel:'only'}})
              this.onlyTableData = res.data
              console.log(res.data);
              
          }


        },
        
        //复选框选择方法
        changeGroup(value){
          console.log(value);          
          console.log(this.manyTableData);         
        },
        
        //图片预览方法
        handlePreview(file){
            this.previewPath = file.response.data.url;
            console.log(this.previewPath);
            
            this.dialogVisible = true
        },
        

        //预览图片移除的钩子
        handleRemove(file){
            // console.log(file);
            const filePath = file.response.data.tmp_path
            const index = this.addForm.pics.findIndex(item =>{
               return item.pic === filePath
            })
            this.addForm.pics.splice(index,1)
            console.log(this.addForm);
        },
        
        //图片上传成功的钩子
        onSuccess(response){
            // console.log(response);   
            const picInfo = {
              pic:response.data.tmp_path
            }
            this.addForm.pics.push(picInfo)
            console.log(this.addForm);
            
        },
        //图片上传时的钩子
        onProgress(){
            // console.log("onProgress");
            
        },

        //添加商品按钮方法
        async add(){
            // console.log(this.addForm);
            let vali = await this.$refs.addFormRef.validate().catch(err=>err);
            if(vali == false){return this.$message.error('请填写所需的必要项！')}
            // console.log('提交成功');
            const form = _.cloneDeep(this.addForm)
            form.goods_cat = form.goods_cat.join(',')
            //处理动态参数
            // console.log(form);
            this.manyTableData.forEach(item=>{
                const newInfo ={
                    attr_id:item.attr_id,
                    attr_vals:item.attr_vals.join(',')
                }
                this.addForm.attrs.push(newInfo)
            })
            //处理静态参数
            this.onlyTableData.forEach(item=>{
                const newInfo = {
                    attr_id:item.attr_id,
                    attr_vals:item.attr_vals
                }
                this.addForm.attrs.push(newInfo)
            })
            form.attrs = this.addForm.attrs
            console.log(form);
            // console.log(this.manyTableData);
            // console.log(this.onlyTableData);
            //发起请求
            const {data:res} = await this.$http.post('goods',form)
            // console.log(res);         
            if(res.meta.status !== 201){return this.$message.error('添加商品失败')}
            this.$message.success('添加商品成功')
            this.$router.push('/goods')
        }

    },
};
</script>

<style scoped>
.steps_wrap{
    text-align: center;
}
.el-checkbox{
    margin: 0 10px 0 0 !important;
}
.previewImg{
    width: 100%;
}
.btnAdd{
    margin-top: 15px;
}
</style>