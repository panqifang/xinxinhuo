// 导入设置
import common from './appset'
// 域名设置
const HOST = 'https://g.mtx6.com'
// 小程序标识
const HASH = '3a225b73'

export default Object.assign({
    hostUrl: HOST,
    host: HOST + '/api',
    hash: HASH,
}, common[HASH])

// g.mtx6.com-- hash 列表
// 惠哆啦 6a60ed12
// 共享财富生活 61ba3d45
// 北辰共享 89356307
// 有分红 28616873
// 共享链商家 45d21094
// 共享W惠州 13ad1e22
// 分享链 1422237f
// 汇联商盟 3a12ac5f
// 创享链商家 3a225b73
// 共享支付链 da4ee1e1
// 优享购共享商家 f8438147
