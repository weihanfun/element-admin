<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column label="#" type="index" ></el-table-column>
        <el-table-column label="权限名称" prop="authName" ></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == 0">一级</el-tag>
            <el-tag v-else-if="scope.row.level == 1" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getRightsList();
  },

  data() {
    return {
      rightsList: []
    };
  },

  methods: {
    async getRightsList() {
      let {data:res} = await this.$http.get("rights/list");
      console.log(res.data);
      this.rightsList = res.data
    },

    cellStyleFun(){
      return 'text-align:center'
    },

    headerCellStyle(){
      return 'text-align:center'
    }
  }
};
</script>

<style>
</style>