var Soshm = require('../js/index');

var share1 = new Soshm('#share', {sites: ['weixin', 'weibo', 'yixin', 'qzone', 'tqq']});

document.getElementById('btn1').addEventListener('click', function() {
  share1.popIn({sites: ['weixin', 'weixintimeline', 'weibo', 'yixin', 'qzone', 'tqq', 'qq', 'renren', 'douban']});
}, false);
