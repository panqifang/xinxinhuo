import { requestGet, requestPut } from '../../assets/utils/request'
import { getFloatThree, checkTwoFloat, toCeil, toTwoNum } from '../../assets/utils/func'
import config from '../../assets/config'
import { add, sub, mul, div } from '../../assets/utils/calc';
const { getMemberInfo, globalData, modules } = getApp()

Page({

    data: {
        // 输入金额
        payMoney: 0,
        // 用户默认的
        cash: 0,
        score: 0,
        maxCash: 0,
        // 计算后的显示
        realCash: 0,
        realMoney: 0,
        realScore: 0,
        // 是否开启积分抵现--功能开启
        openScorePay: modules.openScorePay,
        // 是否开启余额抵现--功能开启
        openBalancePay: modules.openBalancePay,
        // 是否使用积分抵现
        useScorePay: false,
        useBalancePay: false,
        useHbPay: false,
        // 余额足够后不能使用积分
        maxCashNoScore: true,
        // 最大可用积分率
        poolRate: 0,
        isPay: false,
        envelope_rate: 0,
        hb: 0,
        realhb: 0,
        realhb2: 0,
        backCash: 0,
        deductionRatio: 1,
        maxHbMoney: 0,
        canuse: true,
        firstHb: 0
    },
    onLoad: function (options) {
        this.options = options
        console.log(this.options)
        // 智能反不开启积分抵现功能
        // if (options.switcher && (options.switcher == 4 || options.switcher == 12)) {
        //     this.setData({ openScorePay: false })
        // } else {
        //     this.setData({ openScorePay: true })
        // }
    },
    onShow: function () {
        const self = this
        // 有数据传人执行
        if (self.options.code && self.options.money && self.options.poolRate) {
            self.sid = wx.getStorageSync('session').sid
            self.shopid = parseInt(self.options.shopid)
            self.data.payMoney = parseFloat(self.options.money)
            self.data.poolRate = parseFloat(self.options.poolRate)
            if (wx.getStorageSync('memberinfo').user.cash) {
                self.data.cash = wx.getStorageSync('memberinfo').user.cash
            }
            if (wx.getStorageSync('memberinfo').user.score) {
                self.data.score = wx.getStorageSync('memberinfo').user.score
            }
            // 红包最大比例
            if (self.options.deductionRatio) {
                self.data.deductionRatio = div(parseInt(self.options.deductionRatio), 100)
                self.setData({ canuse: true })
            } else {
                self.setData({ canuse: false })
            }

            // 红包最大使用
            self.data.maxHbMoney = mul(self.data.payMoney, self.data.deductionRatio)

            // 判断是否开启红包
            if (self.options.hb == 'true') {
                const envelopeRate = parseFloat(self.options.envelope_rate)
                self.data.envelope_rate = envelopeRate
                requestGet('/orders/pay-first-order', { sid: self.sid, shopid: self.shopid }).then(({ success, data, msg }) => {
                    if (success && data.intelligenceBackMoney) {
                        self.data.firstHb = data.intelligenceBackMoney
                        const hb = data.intelligenceBackMoney
                        self.data.hb = hb
                        // 判断是否可以使用红包
                        if(hb > 0) {
                            // 判断红包翻倍是否足够支付
                            let maxHb = mul(hb, envelopeRate)
                            if (sub(maxHb, self.data.maxHbMoney) >= 0) {
                                const realhb = toCeil(div(self.data.maxHbMoney, envelopeRate))
                                self.data.realhb = realhb
                                self.data.realhb2 = toTwoNum(self.data.maxHbMoney)
                                self.data.backCash = sub(hb, self.data.realhb)
                            } else {
                                self.data.realhb = hb
                                self.data.realhb2 = toTwoNum(maxHb)
                                self.data.backCash = 0
                            }
                        }
                        self.setData({ hb: self.data.hb, realhb: self.data.realhb, realhb2: self.data.realhb2, backCash: self.data.backCash })
                    }
                })
            }

            // 计算最大可以使用的余额
            if (self.data.payMoney * 1000 < self.data.cash * 1000) {
                self.data.maxCash = toTwoNum(self.data.payMoney)
            } else {
                self.data.maxCash = toTwoNum(self.data.cash)
            }

            self.data.realCash = self.data.maxCash

            // 开启积分抵现功能后计算使用积分抵现的钱
            if (self.data.openScorePay && self.data.score > 0) {
                self.countScorePay(self.data.score)
            }

            self.setData({ cash: self.data.cash, score: self.data.score, realMoney: self.data.payMoney, realCash: self.data.realCash, maxCash: self.data.maxCash })
        }
    },
    // 计算积分抵现
    countScorePay: function (score) {
        const self = this
        // 计算最大可用积分
        let maxScore = getFloatThree(self.data.payMoney * self.data.poolRate / 100 * 0.9)
        if (checkTwoFloat(score, maxScore)) { // 积分充足，只能用最大积分
            // 计算可使用积分
            self.data.realScore = toTwoNum(maxScore)
        } else { // 积分不足，用光积分
            // 计算可使用积分
            self.data.realScore = toTwoNum(score)
        }
        // 渲染显示
        self.setData({
            realScore: self.data.realScore
        })
    },
    // 开启积分抵现
    openScoreBtn: function (e) {
        this.data.useScorePay = e.detail.value
        this.countPay()
    },
    // 开启余额抵现
    openBalanceBtn: function (e) {
        this.data.useBalancePay = e.detail.value
        this.countPay()
    },
    openHbBtn: function (e) {
        this.data.useHbPay = e.detail.value
        this.countPay()
    },

    countPay: function () {
        const self = this
        const money = toTwoNum(self.data.payMoney)
        self.data.realmoney = toTwoNum(self.data.payMoney)
        // 先扣积分(积分不可能全抵扣)
        if (self.data.useScorePay) {
            self.data.realmoney = sub(self.data.realmoney, self.data.realScore)
        }
        // 重新计算可用红包
        self.countHb()
        // 再扣红包（红包可能全抵扣)
        if (self.data.useHbPay) {
            self.data.realmoney = sub(self.data.realmoney, self.data.realhb2)
        }
        // 重新计算可用余额
        self.countCash()
        // 再扣余额（余额可能全抵扣)
        if (self.data.useBalancePay) {
            self.data.realmoney = sub(self.data.realmoney, self.data.realCash)
        }
        // 结果
        self.setData({
            realMoney: self.data.realmoney,
            realhb: self.data.realhb,
            realhb2: self.data.realhb2,
            realCash: self.data.realCash,
            backCash: self.data.backCash
        })
    },
    // 计算可用红包
    countHb: function () {
        const self = this;
        // 判断红包是否够钱支付
        let maxHb = mul(self.data.hb, self.data.envelope_rate)
        // 红包翻倍足够抵扣
        if (sub(maxHb, self.data.maxHbMoney) >= 0) {
            let maxMoney = self.data.maxHbMoney
            // 最大抵扣钱大于要付金额
            if (sub(self.data.maxHbMoney, self.data.realmoney) >= 0) {
                maxMoney = self.data.realmoney
            }
            const realhb = toCeil(div(maxMoney, self.data.envelope_rate))
            self.data.realhb = realhb
            self.data.realhb2 = toTwoNum(maxMoney)
            self.data.backCash = sub(self.data.hb, self.data.realhb)
        }
    },
    countCash: function () {
        const self = this;
        // 判断红包和积分是否足够
        if (self.data.realmoney > 0) {
            // 判断余额是否足够
            if (sub(self.data.cash, self.data.realmoney) >= 0) {
                self.data.realCash = toTwoNum(self.data.realmoney)
            } else {
                self.data.realCash = toTwoNum(self.data.cash)
            }
        } else {
            self.data.realCash = 0
        }
    },
    // 执行微信支付
    orderWxPay: function () {
        // 如果开启积分积分抵现
        let payType = 0
        if (this.data.useBalancePay) {
            payType = payType + 1
        }
        if (this.data.useScorePay) {
            payType = payType + 2
        }
        if (this.data.useHbPay) {
            payType = payType + 4
        }
        // 调用支付
        this.pay(payType)
    },
    // 执行生成订单
    pay: function (typePay) {
        const self = this
        if (self.data.isPay) {
            return
        }
        let score = 0
        if (this.data.useScorePay) {
            score = self.data.realScore
        }
        let data = {
            sid: self.sid,
            code: self.options.code,
            name: '微信支付：' + self.data.payMoney + '元',
            amount: self.data.payMoney,
            score: score,
            envelope: self.data.firstHb,
            multi_pay: typePay
        }
        wx.showLoading({
            title: '执行支付中',
            mask: true
        })
        self.setData({ isPay: true })
        requestPut('/orders', data).then(({ success, data, msg }) => {
            self.setData({ isPay: false })
            wx.hideLoading()
            if (success) {
                // 调取微信支付
                if (data.type == 1) {
                    self.payFinalHandle()
                } else {
                    console.log(data)
                    wx.requestPayment({
                        'timeStamp': String(data.timeStamp),
                        'nonceStr': data.nonceStr,
                        'package': data.package,
                        'signType': data.signType,
                        'paySign': data.paySign,
                        'success': function (res) {
                            self.payFinalHandle()
                        },
                        fail: function (err) {
                            console.log(err)
                            wx.removeStorageSync('memberinfo');
                            wx.navigateBack()
                        }
                    })
                }
            } else {
                wx.showModal({
                    title: '提示',
                    content: msg,
                    showCancel: false
                })
            }
        })
    },
    // 支付成功
    payFinalHandle: function () {
        // wx.redirectTo({
        //     url: '/pages/payresult/index?switcher=' + this.options.switcher
        // })
        wx.removeStorageSync('memberinfo')
        wx.switchTab({
            url: '/pages/home/home'
        })
    }
})