import { bindPartner } from '../../script/api'

import { Toast } from '../../zanui/index'
import { isPhoneNum } from '../../script/base'
const app = getApp()
let self

Page(Object.assign({}, Toast, {

    /**
     * 页面的初始数据
     */
    data: {
        uid: 0,
        mobile: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this
        if (options.uid) {
            self.data.uid = options.uid
        }
        app.init().then(memberInfo => {
            if (memberInfo.user.mobile) {
                self.setData({ mobile: memberInfo.user.mobile })
            }
        })
    },
    // 执行绑定
    toPartnerTap: function (e) {
        let formValue = e.detail.value
        // 判读手机号码
        if (formValue.mobile == '') {
            return self.showZanToast('请输入手机号码')
        }
        // 判读手机号码是否正确
        if (!isPhoneNum(formValue.mobile)) {
            return self.showZanToast('请输入正确手机号码')
        }
        bindPartner({ mobile: formValue.mobile, serviceUid: self.data.uid }).then(res => {
            app.updateMemberInfoCache()
            wx.showToast({
                title: '申请成功',
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
    // 不同意开店，点击取消
    openShopCannel: function () {
        wx.navigateBack({ delta: 1 })
    }
}))