(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("soshm", [], factory);
	else if(typeof exports === 'object')
		exports["soshm"] = factory();
	else
		root["soshm"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(7);
	var delegate = __webpack_require__(5);
	var extend = __webpack_require__(19);
	var base64 = __webpack_require__(20);
	var sitesObj = __webpack_require__(21);
	var device = __webpack_require__(1);

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


/***/ },
/* 1 */
/***/ function(module, exports) {

	var ua = navigator.userAgent.toLowerCase();

	/**
	 * 设备检测函数
	 * @param  {String} needle [特定UA标识]
	 * @return {Boolean}
	 */
	function deviceDetect(needle) {
	  needle = needle.toLowerCase();
	  return ua.indexOf(needle) !== -1;
	}

	/**
	 * 获取浏览器版本
	 * @param  {String} nece [UA中带有版本信息的部分字符串]
	 * @return {Number}      [版本号]
	 */
	function getVersion(nece) {
	  var arr = nece.split('.');
	  return parseFloat(arr[0] + '.' + arr[1]);
	}

	var device = {
	  isIOS: deviceDetect('iPhone') || deviceDetect('iPad') || deviceDetect('iPod'),
	  isAndroid: deviceDetect('Android'),
	  isUCBrowser: deviceDetect('UCBrowser'),
	  isQQBrowser: deviceDetect('MQQBrowser'),
	  isWeixin: deviceDetect('MicroMessenger')
	};

	device.qqBrowserVersion = device.isQQBrowser ? getVersion(ua.split('mqqbrowser/')[1]) : 0;
	device.ucBrowserVersion = device.isUCBrowser ? getVersion(ua.split('ucbrowser/')[1]) : 0;

	module.exports = device;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, ".soshm{text-align:center;-webkit-tap-highlight-color:transparent}.soshm:after,.soshm:before{content:\" \";display:table}.soshm:after{clear:both}.soshm-item{float:left;margin:5px;cursor:pointer}.soshm-item-icon{box-sizing:content-box;display:inline-block;width:26px;height:26px;padding:5px;margin:0;vertical-align:middle;border-radius:50%}.soshm-item-icon img{vertical-align:top;padding:0;margin:0;width:100%;height:100%}.soshm-item-text{display:none;font-size:14px;color:#666}.soshm-item.weixin .soshm-item-icon{background:#49b233}.soshm-item.weixin:hover .soshm-item-icon{background:#398a28}.soshm-item.yixin .soshm-item-icon{background:#23cfaf}.soshm-item.yixin:hover .soshm-item-icon{background:#1ca38a}.soshm-item.weibo .soshm-item-icon{background:#f04e59}.soshm-item.weibo:hover .soshm-item-icon{background:#ec1f2d}.soshm-item.qzone .soshm-item-icon{background:#fdbe3d}.soshm-item.qzone:hover .soshm-item-icon{background:#fcad0b}.soshm-item.renren .soshm-item-icon{background:#1f7fc9}.soshm-item.renren:hover .soshm-item-icon{background:#18639d}.soshm-item.tieba .soshm-item-icon{background:#5b95f0}.soshm-item.tieba:hover .soshm-item-icon{background:#2c77ec}.soshm-item.douban .soshm-item-icon{background:#228a31}.soshm-item.douban:hover .soshm-item-icon{background:#186122}.soshm-item.tqq .soshm-item-icon{background:#97cbe1}.soshm-item.tqq:hover .soshm-item-icon{background:#6fb7d6}.soshm-item.qq .soshm-item-icon{background:#4081e1}.soshm-item.qq:hover .soshm-item-icon{background:#2066ce}.soshm-item.weixintimeline .soshm-item-icon{background:#1cb526}.soshm-item.weixintimeline:hover .soshm-item-icon{background:#15891d}.soshm-group{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;padding:15px 20px}.soshm-group .soshm-item{display:block;float:none;margin:0}.soshm-pop{display:none;position:fixed;top:0;left:0;right:0;bottom:0;height:100%;width:100%;opacity:0;z-index:9999;background:rgba(0,0,0,.65);-webkit-transition-property:opacity;transition-property:opacity;-webkit-transition-timing-function:ease-in;transition-timing-function:ease-in}.soshm-pop-show{opacity:1;-webkit-transition-duration:.6s;transition-duration:.6s}.soshm-pop-show .group1{-webkit-animation:soshtrans 1.2s 1 ease;animation:soshtrans 1.2s 1 ease}.soshm-pop-show .group2{-webkit-animation:soshtrans 1.7s 1 ease;animation:soshtrans 1.7s 1 ease}.soshm-pop-show .group3{-webkit-animation:soshtrans 2.2s 1 ease;animation:soshtrans 2.2s 1 ease}.soshm-pop-show .group4{-webkit-animation:soshtrans 2.7s 1 ease;animation:soshtrans 2.7s 1 ease}.soshm-pop-hide{opacity:0;-webkit-transition-duration:1s;transition-duration:1s}.soshm-pop-hide .group1{-webkit-animation:soshtrans2 .5s 1 cubic-bezier(.68,-.55,.265,1.55) 0ms forwards;animation:soshtrans2 .5s 1 cubic-bezier(.68,-.55,.265,1.55) 0ms forwards}.soshm-pop-hide .group2{-webkit-animation:soshtrans2 .5s 1 cubic-bezier(.68,-.55,.265,1.55) .2s forwards;animation:soshtrans2 .5s 1 cubic-bezier(.68,-.55,.265,1.55) .2s forwards}.soshm-pop-hide .group3{-webkit-animation:soshtrans2 .5s 1 cubic-bezier(.68,-.55,.265,1.55) .4s forwards;animation:soshtrans2 .5s 1 cubic-bezier(.68,-.55,.265,1.55) .4s forwards}.soshm-pop-hide .group4{-webkit-animation:soshtrans2 .5s 1 cubic-bezier(.68,-.55,.265,1.55) .6s forwards;animation:soshtrans2 .5s 1 cubic-bezier(.68,-.55,.265,1.55) .6s forwards}.soshm-pop-sites{position:absolute;top:50%;left:0;width:100%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.soshm-pop .soshm-item-icon{width:42px;height:42px;padding:10px}.soshm-weixin-sharetip{position:fixed;overflow:hidden;width:100%;height:100%;top:0;left:0;background:rgba(0,0,0,.6) url(" + __webpack_require__(16) + ") no-repeat right 0;background-size:50% auto;z-index:-1;opacity:0;visibility:hidden;-webkit-transition:all .6s ease-out;transition:all .6s ease-out}.soshm-weixin-sharetip.weixin-sharetip-show{z-index:9999;opacity:1;visibility:visible}@-webkit-keyframes soshtrans{0%{-webkit-transform:translate3d(0,1136px,0);transform:translate3d(0,1136px,0)}50%{-webkit-transform:translateZ(0);transform:translateZ(0)}60%{-webkit-transform:translateZ(0);transform:translateZ(0)}to{-webkit-transform:translateZ(0);transform:translateZ(0)}}@keyframes soshtrans{0%{-webkit-transform:translate3d(0,1136px,0);transform:translate3d(0,1136px,0)}50%{-webkit-transform:translateZ(0);transform:translateZ(0)}60%{-webkit-transform:translateZ(0);transform:translateZ(0)}to{-webkit-transform:translateZ(0);transform:translateZ(0)}}@-webkit-keyframes soshtrans2{0%{opacity:1;-webkit-transform:translateZ(0);transform:translateZ(0)}to{opacity:0;-webkit-transform:translate3d(0,500%,0);transform:translate3d(0,500%,0)}}@keyframes soshtrans2{0%{opacity:1;-webkit-transform:translateZ(0);transform:translateZ(0)}to{opacity:0;-webkit-transform:translate3d(0,500%,0);transform:translate3d(0,500%,0)}}", ""]);

	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	var DOCUMENT_NODE_TYPE = 9;

	/**
	 * A polyfill for Element.matches()
	 */
	if (Element && !Element.prototype.matches) {
	    var proto = Element.prototype;

	    proto.matches = proto.matchesSelector ||
	                    proto.mozMatchesSelector ||
	                    proto.msMatchesSelector ||
	                    proto.oMatchesSelector ||
	                    proto.webkitMatchesSelector;
	}

	/**
	 * Finds the closest parent that matches a selector.
	 *
	 * @param {Element} element
	 * @param {String} selector
	 * @return {Function}
	 */
	function closest (element, selector) {
	    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
	        if (element.matches(selector)) return element;
	        element = element.parentNode;
	    }
	}

	module.exports = closest;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var closest = __webpack_require__(4);

	/**
	 * Delegates event to a selector.
	 *
	 * @param {Element} element
	 * @param {String} selector
	 * @param {String} type
	 * @param {Function} callback
	 * @param {Boolean} useCapture
	 * @return {Object}
	 */
	function delegate(element, selector, type, callback, useCapture) {
	    var listenerFn = listener.apply(this, arguments);

	    element.addEventListener(type, listenerFn, useCapture);

	    return {
	        destroy: function() {
	            element.removeEventListener(type, listenerFn, useCapture);
	        }
	    }
	}

	/**
	 * Finds closest match and invokes callback.
	 *
	 * @param {Element} element
	 * @param {String} selector
	 * @param {String} type
	 * @param {Function} callback
	 * @return {Function}
	 */
	function listener(element, selector, type, callback) {
	    return function(e) {
	        e.delegateTarget = closest(e.target, selector);

	        if (e.delegateTarget) {
	            callback.call(element, e);
	        }
	    }
	}

	module.exports = delegate;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(6)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/postcss-loader/index.js!./../../node_modules/sass-loader/index.js!./index.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/postcss-loader/index.js!./../../node_modules/sass-loader/index.js!./index.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMAIPDgv0BegH/AoDCPzxBvsNFNiOYAAAC3SURBVHhe7dbNCoQwDATgabttV+tf3v9lF+rJRJr2sojkO0oYBg1BPIhx3zEJTKQxE04WIJnBLZSoz/T6AD81KAH6kv4twAIswH8a1AC7B7lPwvulzwJp80tBh7J4IooQdiIKu4PmPLwrhND5X1CoSmASVRGqXAcDmKOzALCFuwqOFWiJdxVm/lB/j0kpoFZYZYEDDXK8iAIOTXx+5om5ub0Xnh1HqtbLTGEff1h8W0DMwxwew/wAniVLWfHYFrQAAAAASUVORK5CYII="

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAP1BMVEVHcEz///////////////////////////////////////////////////////////////////////////////9KjZoYAAAAFHRSTlMAIGAwgKDwQBDA0FDfsHDgkD+PT2O/b44AAAGsSURBVHhe1dfddqsgEAXgzf8AYmw67/+sPUe7zHLhONjctN9dFHaMCVuCX859/GPwM+5Z+Ft+fuIuO/FB9IQb6sSd6DHsyaeKwxAqLIhpcL7MQdf4QtQTZr5UoDCRr3lcC6yIhCuGVV65ANWEK5F1CbLKAxbIPA/IkGUeARkPMe8GJEjS3w+o7wY0HrJAYGzmEQECT/Rgna9OCgBcGXl/j1M095Xa8xADqtMXVF7HzIQzCzamidMTVqniRHpVtguRO2U2+DZPhA5NzPb1yi6Fd4+8VDq0xiJ0STskm7RyOKB8uqRpu+hYobDbwCaWWU64kLLUKtNI4dgs/p6dXnmfz4lfOIp1nLFJ8769+rA+x+tFfXJt4dYjbupP5FuLmu8HZCnA/ihgLZLHSMA+MPRtaLYTakBO/U206xHL/02WtvsqqWjdho0iFwCFNzkEeX5eh2cc2UAA3Oiz1bUkbfJU9s1dWoAiaPNV5Y2N6l6nshiM8kdBN0PkeYiFgHhMu7NRLlH5DMpXGGD7TIJojn1t1QcfNMIFsm3PKDNhVcOe8VgMVJRW3bGaEuEX+gJWbpMHBa1eygAAAABJRU5ErkJggg=="

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAP1BMVEVHcEz///////////////////////////////////////////////////////////////////////////////9KjZoYAAAAFHRSTlMAYECgEPAwwH8/4NAgUJCwcM+fr0RbN4IAAAGVSURBVHhe7ZbdkoMgDIUVE2ARf7o97/+s22k7pZmAUJnZq36XmBwPJgGHf+CLQ+zKN8DUJbABXRYi0GdhArosRNy5dhoAzMl8whN3UsADXRaI0WfBA30WGOiyMOKd8XOBIATCGQNdFoghCXSiBAJ/YgoEXJgp+5PjCs1Vh9H9yOjA3gRoVcuzK5KtjHVqu27db/Y0vyLKvtZ35AjOjz+itE74tEPCMBJa5hFKF5EvHdoAiX5XFPkTDRKaUWK7x1oW+YOCJuRZB5lfHoysAo9tsy2idKlGtZZnST7Fpxa9Fgr5aafqU/0qzTI0q62SyHc0HJOajU2mfeCHVoE55vKx1QSC7DTLkFxqAtJp1DPSdJ/yksZs34I6Qw4waXgStHjHjZecKVbKjuvcUIYdYF/GVf+YPGq42k9NDa71URX6SIB3MaH1MkAykb44xnaB8HyZnZvHySLBb5E7N5bBvMVF0Yxb2zgtL/eL0g540tJHng4e2qqAK4TER5GXShvwQZ2WUCmDA9bDTqP1eJz8ZoYKVoX08uUPi2Bapj4cFIsAAAAASUVORK5CYII="

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMAMNCgYIDAEPBAULAgkHDf4FyRdXUAAAG8SURBVHhezZbdcoQgDEbDn4ki6vf+L9tOZ2dSuoSsXvXcaeAYCHGgfwvn1PRpSXmnO+QKAPoMAPHgj6efwLsAkPRRGtsJjAUAkpvFXoGJAJKd7AUDAUPBwmTCCRgJVvwmBjP9iE8EkI2GBMFcoKzOfFcgg1VwhCNwDAvuCBCZeg7cE6BRR8BdATZnAa7gZFJW3BegkHI+EQj3A3yBnUJ9JjjpxY5HAi3E8VSQtIZzAcHACfuCVRN8JjimWxB9Qf2JFoxZrJOuxGm0+gJMo0UFxRfYx8TfZ4wRUkhmdYzmMVOSswRDrmz3BRd1yERQ7Rp4dbjsmDB1sNhnbZskoBR71G4l4KeQ6YfLjBBxoBcZ77w+0yZ9VM9JQ0SryLLr7xK7vYiDXlxmFzQgmRcAdRfrELN0+5mtfmerCQ6t1cCwjosc/5ZOeGxYxkWu/OZtpGSj2/KoicNoaNYd6IhaGH03vApsYjfLFUihBgy/FuLwprcCrZNms7e4QV8oW+gf35tD2Q/yCIKZ4cb8Z4YswFOD7t9zQ4NBYpqhZTY5A/lwERhIYfqIvGDApdN99qOiI7ZAdwm5tOWbUnKgf8wXi3+FNpeg8ZMAAAAASUVORK5CYII="

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMAMPCggL8QwD9/4NCQsHDPYFAr85NjAAABBklEQVR4Xu3V3Y6DIBCG4QFxoP5u5/4vdrM4+2kTaoD+eMJ7QtvUJxHHQF+sFbboabdkhGTrOSDJyoEGWI9sFeAJ+csAjzUJhD2uAY6FK4AG1M9BAxrQawr02nQOdDsg6fw54K4E1lcBeRHgNDA4NJwD97guByBxYJwBXVxXpsn/lQsgthKbSSsFFtFcHcCD/PdTBThB1lQARg4NXArgBnQj+2JgltjIKnSFQIcT546NLAE62Udg0s8Go3xDQxrgVbYsH3eDc18msz4emQH/ywTswwTiJkaTCyyCjdfG+DwoF6BZr0dGv+UCbPV65BYqASjg/UGFk+gMVQLoM0CIGUIGP7yr1i+rL2X5ejXICAAAAABJRU5ErkJggg=="

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMAoLAwwECAEPAg0HDgYFCQv48OkrAuAAAB90lEQVR4Xu2UXZOjIBBFG+RTQJPz/3/sbqKxnZCpcczD1lblPNGl3Kb70sj/xochXG2Y5CzTBUiQgpyiUEu86TjGKL8nYB/b2k8KUXoGrAaN+butzVaAZFuWL9i0lzVotCMbFMxeIi85r3CN97BIT0gA1RnjRgCusuHx9z7ColRtf3oL1LKmzaUCl6gtvC0dQL3FznX7R0ghilIS2u3AvREA42sBC2l4avwIoyxM9xKGBEy3OD2XMEONr041r8tlMczYxdT21H/NvycnGNRGNdA+22igyAsaXL5epIwR8YTuAHUXeV277QgNE5dcXvLczYnWNFXAxEcE83aadDM5phSlt4C8+XUnPWI1QrwDavT0o6R/eVYuWoNs5BLml8MIVru5krcTdfZ0CgMETbjiNwHfm5PStI/9cQG9pDbvQi0h8CA+CfSje9EP4PTyLgQ1SF6S56SXb2T1dttvZCVR5RtiizpKtMdI5eBG27Q6jPzMsPg+9SNlYJIDjCASUzdSHqocYXDlns31D8IkR/HLBCgqeYwLT1MeDaQoB+nLHUbt6REMNFEGw4H9/aMUjQlTC9cK4KIcpywWFjZqk98wQl7fYYBkJvkVGey68n/J8lsKNDmNPqvnqVR5hwxGTqOv4nkKeHmH8K6AA/kIfAQKSd6jePl3fPgDOtEg/yPlfh8AAAAASUVORK5CYII="

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAPFBMVEVHcEz///////////////////////////////////////////////////////////////////////////+PybD1AAAAE3RSTlMAoGAw0PCAEEDAIHDfsJBQ4I+vnt3bXwAAAkdJREFUeF7tVtuCqyAMLAghAfHG///rqW0xwWjd9nHPzgsWyGQgF3r7v/CHzrhSiieau+8I+rKhn8MXBEXCp88JqDRwn4tIkBAtZM8MXwKJGb7E+FBBb3YEa4jI4GlMHwzpVKMpL5ggrdzqdo4bgz8+RFwKYzjIhEcWwKkEKA2EEy9DGKY1o3hRyGyBvDaUCnP/ZdcPldXWlx1Aslu0ptLGdbQ7+7kooPJRJbjnKPFkP7wDvEPs8vcxcypoexkFhOV1/8vjyOP6eR9hT7AUDZ/a2ZUBFQH7v0Sul/AyoM/sW899k2e2/JgAn+GLTSp2P7R3j4iArXcZa/H1aicNAIbIq6BIn3QcgGxFhsbRNFFggHf1J0rXNujmMNV2jFcdm3jHSY24FN8U8HmzjlylHnYaQ2V3Hc+NAKlVY05belLTtrqTTTHUSVVDr4Wp2qOM6SxOcVLknZzTOUmHzS7rE9QUGVVBH0nwgiA3jSN6kYzPkcM2iZpgUKNpkCphJ4EOm7VreicLgHqcngneKBjFjU4WMZe+q8mjCNo4ZhkD3OKZxYXplE8qCpYJUv1ibypA8dbkBzf4sImJ+mkx8mXan6HnY0KbNT5w0YsplYqw7fLYyE26a41szLH3kXU6ckpt0FMMJ4vRtIl8ac+rLqoX2mE9Zq/tNYPfCjKvHG7AugzquVcMz7yh7mgNWNKEF//cymJDaz0aL9zz4htHNFvE+86IaabC8EO8vUdIU9GQ78U1OqCiMRnLzq+BFjIR+TIRkYGE4fbb8Yd/KxZhLtPWraEAAAAASUVORK5CYII="

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMAMOCwQGDQ8IAQkFAgn79wwKDPjjl1AAABuUlEQVR4Xu3VwXKFIAwF0IsASVBR8/8f27IBnSeitatOz455w30kSsTf9G8amW1KMy9O8JifSXdCNHhgiqQfBi+4R6KeowV3jKRNwaAr6qXeIcRqx4xLSfVVwqw3RDR5rQbNTtcjGoT2vZJNi+AAUyJIcK7uYGT1Tw0AjGW54dSkhUO2lgMgEy0mnGEtPLJQ1gIArtfHQQtyABYtrACStKBWBVWag+5QmgfdMfg0ah/ZxaGFtSd4gYyc0qCUEo/yLGDwEB90z/oHAVHAdJJ6N8DDDZ0Rwdf7uTsi3OX++cYF1ybO+/sJVhsCvF7zyLw2uIm0w5TLcGKt95w8xlAKE1MOna5e5nGqR92NnfVw4127C4R4nBOhXun6k0UmZ0XYXWl21yqSwxAUZIb0A09aJa6npDiTFg6tBOf0DkYrwS2PAiBBjxw/CShdrpx/GkA/6oFvzkYWvWM6fp+IR15JM4ugfeFQAbEgE/fNYHlWQdleCGnPgCKy/GDiO1zqdiGiw5BeWYFXCUHwKmEV3GFafdhwF3ceYN+0UeMdvk28rRlhi3mx4CHj+NviBPlMqitemVYVvOMMfsu/L0Ath0CgH1P9AAAAAElFTkSuQmCC"

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARIAAAE8CAMAAAA7T85XAAAAh1BMVEVHcEz9/f3+/v7////9/f3+/v739/f////////39/f39/f39/f////39/f////7+/v39/f8/Pz39/f39/f39/f////////39/f39/f39/f39/f39/f39/f39/f39/f39/f////39/f39/f39/f////39/f39/f39/f39/f39/f39/f////39/dxTaSTAAAAK3RSTlMAIWDwEDDxgMBA9wTg55BRsXP8CrvQoJaHy97UqaAWHLB/OY9AXMMqS29oMLbyrQAACYJJREFUeF7s3VuL4zgQBeCTxjFEwsSxDb5eyN3dnP//+5ZmGCMVM50ZFpalfb7nfmnhlEpSqYQtExERERERERER2eUTIvLBfkJIcrJCQHxK8h0rwYF0TCespCHvZIOV9GxRMS3xg2AmGxzIE1aagpkVRcHUY6Up+IcbVpqCyTQjR3wSLGTbscLwM8DKyOKcsaAjawgA77jKIAAOJJmSw5gxhQCoyeb5JJtzSzoIfMbKH678IYXgRrYpP2V5xh6CkZ9cwTRvKjpNwyhTRg4akneSTNu8Y9GRWvoBvnPDxxPAmUySZShyBdd7ua6GnwB2a/4qRxtG5EIeEZKZ/EBIPHlGRFLWiEjHERHpmSMiD1aISM4WERnYIyI1O0SkZoaI1EwRkeblkGhIpCERkfN/MiT6ShRLNCTKS5TQy2iHRIaXQ6L9EmlZ4Wvae5WMIyJSsEFISltaIjvyDSE52EsFciefCMmJLPF3tBBWPi89B4TEFzwjJE/yjpAcyT1CcmZR4q+oukRbAzLbXh1yJC8ISUPnEZIHHwhJaXNXWez+kdR/3bpEZzjaipYTOSMkLVuE5GmzeTmzmBCSjhVCstg9RsmZeQRktusbubKYsRFJidcwOQ7YgmfTOjKt7h4vNNs4rbhU/Klb8KUp3cJHkowk2V5PpzEjeX4VSZ747i4Z6eodPvmP9Osx2RUb+EgWR+YzfnpmX7ZqyelmfHMXR/eGwDNlluA3jhsoY0wyupv9t1n//q87j2/uSr79+Y9j2MAu9ORYwdqTze+KGOsttNK7wMLDruvWKNOV+O4qdrCAt18OVNLR7bdaEpEUbGD5ivzYbiOwlg9YI1lv+LbElc4jNpKVxwakvP5ZfXxN9smWDzJt/0VfczMP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"

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMA8DB/z6DQPxCAwGAgcLBQ4JAZyUNJAAAB60lEQVR4Xs3X246rMAyF4QRI43Bmvf/DbomhLNUmznRfjS+r/p8gCqfwh0dyn8ZzUp/l27o7dnzMnrpv+hV2Ssjzr2I5JMjrCShIvyCWiIGCAhD7Rj6PACgYABjcg5gioAQNIE71vgegBAsAqdYnwBEIILm9FQhQ8HsKFQCL7SfAETSATfdzhCNYIIoCBsARLID1sy+AIxConYRENIXCZTInQdsRSsj4mMkcgC8QsHthzs7M4RQI2L498roB9t1tzP3DbFq4APYR72U8YOclQQkXwJ7LODg9he0HYM/N5PecrHrs/N3rCdy9XAf987+l0RPQPTK3od8TYM/bwtroCege5fx91L3Mz8Cme6QLUP2Qn4Gie4wXoHrUAN1jvQDV14COvVoD1deAqzdAUT0BtycwqZ6A2/OPWfUE3J5bObAn3O55MYUX+zewSbvn5by8ewJlbfd8Qs53T0DfNJfyMPeWT3dPQAv+sCdwCl12RmxPgLeu6uyBs8AAbSGrh6sFfGH8XGQD+ILdbaMFfOFwXnEIUGjfuScN+ELHkoICPGFyXhQNgFEosHcEDWBQwhIqUwjAEZzX9S0SqAmxC87IqAAjrNL85CFghbiF5kiJBJRQxCtJCIH/fbHr0q627jJ//+lbynjOMeXwh+cfhtCFZYWp8dQAAAAASUVORK5CYII="

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAP1BMVEVHcEz///////////////////////////////////////////////////////////////////////////////9KjZoYAAAAFHRSTlMAMMAgQGCgEPCAcNBQsOCQ37+Pr/HIP5wAAAI0SURBVHhetVfdeuwgCFyNfxhNTJb3f9Zz03aqYvS0X+du10AGGIS8/hjeGLP9zHSz7gr8gcvZ7f+s484tyr3sw7xZxpVWzNXFYxQzzdrNz3g/B6IKzxCe4rC8gnto73gNb79mv2eiSET64PbEz+2z9ThScZ97IAbYdbk2uvLgOvvEgBZLZapIqBVvwFkcaaQKspEU5BfUWpmDl05gP/dwvgAfevu5h02qwLTfTqkSPoDWFHtPAbyORh8qEbVXmuopwKmtqkblQ3Z2oNjwqYEvAlW6oAwuSC0exwujRKC+WML3o4yGaf7weChyA9WpHjHAH3TPQC+82i3SGntly92jkYSKkRFKBQRJd1T9FOUGJCEJeeBAswASMqQhjIpjYQFOdoDX7XDAErTgoMBBE8KcAVjnRQdxFAKhOzsdylq0AwfQgeceh1RlXVX1fBxyUYqQqogKHvHHQy/41qt0S6oHArbNiwYhQIV6GMozBL0BmmIigxJbPYMuKIgNZSQCuMK+MhY2eYrZwRT20E0b6i3zxwxBBPgTWrA7A9kP5gobabmI8b4CAzoN1xg92A6ihnxdM2uHGwLVkjGRCENtsGHk6uxY2OIU4kfFROkWO5ns0MBoFBUrsUjgyW62ZgYn7Ro2PyyKOzcIwneKj7Bv4eEBKG9Kn+VShq7HTcpnXsPuf7eua8kea8kU9HrCpifmhxnaothjBHotwB5Dc/9aQ3JCLjLEuwJzagb0mfwPP70p4fP7T/APapCRU7q26PsAAAAASUVORK5CYII="

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = extend

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function extend() {
	    var target = {}

	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i]

	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key]
	            }
	        }
	    }

	    return target
	}


/***/ },
/* 20 */
/***/ function(module, exports) {

	var Base64 = {
	  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	  encode: function(a) {
	    var b, c, d, e, f, g, h, i = "", j = 0;
	    for (a = Base64._utf8_encode(a); j < a.length; )
	      b = a.charCodeAt(j++),
	      c = a.charCodeAt(j++),
	      d = a.charCodeAt(j++),
	      e = b >> 2,
	      f = (3 & b) << 4 | c >> 4,
	      g = (15 & c) << 2 | d >> 6,
	      h = 63 & d,
	      isNaN(c) ? g = h = 64 : isNaN(d) && (h = 64),
	      i = i + this._keyStr.charAt(e) + this._keyStr.charAt(f) + this._keyStr.charAt(g) + this._keyStr.charAt(h);
	    return i
	  },
	  decode: function(a) {
	    var b, c, d, e, f, g, h, i = "", j = 0;
	    for (a = a.replace(/[^A-Za-z0-9\+\/\=]/g, ""); j < a.length; )
	      e = this._keyStr.indexOf(a.charAt(j++)),
	      f = this._keyStr.indexOf(a.charAt(j++)),
	      g = this._keyStr.indexOf(a.charAt(j++)),
	      h = this._keyStr.indexOf(a.charAt(j++)),
	      b = e << 2 | f >> 4,
	      c = (15 & f) << 4 | g >> 2,
	      d = (3 & g) << 6 | h,
	      i += String.fromCharCode(b),
	      64 != g && (i += String.fromCharCode(c)),
	      64 != h && (i += String.fromCharCode(d));
	    return i = Base64._utf8_decode(i)
	  },
	  _utf8_encode: function(a) {
	    a = a.replace(/\r\n/g, "\n");
	    for (var b = "", c = 0; c < a.length; c++) {
	      var d = a.charCodeAt(c);
	      d < 128 ? b += String.fromCharCode(d) : d > 127 && d < 2048 ? (b += String.fromCharCode(d >> 6 | 192),
	      b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224),
	      b += String.fromCharCode(d >> 6 & 63 | 128),
	      b += String.fromCharCode(63 & d | 128))
	    }
	    return b
	  },
	  _utf8_decode: function(a) {
	    for (var b = "", c = 0, d = c1 = c2 = 0; c < a.length; )
	      d = a.charCodeAt(c),
	      d < 128 ? (b += String.fromCharCode(d),
	      c++) : d > 191 && d < 224 ? (c2 = a.charCodeAt(c + 1),
	      b += String.fromCharCode((31 & d) << 6 | 63 & c2),
	      c += 2) : (c2 = a.charCodeAt(c + 1),
	      c3 = a.charCodeAt(c + 2),
	      b += String.fromCharCode((15 & d) << 12 | (63 & c2) << 6 | 63 & c3),
	      c += 3);
	    return b
	  }
	};

	module.exports = Base64;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var device = __webpack_require__(1);

	module.exports = {
	  weixin: {
	    name: '微信好友',
	    icon: __webpack_require__(15)
	  },
	  weixintimeline: {
	    name: '朋友圈',
	    icon: __webpack_require__(17)
	  },
	  qq: {
	    name: 'QQ好友',
	    icon: __webpack_require__(9),
	    scheme: 'mqqapi://share/to_fri?src_type=web&version=1&file_type=news'
	  },
	  qzone: {
	    name: 'QQ空间',
	    icon: __webpack_require__(10),
	    api: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{url}}&title={{title}}&pics={{pic}}&desc={{digest}}',
	    scheme: device.isIOS ?
	    'mqqapi://share/to_fri?file_type=news&src_type=web&version=1&generalpastboard=1&shareType=1&cflag=1&objectlocation=pasteboard&callback_type=scheme&callback_name=QQ41AF4B2A' :
	    'mqqapi://share/to_qzone?src_type=app&version=1&file_type=news&req_type=1'
	  },
	  yixin: {
	    name: '易信',
	    icon: __webpack_require__(18),
	    api: 'http://open.yixin.im/share?url={{url}}&title={{title}}&pic={{pic}}&desc={{digest}}'
	  },
	  weibo: {
	    name: '微博',
	    icon: __webpack_require__(14),
	    api: 'http://service.weibo.com/share/share.php?url={{url}}&title={{title}}&pic={{pic}}'
	  },
	  tqq: {
	    name: '腾讯微博',
	    icon: __webpack_require__(13),
	    api: 'http://share.v.t.qq.com/index.php?c=share&a=index&url={{url}}&title={{title}}&pic={{pic}}'
	  },
	  renren: {
	    name: '人人网',
	    icon: __webpack_require__(11),
	    api: 'http://widget.renren.com/dialog/share?resourceUrl={{url}}&title={{title}}&pic={{pic}}&description={{digest}}'
	  },
	  douban: {
	    name: '豆瓣',
	    icon: __webpack_require__(8),
	    api: 'http://douban.com/recommend/?url={{url}}&title={{title}}&image={{pic}}'
	  },
	  tieba: {
	    name: '百度贴吧',
	    icon: __webpack_require__(12),
	    api: 'http://tieba.baidu.com/f/commit/share/openShareApi?url={{url}}&title={{title}}&desc={{digest}}'
	  }
	}


/***/ }
/******/ ])
});
;