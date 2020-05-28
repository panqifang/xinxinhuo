import { wantToJoin } from '../../script/api'

import { Toast, CheckLabel } from '../../zanui/index'
import { isPhoneNum } from '../../script/base'
const app = getApp()
let self

Page(Object.assign({}, Toast, CheckLabel, {

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        role: 0,
        mobile: '',
        itemType: '',
        items: [
            {
                padding: 0,
                value: '开店',
                name: '我要开店',
            },
            {
                padding: 0,
                value: '服务商',
                name: '我要成为服务商',
            },
            {
                padding: 0,
                value: '代理商',
                name: '我要成为代理商',
            }
        ],
        checked: {
            base: -1,
            color: -1
        },
        activeColor: '#4b0'
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
                nickname: memberInfo.user.nickname,
                mobile: memberInfo.user.mobile
            }
            self.setData({ userInfo: users, role: memberInfo.user.role })
        })
    },
    // 选择
    handleZanSelectChange({ componentId, value }) {
        self.data.itemType = value
        self.setData({
            [`checked.${componentId}`]: value
        });
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

        wantToJoin({ mobile: formValue.mobile, type: self.data.itemType }).then(res => {
            app.updateMemberInfoCache()
            wx.showToast({
                title: '提交成功',
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
            console.log(err)
        })
    },
    call: function () {
        wx.makePhoneCall({
            phoneNumber: '13019997088'
        })
    }
}))