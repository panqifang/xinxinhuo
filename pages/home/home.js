import { createPartnerQr, createAgentShoprQr, updateMemberInfo, dataTransferUser, userBackShopOrders, userBackingOrdersNew, getBackE } from '../../script/api'
import { UIshowUserAvatarNickname, getAppVersion, isEmptyObject } from '../../script/base'
import { formatMoney } from '../../script/func'
const app = getApp()
let self

Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: {},
        userInfo: {},
        role: 0,
        shopQr: '',
        mobile: '',
        canupdate: true,
        appType: '',
        init: false,
        merage: false,

        orders: [],
        nextPage: 0,
        canMore: true,
        loading: false,
        more: false,
        showPopup: false,
        nodata: false,

        shoporders: [],
        shopid: 0,
        orderCanMore: true,
        orderNextPage: 0,
        orderLoading: false,
        canload: false,
        notorderdata: false,
        idx: 0,
        canclick: true,
        candown:true,
        noorders: false,
        // 
        showTip: false,
        curMoney: 0
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        wx.showLoading({
            title: '数据加载中',
            mask: true
        })
        if (options.scene) {
            app.handleScanPartner(options.scene)
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.init().then(memberInfo => {
            //  获取版本
            self.data.appType = getAppVersion()
            // 全局 role
            self.data.role = memberInfo.user.role
            if (memberInfo.user.mobile) {
                self.data.mobile = memberInfo.user.mobile
            }

            // 没有头像强制跳转授权
            if (!memberInfo.user.avatar) {
                wx.navigateTo({
                    url: '/pages/user/getinfo',
                })
            }

            let users = {
                avatar: memberInfo.user.avatar,
                nickname: memberInfo.user.nickname
            }
            // 更新用户头像
            self.data.userInfo = UIshowUserAvatarNickname(memberInfo.user)
            
            self.setData({ info: memberInfo, userInfo: self.data.userInfo, mobile: self.data.mobile, appType: self.data.appType, init: true, webView: false, orders: [], role: self.data.role, })

            if (memberInfo.user.role == 10) {
                self.data.canMore = true
                self.data.nextPage = 0
                self.data.canload = false
                self.getOrderList(1)
            } else {
                wx.hideLoading()
                wx.stopPullDownRefresh()
            }
            
        })
    },

    getOrderList: function(page) {
        userBackShopOrders({ page: page, size: 100 }).then(data => {
            // 列表有数据
            if (data.list.length > 0) {

                data.list.forEach((item, i) => {
                    if (item.title.length > 4) {
                        item.title = self.changeTitle(item.title)
                    }
                })

                self.data.shopid = data.list[0].shopid
                //
                self.setData({ shoporders: [], loading: true, shoporders: [] })
                self.data.orderNextPage = 0
                self.data.orderCanMore = false
                self.getshoplist(1)
                self.setData({ orders: data.list, nodata: false, idx: self.data.shopid })
            } else {
                wx.hideLoading()
                self.setData({ nodata: true, idx: self.data.shopid })
            }
            
        }).catch(err => {
            wx.hideLoading()
            self.data.canMore = true
            console.log(err)
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        if (self.data.role == 10) {
            wx.stopPullDownRefresh()
        } else {
            wx.removeStorageSync('memberinfo')
            self.onShow()
        }
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
    // 服务商招聘合伙人
    createPartnerQr: function () {
        // 仅仅允许服务商操作
        if (self.data.role === 40) {
            wx.showModal({
                title: '温馨提示',
                content: '此操作生成招聘合伙人二维码',
                mask: true,
                confirmText: '生成',
                success: function (res) {
                    if (res.confirm) {
                        createPartnerQr({}).then(res => {
                            wx.previewImage({
                                urls: [res.url]
                            })
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                }
            })
        }
    },
    // 代理商开店
    createShopQr: function () {
        // 仅仅允许代理商商操作
        if (self.data.role === 50) {
            wx.showModal({
                title: '操作提示',
                content: '确认新开商户么？',
                success: function (res) {
                    if (res.confirm) {
                        wx.showModal({
                            title: '重要提示',
                            content: '此操作生成店铺二维码，二维码第一次被扫时绑定扫码人为店主，请妥善保管生成的二维码！',
                            mask: true,
                            confirmText: '生成',
                            success: function (res) {
                                if (res.confirm) {
                                    wx.showLoading({
                                        title: '生成二维码中',
                                    })
                                    // 执行生成开店二维码
                                    createAgentShoprQr({}).then(res => {
                                        wx.hideLoading()
                                        // 更新用户缓存信息
                                        app.updateMemberInfoCache()
                                        // 跳回用户中心
                                        wx.previewImage({
                                            urls: [res.url]
                                        })
                                    }).catch(err => {
                                        wx.hideLoading()
                                        console.log(err)
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    },
    // 点击开店
    openshop: function () {
        // 如果是代理商直接询问生成二维码
        if (self.data.role === 50) {
            self.createShopQr()
            // 服务商和合伙人直接跳转开店页面
        } else if (self.data.role === 40 || self.data.role === 30) {
            wx.navigateTo({
                url: '/pages/shop/open/index',
            })
        }
    },
    // 商户显示二维码
    showShopQe: function () {
        // 仅仅允许商户商操作
        if (self.data.role === 20 && self.data.info.shop) {
            const codeImageUrl = self.data.info.shop.codeImageUrl
            if (!codeImageUrl) {
                return
            }
            wx.previewImage({
                urls: [codeImageUrl]
            })
        }
    },
    // 清除缓存
    clearCache: function () {
        wx.showLoading({
            title: '清除缓存中',
            mask: true
        })
        wx.clearStorageSync()
        setTimeout(() => {
            wx.hideLoading()
            self.onShow()
        }, 500)
    },
    // 分享
    onShareAppMessage: function () {
        return {
            title: wx.getStorageSync('appinfo').name,
            path: '/pages/home/home'
        }
    },
    showShopOrders: function (e) {
        const shopid = e.currentTarget.dataset.shopid
        if (self.data.shopid != shopid && self.data.canclick) {
            self.data.canclick = false
            self.data.shopid = shopid
            self.setData({ shoporders: [], loading: true, idx: shopid, canload: false, noorders: false })
            self.data.orderNextPage = 0
            self.getshoplist(1)
        }
    },
    closeMask: function () {
        self.setData({ showPopup: false })
    },
    orderSeeMore: function () {
        if (self.data.orderNextPage !== 0) {
            if (!self.data.orderCanMore) {
                return
            }
            self.data.orderCanMore = false
            self.setData({ loading: true, canload: false })
            self.getshoplist(self.data.orderNextPage)
        }
    },
    getshoplist: function (page) {
        userBackingOrdersNew({ page: page, shopId: self.data.shopid, size: 10 }).then(data => {
            wx.hideLoading()
            // 列表有数据
            self.data.orderCanMore = true
            self.data.canclick = true
            self.data.candown = true
            self.data.orderNextPage = data.nextPage
            if (data.nextPage > 0) {

                self.setData({ canload: true })
            } else {
                self.setData({ canload: false })
            }
            // 判断是否是新的订单
            wx.getStorage({
                key: 'orderChange',
                success: function (res) {
                    const loac = res.data[self.data.shopid][data.lastPage]
                    userBackingOrdersNew({ page: data.lastPage, shopId: self.data.shopid, size: 10 }).then(lastData => {
                        if (lastData.list.length > 0) {
                            const redata = lastData.list[lastData.list.length - 1]
                            let momey = Math.floor(redata.intelligenceBackMoney * 100) / 100
                            if (!momey) {
                                momey = Math.floor(redata.money * 1000) / 1000
                            }
                            if (loac[redata.orderid]) {
                                self.setData({
                                    showTip: false,
                                    curMoney: 0
                                })
                            } else {
                                self.setData({
                                    showTip: true,
                                    curMoney: momey
                                })
                            }
                        } else {
                            self.setData({
                                showTip: false,
                                curMoney: 0
                            })
                        }

                    })
                },
                fail: function(res) {
                    userBackingOrdersNew({ page: data.lastPage, shopId: self.data.shopid, size: 10 }).then(lastData => {
                        if (lastData.list.length > 0) {
                            const redata = lastData.list[lastData.list.length - 1]
                            let momey = Math.floor(redata.intelligenceBackMoney * 100) / 100
                            if (!momey) {
                                momey = Math.floor(redata.money * 1000) / 1000
                            }
                            self.setData({
                                showTip: true,
                                curMoney: momey
                            })
                        } else {
                            self.setData({
                                showTip: false,
                                curMoney: 0
                            })
                        }

                    })
                }
            })
            
            // 判断是否最后一页
            if (self.data.role == 10 && data.list.length > 0) {
                // 判断是否最后一页
                let page = data.nextPage - 1
                if (data.nextPage == 0) {
                    page = data.pages
                }
                var redata = self.saveFiveChange(page, data.list)
                // console.log(redata)
                if (!isEmptyObject(redata)) {
                    wx.setStorage({
                        key: 'orderChange',
                        data: redata
                    })
                }
            }
            if (data.list.length > 0) {
                data.list.forEach((item, i) => {
                    if (item.switcher == 4) {
                        item.isdown = self.getOrderlog(item.orderid, redata)
                        item.relMomey = Math.floor(item.intelligenceBackMoney * 100) / 100
                    } else {
                        item.relMomey = item.money
                    }
                    self.data.shoporders.push(item)
                    self.setData({ shoporders: self.data.shoporders, loading: false })
                })
            } else {
                self.setData({ loading: false, notorderdata: true })
            }

            if (self.data.shoporders.length > 0) {
                self.setData({ noorders: false })
            } else {
                self.setData({ noorders: true })
            }
        }).catch(err => {
            wx.hideLoading()
        })
    },
    // 查看订单详情
    backInfo: function (e) {
        let slot = e.currentTarget.dataset.slot
        let orderid = e.currentTarget.dataset.orderid
        let cash = e.currentTarget.dataset.cash
        let shopid = self.data.shopid
        let switcher = e.currentTarget.dataset.switcher
        self.setData({ showPopup: false })
        if (switcher == 4) {
            wx.navigateTo({
                url: '/pages/list/backinfo/index?shopid=' + self.data.shopid + '&orderid=' + orderid + '&cash=' + cash + '&slot=' + slot + '&shopid=' + shopid,
            })
        } else {
            wx.showModal({
                title: '系统提示',
                content: '该订单不是智能返订单',
                showCancel: false
            })
        }
    },

    // 存储最近五次变动金额
    saveFiveChange: function (page, orders) {
        const self = this
        // 获取缓存数据
        let result = wx.getStorageSync('orderChange') || {}
        // 判断是否缓存有当前店铺订单数据
        if (isEmptyObject(result) || !result[self.data.shopid]) {
            let backinfo = {}
            let orderInfo = {}
            orders.forEach((item, i) => {
                const money = Math.floor(item.intelligenceBackMoney * 100) / 100
                orderInfo[item.orderid] = { money: [money], up: true }
            })
            backinfo[page] = orderInfo
            result[self.data.shopid] = backinfo
        } else {
            // 获取当前店铺订单缓存
            let cacheShopOrders = result[self.data.shopid]
            const curPageCacheData = cacheShopOrders[page]
            // 如果存在当前页数据
            if (curPageCacheData) {
                let backdata = {}
                // 获取新数据
                let newDta = {}
                orders.forEach((item, i) => {
                    newDta[item.orderid] = Math.floor(item.intelligenceBackMoney * 100) / 100
                })
                // 遍历
                for (let key in newDta) {
                    // 判断缓存是否存在当前订单
                    if (curPageCacheData[key]) {
                        backdata[key] = self.isInArray(newDta[key], curPageCacheData[key].money)
                    } else {
                        const newdata = newDta[key]
                        backdata[key] = { money: [newdata], up: true }
                    }
                }
                cacheShopOrders[page] = backdata
            } else {
                let orderInfo = {}
                orders.forEach((item, i) => {
                    const money = Math.floor(item.intelligenceBackMoney * 100) / 100
                    orderInfo[item.orderid] = { money: [money], up: true }
                })
                cacheShopOrders[page] = orderInfo
            }
            result[self.data.shopid] = cacheShopOrders
        }
        return result
    },
    // 判断是否跟你上一次订单一样
    isInArray: function (sum, arr) {
        if (sum != arr[arr.length - 1]) {
            arr.push(sum)
        }
        // 判断是否小于上次，是的话更新为降
        if (sum < arr[arr.length - 1]) {
            return { money: arr, up: false }
        } else {
            return { money: arr, up: true }
        }
    },
    // 获取订单的次数
    getOrderlog: function (orderid, curArr) {
        const self = this
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
        const arr = bacObj[orderid].money
        arr.forEach((item, i) => {
            if (arr.length <= 5) {
                resarr.push(item)
            } else {
                if (i >= arr.length - 5) {
                    resarr.push(item)
                }
            }
        })
        // 如果最后一次小于最后第二次，为降落
        if (resarr[resarr.length - 1] < resarr[resarr.length - 2]) {
            return true
        } else {
            return false
        }
    },
    // 店铺格式成4个字
    changeTitle: function (title) {
        return title.substring(0, 4)
    },
    closeTip: function () {
        self.setData({
            showTip: false,
            curMoney: 0
        })
    }
})