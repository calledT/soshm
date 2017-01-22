require('../scss/index');
var delegate = require('delegate');
var extend = require('xtend');
var base64 = require('./base64');
var sitesObj = require('./sites');
var device = require('./device');

var doc = document;
var body = doc.body;

var supportNativeShare = false;
if ((device.isIOS && device.ucBrowserVersion >= 10.2)
    || (device.isAndroid && device.ucBrowserVersion >= 9.7)
    || device.qqBrowserVersion >= 5.4) {
  supportNativeShare = true;
}

// 支持浏览器原生分享的APP
var nativeShareApps = {
  weibo: ['kSinaWeibo', 'SinaWeibo', 11],
  weixin: ['kWeixin', 'WechatFriends', 1],
  weixintimeline: ['kWeixinFriend', 'WechatTimeline', 8],
  qq: ['kQQ', 'QQ', 4],
  qzone: ['kQZone', 'Qzone', 3]
};

var templateStr =
'<div class="soshm-item {{site}}" data-site="{{site}}">' +
  '<span class="soshm-item-icon">' +
    '<img src="{{icon}}" alt="{{site}}">' +
  '</span>' +
  '<span class="soshm-item-text">{{name}}</span>' +
'</div>';

var metaDesc = doc.getElementsByName('description')[0];
var firstImg = doc.getElementsByTagName('img')[0];
var defaults = {
  title: doc.title,
  url: location.href,
  digest: metaDesc && metaDesc.content || '',
  pic: firstImg && firstImg.src || '',
  from: location.host,
  sites: ['weixin', 'weixintimeline', 'yixin', 'weibo', 'qq', 'qzone']
};

function soshm(selector, options) {
  var elems = doc.querySelectorAll(selector);
  for(var i=0, length = elems.length; i < length; i++) {
    var elem = elems[i];
    var status = elem.getAttribute('sosh-status');
    if (status !== 'initialized') {
      var dataset = extend(elem.dataset);
      if (dataset.sites) dataset.sites = dataset.sites.split(',');

      options = extend({}, defaults, dataset, options);

      var sitesHtml = getSitesHtml(options.sites);
      elem.insertAdjacentHTML('beforeend', sitesHtml);
      elem.setAttribute('sosh-status', 'initialized');
      elem.classList.add('soshm');

      (function(options) {
        delegate(elem, '.soshm-item', 'click', function(e) {
          var site = e.delegateTarget.dataset.site;
          shareTo(site, options);
        });
      })(options);
    }
  }
  // 普通浏览器没有webapi的分享是通过QQ浏览器当桥梁进行的，
  // 需要通过URL参数判断分享到哪个地方
  var site = getQueryVariable('__soshmbridge');
  if (site && typeof history.replaceState === 'function') {
    var url = location.href.replace(new RegExp('[&?]__soshmbridge='+site, 'gi'), '');
    history.replaceState(null, doc.title, url);
    shareTo(site, extend(defaults, opts));
  }
}

soshm.popIn = function(options) {
  var popDelegation;
  var pop = doc.querySelector('.soshm-pop');
  if (!pop) {
    pop = doc.createElement('div');
    pop.className = 'soshm-pop';
    body.appendChild(pop);
  }

  options = extend({}, defaults, options);
  pop.innerHTML =
    '<div class="soshm-pop-sites">' +
      getSitesHtml(options.sites, 3) +
    '</div>';

  var popDelegation = delegate(pop, '.soshm-item', 'click', function(e) {
    var site = e.delegateTarget.dataset.site;
    shareTo(site, options);
  });
  pop.classList.remove('soshm-pop-hide');
  pop.style.display = 'block';
  setTimeout(function() {
    pop.classList.add('soshm-pop-show');
  }.bind(this), 0);

  pop.addEventListener('click', function() {
    pop.classList.remove('soshm-pop-show');
    pop.classList.add('soshm-pop-hide');
    setTimeout(function() {
      pop.style.display = 'none';
      popDelegation.destroy();
    }, 1100);
  }, false);
};

soshm.weixinSharetip = function(duration) {
  if (getType(duration) !== 'number') duration = 2000;
  if (device.isWeixin) {
    var elem = doc.querySelector('.soshm-weixin-sharetip');
    if (!elem) {
      var  elem = doc.createElement('div');
      elem.className = 'soshm-weixin-sharetip';
      body.appendChild(elem);
    }
    elem.classList.add('weixin-sharetip-show');
    setTimeout(function() {
      elem.classList.remove('weixin-sharetip-show');
    }, duration);
  }
};

function shareTo(site, data) {
  var app;
  var shareInfo;
  var api = sitesObj[site].api;

  // 在UC和QQ浏览器里，对支持的应用调用原生分享
  if (supportNativeShare) {
    if (device.isUCBrowser) {
      if (nativeShareApps[site]) {
        app = device.isIOS ? nativeShareApps[site][0] : nativeShareApps[site][1];
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

    if (device.isQQBrowser) {
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
            shareTo(site, data);
          });
        }
        return;
      }
    }
  }

  // 在普通浏览器里，使用URL Scheme唤起QQ客户端进行分享
  if (site === 'qzone' || site === 'qq') {
    var scheme = appendToQuerysting(sitesObj[site].scheme, {
      share_id: '1101685683',
      url: base64.encode(data.url),
      title: base64.encode(data.title),
      description: base64.encode(data.digest),
      previewimageUrl: base64.encode(data.pic), //For IOS
      image_url: base64.encode(data.pic) //For Android
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
  if (device.isWeixin && (site.indexOf('weixin') !== -1)) {
    soshm.weixinSharetip();
    return;
  }

  // 对于没有原生分享的网站，使用webapi进行分享
  if (api) {
    for (k in data) {
      api = api.replace(new RegExp('{{' + k + '}}', 'g'), encodeURIComponent(data[k]));
    }
    window.open(api, '_blank');
  }
}

/**
 * 获取分享站点的html字符串
 * @param  {Array} sites      [需要展示的站点数组]
 * @param  {Number} groupsize [分组的大小，不传表示不分组]
 * @return {String}           [html字符串]
 */
function getSitesHtml(sites, groupsize) {
  var html = '';
  var groupsize = getType(groupsize) === 'number' && groupsize !== 0 ? groupsize : 0;
  for (var i = 0, length = sites.length; i < length; i++) {
    if (groupsize && i % groupsize === 0) {
      html += '<div class="soshm-group group' + ((i / groupsize) + 1) + '">';
    }

    var key = sites[i];
    var siteObj = sitesObj[key];
    if (siteObj) {
      html += templateStr.
        replace(/\{\{site\}\}/g, key)
        .replace(/\{\{icon\}\}/g, siteObj.icon)
        .replace(/\{\{name\}\}/g, siteObj.name);
    } else {
      console.warn('site [' + key + '] not exist.');
    }

    if (groupsize && (i % groupsize === groupsize - 1 || i === length - 1)) {
      html += '</div>';
    }
  }
  return html;
}

/**
 * 获取传入参数类型
 * @param  {String,Number,Array,Boolaen,Function,Object,Null,Undefined} obj
 * @return {String}     []
 */
function getType(obj) {
  if (obj === null) return 'null';
  if (typeof obj === undefined) return 'undefined';

  return Object.prototype.toString.call(obj)
          .match(/\s([a-zA-Z]+)/)[1]
          .toLowerCase();
}

/**
 * 追加对象字面量对象到URL的querystring里
 * @param  {String} url [URL字符串]
 * @param  {Object} obj [对象字面量]
 * @return {String}     [追加querystring后的URL字符串]
 */
function appendToQuerysting(url, obj) {
  var arr = [];
  for(var k in obj) {
    arr.push(k + '=' + obj[k]);
  }
  return url + (url.indexOf('?') !== -1 ? '&' : '?') + arr.join('&');
}

/**
 * 获取querystring中特定变量的值
 * @param  {String} variable [变量名]
 * @return {String}          [变量值]
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
 * 动态加载外部脚本
 * @param  {String}   url [脚本地址]
 * @param  {Function} done  [脚本完毕回调函数]
 */
function loadScript(url, done) {
  var script = doc.createElement('script');
  script.src = url;
  script.onload = onreadystatechange = function() {
    if (!this.readyState ||
        this.readyState === 'load' ||
        this.readyState === 'complete') {
      done && done();
      script.onload = onreadystatechange
      script.parentNode.removeChild(script);
    }
  };
  body.appendChild(script);
}

/**
 * 通过scheme唤起APP
 * @param  {String} scheme [app打开协议]
 */
function openAppByScheme(scheme) {
  if (device.isIOS) {
    window.location.href = scheme;
  } else {
    var iframe = doc.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = scheme;
    body.appendChild(iframe);
    setTimeout(function() {
      iframe && iframe.parentNode && iframe.parentNode.removeChild(iframe);
    }, 2000);
  }
}

module.exports = soshm;
