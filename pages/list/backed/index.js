
import { 
    userDdhedOrders, 
    userBackedOrders, 
    shopBackedOrders,
    receive 
} from '../../../script/api'
import { Tab } from '../../../zanui/index'
import { UIshowUserAvatarNickname, getAppVersion } from '../../../script/base'
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
        appType: '',
        // tab
        tab: {
            list: [{
                id: 'backed',
                title: '已奖励订单'
            }],
            selectedId: 'backed',
            scroll: false
        },
        shopid: 0,
        // 双击
        clickNum: 0,
        isTwoClick: false,
        canTab: true,
        canMore: true,
        appType: ''
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
            //  获取版本
            self.data.appType = getAppVersion()
            self.setData({ appType: self.data.appType })
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
        // 用户角色显示
        if (self.data.role === 10) {
            // 获取已奖励订单
            if (self.data.tab.selectedId === 'backed') {
                userBackedOrders({ page: page }).then(data => {
                    wx.hideLoading()
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
            // 获取已开奖天天乐订单
            } else if (self.data.tab.selectedId === 'ddhed') {
                userDdhedOrders({ page: page }).then(data => {
                    wx.hideLoading()
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
            // 商户角色显示
        } else if (self.data.role === 20) {
            shopBackedOrders({ page: page, shopid: self.data.shopid }).then(data => {
                wx.hideLoading()
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
            // 代理商角色和其他角色显示
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
    // 切换选项
    handleZanTabChange: function (e) {
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
        self.getOrderList(1)
    },
    // 头部返回
    topBack: function () {
        wx.navigateBack({ delta: 1 })
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
    // 标记已经领取
    receiveTap: function (e) {
        self.doubleClick().then(() => {
            // 仅仅允许到店领的操作
            if (self.data.appType !== 'shop') {
                return
            }
            // 仅仅允许用户自己操作
            if (self.data.role !== 10) {
                return
            }
            // 仅仅允许用户自己的待奖励订单进行操作
            if (self.data.tab.selectedId !== 'backed') {
                return
            }
            let isback = parseInt(e.currentTarget.dataset.isback)
            // 仅仅允许未领取的操作
            if (isback !== 20) {
                return
            }
            let orderId = parseInt(e.currentTarget.dataset.orderid)
            wx.showModal({
                title: "系统提示",
                content: '是否标记为已领取？',
                confirmText: '确认领取',
                success: function (res) {
                    if (res.confirm) {
                        receive({ orderid: orderId }).then(res => {
                            wx.showToast({
                                title: '领取成功',
                                icon: 'success',
                                success: function () {
                                    setTimeout(() => {
                                        self.onShow()
                                    }, 1500)
                                }
                            })
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                }
            })
        })
    }
}))