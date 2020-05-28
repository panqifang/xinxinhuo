
import { userBackShopOrders, shopBackingOrders, shopDdhingOrders, dataTransferUser, wantToJoin, updateMemberInfo, homeGetinfo, getBackE } from '../../script/api'
import { Tab, Toast } from '../../zanui/index'
import { formatMoney } from '../../script/func'
import { UIshowUserAvatarNickname, getAppVersion, isPhoneNum } from '../../script/base'
const app = getApp()
let self

Page(Object.assign({}, Tab, Toast, {
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
        canMore: true,
        merage: false,
        slot: 0,
        canupdate: true,
        wiperdata: []
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

            // 更新用户头像
            self.data.userInfo = UIshowUserAvatarNickname(memberInfo.user)

            self.setData({ info: memberInfo, userInfo: self.data.userInfo })

            // 获取可合并用户
            if (memberInfo.user.mobile) {
                dataTransferUser({ mobile: memberInfo.user.mobile }).then(data => {
                    if (data.length > 0) {
                        self.setData({ merage: true })
                    } else {
                        self.setData({ merage: false })
                    }
                }).catch(err => {
                    self.setData({ merage: false })
                })
            } else {
                self.setData({ merage: false })
            }
            homeGetinfo({ size: 15 }).then(res => {
                let list = res.list
                res.list.forEach((item, i) => {
                    item.nickname = item.nickname.substring(0, 5)
                })
                let leng = list.length > 5 ? list.length : 5
                let size = Math.floor(leng / 5)
                let rs = []
                for (let i = 0; i < size; i++) {
                    let arr = []
                    list.forEach((item, a) => {
                        if (Math.floor(a / 5) == i) {
                            arr.push(item)
                        }
                    })
                    rs.push(arr)
                }
                self.setData({
                    wiperdata: rs
                })
            })

            self.data.canMore = true
            self.data.orders = []
            self.data.nextPage = 0
            self.data.slot = 0
            self.getOrderList(1)
        })
    },

    // 获取订单数据列表
    getOrderList: function (page) {
        // 用户角色显示
        if (self.data.role === 10) {
            wx.hideLoading()
            wx.stopPullDownRefresh()
            self.setData({ role: self.data.role })
            // 商户角色显示
        } else if (self.data.role === 20) {
            // 待奖励订单
            if (self.data.tab.selectedId === 'backing') {
                shopBackingOrders({ page: page, shopId: self.data.shopid }).then(data => {
                    wx.hideLoading()
                    wx.stopPullDownRefresh()
                    self.data.nextPage = data.nextPage
                    self.data.canTab = true
                    self.data.canMore = true
                    // 列表有数据
                    if (data.list.length > 0) {
                        data.list.forEach((item, i) => {
                            if (item.switcher == 4) {
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
                    self.data.canTab = true
                    self.data.canMore = true
                    console.log(err)
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
        self.data.slot = 0
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
        self.data.slot = 0
        self.getOrderList(1)
    },
    // 头部返回
    topBack: function () {
        wx.switchTab({
            url: '/pages/user/user'
        })
    },
    // 执行绑定
    formSubmit: function (e) {
        let formValue = e.detail.value
        // 判读手机号码
        if (formValue.mobile == '') {
            return self.showZanToast('请输入手机号码')
        }
        // 判读手机号码是否正确
        if (!isPhoneNum(formValue.mobile)) {
            return self.showZanToast('请输入正确手机号码')
        }

        wantToJoin({ mobile: formValue.mobile, type: '' }).then(res => {
            app.updateMemberInfoCache()
            wx.showToast({
                title: '提交成功',
                icon: 'success'
            })
        }).catch(err => {
            console.log(err)
        })
    },
    // 点击头像更新信息
    updateUserInfo: function () {
        if (!self.data.canupdate) {
            return
        }
        self.data.canupdate = false
        wx.showLoading({
            title: '更新信息中',
            mask: true
        })
        wx.clearStorageSync()
        wx.setStorageSync('phoneBind', true);
        updateMemberInfo().then(data => {
            wx.hideLoading()
            self.data.canupdate = true
            self.onShow()
            wx.showModal({
                title: '更新成功',
                content: '因为微信的头像缓存机制，如果未更新，请24小时后重新更新',
                showCancel: false
            })
        }).catch(err => {
            self.data.canupdate = true
            console.log(err)
        })
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        wx.removeStorageSync('memberinfo')
        self.onShow()
    },
    callphone: function () {
        wx.makePhoneCall({
            phoneNumber: '18003006699' //仅为示例，并非真实的电话号码
        })
    }
}))