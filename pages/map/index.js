import { getNearbyShop } from '../../script/api'
import config from '../../config'
let app = getApp()

Page({
    data: {
        mapShow: true,
        latitude: 22.6355320,
        longitude: 114.1807630,
        markers: [],
        controls: [],
        regionchange : 1
    },
    onLoad(options) {
        var that = this
        wx.showToast({
            title: "定位中",
            icon: "loading",
        })
        // 初始化标题
        that.data.controls = that.getControls()
        that.setData({
            controls: that.data.controls
        })
    },
    onReady: function () {
        var that = this
        if (that.isLoad) {
            return
        } else {
            wx.getLocation({
                type: 'gcj02',
                success: function (res) {
                    that.setData({
                        latitude: res.latitude,
                        longitude: res.longitude,
                    })
                    that.getQrList({ lat: res.latitude, lng: res.longitude })
                },
                fail: function (res) {
                    app.info('获取位置失败，请检查定位设置')
                    that.getQrList({ lat: that.data.latitude, lng: that.data.longitude })
                },
                complete: function () {
                    setTimeout(wx.hideToast, 1000)
                }
            })
            that.isLoad = true
        }
        this.mapCtx = wx.createMapContext('map')
        this.mapCtx.moveToLocation()
    },
    regionchange: function () {
        var that = this
        that.data.regionchange ++
        setTimeout(function(){
            that.data.regionchange--
            if(that.data.regionchange == 1){
                that.mapCtx.getCenterLocation({
                    success: function (res) {
                        if (that.data.latitude == res.latitude) {
                            return
                        }
                        var distance = that.getDistance(that.data.latitude, that.data.longitude, res.latitude, res.longitude)
                        if (distance > 2000) {
                            that.data.latitude = res.latitude
                            that.data.longitude = res.longitude
                            // 刷新列表
                            that.getQrList({ lat: res.latitude, lng: res.longitude })
                        }
                    }
                })
            }
        },200)
    },
    getControls: function () {
        app.systemInfo = wx.getSystemInfoSync()
        let botHeight = 30
        let os = app.systemInfo.system.split(' ')
        if (os[0] === 'Android') {
            botHeight = 0
        }
        return [{
            id: 1,
            iconPath: '/images/mapgoto.png',
            position: {
                left: 10,
                top: 10,
                width: 50,
                height: 50
            },
            clickable: true
        },
        {
            id: 2,
            iconPath: '/images/mapscan.png',
            position: {
                left: app.systemInfo.windowWidth / 2 - 51,
                top: 10,
                width: 102,
                height: 40
            },
            clickable: true
        },
        {
            id: 3,
            iconPath: '/images/mapshop.png',
            position: {
                left: app.systemInfo.windowWidth - 55,
                top: 10,
                width: 50,
                height: 50
            },
            clickable: true
        },
        {
            iconPath: '/images/location.png',
            position: {
                left: app.systemInfo.windowWidth / 2 - 5,
                top: app.systemInfo.windowHeight / 2 - 16 - botHeight,
                width: 10,
                height: 22
            }
        }]
    },
    getQrList: function (gps, cb) {
        var that = this
        // 获取商户信息：
        getNearbyShop({ lat: gps.lat, lng: gps.lng }).then(function (res) {
            var markers = []
            for (var i = 0; i < res.length; i++) {
                res[i].range = that.getDistance(res[i].lat, res[i].lng, gps.lat, gps.lng)
                if (res[i].range >= 1000) {
                    res[i].range_km = Math.round(res[i].range / 1000, 1)
                }
                if (!res[i].logo) {
                    res[i].logo = '/images/logo.png'
                } else if (res[i].logo.indexOf("http") == -1) {
                    res[i].logo = config + '/api/' + res[i].logo
                }
                markers[i] = {
                    iconPath: "/images/marker.png",
                    id: parseInt(res[i].shopid),
                    latitude: parseFloat(res[i].lat),
                    longitude: parseFloat(res[i].lng),
                    width: 40,
                    height: 47
                }
            }
            res.sort(function (a, b) {
                return a.range >= b.range ? 1 : -1
            })
            if (that.data.controls.length < 3) {
                // 刷新控制按钮
                that.data.controls = that.getControls()
                that.setData({
                    controls: that.data.controls,
                    markers: markers,
                    lists: res
                })
            } else {
                that.setData({
                    markers: markers,
                    lists: res
                })
            }
            typeof cb == 'function' && cb(res)
        })
    },
    // 店铺列表点击
    navigationTap: function (e) {
        wx.navigateTo({
            url: '/pages/shop/info/index?shopid=' + e.currentTarget.dataset.id
        })
    },
    // 地图点点击
    markerTap: function (e) {
        wx.navigateTo({
            url: '/pages/shop/info/index?shopid=' + e.markerId
        })
    },
    // 控件点击
    controlTap: function (res) {
        // 点击定位控件
        if (res.controlId == 1) {
            this.mapCtx.moveToLocation()
            this.regionchange()
        } else if (res.controlId == 2) {
            // 扫码
            wx.scanCode({
                success: (res) => {
                    if (res.path) {
                        let url = decodeURIComponent(res.path)
                        // 不存在说明不是店铺码，判断是否是服务商招聘合伙人码
                        if (url.indexOf('servicer_uid')) {
                            // 处理码信息
                            app.handleScanPartner(url)
                        } else {
                            wx.switchTab({ url: '/pages/user/user' })
                        }
                    } else {
                        // 获取店铺码code
                        let code = app.handleScanShopQr(res.result)
                        // 如果code存在
                        if (code) {
                            // 跳到支付页面
                            wx.navigateTo({
                                url: '/pages/scan/index?code=' + code,
                            })
                        } 
                    }
                }
            })
        // 查看附近店铺
        } else if (res.controlId == 3) {
            this.setData({
                mapShow: false
            })
        }
    },
    // 返回地图
    backMapTap: function () {
        this.setData({
            mapShow: true
        })
    },
    // 计算距离
    getDistance(lat1, lng1, lat2, lng2) {
        var radLat1 = lat1 * Math.PI / 180.0
        var radLat2 = lat2 * Math.PI / 180.0
        var a = radLat1 - radLat2
        var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
        s = s * 6378137
        s = Math.round(s)
        return s
    }
})