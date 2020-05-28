
import { getSalesShop } from '../../../script/api'
import { formatDate } from '../../../script/func'
import config from '../../../config'
const app = getApp()
let self

Page({
    // 默认数据
    data: {
        totaFees: 0,
        orders: [],
        nextPage: 0,
        loading: false,
        role: 0,
        shopid: 0,
        total: 0,
        totalSales: 0,
        discout: 0,
        // 
        startDate:'',
        endDate: '',
        startTime: '',
        lastTime: '',
        //
        beginStartDate: '',
        beginEndDate: '',
        lastStartDate: '',
        lastEndDate: '',
        //
        beginEndTime: '',
        lastStartTime: '',
        lastEndTime: '',
        //
        canMore: true,
        time: '12:23',
        // 结果时间
        beginTime: '',
        endTime: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        // 获取时间
        var thisDate = new Date()
        // 获取当前日期作为结束日期
        var endDate = formatDate(thisDate)
        // 获取前一天作为开始日期
        thisDate.setDate(thisDate.getDate() - 0);
        var startDate = formatDate(thisDate)
        // 获取当前时间作为最后时间
        var lastTime = thisDate.getHours() + ':' + thisDate.getMinutes()
        var startTime = '00:00'
        // 初始化可查询的时间段
        self.data.startDate = startDate
        self.data.endDate = endDate
        self.data.lastTime = lastTime
        self.data.startTime = startTime
        // 
        self.data.beginTime = startDate + ' ' + startTime
        self.data.endTime = endDate + ' ' + lastTime
        // 
        // 渲染日期
        self.setData({ endDate: self.data.endDate, startDate: self.data.startDate, lastTime: self.data.lastTime, startTime: self.data.startTime, beginEndDate: self.data.endDate, lastEndDate: self.data.endDate, lastStartDate: self.data.startDate, lastEndTime: lastTime })
        wx.showLoading({
            title: '数据加载中',
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.init().then(memberInfo => {
            self.data.role = memberInfo.user.role
            // 如果是商户，页面全局shopid
            if (memberInfo.user.role === 20) {
                self.data.shopid = memberInfo.shop.shopid
            }
            self.data.canMore = true
            self.data.orders = []
            self.data.nextPage = 0
            self.getOrderList(1)
            wx.hideLoading()
        })
    },

    // 获取订单数据列表
    getOrderList: function (page) {
        // 用户角色显示
        if (self.data.role === 20) {
            getSalesShop({ page: page, shopid: self.data.shopid, beginTime: self.data.beginTime, endTime: self.data.endTime }).then(data => {
                wx.hideLoading()
                wx.stopPullDownRefresh()
                self.data.nextPage = data.nextPage
                self.data.canMore = true
                // 列表有数据
                if (data.list.length > 0) {
                    data.list.forEach((item, i) => {
                        item.create_time = formatDate(item.create_time)
                        self.data.orders.push(item)
                    })
                    self.setData({ orders: self.data.orders, loading: false, role: self.data.role, nodata: false, userInfo: self.data.userInfo, total: data.total, totalSales: data.totalSales, discout: data.discout, totaFees: data.totaFees })
                } else {
                    self.setData({ orders: [], loading: false, role: self.data.role, nodata: true, userInfo: self.data.userInfo, total: data.total, totalSales: data.totalSales, discout: data.discout, totaFees: data.totaFees  })
                }
            }).catch(err => {
                self.data.canMore = true
                console.log(err)
            })
            // 商户角色显示
        } else {
            self.setData({ nodata: true })
            wx.hideLoading()
            wx.stopPullDownRefresh()
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        self.data.canMore = true
        self.data.orders = []
        self.data.nextPage = 0
        self.getOrderList(1)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (self.data.nextPage !== 0) {
            self.setData({ loading: true })
            self.getOrderList(self.data.nextPage)
        }
    },
    // 开始选择日期
    bindStartDateChange: function (e) {
        const time = e.detail.value
        wx.showLoading({
            title: '数据加载中',
            mask: true
        })
        // 判断是否今天
        let thisDate = new Date()
        let curDate = formatDate(thisDate)
        let lastd = thisDate.getHours() + ':' + thisDate.getMinutes()
        if (time == curDate) {
            self.data.beginEndTime = lastd
            self.data.lastEndTime = lastd
        } else {
            self.data.beginEndTime = ''
            self.data.lastEndTime = ''
        }
        self.setData({
            startDate: time,
            lastStartDate: time,
            orders: [],
            beginEndTime: self.data.beginEndTime,
            lastEndTime: self.data.lastEndTime,
            lastTime: lastd,
            startTime: '00:00'
        })
        self.data.beginTime = time + ' ' + self.data.startTime
        self.data.canMore = true
        self.data.nextPage = 0
        self.getOrderList(1)
    },
    bindStartTimeChange: function (e) {
        const time = e.detail.value
        wx.showLoading({
            title: '数据加载中',
            mask: true
        })
        let thisDate = new Date()
        let curDate = formatDate(thisDate)
        let lastd = thisDate.getHours() + ':' + thisDate.getMinutes()
        if (self.data.startDate == self.data.endDate) {
            self.data.lastStartTime = time
            self.data.beginEndTime = lastd
        } else {
            self.data.lastStartTime = ''
            self.data.beginEndTime = ''
        }
        self.setData({
            startTime: time,
            orders: [],
            lastStartTime: self.data.lastStartTime,
            beginEndTime: self.data.beginEndTime
        })
        self.data.beginTime = self.data.startDate + ' ' + time
        self.data.canMore = true
        self.data.nextPage = 0
        self.getOrderList(1)
    },
    // 结束选择时间
    bindEndDateChange: function (e) {
        const time = e.detail.value
        wx.showLoading({
            title: '数据加载中',
            mask: true
        })
        // 判断是否今天
        let thisDate = new Date()
        let curDate = formatDate(thisDate)
        let lastd = thisDate.getHours() + ':' + thisDate.getMinutes()
        if (time == curDate) {
            self.data.beginEndTime = lastd
            self.data.lastEndTime = lastd
            self.data.lastTime = lastd
        } else {
            self.data.beginEndTime = ''
            self.data.lastEndTime = ''
            self.data.lastTime = '00:00'
        }
        self.setData({
            endDate: time,
            beginEndDate: time,
            orders: [],
            beginEndTime: self.data.beginEndTime,
            lastEndTime: self.data.lastEndTime,
            lastTime: self.data.lastTime 
        })
        self.data.endTime = time + ' ' + self.data.lastTime
        self.data.canMore = true
        self.data.nextPage = 0
        self.getOrderList(1)
    },
    bindEndTimeChange: function (e) {
        const time = e.detail.value
        wx.showLoading({
            title: '数据加载中',
            mask: true
        })
        let thisDate = new Date()
        let curDate = formatDate(thisDate)
        let lastd = thisDate.getHours() + ':' + thisDate.getMinutes()
        if (self.data.startDate == self.data.endDate) {
            self.data.beginEndTime = time
        } else {
            self.data.beginEndTime = ''
        }
        self.setData({
            lastTime: time,
            orders: [],
            beginEndTime: self.data.beginEndTime
        })
        self.data.endTime = self.data.endDate + ' ' + time
        self.data.canMore = true
        self.data.nextPage = 0
        self.getOrderList(1)
    },
    // 头部返回
    topBack: function () {
        wx.switchTab({
            url: '/pages/user/user'
        })
    },
    export: function () {
        wx.showModal({
            title: '导出提示',
            content: '默认以开始日期为时间进行导出，是否继续',
            success: function (res) {
                if (res.confirm) {
                    let sid = wx.getStorageSync('session').sid
                    wx.showLoading({
                        title: '导出中，请稍后',
                        mask: true
                    })
                    wx.downloadFile({
                        url: config.host + '/api/merchant/sales/export?sid=' + sid + '&date=' + self.data.startDate,
                        success: function (res) {
                            wx.hideLoading()
                            console.log(res)
                            if (res.statusCode === 200) {
                                wx.showLoading({
                                    title: '保存中，请稍后',
                                    mask: true
                                })
                                wx.saveFile({
                                    tempFilePath: res.tempFilePath,
                                    success: function (res) {
                                        wx.hideLoading()
                                        wx.openDocument({
                                            filePath: res.savedFilePath,
                                            success: function (res) {
                                                console.log('打开文档成功')
                                            }
                                        })
                                    }
                                })
                            }
                        },
                        fail: function () {
                            console.log(res)
                        }
                    })
                }
            }
        })
    }
})