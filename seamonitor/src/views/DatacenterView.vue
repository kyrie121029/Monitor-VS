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
        <!-- 数据总量 -->
        <div class="totalnum">
          <h2>数据总量</h2>
          <p>今日出生: {{ bornToday }}</p>
          <p>今日死亡: {{ diedToday }}</p>
        </div>
        <!-- 硬件信息统计 -->
        <div class="hardware">
          <h2>硬件信息统计</h2>
          <div class="cylinder" :style="{ height: cpuUsage + 'px' }"></div>
          <div class="cylinder" :style="{ height: memoryUsage + 'px' }"></div>
          <div class="cylinder" :style="{ height: gpuUsage + 'px' }"></div>
          <p>进程总量：{{ processCount }}</p>
          <p>磁盘使用率：{{ diskUsage }}%</p>
        </div>
      </div>
      <div class="column">
        <!-- 数据类型统计 -->
        <div class="variety-info">
          <div class="variety">
            <h2>数据类型统计</h2>
            <div class="pentagon-chart">
              <canvas id="pentagon-chart"></canvas>
            </div>
            <div class="statistics">
              <p>采集的种类数量：{{ originalVarieties }}</p>
              <p>处理后的种类数量：{{ processedVarieties }}</p>
            </div>
          </div>
          <div class="mind-map">
            <!-- 这里可以插入数据分类的图表 -->
          </div>
        </div>
        <!-- 数据中心分布 -->
        <div class="totalstatic">
          <h2>数据中心分布</h2>
          <div id="china_map" class="ditu" style="width: 50vw; height: 30vw"></div>
        </div>
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
              <tr>
                <td>水底摄像头</td>
                <td>{{ underwaterCamera.number }}</td>
                <td>{{ underwaterCamera.type }}</td>
                <td>{{ underwaterCamera.size }}</td>
              </tr>
              <tr>
                <td>水底摄像头</td>
                <td>{{ underwaterCamera.number }}</td>
                <td>{{ underwaterCamera.type }}</td>
                <td>{{ underwaterCamera.size }}</td>
              </tr>
              <tr>
                <td>水面摄像头</td>
                <td>{{ underwaterCamera.number }}</td>
                <td>{{ underwaterCamera.type }}</td>
                <td>{{ underwaterCamera.size }}</td>
              </tr>
              <tr>
                <td>云台</td>
                <td>{{ underwaterCamera.number }}</td>
                <td>{{ underwaterCamera.type }}</td>
                <td>{{ underwaterCamera.size }}</td>
              </tr>
              <tr>
                <td>声呐</td>
                <td>{{ underwaterCamera.number }}</td>
                <td>{{ underwaterCamera.type }}</td>
                <td>{{ underwaterCamera.size }}</td>
              </tr>
              <tr>
                <td>传感器</td>
                <td>{{ underwaterCamera.number }}</td>
                <td>{{ underwaterCamera.type }}</td>
                <td>{{ underwaterCamera.size }}</td>
              </tr>
              <tr>
                <td>气象台</td>
                <td>{{ underwaterCamera.number }}</td>
                <td>{{ underwaterCamera.type }}</td>
                <td>{{ underwaterCamera.size }}</td>
              </tr>
              <!-- Add rows for other devices -->
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
import Chart from 'chart.js/auto';
export default {
  name: "DateUtil",
  data() {
    return {
      nowTime: new Date(),
      currentTime: '', // 实时时间
      currentTemperature: '', // 当前温度,
      bornToday: 0,
      diedToday: 0,
      cpuUsage: 120, // CPU使用率（0-200，这里取120只是为了展示效果）
      memoryUsage: 160, // 内存使用率（0-200，这里取160只是为了展示效果）
      gpuUsage: 100, // GPU使用率（0-200，这里取100只是为了展示效果）
      processCount: 120, // 进程总量
      diskUsage: 60, // 磁盘使用率（0-100）
      originalVarieties: 20, // 采集的种类数量
      processedVarieties: 15, // 处理后的种类数量
      pentagonChart: null,
      averageTransmissionDuration: 0, // Placeholder for average transmission duration
      averageProcessingDuration: 0, // Placeholder for average processing duration
      underwaterCamera: {
        number: '', // Device number
        type: '', // Device type
        size: '', // Device size
      },
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
    // 获取实时数据
    fetchData() {
      // 模拟异步请求数据
      setTimeout(() => {
        // 模拟数据
        this.originalVarieties = 5;
        this.processedVarieties = 3;
        // 数据获取后渲染雷达图
        this.renderPentagonChart();
      }, 1000);
    },
    // 计算今日出生和今日死亡的总数
    totalBornAndDiedToday() {
      return this.bornToday + this.diedToday;
    },
    // 渲染雷达图
    renderPentagonChart() {
      const ctx = document.getElementById('pentagon-chart').getContext('2d');
  
      // Ensure that any existing chart instance is destroyed
      if (this.pentagonChart) {
        this.pentagonChart.destroy();
        this.pentagonChart = null; // Reset the chart instance
      }
  
      // Create new chart
      this.pentagonChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['类型1', '类型2', '类型3', '类型4', '类型5'],
          datasets: [
            {
              label: '采集数据',
              data: [3, 2, 4, 5, 3],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            },
            {
              label: '处理后数据',
              data: [4, 3, 5, 4, 2],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            r: {
              beginAtZero: true
            }
          }
        }
      });
    },
  },
  
  mounted() {
    // 启动定时器更新时间
    this.timer = setInterval(() => {
      this.nowTime = new Date();
    }, 1000);
    // 获取实时数据
    this.fetchData();
    // 从服务器获取的今日出生和今日死亡的数量
    this.bornToday = 10;
    this.diedToday = 5;
    this.getMapChart();
    // 页面加载时获取用户列表
    this.fetchUserList();
    // 渲染雷达图
    this.renderPentagonChart();
    
  },
  beforeUnmount() {
    // 销毁图表实例
    if (this.pentagonChart) {
      this.pentagonChart.destroy();
      this.pentagonChart = null;
    }
    
    // 销毁地图实例
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    
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

.button-container {
  display: flex;
  align-items: center;
  width: 200px; /* 设置按钮框的宽度 */
  margin-bottom: 5px;
}

.button-icon {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px 10px;
}

.inner-button {
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  margin-left: 5px;
}

.button-icon i {
  margin-right: 8px;
}

.column {
  width: 30%;
}

.totalnum, .sensor, .database, .totalstatic, .distribution,.hardware,.variety {
  margin-bottom: 30px;
}

.totalnum,.sensor, .database, .totalstatic, .distribution,.hardware,.variety {
  padding: 30px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(191, 125, 125, 0.1);
  color: black; /* 修改文本颜色为黑色 */
}

.totalnum{
  width: 300px;
  height: 100px;
}

.hardware-info {
  width: 80%;
  margin: 0 auto;
  text-align: center;
}


.cylinder {
  display: inline-block;
  width: 50px;
  height: 200px;
  background-color: #ccc;
  border-radius: 25px;
  margin: 0 10px;
}

.variety-info {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}

.variety {
  margin-top: 20px;
}

.statistics {
  margin-top: 20px;
}

.pentagon-chart {
  margin-top: 20px;
}

.mind-map {
  margin-top: 20px;
}
.sensor{
  height: 400px;
}

.database{
  height: 300px;
}

.totalstatic{
  height: 250px;
}

.distribution{
  height: 300px;
}

.hardware{
  height: 380px;
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
