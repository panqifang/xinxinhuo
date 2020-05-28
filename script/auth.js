
import config from '../config'
import { fetch } from './request'

/**
 * 获取小程序基本信息
 *
 * @param  {string} [hash]       请求地址，url模式
 * @return {object} Promise     成功和失败都返回一个Promise
 */

function getAppInfo () {
    return new Promise((resolve, reject) => {
        if (wx.getStorageSync('appinfo')) {
            return resolve(wx.getStorageSync('appinfo').hash)
        }
        fetch('/api/applets', { hash: config.hash }, 'GET').then(res => {
            if (parseInt(res.status) === 10) {
                wx.setStorageSync('appinfo', res)
                return resolve(res.hash)
            } 
            wx.clearStorageSync()
            reject(false)
        }).catch(err => {
            // 请求成功，接口返回false
            reject(false)
        })
    })
    
}

/**
 * 获取登录sid
 *
 * @param  {string} [hash]       请求地址，url模式
 * @return {string} sid     成功和失败都返回一个Promise
 */

export const login = function () {
    return new Promise((resolve, reject) => {
        // 判断小程序是否存在
        getAppInfo().then(hash => {
            // 小程序存在，获取缓存登录session
            let session = wx.getStorageSync('session')
            if (session) {
                let currentTime = Date.parse(new Date()) / 1000
                if (currentTime < parseInt(session.expireTime)) {
                    return resolve({ hash: hash, sid: session.sid })
                }
            }
            wx.removeStorageSync('session')
            wx.login({
                success: function (res) {
                    fetch('/api/users/login', { hash: hash, code: res.code }, 'POST').then(res => {
                        wx.setStorageSync('session', res)
                        resolve({ hash: hash, sid: res.sid })
                    }).catch(err => {
                        // 请求成功，接口返回false
                        wx.hideLoading()
                        wx.showModal({
                            title: '系统提示',
                            content: err.msg,
                            showCancel: false
                        })
                        reject(false)
                    })
                },
                fail: function(err) {
                    console.log(err)
                    reject(false)
                }
            })

        }).catch(err => {
            // 小程序不存在获取禁用处理
            wx.hideLoading()
            wx.showModal({
                title: '系统提示',
                content: '小程序不存在，或者已经被禁用',
                showCancel: false
            })
        })
    })
}

