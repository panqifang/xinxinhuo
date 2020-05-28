
import { shopSetting } from '../../../script/api'
import { Switch, Toast } from '../../../zanui/index'
import { UIshowUserAvatarNickname } from '../../../script/base'
let app = getApp()
let self

Page(Object.assign({}, Switch, Toast, {
    data: {
        citys: [],
        userInfo: {},
        shopInfo: {},
        shopid: 0,
        nodata: false,
        ddhshow: true,
        role: 0,
        lat: 0,
        lng: 0,
        // 不做奖励开关
        backchecked: false,
        // 智能返开关
        intellected: false,
        // 最大天天乐
        max_ddh: 0,
        // 店铺地址
        address: '',
        // 奖励类型, 0固定,1随机返,2智能返
        switcher: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        app.init().then(memberInfo => {
            // 如果是商户，页面全局shopid
            if (memberInfo.user.role === 20) {
                self.data.role = memberInfo.user.role
                self.data.shopInfo = memberInfo.shop
                self.data.shopid = memberInfo.shop.shopid
                self.data.address = memberInfo.shop.address
                self.data.switcher = memberInfo.shop.switcher

                // 更新头部信息
                let shopinfo = UIshowUserAvatarNickname({
                    avatar: memberInfo.shop.logo,
                    nickname: memberInfo.shop.title
                })
                self.data.userInfo = {
                    logo: shopinfo.avatar,
                    name: shopinfo.nickname
                }
                wx.getLocation({
                    type: 'gcj02',
                    success: function (res) {
                        self.data.lat = res.latitude
                        self.data.lng = res.longitude
                    },
                    fail: function () {
                        self.data.lat = memberInfo.shop.lat
                        self.data.lng = memberInfo.shop.lng
                    }
                })
                // 计算折扣比例
                memberInfo.shop.pool_rate = parseInt(memberInfo.shop.pool_rate)
                // 判断是否开启不做奖励
                
                if (memberInfo.shop.order_pay_rate === 0 && memberInfo.shop.pool_rate === 100) {
                    self.data.backchecked = true
                } else {
                    self.data.backchecked = false
                }
                // 判断是否开启智能返
                if (parseInt(memberInfo.shop.switcher) === 2) {
                    self.data.intellected = true
                } else {
                    self.data.intellected = false
                }
                // 判断天天乐是否开启
                if (memberInfo.shop.ddh_pool_rate > 0) {
                    self.data.ddhshow = false
                } else {
                    self.data.ddhshow = true
                }
                // 获取最大可设置天天乐
                self.data.max_ddh = parseInt(100 - memberInfo.shop.pool_rate)
                self.setData({ userInfo: self.data.userInfo, role: self.data.role, shopInfo: self.data.shopInfo, max_ddh: self.data.max_ddh, address: self.data.address, backchecked: self.data.backchecked, intellected: self.data.intellected, ddhshow: self.data.ddhshow, switcher: self.data.switcher })
            }
        })
    },
    // 开关
    handleZanSwitchChange(e) {
        // 开启不做奖励
        if (e.componentId == 'back') {
            self.data.switcher = 0
            self.setData({
                backchecked: e.checked,
                intellected: false
            })
        } else if (e.componentId == 'intellect') {
            if (e.checked) {
                self.data.switcher = 2
            } else {
                self.data.switcher = 0
            }
            self.setData({
                intellected: e.checked
            })
        }
    },
    // 折扣比例设置后，更新天天乐最大设置比例
    poolRateChange: function (e) {
        self.data.max_ddh = parseInt(100 - e.detail.value)
        self.setData({ max_ddh: self.data.max_ddh })
    },
    // 开启天天了，隐藏奖励比例
    ddhRateChange: function (e) {
        if (e.detail.value > 0) {
            self.setData({ ddhshow: false })
        } else {
            self.setData({ ddhshow: true })
        }
    },
    // 选择地点, 注意：选择完成后还会执行onshow方法
    selectAdress: function () {
        wx.chooseLocation({
            success: function (res) {
                self.data.lat = res.latitude
                self.data.lng = res.longitude
                self.setData({ address: res.address })
            },
            fail: function (err) {
                console.log(err)
            }
        })
    },
    // 保存设置
    formSubmit: function (e) {
        // 获取表单数据
        let formValue = e.detail.value

        // 店铺名称不能为空
        if (formValue.title == '') {
            return self.showZanToast('店铺名称不能为空')
        }
        // 联系方式不能为空
        if (formValue.phone == '') {
            return self.showZanToast('联系方式不能为空')
        }
        // 店铺地址不能为空
        if (formValue.address == '') {
            return self.showZanToast('店铺地址不能为空')
        }
        // 追加参数
        let param = {
            shopid: self.data.shopid,
            lat: self.data.lat,
            lng: self.data.lng,
            switcher: self.data.switcher
        }

        // 判断是否开启不做奖励
        if (self.data.backchecked) {
            // 折扣比例设置为 100， 即资金池比例为 0
            formValue.pool_rate = 100 - 0
            // 奖励比例设置为 0
            formValue.order_pay_rate = 0,
            // 天天乐设置为 0
            formValue.ddh_pool_rate = 0
        } else {
            if (!formValue.pool_rate) {
                formValue.pool_rate = 0
            }
            // 做奖励时，折扣比例最多只能是90%
            if (formValue.pool_rate > 90) {
                formValue.pool_rate = 90
            }
            if (!formValue.order_pay_rate) {
                formValue.order_pay_rate = 0
            }
            if (!formValue.ddh_pool_rate) {
                formValue.ddh_pool_rate = 0
            }
        }
        if (self.data.switcher == 4 ) {
            formValue.order_pay_rate = 1
        }
        formValue.order_pay_rate = 100
        formValue.pool_rate = parseInt(formValue.pool_rate)
        const data = Object.assign(param, formValue)
        wx.showLoading({
            title: '正在提交中',
        })
        shopSetting(data).then(res => {
            app.updateMemberInfoCache()
            wx.showToast({
                title: '设置成功',
                icon: 'success',
                success: function () {
                    setTimeout(() => {
                        wx.switchTab({
                            url: '/pages/user/user',
                        })
                    }, 1500)
                }
            })
        }).catch(err => {
            console.log(err)
        })
    },
    // 头部返回
    topBack: function () {
        wx.navigateBack({ delta: 1 })
    }
}))