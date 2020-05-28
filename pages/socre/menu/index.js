
import { UIshowUserAvatarNickname } from '../../../script/base'
const app = getApp()
let self

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        role: 0,
        shopid: 0,
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
            // 更新头部信息
            self.data.userInfo = {
                logo: memberInfo.user.avatar,
                name: memberInfo.user.nickname
            }
            self.data.role = memberInfo.user.role
            self.data.mobile = memberInfo.user.mobile
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
            self.setData({ userInfo: self.data.userInfo, role: self.data.role })
        })
    },
    // 判断是否绑定手机
    intoGive: function () {
        if (!self.data.mobile) {
            wx.showModal({
                title: '系统提示',
                content: '请先绑定手机号码！',
                showCancel: false
            })
            return
        }
        wx.navigateTo({
            url: '/pages/socre/give/index',
        })
    },
    // 头部返回
    topBack: function () {
        wx.navigateBack({ delta: 1 })
    }
})