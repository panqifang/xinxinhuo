import { reportShops, report } from '../../script/api'

import { Toast } from '../../zanui/index'
import { isPhoneNum } from '../../script/base'
const app = getApp()
let self

Page(Object.assign({}, Toast, {

    /**
     * 页面的初始数据
     */
    data: {
        shoplists: [],
        role: 0,
        phone: '',
        size: 10,
        can: 0,
        shopName: '请选择要投诉的店铺',
        shopid: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        wx.showLoading({
            title: '获取数据中',
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.init().then(memberInfo => {
            self.data.role = memberInfo.user.role
            self.data.phone = memberInfo.user.mobile
            let users = {
                avatar: memberInfo.user.avatar,
                nickname: memberInfo.user.nickname,
                phone: self.data.phone
            }
            if (memberInfo.user.role === 10) {
                reportShops({ count: self.data.size }).then(data => {
                    wx.hideLoading()
                    if (data.length > 0) {
                        self.data.shoplists = data
                        self.data.can = 0
                        self.setData({ userInfo: users, mobile: self.data.mobile, role: self.data.role, shoplists: self.data.shoplists, can: self.data.can })
                    } else {
                        self.data.shoplists = []
                        self.data.can = 1
                        self.setData({ userInfo: users, mobile: self.data.mobile, role: self.data.role, shoplists: self.data.shoplists, can: self.data.can })
                    }
                }).catch(err => {
                    wx.hideLoading()
                })
                
            } else {
                self.setData({ userInfo: users, mobile: self.data.mobile, role: self.data.role })
            }
            
        })
    },
    // 选择店铺
    shopPickerChange: function (e) {
        let item = self.data.shoplists[e.detail.value]
        console.log(item.shopid)
        self.data.shopid = item.shopid
        self.setData({ shopName: item.title })
    },
    // 执行绑定
    formSubmit: function (e) {
        // 获取表单数据
        let formValue = e.detail.value
        if (self.data.shopid === 0) {
            return self.showZanToast('请选择要投诉的店铺');
        }
        if (!formValue.name) {
            return self.showZanToast('请输入你的名称');
        }
        // 判读手机号码
        if (formValue.phone == '') {
            return self.showZanToast('请输入手机号码')
        }
        // 判读手机号码是否正确
        if (!isPhoneNum(formValue.phone)) {
            return self.showZanToast('请输入正确手机号码')
        }
        if (!formValue.content) {
            return self.showZanToast('请输入要投诉的内容');
        }

        wx.showLoading({
            title: '提交中',
        })
        report(Object.assign({ shopId: self.data.shopid }, formValue)).then(res => {
            app.updateMemberInfoCache()
            wx.showToast({
                title: '提交成功',
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
            wx.hideLoading()
        })
    }
}))