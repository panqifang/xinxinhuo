
import { userExchangeScoreShop, userConsumeScoreShop, shopExchangeScoreOrders, shopConsumeScoreOrders } from '../../../script/api'
import { Tab } from '../../../zanui/index'
import { UIshowUserAvatarNickname } from '../../../script/base'
const app = getApp()
let self

Page(Object.assign({}, Tab, {
    // 默认数据
    data: {
        orders: [],
        nextPage: 0,
        loading: false,
        role: 0,
        userInfo: {},
        // 积分列表类型： 0 兑换， 1 消费
        listType: 0,
        shopid: 0,
        canMore: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        if (options.orderType) {
            self.data.listType = parseInt(options.orderType)
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
            // 如果是商户，页面全局shopid
            if (memberInfo.user.role === 20) {
                self.data.shopid = memberInfo.shop.shopid
                // 更新头部信息
                let shopinfo = UIshowUserAvatarNickname({
                    avatar: memberInfo.shop.logo,
                    nickname: memberInfo.shop.title
                })
                self.data.userInfo = {
                    logo: shopinfo.avatar,
                    name: shopinfo.nickname
                }
            }
            self.data.canMore = true
            self.data.orders = []
            self.data.nextPage = 0
            self.getOrderList(1)
        })
    },

    // 获取订单数据列表
    getOrderList: function (page) {
        // 用户角色
        if (self.data.role === 10) {
            // 积分兑换订单店铺列表
            if (self.data.listType === 0) {
                userExchangeScoreShop({ page: page }).then(data => {
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
            // 积分消费订单店铺列表
            } else if (self.data.listType === 1) {
                userConsumeScoreShop({ page: page }).then(data => {
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
            }
        } else if (self.data.role === 20) {
            // 商户下积分兑换订单
            if (self.data.listType === 0) {
                shopExchangeScoreOrders({ page: page, shopid: self.data.shopid }).then(data => {
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
             // 商户下积分消费订单
            } else if (self.data.listType === 1) {
                shopConsumeScoreOrders({ page: page, shopid: self.data.shopid }).then(data => {
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
            }
        // 代理商角色和其他角色显示
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
}))