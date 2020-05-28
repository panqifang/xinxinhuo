
import {
    userBackingOrdersNew,
    userDdhingOrders,
    shopBackingOrdersNew,
    orderOutQueueGetMoney,
    orderOutQueue,
    orderToScore,
    getBackE
} from '../../../script/api'
import { Tab } from '../../../zanui/index'
import { formatMoney } from '../../../script/func'
const app = getApp()
let self

Page(Object.assign({}, Tab, {

    data: {
        orders: [],
        nextPage: 0,
        role: 0,
        loading: false,
        tab: {
            list: [{
                id: 'queue',
                title: '店铺队列'
            }],
            selectedId: 'order',
            scroll: false
        },
        shopid: 0,
        // 双击
        clickNum: 0,
        isTwoClick: false,
        canTab: true,
        canMore: true,
        money: 0,
        show: false,
        orderid: 0,
        top: 0,
        slot: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        if (options.shopid) {
            self.data.shopid = options.shopid
        }
        if (options.selectid) {
            self.data.tab.selectedId = options.selectid
            self.setData({
                tab: self.data.tab
            })
        } 
        wx.showLoading({
            title: '数据加载中',
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.init().then(memberInfo => {
            self.data.canMore = true
            self.data.role = memberInfo.user.role
            self.data.orders = []
            self.data.nextPage = 0
            self.data.slot = 0
            self.getOrderList(1)
        })
    },

    // 获取订单数据列表
    getOrderList: function (page) {
        // 仅仅允许用户身份访问
        if (self.data.role === 10) {
            // 正在待返订单
            if (self.data.tab.selectedId === 'order') {
                getBackE({}).then(mume => {
                    let nums = parseInt(mume)
                    userBackingOrdersNew({ page: page, shopId: self.data.shopid }).then(data => {
                        wx.hideLoading()
                        wx.stopPullDownRefresh()
                        self.data.nextPage = data.nextPage
                        self.data.canTab = true
                        self.data.canMore = true
                        // 列表有数据
                        if (data.list.length > 0) {
                            data.list.forEach((item, i) => {
                                item.shopid = parseInt(self.data.shopid)
                                if (item.switcher == 4) {
                                    let slot = parseInt(item.slot)
                                    let money = parseFloat(item.total_fee)
                                    let num = parseInt(item.backingNum)
                                    let t = parseFloat(item.coefficient)
                                    console.log(slot + '-' + money + '-' + num + '-' + t)
                                    // 计算获取待返金额
                                    item.relMomey = formatMoney(app.getBackMoney(slot, money, num, t, nums))
                                    // 存最近待返金额
                                    let olddata = self.saveMoney(item.orderid, item.relMomey)
                                    item.oldMoney = olddata[item.orderid]
                                } else {
                                    item.relMomey = item.money
                                }
                                self.data.orders.push(item)
                            })
                            self.setData({ orders: self.data.orders, loading: false, role: self.data.role, nodata: false })
                        } else {
                            self.setData({ orders: [], loading: false, role: self.data.role, nodata: true })
                        }
                    }).catch(err => {
                        wx.hideLoading()
                        wx.stopPullDownRefresh()
                        self.data.canTab = true
                        self.data.canMore = true                    
                        console.log(err)
                    })
                })
            // 待开奖天天乐
            } else if (self.data.tab.selectedId === 'ddh') {
                userDdhingOrders({ page: page, shopId: self.data.shopid }).then(data => {
                    wx.hideLoading()
                    wx.stopPullDownRefresh()
                    self.data.nextPage = data.nextPage
                    self.data.canTab = true                    
                    // 列表有数据
                    if (data.list.length > 0) {
                        data.list.forEach((item, i) => {
                            self.data.orders.push(item)
                        })
                        self.setData({ orders: self.data.orders, loading: false, role: self.data.role, nodata: false })
                    } else {
                        self.setData({ orders: [], loading: false, role: self.data.role, nodata: true })
                    }
                }).catch(err => {
                    wx.hideLoading()
                    wx.stopPullDownRefresh()
                    self.data.canTab = true
                    self.data.canMore = true                    
                    console.log(err)
                })
            } else if (self.data.tab.selectedId === 'queue') {
                shopBackingOrdersNew({ page: page, shopId: self.data.shopid, size: 20 }).then(data => {
                    wx.hideLoading()
                    wx.stopPullDownRefresh()
                    self.data.nextPage = data.nextPage
                    self.data.canTab = true
                    self.data.canMore = true
                    // 列表有数据
                    if (data.list.length > 0) {
                        data.list.forEach((item, i) => {
                            if (item.switcher == 4 && item.intelligenceBackMoney) {
                                item.relMomey = Math.floor(item.intelligenceBackMoney * 100) / 100
                            } else {
                                item.relMomey = item.money
                            }
                            self.data.orders.push(item)
                        })
                        self.setData({ orders: self.data.orders, loading: false, role: self.data.role, nodata: false })
                    } else {
                        self.setData({ orders: [], loading: false, role: self.data.role, nodata: true })
                    }
                }).catch(err => {
                    wx.hideLoading()
                    wx.stopPullDownRefresh()
                    self.data.canTab = true
                    self.data.canMore = true
                    console.log(err)
                })
            }
        } else {
            wx.hideLoading()
            self.setData({ nodata: true })
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (self.data.nextPage !== 0) {
            if (!self.data.canMore) {
                return
            }
            self.data.canMore = false
            self.setData({ loading: true })
            self.getOrderList(self.data.nextPage)
        }
    },
    // 切换tab
    handleZanTabChange(e) {
        var componentId = e.componentId;
        var selectedId = e.selectedId;
        if (!self.data.canTab) {
            return
        }
        self.setData({
            [`${componentId}.selectedId`]: selectedId,
            orders: [], 
            loading: true,
            nodata: false
        })
        self.data.canTab = false
        self.data.canMore = true
        self.data.nextPage = 0
        self.data.slot = 0
        self.getOrderList(1)
    },
    // 用户双击订单处理
    doubleClick: function () {
        return new Promise((resolve, reject) => {
            if (self.data.isTwoClick) {
                self.data.clickNum++
            } else {
                self.data.isTwoClick = true
                self.data.clickNum++
                setTimeout(function () {
                    self.data.isTwoClick = false
                    self.data.clickNum = 0
                }, 800)
            }
            if (self.data.clickNum > 2) {
                return;
            } else if (self.data.clickNum === 2) {
                resolve()
            }
        })
    },
    // 操作消除订单
    removeDefaultQueueTap: function (e) {
        // 仅仅允许用户自己操作
        if (self.data.role !== 10) {
            return
        }
        // 仅仅允许用户自己的待奖励订单进行操作
        if (self.data.tab.selectedId !== 'order') {
            return
        }
        let orderId = parseInt(e.currentTarget.dataset.orderid)
        self.doubleClick().then(() => {
            // 弹层显示需要执行的操作
            wx.showActionSheet({
                itemList: ['该订单兑换积分', '退出当前排队'],
                success: function (res) {
                    if (res.tapIndex == 0) {
                        self.addDefaultScore(orderId)
                    } else if (res.tapIndex == 1) {
                        self.outDefaultQueue(orderId)
                    }
                },
                fail: function (res) {

                }
            })
        })
    },
    // 订单退出排队
    outDefaultQueue: function (orderId) {
        wx.showModal({
            title: "系统提示",
            content: '是否把该订单退出排队，退出排队后将放弃奖励',
            confirmText: '确认退出',
            success: function (res) {
                if (res.confirm) {
                    // 执行退出
                    wx.showLoading({
                        title: '执行退出排队中',
                    })
                    orderOutQueue({ orderid: orderId }).then(res => {
                        wx.showToast({
                            title: '退出成功',
                            icon: 'success',
                            success: function () {
                                setTimeout(() => {
                                    self.onShow()
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
    // 订单兑换积分
    addDefaultScore: function (orderId) {
        wx.showModal({
            title: "温馨提示",
            content: '确认该订单退出排队换取积分？',
            confirmText: '确认兑换',
            success: function (res) {
                if (res.confirm) {
                    //  执行操作
                    wx.showLoading({
                        title: '执行兑换中',
                    })
                    orderToScore({ orderId: orderId }).then(res => {
                        wx.showToast({
                            title: '兑换成功',
                            icon: 'success',
                            success: function () {
                                setTimeout(() => {
                                    self.onShow()
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
    // 智能发订单点击
    backingClick: function () {
        return new Promise((resolve, reject) => {
            resolve()
        })
    },
    // 智能发订单操作消除订单
    removeQueueTap: function (e) {
        // 仅仅允许用户自己操作
        if (self.data.role !== 10) {
            return
        }
        // 仅仅允许用户自己的待奖励订单进行操作
        if (self.data.tab.selectedId !== 'order') {
            return
        }
        // 仅仅支持智能返操作
        if (e.currentTarget.dataset.iszn != 4) {
            return
        }
        let orderId = parseInt(e.currentTarget.dataset.orderid)
        let money = e.currentTarget.dataset.money
        self.data.top = e.currentTarget.dataset.slot
        self.backingClick().then(() => {
            // 弹层显示需要执行的操作
            self.setData({ show: true, money: money, orderid: orderId })
        })
    },
    // 订单退出排队
    outQueue: function () {
        let orderId = self.data.orderid
        self.setData({ show: false })
        wx.showModal({
            title: "系统提示",
            content: '是否把该订单退出排队，具体以实际到账为准',
            confirmText: '确认退出',
            success: function (res) {
                if (res.confirm) {
                    // 执行退出
                    wx.showLoading({
                        title: '执行兑换中',
                    })
                    orderOutQueueGetMoney({ orderid: orderId, top: self.data.top }).then(res => {
                        wx.showToast({
                            title: '兑换成功',
                            icon: 'success',
                            success: function () {
                                setTimeout(() => {
                                    self.onShow()
                                }, 1500)
                            }
                        })
                    }).catch(err => {
                        // 退出失败执行
                        console.log(err)
                    })
                } else {
                    self.setData({ orderid: 0 })
                }
            }
        })
    },
    // 订单兑换积分
    addScore: function () {
        let orderId = self.data.orderid
        self.setData({ show: false })
        wx.showModal({
            title: "温馨提示",
            content: '确认该订单退出排队换取积分？',
            confirmText: '确认兑换',
            success: function (res) {
                if (res.confirm) {
                    //  执行操作
                    wx.showLoading({
                        title: '执行兑换中',
                    })
                    orderToScore({ orderId: orderId }).then(res => {
                        wx.showToast({
                            title: '兑换成功',
                            icon: 'success',
                            success: function () {
                                setTimeout(() => {
                                    self.onShow()
                                }, 1500)
                            }
                        })
                    }).catch(err => {
                        // 退出失败执行
                        console.log(err)
                    })
                } else {
                    self.setData({ orderid: 0 })
                }
            }
        })
    },
    cannelOut: function () {
        this.setData({ show: false, orderid: 0 })
    },
    // 查看订单详情
    backInfo: function (e) {
        let slot = e.currentTarget.dataset.slot
        let orderid = e.currentTarget.dataset.orderid
        let cash = e.currentTarget.dataset.cash
        let shopid = e.currentTarget.dataset.shopid
        wx.navigateTo({
            url: '/pages/list/backinfo/index?shopid=' + self.data.shopid + '&orderid=' + orderid + '&cash=' + cash + '&slot=' + slot + '&shopid=' + shopid,
        })
    },
    // 奖励存波动
    saveMoney: function (orderid, cash) {
        // 判断是否存在数据
        if (wx.getStorageSync('oidBackindMoney')) {
            let newHistory = wx.getStorageSync('oidBackindMoney')
            // 判断当前订单是否存在数据
            if (newHistory[orderid]) {
                let orderData = newHistory[orderid]
                // 删除相同搜索
                app.removeByValue(orderData, cash)
                // 如果数组大于等于5 ，删除第一个
                if (orderData.length >= 5) {
                    orderData.splice(0, 1)
                }
                // 添加
                orderData.push(cash)
                newHistory[orderid] = orderData
            } else {
                let arr = []
                arr.push(cash)
                newHistory[orderid] = arr
            }
            wx.setStorageSync('oidBackindMoney', newHistory)
            return newHistory
        } else {
            let result = {}
            let arr = []
            arr.push(cash)
            result[orderid] = arr
            wx.setStorageSync('oidBackindMoney', result)
            return result
        }
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        self.onShow()
    }
}))