
import { updateUserInfo } from '../../script/api'
import config from '../../config'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageShow: true,
        appinfo: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var appinfo = wx.getStorageSync('appinfo')
        appinfo.logo = config.host + '/api' + appinfo.url
        this.setData({ appinfo: appinfo })
    },
    getUserInfo: function (e) {
        updateUserInfo(e.detail).then(data => {
            let users = wx.getStorageSync('memberinfo')
            users.user.avatar = data.avatarUrl
            users.user.nickname = data.nickName
            wx.setStorageSync('memberinfo', users)
            setTimeout(() => {
                wx.navigateBack()
            }, 500)
        }).catch(err => {
            console.log(err)
        })
    }

})