<template>
  <div class="chart-container">
    <h2 class="chart-title">Fish Species Distribution</h2>
    <div ref="chart" class="chart"></div>
  </div>
</template>

<script>
import axios from 'axios';
import * as echarts from 'echarts';

export default {
  data() {
    return {
      chartData: []
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      axios.get('http://localhost:3000/api/data/Fish.csv')
        .then(response => {
          this.processData(response.data);
        })
        .catch(error => {
          console.error("There was an error fetching the data!", error);
        });
    },
    processData(data) {
      const speciesCount = data.reduce((acc, row) => {
        acc[row.Species] = (acc[row.Species] || 0) + 1;
        return acc;
      }, {});

      this.chartData = Object.entries(speciesCount).map(([name, value]) => ({ name, value }));
      this.initChart();
    },
    initChart() {
      if (!this.chartData.length) {
        console.error("No chart data available.");
        return;
      }
      const chart = echarts.init(this.$refs.chart);
      const option = {
        title: {
          text: '鱼种类统计',
          left: 'center',
          textStyle: {
            color: '#ffffff'
          }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: '#ffffff'
          }
        },
        series: [
          {
            name: 'Species',
            type: 'pie',
            radius: '50%',
            data: this.chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              color: '#ffffff'
            }
          }
        ],
        backgroundColor: 'rgba(0,0,0,0)'
      };
      chart.setOption(option);
    }
  }
};
</script>

<style scoped>
.chart-container {
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.chart-title {
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
}

.chart {
  width: 100%;
  height: 400px;
}
</style>
