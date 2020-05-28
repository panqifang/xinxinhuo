import { createPartnerQr, createAgentShoprQr, updateMemberInfo, dataTransferUser } from '../../script/api'
import { UIshowUserAvatarNickname, getAppVersion } from '../../script/base'
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
        shopQr:'',
        mobile: '',
        canupdate: true,
        appType: '',
        init: false,
        merage: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        wx.showLoading({
            title: '数据加载中',
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
            wx.hideLoading()
            wx.stopPullDownRefresh()
            //  获取版本
            self.data.appType = getAppVersion()
            // 全局 role
            self.data.role = memberInfo.user.role
            if (memberInfo.user.mobile) {
                self.data.mobile = memberInfo.user.mobile
            } else {
                if (!wx.getStorageSync('phoneBind')) {
                    wx.setStorageSync('phoneBind', true)
                    wx.showModal({
                        title: '温馨提示',
                        content: '如果未绑定手机肯导致无法奖励',
                        cancelText: '关闭',
                        confirmText: '绑定',
                        success: function (res) {
                            if (res.confirm) {
                                wx.navigateTo({
                                    url: '/pages/phone/bind'
                                })
                            }
                        }
                    })
                }
            }

            let users = {
                avatar: memberInfo.user.avatar,
                nickname: memberInfo.user.nickname
            }
            // 更新用户头像
            self.data.userInfo = UIshowUserAvatarNickname(memberInfo.user)
            // 如果是商户显示用户头像
            if (memberInfo.user.role === 20) {
                // 全店铺二维码
                if (memberInfo.shop) {
                    if (memberInfo.shop.codeImageUrl) {
                        self.data.shopQr = memberInfo.shop.codeImageUrl
                    }
                    let users = {
                        avatar: memberInfo.shop.logo,
                        nickname: memberInfo.shop.title
                    }
                    self.data.userInfo = UIshowUserAvatarNickname(users)
                } 
            }
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
            self.setData({ info: memberInfo, userInfo: self.data.userInfo, mobile: self.data.mobile, appType: self.data.appType, init: true, webView: false })
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        wx.removeStorageSync('memberinfo')
        self.onShow()
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
        if (self.data.role === 20) {
            if (!self.data.shopQr) {
                return
            }
            wx.previewImage({
                urls: [self.data.shopQr]
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
            path: '/pages/user/user'
        }
    }
})