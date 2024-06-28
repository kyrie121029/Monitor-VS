<template>
  <div :class="['weather-chart-container', currentWeatherClass]">
    <div class="weather-chart-header">
      <h2>{{ city }} 天气</h2>
      <div class="navigation-buttons">
        <button class="nav-btn" @click="changeData('temp')">温度</button>
        <button class="nav-btn" @click="changeData('wind')">风力</button>
        <button class="nav-btn" @click="changeData('humidity')">湿度</button>
        <button class="nav-btn" @click="changeData('uv')">紫外线</button>
        <button class="nav-btn" @click="changeData('rain')">降水</button>
      </div>
    </div>
    <div class="weather-chart">
      <canvas id="weatherChart"></canvas>
    </div>
    <div class="arrow-buttons">
      <button @click="previous" class="arrow-btn">&lt;</button>
      <button @click="next" class="arrow-btn">&gt;</button>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
  </div>
</template>

<script>
import axios from 'axios'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { zhCN } from 'date-fns/locale'
import ChartDataLabels from 'chartjs-plugin-datalabels'

Chart.register(...registerables, ChartDataLabels)

export default {
  name: 'WeatherChart',
  data() {
    return {
      loading: true,
      data: [],
      currentDataType: 'temp',
      city: '天津',
      weatherChart: null,
      currentPage: 0,
      itemsPerPage: 8,
      currentWeather: 'sunny', // 默认天气
    }
  },
  computed: {
    paginatedData() {
      const start = this.currentPage * this.itemsPerPage
      return this.data.slice(start, start + this.itemsPerPage)
    },
  currentWeatherClass() {
    const currentHour = new Date().getHours()
    const isRaining = this.currentWeather.includes('rain')
    if (isRaining) {
      return 'rain'
    } else if (currentHour >= 19 || currentHour < 6) {
      return 'night'
    } else {
      return 'sunny'
    }
  }
},

  methods: {
    async fetchData() {
  const API_KEY = '7f873139e29356287898de1ee8b4354f'
  const CITY = 'Tianjin,CN'
  const URL = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&appid=${API_KEY}`

  try {
    const response = await axios.get(URL)
    console.log('API Response:', response.data)

    if (response.data && response.data.list) {
      this.data = response.data.list.map(entry => ({
        t: new Date(entry.dt * 1000),
        temp: entry.main.temp,
        wind: entry.wind.speed,
        windDir: this.getWindDirection(entry.wind.deg),
        windLevel: this.getWindLevel(entry.wind.speed),
        humidity: entry.main.humidity,
        uv: entry.main.uvi || 0,
        rain: entry.rain ? entry.rain['3h'] : 0,
        weather: entry.weather[0].main,
        icon: `http://openweathermap.org/img/wn/${entry.weather[0].icon}.png`
      }))

      if (this.data.length > 0) {
        this.currentWeather = this.data[0].weather.toLowerCase()
        console.log('Current Weather:', this.currentWeather)
      } else {
        console.log('No weather data available.')
      }

      this.renderChart()
    } else {
      console.log('Invalid API response.')
    }

    this.loading = false
  } catch (error) {
    console.error('Error fetching weather data:', error)
  }
},
    renderChart() {
      const ctx = document.getElementById('weatherChart').getContext('2d')
      const labels = this.paginatedData.map(entry => entry.t)
      const data = this.paginatedData.map(entry => entry[this.currentDataType])

      if (this.weatherChart) {
        this.weatherChart.destroy()
      }

      this.weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: this.getLabel(this.currentDataType),
            backgroundColor: 'rgba(0, 0, 0, 0)',
            borderColor: 'rgba(255, 255, 255, 1)', // 更显眼的颜色
            data: data,
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgba(255, 255, 255, 1)', // 更显眼的颜色
            pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)', // 更显眼的颜色
            pointBorderColor: 'rgba(0, 0, 0, 1)',
            pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
            showLine: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour',
                tooltipFormat: 'MM/dd HH:mm',
                displayFormats: {
                  hour: 'MM/dd HH:mm'
                }
              },
              adapters: {
                date: {
                  locale: zhCN
                }
              },
              title: {
                display: true,
                text: '时间',
                color: '#fff'
              },
              grid: {
                display: false
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10,
                color: '#fff'
              }
            },
            y: {
              display: false
            }
          },
          plugins: {
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => `${value}${this.getUnit(this.currentDataType)}`,
              font: {
                size: 12
              },
              color: 'white'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y
                  return `${value}${this.getUnit(this.currentDataType)}`
                }
              }
            }
          }
        }
      })
    },
    getLabel(dataType) {
      switch (dataType) {
        case 'temp':
          return '温度 (°C)'
        case 'wind':
          return '风速 (m/s)'
        case 'humidity':
          return '湿度 (%)'
        case 'uv':
          return '紫外线指数'
        case 'rain':
          return '降水 (mm)'
        default:
          return ''
      }
    },
    getUnit(dataType) {
      switch (dataType) {
        case 'temp':
          return '°C'
        case 'wind':
          return ' m/s'
        case 'humidity':
          return '%'
        case 'uv':
          return ''
        case 'rain':
          return ' mm'
        default:
          return ''
      }
    },
    getWindDirection(deg) {
      const directions = ['北', '北东北', '东北', '东东北', '东', '东东南', '东南', '南东南', '南', '南西南', '西南', '西西南', '西', '西西北', '西北', '北西北']
      const index = Math.round(deg / 22.5) % 16
      return directions[index]
    },
    getWindLevel(speed) {
      if (speed < 0.3) return '无风'
      if (speed < 1.6) return '1级'
      if (speed < 3.4) return '2级'
      if (speed < 5.5) return '3级'
      if (speed < 8.0) return '4级'
      if (speed < 10.8) return '5级'
      if (speed < 13.9) return '6级'
      if (speed < 17.2) return '7级'
      if (speed < 20.8) return '8级'
      if (speed < 24.5) return '9级'
      if (speed < 28.5) return '10级'
      if (speed < 32.7) return '11级'
      return '12级或以上'
    },
    changeData(dataType) {
      this.currentDataType = dataType
      this.renderChart()
    },
    next() {
      if ((this.currentPage + 1) * this.itemsPerPage < this.data.length) {
        this.currentPage++
        this.renderChart()
      }
    },
    previous() {
      if (this.currentPage > 0) {
        this.currentPage--
        this.renderChart()
      }
    }
  },
  mounted() {
  console.log('Component mounted.')
  this.fetchData()
}
}
</script>

<style scoped>
.weather-chart-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  border-radius: 10px;
  padding: 20px;
  position: relative;
  background-size: cover;
  background-position: center;
  color: #fff; /* 确保文字在背景图片上清晰可见 */
}

.sunny {
  background-image: url('@/assets/sunny.jpg');
}

.night {
  background-image: url('@/assets/night.jpg');
}

.rain {
  background-image: url('@/assets/rain.jpg');
}

.weather-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.navigation-buttons {
  display: flex;
  gap: 10px;
}

.nav-btn {
  padding: 10px 20px;
  border: none;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 1);
}

.weather-chart {
  position: relative;
  height: 400px;
}

.arrow-buttons {
  display: flex;
  justify-content: space-between;
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}

.arrow-btn {
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.arrow-btn:hover {
  background-color: rgba(255, 255, 255, 1);
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: #000;
}
</style>
