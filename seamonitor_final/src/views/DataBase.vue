<template>
  <div class="content">
    <div class="upload-section">
      <input type="file" @change="handleFileChange" />
      <button @click="uploadFile">上传文件</button>
      <button @click="exportData">导出数据</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { saveAs } from 'file-saver';

export default {
  data() {
    return {
      selectedFile: null,
      fishData: [],
      pentagonChart: null
    };
  },
  methods: {
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    uploadFile() {
      if (!this.selectedFile) {
        alert("请先选择一个文件");
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      axios.post('http://localhost:3000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        alert('文件上传成功');
        console.log('File uploaded successfully', response.data);
        this.fetchData();
      })
      .catch(error => {
        alert('文件上传失败');
        console.error("数据上传失败:", error);
      });
    },
    fetchData() {
      axios.get('http://localhost:3000/api/data')
        .then(response => {
          this.fishData = response.data;
          this.renderPentagonChart();
        })
        .catch(error => {
          console.error("获取数据失败:", error);
        });
    },
    exportData() {
      axios.get('http://localhost:3000/api/export', { responseType: 'blob' })
        .then(response => {
          const blob = new Blob([response.data], { type: 'application/zip' });
          saveAs(blob, 'exported_data.zip');
        })
        .catch(error => {
          console.error("导出数据失败:", error);
        });
    }
  },
  mounted() {
    this.fetchData(); // 初始化时获取数据
  }
};
</script>

<style scoped>
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-size: 36px; /* 调整字体大小 */
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url('@/assets/registerbg.jpg'); /* 添加背景图片 */
  background-size: cover; /* 覆盖整个背景 */
  background-position: center; /* 背景居中 */
  background-repeat: no-repeat; /* 背景不重复 */
  color: white; /* 修改字体颜色以在深色背景上更易阅读 */
  min-height: 100vh; /* 设置最小高度以覆盖整个视口 */
  padding: 20px; /* 增加内边距 */
  width: 1600px;
}

.upload-section {
  margin-bottom: 20px;
  width: 20%; /* 增加容器宽度 */
}

button {
  width: 100%; /* 按钮占满容器宽度 */
  margin-top: 20px;
  padding: 20px 40px; /* 增加按钮的内边距 */
  font-size: 28px; /* 调整按钮的字体大小 */
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  color: white; /* 按钮字体颜色 */
  border: none; /* 去除按钮边框 */
  border-radius: 10px; /* 按钮圆角 */
}

button:hover {
  background-color: rgba(0, 0, 0, 0.7); /* 鼠标悬停时的按钮背景色 */
}
.alert {
  color: black; /* 设置提示消息的颜色 */
  margin-top: 10px;
  font-size: 24px; /* 调整提示消息的字体大小 */
}
</style>
