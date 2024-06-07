<template>
    <div class="admin-home">
      <div class="sidebar">
        <router-link to="/userhome/main-info" class="button">主要信息</router-link>
        <router-link to="/userhome/under-sea" class="button">水下系统</router-link>
        <router-link to="/userhome/data-center" class="button">数据中心</router-link>
        <router-link to="/userhome/smart-center" class="button">智能中心</router-link>
      </div>
      <div class="content1" v-if="$route.meta.show">
        <router-view></router-view>
      </div>
      <div class="content">
        <router-view v-if="showContent('data-center')" class="data-center"></router-view>
        <router-view v-if="showContent('main-info')" class="main-info"></router-view>
        <router-view v-if="showContent('under-sea')" class="under-sea"></router-view>
        <router-view v-if="showContent('smart-center')" class="smart-center"></router-view>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UserHome',
    methods: {
      showContent(viewName) {
      // 判断当前路由的元信息是否存在，以及是否与指定的视图名称相匹配
        return this.$route.meta && this.$route.meta.showContent === viewName;
  }
  
    }
  };
  </script>
  
  <style scoped>
  .admin-home {
    display: flex;
    height: 100vh; /* 使容器占满整个视口高度 */
  }
  
.sidebar {
  background-color: #bbb5b5;
  width: 200px;
  height: 918px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
  
  .content1 {
    flex: 1; /* 让内容部分占据剩余空间 */
    text-align: center;
    background-image: url('/src/assets/adminhomebg.jpg'); /* 整个页面的背景图 */
    background-size: cover;
    background-position: center;
    color: white;
    padding: 50px;
  }
  
.button {
  display: block;
  padding: 15px 30px;
  margin-bottom: 80px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}
  .button:hover {
    background-color: #0056b3;
  }
  </style>