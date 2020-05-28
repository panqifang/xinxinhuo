
import config from '../config'

/**
 *  根据小程序配置状态，是否开启web-view
 *
 * @param  {object} options
 * @return {object} options
 */

export const isOpenWebView = function () {
    let { status } = wx.getStorageSync('appinfo')
    if (parseInt(status) === 100) {
        return true
    }
    return false
}

/**
 *  返回处理后的小程序版本
 *
 * @param  {object} options
 * @return {object} options
 */

export const getAppVersion = function () {
    let { type } = wx.getStorageSync('appinfo')
    if (type % 10 === 0) {
        return 'vip'
    }
    if (type === 11) {
        return 'shop'
    }
    if (type === 31) {
        return 'vipshop'
    }
}

/**
 * 统一用户头像昵称显示
 *
 * @param  {object} options
 * @return {object} options
 */

export const UIshowUserAvatarNickname = function (options) {
    let avatarUrl = '/images/logo.png'
    if (wx.getStorageSync('appinfo').url) {
        avatarUrl = wx.getStorageSync('appinfo').url
    }
    if (!options.avatar) {
        options.avatar = config.host + '/api/' + avatarUrl
    } else if (options.avatar.indexOf('http') === -1) {
        options.avatar = '/api' + options.avatar
    }
    if (!options.nickname) {
        if (!options.mobile) {
            options.nickname = wx.getStorageSync('memberinfo').user.nickname +'.'
        } else {
            options.nickname = options.mobile
        }
    }
    return options
}


/**
 *
 * @desc   判断`obj`是否为空
 * @param  {Object} obj
 * @return {Boolean}
 */

export const isEmptyObject = function (obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        return false
    }
    return !Object.keys(obj).length
}

/**
 *
 * @desc   判断是否为邮箱地址
 * @param  {String}  str
 * @return {Boolean}
 */
export const isEmail = function (str) {
    return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(str)
}

/**
 *
 * @desc  判断是否为身份证号
 * @param  {String|Number} str
 * @return {Boolean}
 */
export const isIdCard = function (str) {
    return /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(str)
}

/**
 *
 * @desc   判断是否为手机号
 * @param  {String|Number} str
 * @return {Boolean}
 */
export const isPhoneNum = function (str) {
    return /^(0|86|17951)?(10[0-9]|11[0-9]|12[0-9]|13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])[0-9]{8}$/.test(str)
}
/**
 *
 * @desc   判断是否钱数量
 * @param  {String|Number} str
 * @return {Boolean}
 */
export const isMoneyNum = function (str) {
    let reg = new RegExp("[1-9]([0-9]+)?(\\.[0-9]?[1-9]?)?|0\\.([0-9]?[1-9]?)?|0")
    let res = str.match(reg)
    if (res) {
        return parseFloat(res[0])
    }
    return 0
}

/**
 * @desc   比较第一个浮点数是否大于第二个 (仅支持 0.001格式) 
 * 
 * @param  {float} oneNum 
 * @return {Boolean}
 */
export const checkTwoFloat = function (oneNum, twoNum) {
    let n = 1000
    return parseFloat(oneNum * n) > parseFloat(twoNum * n)
}

/**
 * @desc   格式化小数，取三位，不做四舍五入 
 * 
 * @param  {float} oneNum 
 * @return {Boolean}
 */
export const getFloatThree = function (num) {
    return Math.floor(num * 100) / 100
}

