import {
    userBackingOrdersNew,
    shopBackingOrdersNew,
    orderOutQueueGetMoney
} from '../../../script/api'
import wxCharts from '../../../zanui/wxcharts'
import { formatMoney } from '../../../script/func'
const app = getApp()
let self

// 定义line 图表
var lineChart = null;
// 定义area 图表
var areaChart = null;

Page({

    data: {
        orderid: 0,
        shopid: 19,
        slot: 0,
        areaChart: {},
        lineChart: {},
        cash: 0,
        role: 0
    },

    onLoad: function (options) {
        self = this
        if (options.orderid) {
            self.data.orderid = options.orderid
        }
        if (options.shopid) {
            self.data.shopid = options.shopid
        }
        if (options.slot) {
            self.setData({ slot: options.slot })
        }
        if (options.cash) {
            self.data.cash = options.cash
        }
        wx.showLoading({
            title: '数据加载中',
        })
    },
    onShow: function () {
        app.init().then(memberInfo => {
            self.data.role = memberInfo.user.role
            self.setData({ cash: self.data.cash })
            // 加载图表数据
            self.loadLineData()
            self.loadAreaData()
        })
    },
    // 加载line图表数据
    loadLineData: function () {
        var windowWidth = 320;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }

        this.createSimulationData().then(simulationData => {
            self.data.lineChart = new wxCharts({
                canvasId: 'lineCanvas',
                type: 'line',
                categories: simulationData.categories,
                animation: true,
                series: [{
                    name: '消费人次',
                    data: simulationData.data
                }],
                xAxis: {
                    disableGrid: true
                },
                yAxis: {
                    title: '奖励比例 (0% - 100%)',
                    format: function (val) {
                        let yText = formatMoney(val.toFixed(2)) * 100 
                        return yText + '%';
                    },
                    min: 0,
                    max: 1
                },
                width: windowWidth,
                height: 200,
                dataLabel: false,
                dataPointShape: false,
                extra: {
                    lineStyle: 'curve'
                }
            });
            
        })
    },
    // 加载区域图表数据
    loadAreaData: function () {
        const self = this
        var windowWidth = 320;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
        self.getOrderlog().then(data => {
            let back = data
            let num = [];
            data.forEach((item, i) => {
                num.push((i + 1))
            })
            self.data.areaChart = new wxCharts({
                canvasId: 'areaCanvas',
                type: 'column',
                categories: num,
                animation: true,
                series: [{
                    name: '最近奖励',
                    data: data,
                    format: function (val) {
                        return val;
                    }
                }],
                yAxis: {
                    title: '奖励金额（元）',
                    format: function (val) {
                        return val.toFixed(2);
                    },
                    min: 0
                },
                xAxis: {
                    disableGrid: true
                },
                extra: {
                    legendTextColor: ''
                },
                width: windowWidth,
                height: 200
            });
        })
    },


    touchLineHandler: function (e) {
        self.data.lineChart.showToolTip(e, {
            // background: '#7cb5ec',
            format: function (item, category) {
                console.log(item.data)
                return '奖励比例:' + Math.floor(item.data * 10000) / 10000 * 100 + '%'
            }
        });
    },
    // 获取奖励数据
    createSimulationData: function () {
        return new Promise((resolve) => {
            shopBackingOrdersNew({ page: 1, shopId: self.data.shopid, size: 20 }).then(data => {
                wx.hideLoading()
                if (data) {
                    let listdata = data.list
                    var categories = [];
                    var data = [];
                    listdata.forEach((item, i) => {
                        if (i < 20) {
                            let momey = 0
                            if (item.switcher == 4) {
                                let slot = i + 1
                                let money = parseFloat(item.total_fee)
                                let num = parseInt(item.backingNum)
                                let t = parseFloat(item.coefficient)
                                // 计算获取待返金额
                                momey = app.getBackMoney(slot, money, num, t)
                            } else {
                                momey = item.money
                            }
                            let moneyPx = formatMoney(momey / item.total_fee)
                            categories.push((i + 1));
                            data.push(moneyPx);
                        }
                        
                    })
                    // data[4] = null;
                    resolve({
                        categories: categories,
                        data: data
                    })
                }
            }).catch(err => {
                wx.hideLoading()
                console.log(err)
            })
        })
    },
    topBackingList: function () {
        wx.navigateTo({
            url: '/pages/list/backing/index?selectid=queue&shopid=' + self.data.shopid
        })
    },
    // 获取订单的缓存记录
    getOrderlog: function () {
        const self = this
        return new Promise((resolve) => {
            // 获取缓存数据
            let curArr = wx.getStorageSync('orderChange')
            // 获取当前缓存店铺数据
            const curdata = curArr[self.data.shopid]
            // 格式数据
            let bacObj = {}
            if (curdata) {
                for (let key in curdata) {
                    for (let k in curdata[key]) {
                        bacObj[k] = curdata[key][k]
                    }
                }
            }
            let resarr = []
            // 返回最后个
            const arr = bacObj[self.data.orderid].money
            arr.forEach((item, i) => {
                if (arr.length <= 5) {
                    resarr.push(item)
                } else {
                    if (i >= arr.length - 5) {
                        resarr.push(item)
                    }
                }
            })
            resolve(resarr)
        })
    },
    // 智能发订单操作消除订单
    removeQueueTap: function (e) {
        // 仅仅允许用户自己操作
        if (self.data.role !== 10) {
            return
        }
        wx.showModal({
            title: '系统提示',
            content: '是否领取该金额，具体以实际到账为准',
            success: function (res) {
                if (res.confirm) {
                    // 执行退出
                    wx.showLoading({
                        title: '执行领取中',
                    })
                    orderOutQueueGetMoney({ orderid: self.data.orderid, top: self.data.slot }).then(res => {
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            success: function () {
                                setTimeout(() => {
                                    wx.navigateBack()
                                }, 1500)
                            }
                        })
                    }).catch(err => {
                        // 退出失败执行
                        console.log(err)
                    })
                } 
            }
        })
    },
})