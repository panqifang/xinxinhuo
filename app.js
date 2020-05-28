import { formatMoney } from './script/func'
const Api = require('./script/api')
import config from './config'
App({
    // 页面初始化
    init: function () {
        return new Promise((resolve, reject) => {
            Api.getMomberInfo().then(data => {
                // 返回数据
                resolve(data)
            }).catch(err => {
                reject(false)
            })
        })
    },
    // 更新用户信息缓存
    updateMemberInfoCache: function () {
        wx.removeStorageSync('memberinfo')
        Api.getMomberInfo()
    },
    // poomise化 定位
    getLocationPromise: function () {
        return new Promise((resolve, reject) => {
            wx.getLocation({
                type: 'gcj02',
                success: function (res) {
                    // 定位成功后
                    resolve(res)
                },
                fail: function (err) {
                    wx.showModal({
                        title: '系统提示',
                        content: '定位失败' + res.errMsg,
                        showCancel: false
                    })
                    reject(err)
                }
            })
        })
    },
    // 处理扫招聘合伙人二维码
    handleScanPartner: function (url) {
        // 定于新招聘合伙人页面
        let page = '/pages/partner/index?uid='
        let arr = url.split('?')
        // 获取码中合伙人uid
        if (arr[1].indexOf('#')) {
            let paramArr = arr[1].split('#')
            wx.navigateTo({ url: page + paramArr[1] })
        } else {
            wx.switchTab({ url: '/pages/user/user' })
        }
    },
    // 处理扫招聘合伙人二维码
    handleScanShopQr: function (url) {
        // 获取hash 去掉空格
        const hash = config.hash.replace(/\s+/g, "")
        const host = config.host.replace(/\s+/g, "")
        // 判断是否是当前小程序的店铺码
        if (url.indexOf(hash) >= 0) {
            const urlHost = url.split(hash)[0]
            // 判断是否同一个域名
            if (urlHost.indexOf(host) >= 0) {
                const code = url.split(hash)[1].replace('/', '')
                return code.replace('/', '')
            } else {
                wx.showModal({
                    title: '扫码失败',
                    content: '该店铺码不在是在' + host + '后台的店铺码',
                    showCancel: false
                })
                return null
            }
        } else {
            wx.showModal({
                title: '扫码失败',
                content: '扫错其他小程序的二维码',
                showCancel: false
            })
            return null
        }
    },
    //计算两经纬度地方距离
    getDistance: function (lat1, lng1, lat2, lng2) {
        var radLat1 = lat1 * Math.PI / 180.0
        var radLat2 = lat2 * Math.PI / 180.0
        var a = radLat1 - radLat2
        var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
        s = s * 6378137
        s = Math.round(s)
        return s
    },
    /**
     * 根据排名获取要返现金额
     *
     * @param  top [int]            队列排名         
     * @param money [float]         消费金额
     * @param num [int]             队列长度
     * @param t [float]             奖励系数
     */
    getBackMoney: function (top, money, num, t, emun) {
        if (!emun) {
            emun = 3
        }
        // 奖励系数为0，即资金池为0，直接返回0.01
        if (t < 0) {
            return 0.01
        } else {
            // 待返现系数
            let arr = [0, 3, 2, 1.4, 1.3, 1.2, 1.15, 1.1, 1.05, 1.02]
            // 奖励基数
            let p = money * t
            // 增值奖励 e=3 (队列的3分之一为准)
            const numres = Math.floor(num / emun * 100000000000) / 100000000000
            const rs = parseFloat(numres.toFixed(10)) - top
            const ctop = Math.floor(rs / num * 100000000000) / 100000000000
            let z = parseFloat(ctop.toFixed(10)) * p
            // 待返金额
            let backMoney = p + z
            // 前10名
            if (top < 10 && num > 10) {
                //  前几名乘以系数实现
                backMoney = arr[top] * backMoney
            }
            // 如果没有返现则保证最低0.01元返现
            if (backMoney <= 0) {
                backMoney = 0.01
            }
            // 如果返利超过消费金额，则以消费金额为准
            if (backMoney * 100 > money * 100) {
                backMoney = money
            }
            // 返回返现金额
            let resMoney = parseFloat(formatMoney(backMoney))
            
            if (resMoney <= 0) {
                return 0.01
            } else {
                return formatMoney(backMoney)
            }
        }
    },
    // 存储后面3个系数
    // 点击搜索
    saveOldMoney: function (money) {
        // 如果存在输入
        if (money) {
            // 添加历史记录
            let newHistory = []
            if (wx.getStorageSync('oidBackindMoney')) {
                newHistory = wx.getStorageSync('oidBackindMoney')
            }
            // 删除相同搜索
            this.removeByValue(newHistory, money)
            if (newHistory.length >= 5) {
                console.log(newHistory)
                newHistory.splice(0, 1)
            }
            newHistory.push(money)
            wx.setStorageSync('oidBackindMoney', newHistory)
            // 返回
            return newHistory
        }
    },
    // 删除数组元素
    removeByValue: function (arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) {
                arr.splice(i, 1);
                break;
            }
        }
    },
});
