<template>
  <div class="dashboard-wrapper">
    <!-- 数据概览卡片 -->
    <div class="stat-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-header">
          <i class="el-icon-shopping-cart-full stat-icon"></i>
          <div class="stat-title">本月订单</div>
        </div>
        <div class="stat-value">
          <count-to :startVal="0" :endVal="orderStats.currentMonthOrders" :duration="2000">
          </count-to>
        </div>
        <div class="stat-footer">
          较上月
          <span :class="orderTrend >= 0 ? 'up' : 'down'">
            {{ orderStats.growthRate }}
            <i :class="orderTrend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
          </span>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-header">
          <i class="el-icon-money stat-icon"></i>
          <div class="stat-title">本月销售额</div>
        </div>
        <div class="stat-value">
          ¥<count-to :startVal="0" :endVal="salesStats.currentMonthSales" :duration="2000" :decimals="2">
          </count-to>
        </div>
        <div class="stat-footer">
          较上月
          <span :class="saleTrend >= 0 ? 'up' : 'down'">
            {{ salesStats.growthRate }}
            <i :class="saleTrend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
          </span>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-header">
          <i class="el-icon-user stat-icon"></i>
          <div class="stat-title">今年用户数</div>
        </div>
        <div class="stat-value">
          <count-to :startVal="0" :endVal="userStats.currentYearUsers" :duration="2000">
          </count-to>
        </div>
        <div class="stat-footer">
          较去年
          <span :class="userTrend >= 0 ? 'up' : 'down'">
            {{ userStats.growthRate }}
            <i :class="userTrend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
          </span>
        </div>
      </el-card>
    </div>

    <div class="content-wrapper">
      <!-- 热销商品TOP5图表 -->
      <el-card class="chart-card" shadow="hover">
        <div slot="header" class="chart-header">
          <span>热销商品 TOP5</span>
          <el-button type="text" @click="fetchTopProducts">刷新</el-button>
        </div>
        <div class="chart-content">
          <div ref="topProductsChart" class="chart"></div>
        </div>
      </el-card>

      <!-- 品类销售占比图表 -->
      <el-card class="chart-card" shadow="hover">
        <div slot="header" class="chart-header">
          <span>品类销售占比</span>
          <el-button type="text" @click="fetchCategoryStats">刷新</el-button>
        </div>
        <div class="chart-content">
          <div ref="categoryChart" class="chart"></div>
        </div>
      </el-card>
    </div>

    <!-- 通知公告 -->
    <div class="content-wrapper">
      <el-card class="notice-card" shadow="hover">
        <div slot="header" class="notice-header">
          <span>通知公告</span>
          <el-button type="text" @click="fetchData">刷新</el-button>
        </div>
        <div class="notice-content">
          <el-timeline>
            <el-timeline-item v-for="(notice, index) in announcements" :key="index" :timestamp="notice.time" :type="getNoticeType(notice.type)">
              <el-card class="notice-item" shadow="never">
                <h4>{{ notice.title }}</h4>
                <p class="notice-text">{{ notice.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Timeline, TimelineItem, Card, Button } from 'element-ui'
import CountTo from 'vue-count-to'
import Request from '../utils/request.js'
import * as echarts from 'echarts'

export default {
  name: 'ShowView',
  components: {
    [Card.name]: Card,
    [Timeline.name]: Timeline,
    [TimelineItem.name]: TimelineItem,
    [Button.name]: Button,
    CountTo
  },
  data() {
    return {
      noticeLimit: 10,
      announcements: [],
      // 统计数据
      orderStats: {
        currentMonthOrders: 0,
        lastMonthOrders: 0,
        growthRate: '0.00%'
      },
      salesStats: {
        currentMonthSales: 0,
        lastMonthSales: 0,
        growthRate: '0.00%'
      },
      userStats: {
        currentYearUsers: 0,
        lastYearUsers: 0,
        growthRate: '0.00%'
      },
      // 热销商品数据
      topProductsChart: null,
      topProducts: [],
      // 添加品类统计数据
      categoryChart: null,
      categoryStats: []
    }
  },
  computed: {
    // 计算订单增长率数值（去掉百分号）
    orderTrend() {
      return parseFloat(this.orderStats.growthRate)
    },
    // 计算销售额增长率数值
    saleTrend() {
      return parseFloat(this.salesStats.growthRate)
    },
    // 计算用户增长率数值
    userTrend() {
      return parseFloat(this.userStats.growthRate)
    }
  },
  created() {
    this.fetchData()
    this.fetchStatistics()
    this.fetchTopProducts()
    this.fetchCategoryStats()
  },
  mounted() {
    this.initTopProductsChart()
    this.initCategoryChart()
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    if (this.topProductsChart) {
      this.topProductsChart.dispose()
    }
    if (this.categoryChart) {
      this.categoryChart.dispose()
    }
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    // 获取通知数据
    fetchData() {
      Request.get("/notice/limit", {
        params: {
          count: this.noticeLimit
        }
      }).then(response => {
        if (response.code === '0') {
          this.announcements = response.data
        }
      })
    },
    // 获取统计数据
    fetchStatistics() {
      // 获取订单统计
      Request.get("/statistics/orders/monthly").then(response => {
        if (response.code === '0') {
          this.orderStats = response.data
        }
      })

      // 获取销售额统计
      Request.get("/statistics/sales/monthly").then(response => {
        if (response.code === '0') {
          this.salesStats = response.data
        }
      })

      // 获取用户统计
      Request.get("/statistics/users/yearly").then(response => {
        if (response.code === '0') {
          this.userStats = response.data
        }
      })
    },
    getNoticeType(type) {
      const types = {
        1: 'primary',   // 普通通知
        2: 'success',   // 活动通知
        3: 'warning',   // 重要通知
        4: 'danger'     // 紧急通知
      }
      return types[type] || 'primary'
    },
    // 初始化图表
    initTopProductsChart() {
      this.topProductsChart = echarts.init(this.$refs.topProductsChart)
      this.updateTopProductsChart()
    },

    // 更新图表数据
    updateTopProductsChart() {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}: {c}件'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => value + '件'
          }
        },
        yAxis: {
          type: 'category',
          data: this.topProducts.map(item => item.name).reverse(),
          axisLabel: {
            formatter: (value) => {
              if (value.length > 10) {
                return value.substring(0, 10) + '...'
              }
              return value
            }
          }
        },
        series: [{
          name: '销售数量',
          type: 'bar',
          data: this.topProducts.map(item => item.salesCount).reverse(),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        }]
      }
      this.topProductsChart.setOption(option)
    },

    // 获取热销商品数据
    async fetchTopProducts() {
      try {
        const response = await Request.get('/statistics/products/top5')
        if (response.code === '0' && response.data.topProducts) {
          this.topProducts = response.data.topProducts
          this.$nextTick(() => {
            this.updateTopProductsChart()
          })
        }
      } catch (error) {
        console.error('获取热销商品数据失败:', error)
      }
    },

    // 初始化品类图表
    initCategoryChart() {
      this.categoryChart = echarts.init(this.$refs.categoryChart)
      this.updateCategoryChart()
    },

    // 更新品类图表数据
    updateCategoryChart() {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [
          {
            name: '品类销售',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true
            },
            data: this.categoryStats.map(item => ({
              name: item.name,
              value: item.salesCount
            }))
          }
        ],
        color: [
          '#409EFF', '#67C23A', '#E6A23C', '#F56C6C',
          '#909399', '#36CBCB', '#FFA2D3', '#9A60B4'
        ]
      }
      this.categoryChart.setOption(option)
    },

    // 获取品类统计数据
    async fetchCategoryStats() {
      try {
        const response = await Request.get('/statistics/category/sales')
        if (response.code === '0' && response.data.categoryStats) {
          this.categoryStats = response.data.categoryStats
          this.$nextTick(() => {
            this.updateCategoryChart()
          })
        }
      } catch (error) {
        console.error('获取品类统计数据失败:', error)
      }
    },

    // 统一处理图表缩放
    resizeCharts() {
      if (this.topProductsChart) {
        this.topProductsChart.resize()
      }
      if (this.categoryChart) {
        this.categoryChart.resize()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.dashboard-wrapper {
  padding: 20px;
}

.stat-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  min-width: 240px;

  .stat-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  .stat-icon {
    font-size: 24px;
    margin-right: 12px;
    color: #409eff;
  }

  .stat-title {
    font-size: 16px;
    color: #606266;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 16px;
  }

  .stat-footer {
    font-size: 14px;
    color: #909399;

    .up {
      color: #67c23a;
    }

    .down {
      color: #f56c6c;
    }
  }
}

.content-wrapper {
  display: flex;
  gap: 20px;
  margin-top: 20px;

  .chart-card {
    flex: 1;
    min-width: 400px;
  }

  .notice-card {
    flex: 1;
    min-width: 400px;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.chart-content {
  height: 400px;
  .chart {
    width: 100%;
    height: 100%;
  }
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.notice-content {
  max-height: 600px;
  overflow-y: auto;
}

.notice-item {
  margin-bottom: 8px;

  h4 {
    margin: 0 0 8px;
    color: #303133;
  }

  .notice-text {
    color: #606266;
    margin: 0;
    line-height: 1.6;
  }
}

:deep(.el-timeline-item__node--primary) {
  background-color: #409eff;
}

:deep(.el-timeline-item__node--success) {
  background-color: #67c23a;
}

:deep(.el-timeline-item__node--warning) {
  background-color: #e6a23c;
}

:deep(.el-timeline-item__node--danger) {
  background-color: #f56c6c;
}

/* 确保图表容器有最小高度 */
.chart {
  min-height: 300px;
}

/* 适配小屏幕 */
@media screen and (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;

    .chart-card,
    .notice-card {
      width: 100%;
    }
  }
}
</style>