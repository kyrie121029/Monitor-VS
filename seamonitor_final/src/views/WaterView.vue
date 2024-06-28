<template>
  <div>
    <h2>Water Quality Information</h2>
    <div>
      <label for="datePicker">Select Date: </label>
      <vue-datepicker-local
        id="datePicker"
        v-model="selectedDate"
        format="YYYY/MM/DD"
        @input="fetchWaterQualityData"
      ></vue-datepicker-local>
    </div>
    <div v-if="waterQualityData && waterQualityData.length">
      <h3>Water Quality Data for {{ selectedDate }}</h3>
      <div class="container">
        <div class="button-group">
          <button @click="showData('水温（℃）', 'range')">水温（℃）</button>
          <button @click="showData('水质类别', 'count')">水质类别</button>
          <button @click="showData('pH(无量纲)', 'range')">pH(无量纲)</button>
          <button @click="showData('溶氧量(mg/L)', 'range')">溶氧量(mg/L)</button>
          <button @click="showData('电导率（μS/cm）', 'range')">电导率（μS/cm）</button>
          <button @click="showData('浊度（NTU）', 'range')">浊度（NTU）</button>
          <button @click="showData('高锰酸盐指数（mg/L）', 'range')">高锰酸盐指数（mg/L）</button>
          <button @click="showData('氨氮（mg/L）', 'range')">氨氮（mg/L）</button>
          <button @click="showData('总磷（mg/L）', 'range')">总磷（mg/L）</button>
          <button @click="showData('总氮（mg/L）', 'range')">总氮（mg/L）</button>
          <button @click="showData('站点情况', 'status')">站点情况</button>
        </div>
        <div class="info-container" v-if="displayData">
          <h4>{{ displayData.title }}</h4>
          <ul>
            <li v-for="(value, key) in displayData.data" :key="key">{{ key }}: {{ value }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import VueDatepickerLocal from 'vue-datepicker-local'
import 'vue-datepicker-local/dist/vue-datepicker-local.css'

export default {
  name: 'WaterView',
  components: {
    VueDatepickerLocal
  },
  data() {
    return {
      selectedDate: null,
      waterQualityData: null,
      displayData: null
    }
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // 月份从0开始
      const day = date.getDate()
      return `${year}/${month}/${day}`
    },
    async fetchWaterQualityData() {
      if (!this.selectedDate) return
      try {
        const formattedDate = this.formatDate(new Date(this.selectedDate))
        console.log(`Formatted date: ${formattedDate}`)
        const response = await axios.get(`http://localhost:3000/api/water-quality?date=${formattedDate}`)
        this.waterQualityData = response.data
      } catch (error) {
        console.error('Error fetching water quality data:', error)
      }
    },
    showData(metric, type) {
      if (type === 'range') {
        const values = this.waterQualityData.map(item => parseFloat(item[metric])).filter(value => !isNaN(value))
        const min = Math.min(...values)
        const max = Math.max(...values)

        this.displayData = {
          title: `Range for ${metric}`,
          data: {
            Minimum: min,
            Maximum: max
          }
        }
      } else if (type === 'count') {
        const counts = {}
        this.waterQualityData.forEach(item => {
          const value = item[metric]
          if (counts[value]) {
            counts[value]++
          } else {
            counts[value] = 1
          }
        })

        this.displayData = {
          title: `Counts for ${metric}`,
          data: counts
        }
      } else if (type === 'status') {
        const counts = { 正常: 0, 不正常: 0 }
        this.waterQualityData.forEach(item => {
          const value = item[metric]
          if (value === '正常') {
            counts.正常++
          } else {
            counts.不正常++
          }
        })

        this.displayData = {
          title: 'Status counts for 站点情况',
          data: counts
        }
      }
    }
  }
}
</script>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 20px;
}

div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

label {
  margin-right: 10px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.button-group {
  display: flex;
  flex-direction: row; /* 从 column 改为 row */
  flex-wrap: wrap; /* 允许按钮换行 */
  justify-content: center; /* 居中对齐 */
  gap: 10px;
  margin-bottom: 20px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #45a049;
}

.info-container {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 4px;
  width: 400px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #fff;
  border: 1px solid #ddd;
  margin-bottom: 5px;
  padding: 10px;
  border-radius: 4px;
}
</style>

