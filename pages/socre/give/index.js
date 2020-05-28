import { searchGiveScoreUser, gieScore } from '../../../script/api'
import { Field, Toast } from '../../../zanui/index'
import { isPhoneNum, isMoneyNum, checkTwoFloat, UIshowUserAvatarNickname } from '../../../script/base'
const app = getApp()
let self

Page(Object.assign({}, Field, Toast, {

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        role: 0,
        shopid: 0,
        canGive: true,
        mobile: '',
        canSearch: false,
        giveBtn: false,
        userMobile: '',
        showBottomPopup: false,
        giveView: false,
        users: [],
        myscore: 0,
        // 转赠的uid
        uid: 0,
        score: 0,
        toUser: {}
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
            self.data.userMobile = memberInfo.user.mobile
            self.data.myscore = memberInfo.user.score
            // 如果是商户，页面全局shopid
            if (memberInfo.user.role === 20) {
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
            self.setData({ userInfo: self.data.userInfo, role: self.data.role, myscore: self.data.myscore, giveView: false })
        })
    },
    // 处理手机输入框输入
    handleZanFieldChange: function (e) {
        if (e.componentId === 'mobile') {
            if (isPhoneNum(e.detail.value)) {
                self.data.mobile = e.detail.value
                self.setData({ canSearch: true })
            } else {
                self.setData({ canSearch: false })
            }
        } else if (e.componentId === 'score') {
            // 转赠积分必须大于0
            if (isMoneyNum(e.detail.value) > 0) {
                self.data.score = isMoneyNum(e.detail.value)
                self.setData({ giveBtn: true })
            } else {
                self.setData({ giveBtn: false })
            }
        }
    },
    searchUser: function () {
        if (self.data.mobile == self.data.userMobile) {
            return self.showZanToast('不能赠送积分给自己')
        }
        searchGiveScoreUser({ mobile: self.data.mobile }).then(res => {
            // 只存在一个用户
            if (res.length  === 1) {
                let item = res[0]
                self.data.uid = item.uid
                self.setData({ toUser: item,  giveView: true })
            // 存在多个用户
            } else if (res.length > 1) {
                self.setData({
                    users: res,
                    showBottomPopup: true
                });
            // 查询用户不存在
            } else {
                return self.showZanToast('不存在该手机号码的用户');
            }
        }).catch(err => {
            return self.showZanToast('不存在该手机号码的用户')
        })
    },
    // 头部返回
    topBack: function () {
        wx.navigateBack({ delta: 1 })
    },
    // 地步弹窗切换
    toggleBottomPopup() {
        return false
    },
    // 关闭弹出层
    closePopup: function () {
        self.setData({
            showBottomPopup: false
        });
    },
    // 选择用户
    select: function (e) {
        let item = e.currentTarget.dataset.item
        self.data.uid = item.uid
        self.setData({ toUser: item, showBottomPopup: false, giveView: true })
    },
    // 执行转赠
    give: function () {
        // 如果转赠积分大于最大转赠积分
        if (checkTwoFloat(self.data.score, self.data.myscore)) {
            return self.showZanToast('你的转赠积分不足')
        }
        let data = {
            to: self.data.uid,
            score: self.data.score
        }
        wx.showLoading({
            title: '积分转赠中',
        })
        self.setData({ giveBtn: false })
        gieScore(data).then(res => {
            self.setData({ giveBtn: true })
            app.updateMemberInfoCache()
            wx.showToast({
                title: '积分转赠成功',
                icon: 'success',
                success: () => {
                    setTimeout(() => {
                        wx.switchTab({
                            url: '/pages/user/user',
                        })
                    }, 1500)
                }
            })
        }).catch(err => {
            self.setData({ giveBtn: true })
        })
    }
}))