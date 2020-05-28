
import { userBackShopOrders, shopBackingOrders, shopDdhingOrders, getBackE } from '../../../script/api'
import { Tab } from '../../../zanui/index'
const app = getApp()
let self

Page(Object.assign({}, Tab,{
    // 默认数据
    data: {
        orders: [],
        nextPage: 0,
        loading: false,
        role: 0,
        userInfo: {},
        // tab
        tab: {
            list: [{
                id: 'backing',
                title: '客户队列'
            }],
            selectedId: 'backing',
            scroll: false
        },
        shopid: 0,
        canTab: true,
        canMore: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
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
            }
            self.data.canMore = true
            self.data.orders = []
            self.data.nextPage = 0
            self.getOrderList(1)
        })  
    },

    // 获取订单数据列表
    getOrderList: function (page) {
        // 用户角色显示
        if (self.data.role === 10) {
            userBackShopOrders({ page: page }).then(data => {
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
        // 商户角色显示
        } else if (self.data.role === 20) {
            // 待奖励订单
            if (self.data.tab.selectedId === 'backing') {
                getBackE({}).then(nume => {
                    let mume = parseInt(nume)
                    shopBackingOrders({ page: page, shopId: self.data.shopid }).then(data => {
                        wx.hideLoading()
                        wx.stopPullDownRefresh()
                        self.data.nextPage = data.nextPage
                        self.data.canTab = true
                        self.data.canMore = true
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
                        self.data.canTab = true
                        self.data.canMore = true
                        console.log(err)
                    })
                })
            // 天天了订单
            } else if (self.data.tab.selectedId === 'ddhing') {
                shopDdhingOrders({ page: page, shopId: self.data.shopid }).then(data => {
                    wx.hideLoading()
                    wx.stopPullDownRefresh()
                    self.data.nextPage = data.nextPage
                    self.data.canTab = true
                    self.data.canMore = true
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
                    self.data.canTab = true
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
    // 切换选项
    handleZanTabChange: function (e) {
        var componentId = e.componentId
        var selectedId = e.selectedId
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
        self.getOrderList(1)
    },
    // 头部返回
    topBack: function () {
        wx.switchTab({
            url: '/pages/user/user'
        })
    }
}))