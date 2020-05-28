
import config from '../config'

/**
 * 同一promise化小程序请求方法
 *
 * @param  {string} [url]       请求地址，url模式
 * @param  {object} [param]     请求参数，对象形式
 * @param  {string} [method]    请求方法：GET POST PUT ...
 * 
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const fetch = function (url, param, method) {
    return new Promise((resolve, reject) => {
        let header = {}
        if (method == 'GET') {
            header = { 'Content-Type': 'application/json' }
        } else {
            header = { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
        wx.request({
            url: config.host + url,
            method: method,
            data: param,
            header: header,
            success: function (res) {
                if (res.statusCode == 200) {
                    if (res.data.success) {
                        resolve(res.data.data)
                    } else {
                        reject(res.data)
                    }
                } else {
                    wx.hideLoading()
                    wx.showModal({
                        title: '请求失败',
                        content: '服务器错误：' + res.statusCode,
                        showCancel: false
                    })
                }
            },
            fail: function (err) {
                wx.hideLoading()
                // wx.showModal({
                //     title: '请求失败',
                //     content: '网络请求失败，请检查网络并重试',
                //     showCancel: false
                // })
            },
        })
    })
}