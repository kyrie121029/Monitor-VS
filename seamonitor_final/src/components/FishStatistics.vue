<template>
  <div class="chart-container">
    <h2 class="chart-title">鱼类数据统计</h2>
    <div class="buttons">
      <button v-for="type in species" :key="type" @click="setSpecies(type)">{{ type }}</button>
    </div>
    <div class="buttons">
      <button @click="setMetric('Weight(g)')">Weight</button>
      <button @click="setMetric('Length1(cm)')">Length</button>
      <button @click="setMetric('Height(cm)')">Height</button>
    </div>
    <div ref="chart" class="chart"></div>
  </div>
</template>

<script>
import axios from 'axios';
import * as echarts from 'echarts';

export default {
  data() {
    return {
      chartData: [],
      metric: 'Weight(g)',
      selectedSpecies: '',
      species: [],
      chart: null,
      interval: 50 // 默认区间大小
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      console.log("Fetching data...");
      axios.get('http://localhost:3000/api/data/Fish.csv', { responseType: 'blob' })
        .then(response => {
          console.log("Data fetched successfully:", response);
          response.data.text().then(text => {
            console.log("Blob converted to text:", text);
            const data = JSON.parse(text); // 直接解析 JSON 数据
            this.processData(data);
          }).catch(error => {
            console.error("Error converting blob to text:", error);
          });
        })
        .catch(error => {
          console.error("There was an error fetching the data!", error);
        });
    },
    processData(data) {
      console.log("Processing data:", data);
      if (data.length > 0) {
        const sampleRow = data[0];
        console.log("Sample row:", sampleRow);

        if (!Object.prototype.hasOwnProperty.call(sampleRow, 'Species')) {
          console.error("CSV data does not have 'Species' column");
          return;
        }

        const speciesSet = new Set(data.map(row => row.Species));
        console.log("Species set:", speciesSet);
        this.species = Array.from(speciesSet);
        this.selectedSpecies = this.species[0];
        console.log("Species array:", this.species);
        this.chartData = data;
        console.log("Processed data:", this.chartData);
        this.initChart();
      } else {
        console.error("No data available to process.");
      }
    },
    setSpecies(species) {
      this.selectedSpecies = species;
      this.updateChart();
    },
    setMetric(metric) {
      this.metric = metric;
      this.updateInterval();
      this.updateChart();
    },
    updateInterval() {
      // 根据不同的指标设置不同的区间大小
      if (this.metric === 'Weight(g)') {
        this.interval = 50;
      } else if (this.metric === 'Length1(cm)' || this.metric === 'Length2(cm)' || this.metric === 'Length3(cm)') {
        this.interval = 1; // 设置长度的区间为1
      } else if (this.metric === 'Height(cm)' || this.metric === 'Width(cm)') {
        this.interval = 0.5; // 设置高度和宽度的区间为0.5
      }
    },
    initChart() {
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chart);
      }
      this.updateChart();
    },
    updateChart() {
      if (!this.chartData.length || !this.chart) {
        console.error("No chart data available or chart is not initialized.");
        return;
      }

      const filteredData = this.chartData.filter(row => row.Species === this.selectedSpecies);
      const aggregatedData = this.aggregateData(filteredData, this.metric);
      const categories = Array.from(aggregatedData.keys());
      const counts = Array.from(aggregatedData.values());

      console.log("Aggregated data:", aggregatedData);
      console.log("Categories:", categories);
      console.log("Counts:", counts);

      const option = {
        title: {
          text: `${this.selectedSpecies} ${this.metric} Distribution`,
          left: 'center',
          textStyle: {
            color: '#ffffff'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            color: '#ffffff',
            formatter: value => {
              const start = (value * this.interval).toFixed(1);
              const end = (parseFloat(start) + this.interval - 0.1).toFixed(1);
              return `${start}-${end}`;
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#ffffff'
          }
        },
        series: [{
          name: this.metric,
          type: 'bar',
          data: counts
        }],
        backgroundColor: 'rgba(0,0,0,0)'
      };
      console.log("Chart option:", option);
      this.chart.setOption(option);
    },
    aggregateData(data, metric) {
      const aggregated = new Map();
      const interval = this.interval; // 使用定义的区间大小
      data.forEach(row => {
        const value = Math.floor(parseFloat(row[metric]) / interval);
        if (aggregated.has(value)) {
          aggregated.set(value, aggregated.get(value) + 1);
        } else {
          aggregated.set(value, 1);
        }
      });
      return new Map([...aggregated.entries()].sort((a, b) => a[0] - b[0])); // 按照键排序
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-title {
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.buttons button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
  border-radius: 4px;
}

.buttons button:hover {
  background-color: #0056b3;
}

.chart {
  width: 100%;
  height: 400px;
}
</style>
