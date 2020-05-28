import { getShopInfoByCode, openShop, shopBackedOrders, createAppOrder } from '../../script/api'

import { Toast, Field } from '../../zanui/index'
import { isPhoneNum, isMoneyNum, checkTwoFloat, getFloatThree } from '../../script/base'
const app = getApp()
let self

Page(Object.assign({}, Field, Toast, {

    /**
     * 页面的初始数据
     */
    data: {
        shop: {},
        code: '',
        role: 0,
        status: 0,
        shopid: 0,
        mobile: '',
        // 我的余额
        cash: 0,
        // 我的积分
        score: 0, 
        showBottomPopup: false,
        // 最近奖励列表
        backedList: [],
        load: false,
        nodata: false,
        // 支付订单金额
        orderMoney: 0,
        // 是否可以使用余额，
        canPay: false,
        // 是否可使用积分
        canScorePay: false,
        // 最终付款金额
        real_money: 0,
        // 使用积分
        real_score: 0,
        // 是否开启积分支付
        isScorePay: false,
        // 最大可以积分率
        pool_rate: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        // options.code = '5a436bbc'
        
        // 如果传code进来，直接使用code
        if (options.code) {
            self.data.code = options.code
        // 如果扫店铺二维码进来
        } else if (options.q) {
            // 获取二维码里面的路径信息
            let url = decodeURIComponent(options.q)
            // 处理二维码连接信息，返回code
            self.data.code = app.handleScanShopQr(url)
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.init().then(memberInfo => {
            // 如果是个人用户，获取店铺信息
            if (memberInfo.user.role === 10) {
                wx.showLoading({
                    title: '获取数据中',
                })
                self.data.role = memberInfo.user.role
                getShopInfoByCode({ code: self.data.code }).then(data => {
                    wx.hideLoading()
                    self.data.status = parseInt(data.status)
                    // 第一扫码用户执行开店
                    if (data.status === 10) {
                        wx.setNavigationBarTitle({ title: '开店协议' })
                        self.setData({ shop: data, role: self.data.role, status: self.data.status })
                    // 店铺已经营业，进入支付页面
                    } else if (data.status === 50) {
                        wx.setNavigationBarTitle({ title: '支付' })                        
                        // 全局role
                        self.data.mobile = memberInfo.user.mobile// 初始化余额
                        self.data.cash = parseFloat(memberInfo.user.cash)// 初始化余额
                        self.data.score = parseFloat(memberInfo.user.score) // 初始化积分
                        self.data.pool_rate = parseInt(data.pool_rate) // 初始化积分使用最大率
                        self.data.shopid = data.shopid // shopid
                        // 判断是否可以使用
                        if (self.data.score > 0) {
                            self.data.canScorePay = true
                        } else {
                            self.data.canScorePay = false
                        }
                        // 渲染界面
                        self.setData({ shop: data, role: memberInfo.user.role, status: self.data.status, cash: self.data.cash, score: self.data.score, canScorePay: self.data.canScorePay })
                        // 获取最近奖励商户
                        self.getBackedUser()
                    } else {

                    }
                }).catch(err => {
                    wx.hideLoading()
                    console.log(err)
                })
            // 不是个人用户，跳回用户中心
            } else {
                wx.switchTab({
                    url: '/pages/user/user',
                })
            }
        })
    },
    // 操作输入，处理输入作为订单金额
    handleZanFieldChange(e) {
        const { componentId, detail } = e;
        let val = isMoneyNum(detail.value)
        self.data.orderMoney = val
    },
    // 获取最近奖励用户
    getBackedUser: function () {
        self.setData({ load: true })
        shopBackedOrders({ page: 1, size: 10, shopid: self.data.shopid }).then(data => {
            if (data.list.length > 0) {
                self.setData({ backedList: data.list, load: false, nodata: false })
            } else {
                self.setData({ backedList: [], load: false, nodata: true })
            }
        }).catch(err => {
            console.log(err)
        })
    },
    // 弹出支付信息
    popupPay: function () {
        // 判断订单金额是否大于0
        if (self.data.orderMoney === 0) {
            return self.showZanToast('请输入支付金额')
        }
        // 判断是否可使用积分
        if (self.data.canScorePay) {
            // 计算可以积分
            self.countScorePay()
        } else {
            self.data.real_score = 0
        }
        // 判断是否可以使用余额支付
        if (checkTwoFloat(self.data.cash, self.data.orderMoney)) {
            // 开启余额按钮
            self.data.canPay = true
        } else {
            // 关闭余额支付按钮
            self.data.canPay = false
        }
        self.setData({ real_money: self.data.orderMoney, orderMoney: self.data.orderMoney, showBottomPopup: true, canPay: self.data.canPay, real_score: self.data.real_score, isScorePay: false })
    },
    // 关闭弹出支付信息
    closePopup: function () {
        self.setData({ showBottomPopup: false, isScorePay: false })
    },
    // 开启积分抵现
    radioChange: function (e) {
        // 判断是否开启积分抵现
        if (e.detail.value.length > 0) { // 开启
            self.data.isScorePay = true
            // 计算最终付款金额
            self.data.real_money = getFloatThree(self.data.orderMoney - self.data.real_score)
            // 渲染显示
            self.setData({ real_money: self.data.real_money })
        } else { // 不开启
            self.data.isScorePay = false
            self.setData({ real_money: self.data.orderMoney })
        }
    },
    // 计算积分抵现
    countScorePay: function () {
        // 计算最大可用积分
        var maxScore = getFloatThree(self.data.orderMoney * self.data.pool_rate / 100 * 0.9)
        if (checkTwoFloat(self.data.score, maxScore)) { // 积分充足，只能用最大积分
            // 计算可使用积分
            self.data.real_score = maxScore
        } else { // 积分不足，用光积分
            // 计算可使用积分
            self.data.real_score = self.data.score
        }
        // 渲染显示
        self.setData({
            real_score: self.data.real_score
        })
    },
    // 执行微信支付
    orderWxPay: function () {
        // 如果开启积分积分抵现
        let payType = 0
        if (self.data.isScorePay) {
            payType = 3
        }
        // 调用支付
        self.pay(payType)
    },
    // 执行余额支付
    orderBalancePay: function () {
        // 如果开启积分积分抵现
        let payType = 1
        if (self.data.isScorePay) {
            payType = 2
        }
        // 调用支付
        self.pay(payType)
    },
    // 执行生成订单
    pay: function (typePay) {
        let score = 0
        if (typePay === 2 || typePay === 3) {
            score = self.data.real_score
        }
        let data = {
            code: self.data.code,
            name: '微信支付：' + self.data.orderMoney + '元',
            amount: self.data.orderMoney,
            score: score,
            is_pay: typePay
        }
        wx.showLoading({
            title: '执行支付中',
        })
        // 关闭弹层
        self.setData({ showBottomPopup: false })
        createAppOrder(data).then(res => {
            wx.hideLoading()
            // 更新数据
            app.updateMemberInfoCache()
            console.log(res)
            // 调取微信支付
            if (res.type == 1 || res.type == 2) {
                wx.showToast({
                    title: '付款成功',
                    icon: 'success',
                    success: function () {
                        setTimeout(() => {
                            wx.switchTab({
                                url: '/pages/home/home'
                            })
                            return
                        }, 1500)
                    }
                })
            } else {
                wx.requestPayment({
                    'timeStamp': String(res.timeStamp),
                    'nonceStr': res.nonceStr,
                    'package': res.package,
                    'signType': res.signType,
                    'paySign': res.paySign,
                    'success': function (res) {
                        setTimeout(() => {
                            wx.switchTab({
                                url: '/pages/home/home'
                            })
                            return
                        }, 1500)
                    },
                    'complete': function (res) {
                    }
                })
            }
        }).catch(err => {
            wx.hideLoading()
            console.log(err)
        })
    },

    // -------------------------- 开店 ---------------　
    // 同意协议开店
    userOpenShop: function () {
        // 执行绑定用户
        wx.showModal({
            title: '系统提示',
            content: '此操作默认你同意开店协议',
            success: function (res) {
                wx.showLoading({
                    title: '开店中',
                })
                if (res.confirm) {
                    openShop({ code: self.data.code }).then(res => {
                        wx.hideLoading()
                        app.updateMemberInfoCache()
                        wx.showToast({
                            title: '开店成功',
                            icon: 'success',
                            success: function () {
                                setTimeout(() => {
                                    wx.redirectTo({
                                        url: '/pages/shop/setting/index',
                                    })
                                }, 1000)
                            }
                        })
                    }).catch(err => {
                        wx.hideLoading()
                        console.log(err)
                    })
                } 
            }
        })
    },
    // 不同意开店，点击取消
    openShopCannel: function () {
        wx.navigateBack({ delta: 1 })
    }
}))