
import { getAgentShop } from '../../../script/api'
const app = getApp()
let self

Page({
    // 默认数据
    data: {
        orders: [],
        nextPage: 0,
        loading: false,
        role: 0,
        userInfo: {},
        // 积分列表类型： 0 绑定， 1 可提现，2 未绑定
        listType: 0,
        canMore: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        if (options.m) {
            self.data.listType = parseInt(options.m)
            self.setData({ listType: self.data.listType })
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
            // 更新头部信息
            self.data.userInfo = {
                logo: memberInfo.user.avatar,
                name: memberInfo.user.nickname
            }
            self.data.role = memberInfo.user.role
            self.data.canMore = true
            self.data.orders = []
            self.data.nextPage = 0
            self.getOrderList(1)
        })
    },

    // 获取订单数据列表
    getOrderList: function (page) {
        // 用户角色
        if (self.data.role === 50 || self.data.role === 40 || self.data.role === 30) {
            // 积分兑换订单店铺列表
            getAgentShop({ page: page, type: self.data.listType }).then(data => {
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
        } else {
            self.setData({ nodata: true })
            wx.hideLoading()
            wx.stopPullDownRefresh()
        }
    },
    // 查看店铺二维码
    seeShopCode: function (e) {
        let imgurl = e.currentTarget.dataset.imgurl
        if (imgurl) {
            wx.previewImage({
                urls: [imgurl]
            })
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
            if (!self.data.canMore) {
                return
            }
            self.data.canMore = false
            self.setData({ loading: true })
            self.getOrderList(self.data.nextPage)
        }
    },
    // 头部返回
    topBack: function () {
        wx.navigateBack({ delta: 1 })
    }
})