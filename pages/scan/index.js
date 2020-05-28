import { requestGet, requestPOST } from '../../assets/utils/request'
import { formatTime } from '../../assets/utils/func'
import config from '../../assets/config'
const { getMemberInfo, globalData, getScanShopQr } = getApp()

Page({
    data: {
        shop: {},
        noshop: false,
        init: false,
        load: false,
        payInput: '',
        orders: [],
        poolRate: 0,
        switcher: 0,
        hb: false
    },
    onLoad: function (options) {
        // options.code = '5b459bae'
        this.options = options
        this.setData({ load: true, noshop: false })
    },
    onShow: function () {
        const self = this
        if (self.options.code) {
            self.code = self.options.code
            // 如果扫店铺二维码进来
        } else if (self.options.q) {
            // 获取二维码里面的路径信息
            let url = decodeURIComponent(self.options.q)
            // 处理二维码连接信息，返回code
            self.code = getScanShopQr(url)
        }
        // 登录
        getMemberInfo().then(memberinfo => {
            self.sid = wx.getStorageSync('session').sid
            // 获取店铺信息
            self.shopInfo().then(data => {
                console.log(data)
                self.setData({ load: false })
                if (data) {
                    const shop = data
                    if (shop.status == 10) {
                        // 未营业直接跳转
                        self.setData({ noshop: true, init: false })
                        // 跳转开店
                        wx.redirectTo({
                            url: '/pages/openshop/index?code=' + self.code
                        })
                        // 营业中
                    } else if (shop.status == 50) {
                        self.shopid = shop.shopid
                        self.data.poolRate = shop.pool_rate
                        self.switcher = shop.switcher
                        self.setData({ noshop: false, init: true, shop: shop })
                        self.getWinnerData()
                        // 显示等待中
                        if ((shop.switch_web & 8) > 0) {
                            self.data.hb = true
                        } else {
                            self.data.hb = false
                        }
                    } else {
                        self.setData({ noshop: true, init: false })
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '店铺不存在',
                        showCancel: false
                    })
                }
            })
        })

    },
    // 避免周期再次调用接口
    shopInfo: function () {
        const self = this
        return new Promise((resolve) => {
            requestGet('/shops/info', { code: self.code, sid: self.sid }).then(({ success, data, msg }) => {
                if (success && data) {
                    resolve(data)
                } else {
                    resolve(false)
                }
            })
        })
    },
    // 操作输入，处理输入作为订单金额
    handleZanFieldChange(e) {
        let val = Number(e.detail.value.toString().match(/^\d+(?:\.\d{0,2})?/))
        this.data.payInput = val
    },
    // 弹出支付信息
    popupPay: function () {
        const self = this
        const money = this.data.payInput
        const poolRate = this.data.poolRate
        const deductionRatio = parseInt(this.data.shop.deduction_ratio)
        if (money * 1000 >= 0.1 * 1000) {
            let url = '/pages/pay/index?code=' + this.code + '&money=' + money + '&poolRate=' + poolRate + '&switcher=' + this.switcher + '&shopid=' + this.data.shop.shopid
            if ((self.data.shop.switch_web & 8) > 0) {
                url = '/pages/pay/index?code=' + this.code + '&money=' + money + '&poolRate=' + poolRate + '&switcher=' + this.switcher + '&shopid=' + this.data.shop.shopid + '&hb=' + this.data.hb + '&envelope_rate=' + this.data.shop.envelope_rate + '&deductionRatio=' + deductionRatio
            }
            wx.navigateTo({ url: url })
            
        } else {
            wx.showModal({
                title: '提示',
                content: '最少支付0.1元',
                showCancel: false
            })
        }
    },
    // 获取已经奖励的用户订单
    getWinnerData: function () {
        const self = this
        requestGet('/merchant/winners', { sid: self.sid, page: 1, size: 10, shopid: self.shopid }).then(({ success, data, msg }) => {
            if (success) {
                let list = data.list
                if (list.length > 0) {
                    list.forEach((item, i) => {
                        item.update_time = formatTime(item.update_time)
                    })
                    self.setData({ orders: list })
                }
            }
        })
    }
})