<template>
  <div class="content1">
    <router-view></router-view>
    <div class="admin-panel">
      <h1>管理员管理界面</h1>
      <div class="container">
        <!-- 左侧用户列表 -->
        <div class="user-list">
          <h2>用户列表</h2>
          <ul>
            <li v-for="user in userList" :key="user.Username" @click="selectUser(user)">
              <span>{{ user.Username }}</span>
              <div class="actions">
                <button class="edit-btn" @click.stop="editUser(user)">编辑</button>
                <button class="delete-btn" @click.stop="deleteUser(user)">删除</button>
              </div>
            </li>
          </ul>
        </div>
        <!-- 右侧用户详情或添加用户表单 -->
        <div class="details-form">
          <div class="user-details" v-if="selectedUser">
            <h2>用户详情</h2>
            <p><strong>用户名:</strong> {{ selectedUser.Username }}</p>
            <p><strong>邮箱:</strong> {{ selectedUser.Email }}</p>
            <button class="close-btn" @click="closeDetails">关闭</button>
          </div>
          <div class="add-user-form" v-else>
            <h2>添加用户</h2>
            <form @submit.prevent="addUser">
              <div class="input-group">
                <label for="username">用户名:</label>
                <input type="text" id="username" v-model="newUser.Username">
              </div>
              <div class="input-group">
                <label for="email">邮箱:</label>
                <input type="email" id="email" v-model="newUser.Email">
              </div>
              <div class="input-group">
                <label for="password">密码:</label>
                <input type="password" id="password" v-model="newUser.Password">
              </div>
              <button type="submit" class="submit-btn">添加用户</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userList: [], // 用户列表
      newUser: { Username: '', Email: '', Password: '' }, // 新用户表单数据
      selectedUser: null // 选定的用户详情
    };
  },
  methods: {
    // 获取用户列表（从服务器获取）
    async fetchUserList() {
      try {
        const response = await axios.get('http://localhost:3000/api/users');
        this.userList = response.data;
      } catch (error) {
        console.error('获取用户列表失败:', error);
      }
    },
    // 添加用户
    async addUser() {
      try {
        const response = await axios.post('http://localhost:3000/api/users', this.newUser);
        console.log('添加用户成功:', response.data);
        this.newUser = { Username: '', Email: '', Password: '' };
        this.fetchUserList(); // 刷新用户列表
      } catch (error) {
        console.error('添加用户失败:', error);
      }
    },
    // 编辑用户
    editUser(user) {
      this.selectedUser = { ...user }; // 创建用户副本，以便在取消时不改变原始数据
    },
    // 删除用户
    async deleteUser(user) {
      try {
        await axios.delete(`http://localhost:3000/api/users/${user.Username}`);
        console.log('删除用户成功:', user);
        this.fetchUserList(); // 刷新用户列表
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    },
    // 选择用户显示详情或添加用户表单
    selectUser(user) {
      this.selectedUser = user;
    },
    // 关闭用户详情
    closeDetails() {
      this.selectedUser = null;
    }
  },
  mounted() {
    // 页面加载时获取用户列表
    this.fetchUserList();
  }
};
</script>

<style scoped>
.content1 {
  flex: 1;
  text-align: center;
  background-image: url('/src/assets/homebackground.png');
  background-size: cover; /* 将背景图大小设置为 cover */
  background-position: center;
  color: white;
  height: 880px;
  width: 1500px;
  padding: 50px;
}

.admin-panel {
  width: 100%;
  max-width: 1200px; /* 调整最大宽度以适应更多内容 */
  height: 100vh;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.9); /* 添加背景颜色以提高可读性 */
  color: black; /* 设置默认文字颜色为黑色 */
}

.container {
  display: flex;
  justify-content: space-between;
}

.user-list {
  width: 45%;
  color: black; /* 设置文字颜色为黑色 */
}

.user-list ul {
  list-style: none;
  padding: 0;
}

.user-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: rgba(255, 255, 255, 0.8);
}

.user-list li:hover {
  background-color: rgba(200, 200, 200, 0.8);
}

.actions {
  display: flex;
  gap: 5px;
}

.add-user-form, .user-details {
  width: 85%;
}

.input-group {
  margin-bottom: 10px;
}

.input-group label {
  display: block;
}

.input-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-btn,
.close-btn {
  padding: 8px 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover,
.close-btn:hover {
  background-color: #0056b3;
}
</style>
