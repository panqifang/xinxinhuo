
import { dataTransferUser, dataTransferMerge } from '../../script/api'
import { formatTime } from '../../script/func'
var app = getApp()

Page({
    data: {
        items: [],
        uids: [],
        uid: 0
    },
    onLoad: function () {
        var that = this
        app.init().then(memberInfo => {
            that.data.uid = memberInfo.user.uid
            if (memberInfo.user && memberInfo.user.mobile) {
                dataTransferUser({ mobile: memberInfo.user.mobile }).then(data => {
                    if (typeof data != 'undefined' && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            that.data.uids.push(data[i].uid)
                            data[i].create_time = formatTime(data[i].create_time)
                        }
                        that.setData({
                            items: data
                        })
                    }
                })
            }
        })
    },

    mergeClic: function () {
        var that = this
        var uids = that.data.uids.join(',')
        wx.showModal({
            title: '系统提示',
            content: '以当前登陆用户为主账号进行数据合并？',
            showCancel: false,
            confirmText: '确认合并',
            success: function (res) {
                if (res.confirm && that.data.uid != 0) {
                    dataTransferMerge({ targetUid: that.data.uid, sourceUids: uids }).then(res => {
                        app.updateMemberInfoCache()
                        setTimeout(function () {
                            wx.showToast({
                                title: '数据合并成功'
                            })
                        }, 700)
                        setTimeout(function () {
                            wx.switchTab({
                                url: '/pages/user/user',
                            })
                        }, 1300)
                    })
                }
            }
        })
    }
})