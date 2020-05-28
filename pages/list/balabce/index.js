import { bablanceLog } from '../../../script/api'
import { formatDate } from '../../../script/func'
const app = getApp()
let self

Page({
    // 默认数据
    data: {
        orders: [],
        nextPage: 0,
        loading: false,
        role: 0,
        money: 0,
        canMore: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        var thisDate = new Date()
        var endDate = formatDate(thisDate)
        thisDate.setDate(thisDate.getDate() - 180);
        var startDate = formatDate(thisDate)
        // 初始化可查询的时间段
        self.data.date = endDate
        self.data.startDate = startDate
        self.data.endDate = endDate

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
            if (memberInfo.user.role === 30 || memberInfo.user.role === 40 || memberInfo.user.role === 50) {
                self.data.money = memberInfo.agent.moneyout
            } else {
                self.data.money = memberInfo.user.cash
            }
            self.setData({
                date: self.data.date,
                startDate: self.data.startDate,
                endDate: self.data.endDate,
                money: self.data.money
            })
            self.data.canMore = true
            self.data.orders = []
            self.data.nextPage = 0
            self.getOrderList(1)
        })
    },

    // 获取订单数据列表
    getOrderList: function (page) {
        // 用户角色
        bablanceLog({ page: page, startTime: self.data.date }).then(data => {
            wx.hideLoading()
            wx.stopPullDownRefresh()
            self.data.nextPage = data.nextPage
            self.data.canMore = true
            // 列表有数据
            if (data.list.length > 0) {
                data.list.forEach((item, i) => {
                    self.data.orders.push(item)
                })
                self.setData({ orders: self.data.orders, loading: false, role: self.data.role, nodata: false, userInfo: self.data.userInfo })
            } else {
                self.setData({ orders: [], loading: false, role: self.data.role, nodata: true, userInfo: self.data.userInfo })
            }
        }).catch(err => {
            self.data.canMore = true
            console.log(err)
        })
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
            if (!self.data.canMore) {
                return
            }
            self.data.canMore = false
            self.setData({ loading: true })
            self.getOrderList(self.data.nextPage)
        }
    },
    // 更改日期查询
    bindDateChange: function (e) {
        self.setData({
            date: e.detail.value
        })
        wx.showLoading({
            title: '数据加载中',
        })
        self.data.canMore = true
        self.data.orders = []
        self.data.nextPage = 0
        self.getOrderList(1)
    },
    // 滑动开始处理
    touchStart: function (e) {
        this.touchStemp = e.timeStamp
        this.touchpageX = e.changedTouches[0].pageX
        this.touchpageY = e.changedTouches[0].pageY
    },
    // 滑动结束
    touchEnd: function (e) {
        if (e.timeStamp - this.touchStemp < 100) {
            return
        }
        if (Math.abs(e.changedTouches[0].pageY - this.touchpageY) > 45) {
            return
        }
        if (Math.abs(e.changedTouches[0].pageX - this.touchpageX) < 45) {
            return
        }
        if (e.changedTouches[0].pageX > this.touchpageX) {
            // 左划
            if (this.data.date == this.data.endDate) {
                return;
            }
            var date = new Date(this.data.date.replace(/-/g, "/"))
            date.setDate(date.getDate() + 1)
        } else {
            if (this.data.date == this.data.startDate) {
                return;
            }
            var date = new Date(this.data.date.replace(/-/g, "/"))
            date.setDate(date.getDate() - 1)
        }
        console.log(date)
        self.setData({ date: formatDate(date) })
        wx.showLoading({
            title: '数据加载中',
        })
        self.data.canMore = true
        self.data.orders = []
        self.data.nextPage = 0
        self.getOrderList(1)
    },
    viewBackList: function () {
        wx.navigateTo({
            url: '/pages/list/balancecount/index',
        })
    }
})