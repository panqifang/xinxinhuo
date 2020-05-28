/**
 * 时间格式化, returning a staring.
 *
 * @param  {number} date       The URL we want to request
 * @return {string}           An object containing either "data" or "err"
 */
export const formatTime = function (date) {
    typeof date === 'number' && (date = new Date(date * 1000))
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 日期格式化, returning a staring.
 *
 * @param  {number} date       The URL we want to request
 * @return {string}           An object containing either "data" or "err"
 */
export const formatDate = function (date) {
    typeof date === 'number' && (date = new Date(date * 1000))
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return [year, month, day].map(formatNumber).join('-')
}

/**
 * 数字格式化, returning a staring.
 *
 * @param  {int} n       The URL we want to request
 * @return {int}           An object containing either "data" or "err"
 */
const formatNumber = function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

/**
 * 四舍五入格式化，取两位小数点, returning a staring.
 *
 * @param  {int} cash      The URL we want to request
 * @return {int}           An object containing either "data" or "err"
 */
export const formatMoney = function (cash) {
    if (typeof cash === 'number') {
        return cash.toFixed(2)
    } else {
        return cash
    }
}

/**
 *
 * @desc 随机生成颜色
 * @return {String}
 */
export const randomColor = function () {
    return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6)
}

/**
 *
 * @desc 生成指定范围随机数
 * @param  {Number} min
 * @param  {Number} max
 * @return {Number}
 */
export const randomNum = function (min, max) {
    return Math.floor(min + Math.random() * (max - min))
}

/**
 *
 * @desc   url参数转对象
 * @param  {String} url  default: window.location.href
 * @return {Object}
 */
export const parseQueryString = function (url) {
    url = url == null ? window.location.href : url
    var search = url.substring(url.lastIndexOf('?') + 1)
    if (!search) {
        return {}
    }
    return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
}

/**
 *
 * @desc   对象序列化
 * @param  {Object} obj
 * @return {String}
 */
export const stringfyQueryString = function (obj) {
    if (!obj) return ''
    var pairs = []
    for (var key in obj) {
        var value = obj[key]
        if (value instanceof Array) {
            for (var i = 0; i < value.length; ++i) {
                pairs.push(encodeURIComponent(key + '[' + i + ']') + '=' + encodeURIComponent(value[i]))
            }
            continue
        }
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    }
    return pairs.join('&')
}
