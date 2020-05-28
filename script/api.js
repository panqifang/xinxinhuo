
import config from '../config'
import { login } from './auth'
import { fetch } from './request'
import { formatTime, formatMoney, formatDate } from './func'
import { UIshowUserAvatarNickname } from './base'

/**
 * 同一失败温馨提示
 *
 * @param  {object} [msgInfo]       请求地址，url模式
 * @return {boolean} false     返回 fasle
 */

function showErrorMsg (msgInfo) {
    wx.hideLoading()
    wx.showModal({
        title: '系统提示',
        content: msgInfo.msg,
        showCancel: false
    })
    return false
}

/**
 * 获取用户基本信息
 *
 * @param  {string} [hash]       请求地址，url模式
 * @return {object} Promise     成功和失败都返回一个Promise
 */
export const getMomberInfo = function () {
    return new Promise((resolve, reject) => {
        login().then(res => {
            if (wx.getStorageSync('memberinfo')) {
                resolve(wx.getStorageSync('memberinfo'))
            } else {
                fetch('/api/users', { hash: res.hash, sid: res.sid }, 'GET').then(data => {
                    wx.setStorageSync('memberinfo', data)
                    resolve(data)
                }).catch(err => {
                    reject(showErrorMsg(err))
                })
            }
        })
    })
}

/**
 * 更新用户基本信息
 *
 * @param  {string} [hash]       请求地址，url模式
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const updateMemberInfo = function () {
    return new Promise((resolve, reject) => {
        login().then(res => {
            wx.getUserInfo({
                withCredentials: true,
                success: function (wxUserInfo) {
                    fetch('/api/users/update', {
                        hash: res.hash, 
                        sid: res.sid,
                        iv: wxUserInfo.iv,
                        encryptedData: wxUserInfo.encryptedData
                    }, 'POST').then(data => {
                        wx.removeStorageSync('memberinfo')
                        getMomberInfo()
                        resolve(data)
                    }).catch(err => {
                        reject(showErrorMsg(err))
                    })
                },
                fail: function(err) {
                    console.log(err)
                    wx.navigateTo({
                        url: '/pages/user/getinfo',
                    })
                }
            })
        })
    })
}

/**
 * 更新用户基本信息
 *
 * @param  {string} [hash]       请求地址，url模式
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const updateUserInfo = function (wxUserInfo) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/users/update', {
                hash: res.hash,
                sid: res.sid,
                iv: wxUserInfo.iv,
                encryptedData: wxUserInfo.encryptedData
            }, 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取用户正在待奖励的商户
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userBackShopOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            if (!options.size) {
                options.size = config.size
            }
            fetch('/api/orders/consume-group', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item.avatar = item.logo
                    item.nickname = item.title
                    item = UIshowUserAvatarNickname(item)
                    item.last_time = formatTime(item.last_time)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 *  商户获取待奖励订单队列
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const shopBackingOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/merchant/my-order', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 *  商户获取待奖励订单队列
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const shopBackingOrdersNew = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/merchant/my-order', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}


/**
 *  商户获取待开奖天天乐订单队列
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const shopDdhingOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/merchant/my-ddh-order', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取用户在某一店铺下正在待奖励的订单
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userBackingOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/consume-detail-self-list', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取用户在某一店铺下正在待奖励的订单2
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userBackingOrdersNew = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            if (!options.size) {
                options.size = config.size
            }
            fetch('/api/orders/consume-detail-self-list3', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取用户在某一店铺下正在待奖励的天天乐订单
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userDdhingOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/ddh-self-list', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 待奖励订单退出队列
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const orderOutQueue = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/orders/modify', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 待奖励订单退出队列换取余额
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const orderOutQueueGetMoney = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/intelligenceBack/getBackMoney', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 待奖励订单退出队列换取积分
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const orderToScore = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/score/transform', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取用户已经奖励的订单
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userBackedOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/reward-list', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item.avatar = item.logo
                    item.nickname = item.title
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                    item.money = formatMoney(item.backing_money)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取用户已经开奖的天天乐的订单
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userDdhedOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/ddh-reward-self-list', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                    item.money = formatMoney(item.backing_money)
                    item.total_fee = formatMoney(item.total_fee)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取商户已经发放的奖励
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const shopBackedOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            if (!options.size) {
                options.size = config.size
            }
            fetch('/api/merchant/winners', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.update_time = formatTime(item.update_time)
                    item.create_time = formatTime(item.create_time)
                    item.money = formatMoney(item.backing_money)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取提现记录
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const cashOutLog = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/arrived-list', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                    item.total_fee = formatMoney(item.total_fee)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}


/**
 * 积分兑换订单商户列表
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userExchangeScoreShop = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/score-shop-group', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item.avatar = item.logo
                    item.nickname = item.title
                    item = UIshowUserAvatarNickname(item)
                    item.last_time = formatTime(item.last_time)
                    item.money = formatMoney(item.money)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 积分消费订单商户列表
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userConsumeScoreShop = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/score-charge-shop-group', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item.avatar = item.logo
                    item.nickname = item.title
                    item = UIshowUserAvatarNickname(item)
                    item.last_time = formatTime(item.last_time)
                    item.money = formatMoney(item.money)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 商户所有积分兑换订单
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const shopExchangeScoreOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/merchant/score-replace-list', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                    item.money = formatMoney(item.money)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 商户所有积分消费订单
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const shopConsumeScoreOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/merchant/score-charge-list', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                    item.score = formatMoney(item.score)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 用户获取在哪个商户下的兑换积分订单
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userExchangeScoreOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/score-shop-self-list', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                    item.money = formatMoney(item.money)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 用户获取在哪个商户下的兑换积分订单
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const userConsumeScoreOrders = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/score-shop-charge-self-list', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                    item.score = formatMoney(item.score)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 用户获取在哪个商户下的兑换积分订单
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const ScoreHandleLog = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/score/log', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item.avatar = item.target_avatar
                    item.nickname = item.target_nickname
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                    item.score = formatMoney(item.score)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 查询积分转赠的用户
 *
 * @param  {object} [options]   请求参数，{ mobile }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const searchGiveScoreUser = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/score/give-list', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 转赠积分
 *
 * @param  {object} [options]   请求参数，{ mobile }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const gieScore = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/score/give', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取附近商户
 *
 * @param  {object} [options]   请求参数，{ mobile }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getNearbyShop = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/shops/nearby', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 通过店铺id获取商家信息
 *
 * @param  {object} [options]   请求参数，{ mobile }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getShopInfoByshopId = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/shops/shop-info', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取余额流水
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const bablanceLog = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/my-balance', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取余额统计数据
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const bablanceCount = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/orders/my-count', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 店铺销售明细
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const shopSaleList = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/merchant/sales', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                    item.money = formatMoney(item.money)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 代理商店铺查询
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getAgentShop = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            options.size = config.size
            fetch('/api/agents/qr-code', Object.assign(res, options), 'GET').then(data => {
                let lists = data.list
                lists.forEach((item, i) => {
                    if (item.logo) {
                        item.avatar = item.logo
                    }
                    if (item.title) {
                        item.nickname = item.title
                    }
                    item.date = formatDate(item.create_time)
                    item = UIshowUserAvatarNickname(item)
                    item.create_time = formatTime(item.create_time)
                })
                data.list = lists
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 服务商开店查询区域
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getOpenShopPlace = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/agents/city_agent', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 服务商开店查询区域查询选择代理商
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getOpenShopSelectAgent = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/agents/agentsList', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 服务商开店生成开店二维码
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const createShopQr = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/shops/direct_indirect_shop', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 服务商生成招聘合伙人二维码
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const createPartnerQr = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/servicer', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 代理商生成开店二维码
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const createAgentShoprQr = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/shops/custom', Object.assign(res, options), 'PUT').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 查询提现信息
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getCashOutInfo = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/cash-back', Object.assign(res, options), 'GET').then(data => {
                // data.cash = formatMoney(data.cash)
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 验证手机验证码
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const checkSmsCode = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/sms/verify', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 提现
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const cashOut = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/cash-back', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 提现
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const cashOutAll = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/cash-back/agent-cashout', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取手机验证码
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getSmsCode = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/sms/send', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 店铺设置
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const shopSetting = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/merchant/merchant-setting', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}


/**
 * 绑定手机,赠送积分
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const bindMobile = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/users/bindPhone', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取要投诉的店铺，即是该用户消费过的店铺
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const reportShops = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/shops/last-consume-list', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 提交投诉建议
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const report = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/suggests', Object.assign(res, options), 'PUT').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 我要加盟
 *
 * @param  {object} [options]   请求参数，{ shopid, page, size }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const wantToJoin = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/join', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取店铺信息，code
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getShopInfoByCode = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/shops/info', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 同意协议开店
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const openShop = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/shops', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 小程序支付生单接口
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const createAppOrder = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/orders', Object.assign(res, options), 'PUT').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}


/**
 * 普通用户成为合伙人
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const bindPartner = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/shops/bindPn', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 奖励订单标记已领取
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const receive = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/orders/receive', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 绑定手机号码设置用户
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const bindMobileSetUser = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/users/set-user', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取手机号码相同的用户列表
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const dataTransferUser = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/data-transfer/users', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 合并用户数据
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const dataTransferMerge = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/data-transfer/merge', Object.assign(res, options), 'POST').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取领取轮播
 *
 */

export const homeGetinfo = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            if (!options.size) {
                options.size = config.size
            }
            fetch('/api/orders/backed-last', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取智能返e数
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getBackE = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/applets/getIntelligenceBackConfig', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}

/**
 * 获取店铺订单记录
 *
 * @param  {object} [options]   请求参数，{ code }
 * @return {object} Promise     成功和失败都返回一个Promise
 */

export const getSalesShop = function (options) {
    return new Promise((resolve, reject) => {
        login().then(res => {
            fetch('/api/merchant/sales-between-time', Object.assign(res, options), 'GET').then(data => {
                resolve(data)
            }).catch(err => {
                reject(showErrorMsg(err))
            })
        })
    })
}