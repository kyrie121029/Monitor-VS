<template>
  <div id="app">
    <div class="register-container">
      <h2>Register</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required>
        </div>
        <div class="form-group">
          <label for="avatar">Avatar:</label>
          <input type="file" id="avatar" @change="handleFileUpload" accept="image/*">
        </div>
        <button type="submit">Register</button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: ''
    };
  },
  methods: {
    register() {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }
      
      // 模拟注册逻辑，实际情况中应该发送请求到后端进行注册
      // 在这里可以将注册信息提交到后端进行处理
      
      alert('Registration successful!');
      // 注册成功后跳转到首页或其他页面
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
#app {
  background-image: url('/src/assets/registerbg.jpg'); /* 背景图片路径 */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 100vh; /* 设置页面高度为视窗高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1; /* 背景图片透明度 */
}


.register-container {
  max-width: 500px;
  height: 400px;
  padding: 20px;
  border: 1px solid transparent; /* 设置边框颜色为透明 */
  border-radius: 5px;
  color: #333; /* 设置字体颜色为深灰色 */
}



.form-group {
  margin-bottom: 30px;
  display: flex;
  align-items: center; /* 将内部元素垂直居中对齐 */
}

label {
  width: 200px;
  text-align: right;
  margin-right: 20px;
}

.error-message {
  color: red;
}
</style>
