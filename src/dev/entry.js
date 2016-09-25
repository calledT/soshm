var soshm = require('../js/index');

soshm('#share1', {sites: ['weixin', 'weibo', 'yixin', 'qzone', 'tqq']});

soshm('#share2', {sites: ['weixin', 'weibo', 'yixin', 'qzone', 'tqq', 'qq']});

soshm('.share');

document.getElementById('btn').addEventListener('click', function() {
  soshm.popIn({
    title: '弹窗分享',
    sites: ['weixin', 'weixintimeline', 'weibo', 'yixin', 'qzone', 'tqq', 'qq']
  });
}, false);
