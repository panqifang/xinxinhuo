
import { getCashOutInfo, checkSmsCode, cashOutAll, getSmsCode } from '../../../script/api'
import { Toast } from '../../../zanui/index'
import { UIshowUserAvatarNickname, isPhoneNum, checkTwoFloat, isMoneyNum } from '../../../script/base'
const app = getApp()
let self

Page(Object.assign({}, Toast, {
    // 默认数据
    data: {
        shopInfo: {},
        userInfo: {},
        status: 10,
        shopid: 0,
        phone: '',
        getCodeText: '获取验证码',
        banks: [],
        showbanks: [],
        bankSelectText: '点击选择开户银行',
        bankid: '',
        showBank: false,
        seach: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        if (options.shopid) {
            self.data.shopid = parseInt(options.shopid)
        }
        wx.showLoading({
            title: '数据加载中',
            mask: true
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.init().then(memberInfo => {
            self.data.status = parseInt(memberInfo.user.status)
            // 更新头部信息
            self.data.userInfo = {
                logo: memberInfo.user.avatar,
                name: memberInfo.user.nickname
            }
            self.data.role = memberInfo.user.role
            self.setData({ role: memberInfo.user.role })
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
            self.getData()
        })
    },
    // 弹出选择选择开户银行
    selectkhBank: function () {
        this.setData({ showBank: true })
    },
    // 关闭选择
    toggleBottomPopup: function () {
        this.setData({ showBank: false })
    },
    // 查询银行
    bindReplaceInput: function (e) {
        let val = e.detail.value
        const banks = self.data.banks
        let newBanks = []
        banks.forEach((item, i) => {
            if (item.bank_name.indexOf(val) >= 0) {
                newBanks.push(item)
            }
        })
        self.setData({ showbanks: newBanks })
    },
    selectCashOutBank: function (e) {
        let bankinfo = e.currentTarget.dataset.bank
        self.data.bankid = bankinfo.bank_id
        self.data.bankSelectText = bankinfo.bank_name
        self.setData({
            bankid: self.data.bankid,
            bankSelectText: self.data.bankSelectText,
            showBank: false,
            seach: '',
            showbanks: self.data.banks
        })
    },
    // 获取数据
    getData: function () {
        getCashOutInfo({}).then(data => {
            wx.hideLoading()
            self.data.phone = data.mobile
            self.data.bankid = data.bank_id
            if (data.bank_list.length > 0) {
                data.bank_list.forEach((item, i) => {
                    if (item.bank_id == data.bank_id) {
                        self.data.bankSelectText = item.bank_name
                    }
                })
            }
            self.setData({ shopInfo: data, userInfo: self.data.userInfo, status: self.data.status, banks: data.bank_list, bankSelectText: self.data.bankSelectText, showbanks: data.bank_list, bankid: self.data.bankid })
        }).catch(err => {
            wx.hideLoading()
            self.setData({ shopInfo: {}, userInfo: self.data.userInfo, status: self.data.status })
            console.log(err)
        })
    },
    // 绑定手机输入
    bindMobileChange: function (e) {
        self.data.phone = e.detail.value
    },
    // 获取短信验证码
    getSmsCode: function () {
        if (self.data.getCodeText === '获取验证码') {
            // 判读手机号码
            if (self.data.phone == '') {
                return self.showZanToast('请输入手机号码')
            }
            // 判读手机号码是否正确
            if (!isPhoneNum(self.data.phone)) {
                return self.showZanToast('请输入正确手机号码')
            }
            let n = 65
            self.setData({ getCodeText: (n + 1) + 's' })
            const timer = setInterval(function () {
                self.setData({ getCodeText: n + 's' })
                n--
                if (n < 0) {
                    self.setData({ getCodeText: '获取验证码' })
                    clearInterval(timer)
                }
            }, 1000)
            // 获取验证码
            getSmsCode({ mobile: self.data.phone }).then(res => {
                wx.showToast({
                    title: '验证码成功发送',
                    icon: 'success'
                })
            }).catch(err => {
                console.log(err)
            })
        }
    },
    // 头部返回
    topBack: function () {
        wx.navigateBack({ delta: 1 })
    },
    // 执行提现
    cashSubmit: function (e) {
        let formValue = e.detail.value
        // 判读银行卡是否为空
        if (formValue.card == '') {
            return self.showZanToast('请输入银行卡号码')
        }
        // 判读银行卡姓名是否为空
        if (formValue.card_name == '') {
            return self.showZanToast('请输入银行卡对应姓名')
        }
        // 判读手机号码
        if (formValue.mobile == '') {
            return self.showZanToast('请输入手机号码')
        }
        // 判读手机号码是否正确
        if (!isPhoneNum(formValue.mobile)) {
            return self.showZanToast('请输入正确手机号码')
        }
        // 判读手机验证码
        if (formValue.code == '') {
            return self.showZanToast('请输入手机短信验证码')
        }
        if (self.data.banks.length > 0) {
            if (!self.data.bankid) {
                return self.showZanToast('请选择开户银行')
            }
        }
        if (self.data.bankSelectText == '点击选择开户银行') {
            return self.showZanToast('请选择开户银行')
        }
        // 验证手机验证码
        checkSmsCode({ mobile: formValue.mobile, code: formValue.code }).then(res => {
            // 验证成功，执行提现请求
            if (res.verify) {
                wx.showModal({
                    title: '系统提示',
                    content: '提现成功后会锁定银行卡等信息，如需修改请联系客服',
                    success: function (res) {
                        if (res.confirm) {
                            wx.showLoading({
                                title: '正在提交',
                                mask: true
                            })
                            cashOutAll({ mobile: formValue.mobile, realname: formValue.card_name, card: formValue.card, cash: self.data.shopInfo.cash, bank_id: self.data.bankid }).then(data => {
                                console.log(data)
                                wx.showToast({
                                    title: '提现申请成功提交',
                                    icon: 'success',
                                    success: () => {
                                        setTimeout(() => {
                                            app.updateMemberInfoCache()
                                            wx.navigateBack()
                                        }, 1500)
                                    }
                                })
                            }).catch(err => {
                                console.log(err)
                            })
                        }
                    }
                })
            }
        }).catch(err => {
            console.log(err)
        })

    }
}))