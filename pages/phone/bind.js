import { bindMobile, checkSmsCode, getSmsCode } from '../../script/api'

import { Toast } from '../../zanui/index'
import { UIshowUserAvatarNickname, isPhoneNum } from '../../script/base'
const app = getApp()
let self

Page(Object.assign({}, Toast, {

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        isBind: false,
        noBind: false,
        getCodeText: '获取验证码',
        phone: '',
        mobile: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.init().then(memberInfo => {
            let users = {
                avatar: memberInfo.user.avatar,
                nickname: memberInfo.user.nickname
            }
            // 判断是否绑定手机
            if (memberInfo.user.mobile) {
                self.data.isBind = true
                self.data.noBind = false
            } else {
                self.data.isBind = false
                self.data.noBind = true
            }
            self.setData({ userInfo: users, isBind: self.data.isBind, noBind: self.data.noBind, mobile: memberInfo.user.mobile })
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
        // 判读手机验证码
        if (formValue.code == '') {
            return self.showZanToast('请输入手机短信验证码')
        }
        // 验证手机验证码
        checkSmsCode({ mobile: formValue.mobile, code: formValue.code }).then(res => {
            // 验证成功，执行提现请求
            if (res.verify) {
                wx.showLoading({
                    title: '正在提交',
                    mask: true
                })
                bindMobile({ mobile: formValue.mobile }).then(res => {
                    app.updateMemberInfoCache()
                    wx.showToast({
                        title: '绑定成功',
                        icon: 'success',
                        success: () => {
                            setTimeout(() => {
                                wx.navigateBack()
                            }, 1500)
                        }
                    })
                }).catch(err => {
                    console.log(err)
                })
            }
        }).catch(err => {
            console.log(err)
        })
    }
}))