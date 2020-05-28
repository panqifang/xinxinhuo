
import { login } from '../../script/auth'
import config from '../../config'
import { isOpenWebView } from '../../script/base'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: '',
        init: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let self = this
        login().then(res => {
            // 判断是否开启webview
            if (!isOpenWebView()) {
                wx.reLaunch({
                    url: '/pages/user/user',
                })
            } else {
                self.data.url = config.host + '/webapp/user/index?hash=' + res.hash + '&sid=' + res.sid
                console.log(self.data.url)
                self.setData({ init: true, url: self.data.url })
            }
        })
    }
})