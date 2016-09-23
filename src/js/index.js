require('../scss/index');
var extend = require('xtend');
var Base64 = require('base64');

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var doc = document;
var body = doc.body;
var metaDesc = doc.getElementsByName('description')[0];
var firstImg = doc.getElementsByTagName('img')[0];

var ua = navigator.userAgent.toLowerCase();
var isIOS = deviceDetect('iPhone') || deviceDetect('iPad') || deviceDetect('iPod');
var isAndroid = deviceDetect('Android');
var isUCBrowser = deviceDetect('UCBrowser');
var isQQBrowser = deviceDetect('MQQBrowser');
var isWeixin = deviceDetect('MicroMessenger');
var qqBrowserVersion = isQQBrowser ? getVersion(ua.split('mqqbrowser/')[1]) : 0;
var ucBrowserVersion = isUCBrowser ? getVersion(ua.split('ucbrowser/')[1]) : 0;
var iOSVersion = isIOS ? parseInt(ua.match(/\s*os\s*\d/gi)[0].split(' ')[2], 10) : 0;

var supportNativeShare = false;
if (
    (isIOS && ucBrowserVersion >= 10.2) ||
    (isAndroid && ucBrowserVersion >= 9.7) ||
    qqBrowserVersion >= 5.4
  ) {
    supportNativeShare = true;
  }

if (isWeixin) body.insertAdjacentHTML('beforeend', '<div class="soshm-wxsharetip"></div>');

var template =
  '<div class="soshm-item {{site}}" data-site="{{site}}">' +
    '<img class="soshm-item-icon" src="{{icon}}">' +
    '<span class="soshm-item-text">{{name}}</span>' +
  '</div>';

var socialSites = {
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
    scheme: isIOS ?
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
};

// 支持浏览器原生分享的APP
var nativeShareApps = {
  weibo: ['kSinaWeibo', 'SinaWeibo', 11],
  weixin: ['kWeixin', 'WechatFriends', 1],
  weixintimeline: ['kWeixinFriend', 'WechatTimeline', 8],
  qq: ['kQQ', 'QQ', 4],
  qzone: ['kQZone', 'Qzone', 3]
};

var defaults = {
  title: doc.title,
  url: location.href,
  digest: metaDesc && metaDesc.content || '',
  pic: firstImg && firstImg.src || '',
  from: location.host,
  sites: ['weixin', 'weixintimeline', 'yixin', 'weibo', 'qq', 'qzone']
};

function Share() {
  var args = arguments;
  this.opts = {};
  if (getType(args[0]) === 'string') {
    this.elems = doc.querySelectorAll(args[0]);
    this.length = this.elems.length;
    this.opts = args[1];
    this.init(this.opts);
  } else if (getType(args[0]) === 'object') {
    this.opts = args[0]
  }
}

Share.prototype = {
  constructor: this,
  init: function(opts) {
    // 普通浏览器没有webapi的分享是通过QQ浏览器当桥梁进行的，
    // 需要通过URL参数判断分享到哪个地方
    var site = getQueryVariable('__soshmbridge');
    if (site) {
      if (typeof history.replaceState === 'function') {
        var url = location.href.replace(new RegExp('[&?]__soshmbridge='+site, 'gi'), '');
        history.replaceState(null, doc.title, url);
        this.shareTo(site, extend(defaults, opts));
      }
    }

    if (this.length) {
      for(i=0; i<this.length; i++) {
        var elem = this.elems[i];

        var dataset = extend(elem.dataset);

        if (dataset.sites) dataset.sites = dataset.sites.split(',');

        var config = extend(defaults, opts, dataset);

        var sitesHtml = this.getSitesHtml(config.sites);

        elem.insertAdjacentHTML('beforeend', sitesHtml);

        elem.classList.add('soshm');

        this._handlerClick(elem, config);
      }
    }
  },
  getSitesHtml: function(sites, groupsize) {
    var i = 0;
    var html = '';
    var length = sites.length;
    var groupsize = getType(groupsize) === 'number' && groupsize !== 0 ? groupsize : 0;

    for (; i < length; i++) {
      if (groupsize && i % groupsize === 0) {
        html += '<div class="soshm-group group' + ((i / groupsize) + 1) + '">';
      }

      html += this.parseTemplate(sites[i]);

      if (groupsize && (i % groupsize === groupsize - 1 || i === length - 1)) {
        html += '</div>';
      };
    }

    return html;
  },
  parseTemplate: function(site) {
    if (socialSites[site]) {
      return template.replace(/\{\{site\}\}/g, site)
        .replace(/\{\{icon\}\}/g, socialSites[site].icon)
        .replace(/\{\{name\}\}/g, socialSites[site].name);
    } else {
      console.warn('site [' + site + '] not exist.');
      return '';
    }
  },
  shareTo: function(site, data) {
    var _this = this;
    var app;
    var shareInfo;
    var api = socialSites[site].api;

    // 在UC和QQ浏览器里，对支持的应用调用原生分享
    if (supportNativeShare) {
      if (isUCBrowser) {
        if (nativeShareApps[site]) {
          app = isIOS ? nativeShareApps[site][0] : nativeShareApps[site][1];
        }

        if (app !== undefined) {
          shareInfo = [data.title, data.digest, data.url, app, '', '@'+data.from, ''];

          // android
          if (window.ucweb) {
            ucweb.startRequest && ucweb.startRequest('shell.page_share', shareInfo);
          }

          // ios
          if (window.ucbrowser) {
            ucbrowser.web_share && ucbrowser.web_share.apply(null, shareInfo);
          }
          return;
        }
      }

      if (isQQBrowser) {
        if (nativeShareApps[site]) app = nativeShareApps[site][2];
        if (app !== undefined) {
          if (window.browser) {
            shareInfo = {
              url: data.url,
              title: data.title,
              description: data.digest,
              img_url: data.pic,
              img_title: data.title,
              to_app: app,
              cus_txt: ''
            };

            browser.app && browser.app.share(shareInfo);
          } else {
            loadScript('//jsapi.qq.com/get?api=app.share', function() {
              _this.shareTo(site, data);
            });
          }
          return;
        }
      }
    }

    // 在普通浏览器里，使用URL Scheme唤起QQ客户端进行分享
    if (site === 'qzone' || site === 'qq') {
      var scheme = appendToQuerysting(socialSites[site].scheme, {
        share_id: '1101685683',
        url: Base64.encode(data.url),
        title: Base64.encode(data.title),
        description: Base64.encode(data.digest),
        previewimageUrl: Base64.encode(data.pic), //For IOS
        image_url: Base64.encode(data.pic) //For Android
      });
      openAppByScheme(scheme);
      return;
    }

    // 在普通浏览器里点击微信分享，通过QQ浏览器当桥梁唤起微信客户端
    // 如果没有安装QQ浏览器则点击无反应
    if (site.indexOf('weixin') !== -1) {
      var mttbrowserURL = appendToQuerysting(location.href, {__soshmbridge: site});
      openAppByScheme('mttbrowser://url=' + mttbrowserURL);
    }

    // 在微信里点微信分享，弹出右上角提示
    if (isWeixin && (site.indexOf('weixin') !== -1)) {
      Share.wxShareTip();
      return;
    }

    // 对于没有原生分享的网站，使用webapi进行分享
    if (api) {
      for (k in data) {
        api = api.replace(new RegExp('{{'+k+'}}', 'g'), encodeURIComponent(data[k]));
      }
      window.open(api, '_blank');
    }
  },
  popIn: function (opts) {
    if (!this.popElem) {
      var config = extend(defaults, this.opts, opts);
      var html = '<div class="soshm-pop"><div class="soshm-pop-sites">' + this.getSitesHtml(config.sites, 3) + '</div></div>';
      body.insertAdjacentHTML('beforeend', html);
      this.popElem = doc.querySelector('.soshm-pop');
      this.popClass = this.popElem.classList;
      this._handlerClick(this.popElem, config);
      this.popElem.onclick = function() {
        this.popOut();
      }.bind(this);
    }
    this.popClass.remove('soshm-pop-hide');
    this.popElem.style.display = 'block';
    setTimeout(function() {
      this.popClass.add('soshm-pop-show');
    }.bind(this), 0);
  },
  popOut: function () {
    if (this.popElem) {
      this.popClass.remove('soshm-pop-show');
      this.popClass.add('soshm-pop-hide');
      setTimeout(function() {
        this.popElem.style.display = 'none';
      }.bind(this), 800);
    }
  },
  _handlerClick: function(agent, data) {
    var _this = this;
    delegate(agent, '.soshm-item', 'click', function() {
      _this.shareTo(this.dataset.site, data);
    });
  }
};

Share.wxShareTip = function (duration) {
  if (getType(duration) !== 'number') duration = 2000;
  if (isWeixin) {
    var tipElem = doc.querySelector('.soshm-wxsharetip');
    tipElem.classList.add('wxsharetip-show');
    setTimeout(function() {
      tipElem.classList.remove('wxsharetip-show');
    }, duration);
  }
};

function getType(obj) {
  if (obj === null) return 'null';
  if (typeof obj === undefined) return 'undefined';

  return toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

/**
 * [追加对象字面量对象到URL的querystring里]
 * @param  {[string]} url [URL字符串]
 * @param  {[object]} obj [对象字面量]
 * @return {[string]}     [追加querystring后的URL字符串]
 */
function appendToQuerysting(url, obj) {
  var arr = [];
  for(var k in obj) {
    arr.push(k + '=' + obj[k]);
  }
  return url + (url.indexOf('?') !== -1 ? '&' : '?') + arr.join('&');
}

/**
 * [获取querystring中特定变量的值]
 * @param  {[string]} variable [变量名]
 * @return {[string]}          [变量值]
 */
function getQueryVariable(variable) {
  var query = location.search.substring(1);
  var vars = query.split('&');
  var length = vars.length;
  for (var i = 0; i < length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}

/**
 * [事件委托]
 * @param  {[Element object]} agent  [被委托的元素]
 * @param  {[string]}   selector     [选择器]
 * @param  {[string]}   type         [事件名称]
 * @param  {Function} fn             [事件处理函数]
 */
function delegate(agent, selector, type, fn) {
  agent.addEventListener(type, function(e) {
    var target = e.target;
    var ctarget = e.currentTarget;
    while (target && target !== ctarget) {
      if (selectorMatches(target, selector)) {
        fn.call(target, e);
        return;
      }
      target = target.parentNode;
    }
  }, false);
}

/**
 * [判断html元素是否和给出的选择器匹配]
 * @param  {[Element object]} elem  [html元素]
 * @param  {[string]} selector      [选择器]
 * @return {[boolean]}
 */
function selectorMatches(elem, selector) {
  var p = Element.prototype;
  var f = p.matches ||
          p.webkitMatchesSelector ||
          p.mozMatchesSelector ||
          p.msMatchesSelector ||
          function(s) {
            return [].indexOf.call(doc.querySelectorAll(s), this) !== -1;
          };

  return f.call(elem, selector);
}

function loadScript(url, cb) {
  var script = doc.createElement('script');
  script.src = url;
  script.onload = onreadystatechange = function() {
    if (!this.readyState || this.readyState === 'load' || this.readyState === 'complete') {
      cb && cb();
      script.onload = onreadystatechange
      script.parentNode.removeChild(script);
    }
  };
  body.appendChild(script);
}

function deviceDetect(needle) {
  needle = needle.toLowerCase();
  return ua.indexOf(needle) !== -1;
}

function getVersion(nece) {
  var arr = nece.split('.');
  return parseFloat(arr[0] + '.' + arr[1]);
}

function openAppByScheme(scheme) {
  if (iOSVersion > 8) {
    window.location.href = scheme;
  } else {
    var iframe = doc.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = scheme;
    body.appendChild(iframe);
    setTimeout(function() {
      iframe && iframe.parentNode && iframe.parentNode.removeChild(iframe);
    }, 5000);
  }
}

module.exports = Share;
