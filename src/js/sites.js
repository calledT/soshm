var device = require('./device');

module.exports = {
  weixin: {
    name: '微信好友',
    icon: require('../img/weixin.png')
  },
  weixintimeline: {
    name: '朋友圈',
    icon: require('../img/weixin_timeline.png')
  },
  qq: {
    name: 'QQ好友',
    icon: require('../img/qq.png'),
    scheme: 'mqqapi://share/to_fri?src_type=web&version=1&file_type=news'
  },
  qzone: {
    name: 'QQ空间',
    icon: require('../img/qzone.png'),
    api: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{url}}&title={{title}}&pics={{pic}}&desc={{digest}}',
    scheme: device.isIOS ?
    'mqqapi://share/to_fri?file_type=news&src_type=web&version=1&generalpastboard=1&shareType=1&cflag=1&objectlocation=pasteboard&callback_type=scheme&callback_name=QQ41AF4B2A' :
    'mqqapi://share/to_qzone?src_type=app&version=1&file_type=news&req_type=1'
  },
  yixin: {
    name: '易信',
    icon: require('../img/yixin.png'),
    api: 'http://open.yixin.im/share?url={{url}}&title={{title}}&pic={{pic}}&desc={{digest}}'
  },
  weibo: {
    name: '微博',
    icon: require('../img/weibo.png'),
    api: 'http://service.weibo.com/share/share.php?url={{url}}&title={{title}}&pic={{pic}}'
  },
  tqq: {
    name: '腾讯微博',
    icon: require('../img/tqq.png'),
    api: 'http://share.v.t.qq.com/index.php?c=share&a=index&url={{url}}&title={{title}}&pic={{pic}}'
  },
  renren: {
    name: '人人网',
    icon: require('../img/renren.png'),
    api: 'http://widget.renren.com/dialog/share?resourceUrl={{url}}&title={{title}}&pic={{pic}}&description={{digest}}'
  },
  douban: {
    name: '豆瓣',
    icon: require('../img/douban.png'),
    api: 'http://douban.com/recommend/?url={{url}}&title={{title}}&image={{pic}}'
  },
  tieba: {
    name: '百度贴吧',
    icon: require('../img/tieba.png'),
    api: 'http://tieba.baidu.com/f/commit/share/openShareApi?url={{url}}&title={{title}}&desc={{digest}}'
  }
}
