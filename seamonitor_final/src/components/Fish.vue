<template>
    <div ref="chart" style="width: 100%; height: 400px;"></div>
  </template>
  
  <script>
  import axios from 'axios';
  import * as echarts from 'echarts';
  
  export default {
    name: 'FishDonutChart',
    data() {
      return {
        totalFishCount: 0,
      };
    },
    mounted() {
      this.fetchFishData();
    },
    methods: {
      async fetchFishData() {
        try {
          const response = await axios.get('http://localhost:3000/api/data/Fish.csv', {
            responseType: 'json'  // 确保响应被处理为 JSON
          });
          console.log('Fetched data:', response.data);  // 调试输出数据
          this.processData(response.data);
        } catch (error) {
          console.error('Error fetching fish data:', error);
        }
      },
      processData(jsonData) {
        // 计算所有鱼的总数量，即 JSON 数据项的数量
        this.totalFishCount = jsonData.length;
        console.log("Total fish count:", this.totalFishCount);  // 调试输出总数量
        this.renderChart();
      },
      renderChart() {
        const chart = echarts.init(this.$refs.chart);
        const option = {
          title: {
            text: '鱼群总数',
            left: 'center',
            top: '20px',
            textStyle: {
              fontSize: 30,
              fontWeight: 'bold',
              color: '#fff'  // 设置标题颜色
            }
          },
          tooltip: {
            trigger: 'item'
          },
          series: [
            {
              name: 'Fish Count',
              type: 'pie',
              radius: ['40%', '60%'],  // 设置内外半径，形成环形图
              avoidLabelOverlap: false,
              label: {
                show: true,
                position: 'center',
                formatter: '{c}',  // 显示总数量
                fontSize: 50,  // 调整字体大小
                fontWeight: 'bold',  // 调整字体粗细
                color: '#fff'  // 设置字体颜色
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '60',  // 调整高亮时字体大小
                  fontWeight: 'bold',
                  color: '#fff'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: this.totalFishCount, name: 'Total Fish' }
              ]
            }
          ]
        };
        chart.setOption(option);
      }
    }
  };
  </script>
  
  <style scoped>
  /* 样式可以根据需要进行调整 */
  </style>
  