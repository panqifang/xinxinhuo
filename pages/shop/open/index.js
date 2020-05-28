
import { getOpenShopPlace, getOpenShopSelectAgent, createShopQr } from '../../../script/api'
let app = getApp()
let self

Page({
    data: {
        citys: [],
        userInfo: {},
        nodata: false,
        role: 0,
        // 弹出层
        showBottomPopup: false,
        agents: []
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        wx.showLoading({
            title: '数据加载中',
        })
       
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.init().then(memberInfo => {
            self.data.role = memberInfo.user.role
            // 更新头部信息
            self.data.userInfo = {
                logo: memberInfo.user.avatar,
                name: memberInfo.user.nickname
            }
            self.getPlace()
        })
    },
    getPlace: function () {
        getOpenShopPlace({}).then(res => {
            wx.hideLoading()
            if (res.length > 0) { 
                self.setData({ citys: res, userInfo: self.data.userInfo, nodata: false, role: self.data.role })
            } else {
                self.setData({ citys: [], userInfo: self.data.userInfo, nodata: true, role: self.data.role })
            }
        }).catch(err => {
            wx.hideLoading()
            console.log(err)
        })
    },
    // 头部返回
    topBack: function () {
        wx.navigateBack({ delta: 1 })
    },
    // 选择绑定代理商
    selectAgent: function (e) {
        let cityid = e.currentTarget.dataset.cityid
        wx.showLoading({
            title: '查询代理商中',
        })
        getOpenShopSelectAgent({ city: cityid }).then(res => {
            wx.hideLoading()
            console.log(res)
            // 存在代理商的话
            if (res.length > 0) {
                self.setData({ agents: res, showBottomPopup: true }) 
            } else {
                self.setData({ agents: [], showBottomPopup: false }) 
            }
        }).catch(err => {
            wx.hideLoading()
            console.log(err)
        })
    },
    // 关闭
    toggleBottomPopup: function () {
        return
    },
    // 关闭
    closePopup: function () {
        self.setData({ agents: [], showBottomPopup: false }) 
    },
    // 生产开店二维码
    createOpenShopQr: function (e) {
        let uid = e.currentTarget.dataset.uid
        // 关闭弹出层
        self.setData({ showBottomPopup: false }) 
        // 执行询问
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
                                createShopQr({ agentUid: uid }).then(res => {
                                    wx.hideLoading()
                                    // 更新用户缓存信息
                                    app.updateMemberInfoCache()
                                    // 跳回用户中心
                                    wx.switchTab({
                                        url: '/pages/home/home',
                                        success: function () {
                                            // 显示二维码
                                            wx.previewImage({
                                                urls: [res.url]
                                            })
                                        }
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
})