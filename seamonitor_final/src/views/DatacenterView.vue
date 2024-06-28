<template>
  <div class="content1">
    <router-view></router-view>
    <div class="dashboard">
      <div class="header">
        <h1>海洋牧场可视化系统</h1>
        <div class="header-info">
          <i class="iconfont icon-shijian" style="font-size: 22px;"></i>
          <div>{{ dateFormat(nowTime) }}</div>
          <i class="iconfont icon-wendu" style="font-size: 24px;"></i>
          <div>实时温度: {{ currentTemperature }}</div>
        </div>
      </div>
      <div class="column">
        <Water/>
      </div>
      <div class="column">
        <div class="sensor">
          <h2>传感器信息</h2>
          <p>平均传输时长: {{ averageTransmissionDuration }} 分钟</p>
          <p>平均处理时长: {{ averageProcessingDuration }} 分钟</p>

          <!-- Table for device details -->
          <table>
            <thead>
              <tr>
                <th>设备</th>
                <th>编号</th>
                <th>类型</th>
                <th>大小</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="device in devices" :key="device.id">
                <td>{{ device.name }}</td>
                <td>{{ device.number }}</td>
                <td>{{ device.type }}</td>
                <td>{{ device.size }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="database">
          <h2>数据库交互统计</h2>
          <table>
            <thead>
              <tr>
                <th>数据库</th>
                <th>查询次数</th>
                <th>成功次数</th>
                <th>查询时间</th>
                <th>访问数据服务系统</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>MySQL</td>
                <td>567,890</td>
                <td>567,890</td>
                <td>0.1s</td>
                <td>vue.js</td>
              </tr>
              <tr>
                <td>HBase</td>
                <td>--</td>
                <td>--</td>
                <td>--</td>
                <td>--</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Water from '../components/Water.vue'
export default {
  name: "DateUtil",
  components: {
    Water,
  },
  data() {
    return {
      nowTime: new Date(),
      currentTemperature: '', // 当前温度,
      averageTransmissionDuration: 0, // Placeholder for average transmission duration
      averageProcessingDuration: 0, // Placeholder for average processing duration
      devices: this.generateRandomDevices(10) // 生成随机设备数据
    };
  },
  methods: {
    // 格式化时间
    dateFormat() {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
      var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      let week = date.getDay(); // 星期
      let weekArr = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六",];
      return (" "+year + "年" + month + "月" + day + "日 " + hours + ":" + minutes + ":" + seconds + " " + weekArr[week]);
    },
    generateRandomDevices(count) {
      const deviceTypes = ['水底摄像头', '水面摄像头', '云台', '声呐', '传感器', '气象台'];
      const devices = [];
      for (let i = 0; i < count; i++) {
        const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        devices.push({
          id: i,
          name: type,
          number: Math.floor(Math.random() * 10000),
          type: type,
          size: `${Math.floor(Math.random() * 100)} cm`
        });
      }
      return devices;
    },
    async fetchData() {
      // 示例代码，可根据实际数据获取方式进行修改
      try {
        await axios.get('http://localhost:3000/api/data/Fish.csv');
        // 更新传感器信息
        this.devices = this.generateRandomDevices(10);
      } catch (error) {
        console.error("获取数据时出错:", error);
      }
    }
  },
  mounted() {
    // 启动定时器更新时间
    this.timer = setInterval(() => {
      this.nowTime = new Date();
    }, 1000);
    // 获取实时数据
    this.fetchData();
  },
  beforeUnmount() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
};
</script>

<style scoped>
.content1 {
  flex: 1;
  text-align: center;
  background-image: url('/src/assets/homebackground.png');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 50px;
}

.dashboard {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 20px;
}

.header {
  width: 100%;
  text-align: center;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between;
}

.header-info {
  display: flex;
  align-items: center;
  margin-right: auto; /* 将header-info放置到右侧 */
}

.header-info > div {
  margin-right: 40px; /* 调整时间和温度之间的间距 */
}

.column {
  width: 45%;
}

.sensor, .database {
  margin-bottom: 30px;
}

.sensor, .database {
  padding: 30px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(191, 125, 125, 0.1);
  color: black; /* 修改文本颜色为黑色 */
}

table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

#map {
  width: 100%;
}
h2 {
  margin-bottom: 10px;
}

p {
  margin: 5px 0;
}
</style>
