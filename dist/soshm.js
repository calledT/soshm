(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Soshm", [], factory);
	else if(typeof exports === 'object')
		exports["Soshm"] = factory();
	else
		root["Soshm"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	var extend = __webpack_require__(6);
	var Base64 = __webpack_require__(7);
	var socialSites = __webpack_require__(12);
	var device = __webpack_require__(13);
	
	var doc = document;
	var body = doc.body;
	
	var supportNativeShare = false;
	if ((device.isIOS && device.ucBrowserVersion >= 10.2)
	    || (device.isAndroid && device.ucBrowserVersion >= 9.7)
	    || device.qqBrowserVersion >= 5.4) {
	  supportNativeShare = true;
	}
	
	if (device.isWeixin) {
	  body.insertAdjacentHTML('beforeend', '<div class="soshm-wxsharetip"></div>');
	}
	
	var template =
	  '<div class="soshm-item {{site}}" data-site="{{site}}">' +
	    '<img class="soshm-item-icon" src="{{icon}}">' +
	    '<span class="soshm-item-text">{{name}}</span>' +
	  '</div>';
	
	// 支持浏览器原生分享的APP
	var nativeShareApps = {
	  weibo: ['kSinaWeibo', 'SinaWeibo', 11],
	  weixin: ['kWeixin', 'WechatFriends', 1],
	  weixintimeline: ['kWeixinFriend', 'WechatTimeline', 8],
	  qq: ['kQQ', 'QQ', 4],
	  qzone: ['kQZone', 'Qzone', 3]
	};
	
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
	    if (device.isWeixin && (site.indexOf('weixin') !== -1)) {
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
	  popIn: function(opts) {
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
	  popOut: function() {
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
	  if (device.isWeixin) {
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
	
	  return Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
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
	 * 事件委托
	 * @param  {Element} agent   [被委托的元素]
	 * @param  {String} selector [选择器]
	 * @param  {String} event    [事件名称]
	 * @param  {Function} fn     [事件处理函数]
	 */
	function delegate(agent, selector, event, fn) {
	  agent.addEventListener(event, function(e) {
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
	 * 判断html元素是否和给出的选择器匹配
	 * @param  {Element} elem    [html元素]
	 * @param  {String} selector [选择器]
	 * @return {boolean}
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
	
	/**
	 * 动态加载外部脚本
	 * @param  {String}   url [脚本地址]
	 * @param  {Function} cb  [脚本完毕回调函数]
	 */
	function loadScript(url, done) {
	  var script = doc.createElement('script');
	  script.src = url;
	  script.onload = onreadystatechange = function() {
	    if (!this.readyState || this.readyState === 'load' || this.readyState === 'complete') {
	      done && done();
	      script.onload = onreadystatechange
	      script.parentNode.removeChild(script);
	    }
	  };
	  body.appendChild(script);
	}
	
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
	 * 通过scheme唤起APP
	 * @param  {String} scheme [app打开协议]
	 */
	function openAppByScheme(scheme) {
	  if (device.iOSVersion > 8) {
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
	
	module.exports = Share;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
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
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports
	
	
	// module
	exports.push([module.id, ".soshm{text-align:center}.soshm:after,.soshm:before{content:\" \";display:table}.soshm:after{clear:both}.soshm-item{float:left;line-height:0;margin:5px;text-decoration:none;cursor:pointer;border-radius:50%;-webkit-tap-highlight-color:transparent}.soshm-item-icon{display:inline-block;text-decoration:none;width:26px;height:26px;padding:5px;text-align:center}.soshm-item-text{display:none}.soshm-item.weixin{background:#49b233}.soshm-item.weixin:hover{background:#398a28}.soshm-item.yixin{background:#23cfaf}.soshm-item.yixin:hover{background:#1ca38a}.soshm-item.weibo{background:#f04e59}.soshm-item.weibo:hover{background:#ec1f2d}.soshm-item.qzone{background:#fdbe3d}.soshm-item.qzone:hover{background:#fcad0b}.soshm-item.renren{background:#1f7fc9}.soshm-item.renren:hover{background:#18639d}.soshm-item.tieba{background:#5b95f0}.soshm-item.tieba:hover{background:#2c77ec}.soshm-item.douban{background:#228a31}.soshm-item.douban:hover{background:#186122}.soshm-item.tqq{background:#97cbe1}.soshm-item.tqq:hover{background:#6fb7d6}.soshm-item.qq{background:#4081e1}.soshm-item.qq:hover{background:#2066ce}.soshm-item.weixintimeline{background:#1cb526}.soshm-item.weixintimeline:hover{background:#15891d}.soshm-group{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;padding:15px 20px}.soshm-group .soshm-item{display:block;float:none;margin:0}.soshm-pop{display:none;position:fixed;top:0;left:0;right:0;bottom:0;height:100%;width:100%;opacity:0;z-index:9999;background:rgba(0,0,0,.65)}.soshm-pop-show{opacity:1;-webkit-transition:opacity .8s ease-in;transition:opacity .8s ease-in}.soshm-pop-show .group1{-webkit-animation:soshtrans 1.2s 1 ease;animation:soshtrans 1.2s 1 ease}.soshm-pop-show .group2{-webkit-animation:soshtrans 1.8s 1 ease;animation:soshtrans 1.8s 1 ease}.soshm-pop-show .group3{-webkit-animation:soshtrans 2.4s 1 ease;animation:soshtrans 2.4s 1 ease}.soshm-pop-hide{opacity:0;-webkit-transition:opacity .8s ease-in;transition:opacity .8s ease-in}.soshm-pop-hide .group1{-webkit-animation:soshtrans2 .7s 1 cubic-bezier(.68,-.55,.265,1.55) 0ms;animation:soshtrans2 .7s 1 cubic-bezier(.68,-.55,.265,1.55) 0ms}.soshm-pop-hide .group2{-webkit-animation:soshtrans2 .7s 1 cubic-bezier(.68,-.55,.265,1.55) .3s;animation:soshtrans2 .7s 1 cubic-bezier(.68,-.55,.265,1.55) .3s}.soshm-pop-hide .group3{-webkit-animation:soshtrans2 .7s 1 cubic-bezier(.68,-.55,.265,1.55) .6s;animation:soshtrans2 .7s 1 cubic-bezier(.68,-.55,.265,1.55) .6s}.soshm-pop-sites{position:absolute;top:50%;left:0;width:100%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.soshm-pop .soshm-item-icon{width:42px;height:42px;padding:10px}.soshm-wxsharetip{position:fixed;overflow:hidden;width:100%;height:100%;top:0;left:0;background:rgba(0,0,0,.6) url(" + __webpack_require__(4) + ") no-repeat right 0;background-size:50% auto;z-index:-1;opacity:0;visibility:hidden;-webkit-transition:all .6s ease-out;transition:all .6s ease-out}.soshm-wxsharetip.wxsharetip-show{z-index:9999;opacity:1;visibility:visible}@-webkit-keyframes soshtrans{0%{-webkit-transform:translate3d(0,1136px,0);transform:translate3d(0,1136px,0)}50%{-webkit-transform:translateZ(0);transform:translateZ(0)}60%{-webkit-transform:translateZ(0);transform:translateZ(0)}to{-webkit-transform:translateZ(0);transform:translateZ(0)}}@keyframes soshtrans{0%{-webkit-transform:translate3d(0,1136px,0);transform:translate3d(0,1136px,0)}50%{-webkit-transform:translateZ(0);transform:translateZ(0)}60%{-webkit-transform:translateZ(0);transform:translateZ(0)}to{-webkit-transform:translateZ(0);transform:translateZ(0)}}@-webkit-keyframes soshtrans2{0%{opacity:1;-webkit-transform:translateZ(0);transform:translateZ(0)}to{opacity:0;-webkit-transform:translate3d(0,500%,0);transform:translate3d(0,500%,0)}}@keyframes soshtrans2{0%{opacity:1;-webkit-transform:translateZ(0);transform:translateZ(0)}to{opacity:0;-webkit-transform:translate3d(0,500%,0);transform:translate3d(0,500%,0)}}", ""]);
	
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

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARIAAAE8CAYAAAAMkT5lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2tpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowZGU5ZTAzZS05MDIwLTRiN2UtOWMxOS0xZjA3MjEyMmQxNTkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjJGQUFBMTRFREI0MTFFNEIwNzhDNzg1REYxNjc5RTUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjJGQUFBMTNFREI0MTFFNEIwNzhDNzg1REYxNjc5RTUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjMyRkQ4Qjk2NDgxMTFFNDk1QTg5RTA3QzgxM0Y0ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MjMyRkQ4QkE2NDgxMTFFNDk1QTg5RTA3QzgxM0Y0ODYiLz4gPC9yZGY6RGVz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"

/***/ },
/* 5 */
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
/* 6 */
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {(function (root, factory) {
	  if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module === 'object' && module.exports) {
	    // Node. Does not work with strict CommonJS, but
	    // only CommonJS-like environments that support module.exports,
	    // like Node.
	    module.exports = factory();
	  } else {
	    // Browser globals (root is window)
	    root.Base64 = factory();
	  }
	})(this, function () {
	  'use strict';
	  // existing version for noConflict()
	  var _Base64 = global.Base64;
	  var version = "2.1.9";
	  // if node.js, we use Buffer
	  var buffer;
	  if (typeof module !== 'undefined' && module.exports) {
	    try {
	      buffer = __webpack_require__(8).Buffer;
	    } catch (err) {}
	  }
	  // constants
	  var b64chars
	    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	  var b64tab = function(bin) {
	    var t = {};
	    for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
	    return t;
	  }(b64chars);
	  var fromCharCode = String.fromCharCode;
	  // encoder stuff
	  var cb_utob = function(c) {
	    if (c.length < 2) {
	      var cc = c.charCodeAt(0);
	      return cc < 0x80 ? c
	        : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
	                + fromCharCode(0x80 | (cc & 0x3f)))
	        : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
	           + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
	           + fromCharCode(0x80 | ( cc         & 0x3f)));
	    } else {
	      var cc = 0x10000
	        + (c.charCodeAt(0) - 0xD800) * 0x400
	        + (c.charCodeAt(1) - 0xDC00);
	      return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
	          + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
	          + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
	          + fromCharCode(0x80 | ( cc         & 0x3f)));
	    }
	  };
	  var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
	  var utob = function(u) {
	    return u.replace(re_utob, cb_utob);
	  };
	  var cb_encode = function(ccc) {
	    var padlen = [0, 2, 1][ccc.length % 3],
	    ord = ccc.charCodeAt(0) << 16
	      | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
	      | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
	    chars = [
	      b64chars.charAt( ord >>> 18),
	      b64chars.charAt((ord >>> 12) & 63),
	      padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
	      padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
	    ];
	    return chars.join('');
	  };
	  var btoa = global.btoa ? function(b) {
	    return global.btoa(b);
	  } : function(b) {
	    return b.replace(/[\s\S]{1,3}/g, cb_encode);
	  };
	  var _encode = buffer ? function (u) {
	    return (u.constructor === buffer.constructor ? u : new buffer(u))
	    .toString('base64')
	  }
	  : function (u) { return btoa(utob(u)) }
	  ;
	  var encode = function(u, urisafe) {
	    return !urisafe
	      ? _encode(String(u))
	      : _encode(String(u)).replace(/[+\/]/g, function(m0) {
	        return m0 == '+' ? '-' : '_';
	      }).replace(/=/g, '');
	  };
	  var encodeURI = function(u) { return encode(u, true) };
	  // decoder stuff
	  var re_btou = new RegExp([
	    '[\xC0-\xDF][\x80-\xBF]',
	    '[\xE0-\xEF][\x80-\xBF]{2}',
	    '[\xF0-\xF7][\x80-\xBF]{3}'
	  ].join('|'), 'g');
	  var cb_btou = function(cccc) {
	    switch(cccc.length) {
	    case 4:
	      var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
	        |    ((0x3f & cccc.charCodeAt(1)) << 12)
	        |    ((0x3f & cccc.charCodeAt(2)) <<  6)
	        |     (0x3f & cccc.charCodeAt(3)),
	      offset = cp - 0x10000;
	      return (fromCharCode((offset  >>> 10) + 0xD800)
	          + fromCharCode((offset & 0x3FF) + 0xDC00));
	    case 3:
	      return fromCharCode(
	        ((0x0f & cccc.charCodeAt(0)) << 12)
	          | ((0x3f & cccc.charCodeAt(1)) << 6)
	          |  (0x3f & cccc.charCodeAt(2))
	      );
	    default:
	      return  fromCharCode(
	        ((0x1f & cccc.charCodeAt(0)) << 6)
	          |  (0x3f & cccc.charCodeAt(1))
	      );
	    }
	  };
	  var btou = function(b) {
	    return b.replace(re_btou, cb_btou);
	  };
	  var cb_decode = function(cccc) {
	    var len = cccc.length,
	    padlen = len % 4,
	    n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
	      | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
	      | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
	      | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
	    chars = [
	      fromCharCode( n >>> 16),
	      fromCharCode((n >>>  8) & 0xff),
	      fromCharCode( n         & 0xff)
	    ];
	    chars.length -= [0, 0, 2, 1][padlen];
	    return chars.join('');
	  };
	  var atob = global.atob ? function(a) {
	    return global.atob(a);
	  } : function(a){
	    return a.replace(/[\s\S]{1,4}/g, cb_decode);
	  };
	  var _decode = buffer ? function(a) {
	    return (a.constructor === buffer.constructor
	        ? a : new buffer(a, 'base64')).toString();
	  }
	  : function(a) { return btou(atob(a)) };
	  var decode = function(a){
	    return _decode(
	      String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
	        .replace(/[^A-Za-z0-9\+\/]/g, '')
	    );
	  };
	
	  // export Base64
	  var Base64 = {
	    VERSION: version,
	    atob: atob,
	    btoa: btoa,
	    fromBase64: decode,
	    toBase64: encode,
	    utob: utob,
	    encode: encode,
	    encodeURI: encodeURI,
	    btou: btou,
	    decode: decode
	  };
	  // if ES5 is available, make Base64.extendString() available
	  if (typeof Object.defineProperty === 'function') {
	    var noEnum = function(v){
	      return {value:v,enumerable:false,writable:true,configurable:true};
	    };
	    Base64.extendString = function () {
	      Object.defineProperty(
	        String.prototype, 'fromBase64', noEnum(function () {
	          return decode(this)
	        }));
	      Object.defineProperty(
	        String.prototype, 'toBase64', noEnum(function (urisafe) {
	          return encode(this, urisafe)
	        }));
	      Object.defineProperty(
	        String.prototype, 'toBase64URI', noEnum(function () {
	          return encode(this, true)
	        }));
	    };
	  }
	
	  return Base64;
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */
	
	'use strict'
	
	var base64 = __webpack_require__(9)
	var ieee754 = __webpack_require__(10)
	var isArray = __webpack_require__(11)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.
	
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()
	
	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()
	
	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}
	
	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}
	
	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length)
	    }
	    that.length = length
	  }
	
	  return that
	}
	
	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */
	
	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }
	
	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}
	
	Buffer.poolSize = 8192 // not used by this implementation
	
	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype
	  return arr
	}
	
	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }
	
	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }
	
	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }
	
	  return fromObject(that, value)
	}
	
	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	}
	
	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) {
	    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	    Object.defineProperty(Buffer, Symbol.species, {
	      value: null,
	      configurable: true
	    })
	  }
	}
	
	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}
	
	function alloc (that, size, fill, encoding) {
	  assertSize(size)
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}
	
	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	}
	
	function allocUnsafe (that, size) {
	  assertSize(size)
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0
	    }
	  }
	  return that
	}
	
	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	}
	
	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8'
	  }
	
	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }
	
	  var length = byteLength(string, encoding) | 0
	  that = createBuffer(that, length)
	
	  var actual = that.write(string, encoding)
	
	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual)
	  }
	
	  return that
	}
	
	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0
	  that = createBuffer(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength // this throws if `array` is not a valid ArrayBuffer
	
	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }
	
	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }
	
	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array)
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset)
	  } else {
	    array = new Uint8Array(array, byteOffset, length)
	  }
	
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array)
	  }
	  return that
	}
	
	function fromObject (that, obj) {
	  if (Buffer.isBuffer(obj)) {
	    var len = checked(obj.length) | 0
	    that = createBuffer(that, len)
	
	    if (that.length === 0) {
	      return that
	    }
	
	    obj.copy(that, 0, 0, len)
	    return that
	  }
	
	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }
	
	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }
	
	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}
	
	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	
	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0
	  }
	  return Buffer.alloc(+length)
	}
	
	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }
	
	  if (a === b) return 0
	
	  var x = a.length
	  var y = b.length
	
	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i]
	      y = b[i]
	      break
	    }
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }
	
	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }
	
	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length
	    }
	  }
	
	  var buffer = Buffer.allocUnsafe(length)
	  var pos = 0
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i]
	    if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos)
	    pos += buf.length
	  }
	  return buffer
	}
	
	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string
	  }
	
	  var len = string.length
	  if (len === 0) return 0
	
	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength
	
	function slowToString (encoding, start, end) {
	  var loweredCase = false
	
	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.
	
	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }
	
	  if (end === undefined || end > this.length) {
	    end = this.length
	  }
	
	  if (end <= 0) {
	    return ''
	  }
	
	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0
	  start >>>= 0
	
	  if (end <= start) {
	    return ''
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true
	
	function swap (b, n, m) {
	  var i = b[n]
	  b[n] = b[m]
	  b[m] = i
	}
	
	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1)
	  }
	  return this
	}
	
	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3)
	    swap(this, i + 1, i + 2)
	  }
	  return this
	}
	
	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7)
	    swap(this, i + 1, i + 6)
	    swap(this, i + 2, i + 5)
	    swap(this, i + 3, i + 4)
	  }
	  return this
	}
	
	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}
	
	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }
	
	  if (start === undefined) {
	    start = 0
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0
	  }
	  if (thisStart === undefined) {
	    thisStart = 0
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length
	  }
	
	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }
	
	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }
	
	  start >>>= 0
	  end >>>= 0
	  thisStart >>>= 0
	  thisEnd >>>= 0
	
	  if (this === target) return 0
	
	  var x = thisEnd - thisStart
	  var y = end - start
	  var len = Math.min(x, y)
	
	  var thisCopy = this.slice(thisStart, thisEnd)
	  var targetCopy = target.slice(start, end)
	
	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i]
	      y = targetCopy[i]
	      break
	    }
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1
	
	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset
	    byteOffset = 0
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000
	  }
	  byteOffset = +byteOffset  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1)
	  }
	
	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0
	    else return -1
	  }
	
	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding)
	  }
	
	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }
	
	  throw new TypeError('val must be string, number or Buffer')
	}
	
	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1
	  var arrLength = arr.length
	  var valLength = val.length
	
	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase()
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2
	      arrLength /= 2
	      valLength /= 2
	      byteOffset /= 2
	    }
	  }
	
	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }
	
	  var i
	  if (dir) {
	    var foundIndex = -1
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex
	        foundIndex = -1
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false
	          break
	        }
	      }
	      if (found) return i
	    }
	  }
	
	  return -1
	}
	
	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	}
	
	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	}
	
	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}
	
	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}
	
	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }
	
	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining
	
	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)
	
	      case 'ascii':
	        return asciiWrite(this, string, offset, length)
	
	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)
	
	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []
	
	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1
	
	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint
	
	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }
	
	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }
	
	    res.push(codePoint)
	    i += bytesPerSequence
	  }
	
	  return decodeCodePointsArray(res)
	}
	
	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000
	
	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }
	
	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}
	
	function latin1Slice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start) end = start
	
	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start]
	    }
	  }
	
	  return newBuf
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }
	
	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}
	
	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}
	
	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }
	
	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = 0
	  var mul = 1
	  var sub = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  var sub = 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start
	
	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0
	
	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }
	
	  var len = end - start
	  var i
	
	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }
	
	  return len
	}
	
	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start
	      start = 0
	      end = this.length
	    } else if (typeof end === 'string') {
	      encoding = end
	      end = this.length
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0)
	      if (code < 256) {
	        val = code
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255
	  }
	
	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }
	
	  if (end <= start) {
	    return this
	  }
	
	  start = start >>> 0
	  end = end === undefined ? this.length : end >>> 0
	
	  if (!val) val = 0
	
	  var i
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val
	    }
	  } else {
	    var bytes = Buffer.isBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString())
	    var len = bytes.length
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	
	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i)
	
	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }
	
	        // valid lead
	        leadSurrogate = codePoint
	
	        continue
	      }
	
	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }
	
	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }
	
	    leadSurrogate = null
	
	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }
	
	  return bytes
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break
	
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}
	
	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}
	
	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8).Buffer, (function() { return this; }())))

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict'
	
	exports.byteLength = byteLength
	exports.toByteArray = toByteArray
	exports.fromByteArray = fromByteArray
	
	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
	
	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i]
	  revLookup[code.charCodeAt(i)] = i
	}
	
	revLookup['-'.charCodeAt(0)] = 62
	revLookup['_'.charCodeAt(0)] = 63
	
	function placeHoldersCount (b64) {
	  var len = b64.length
	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }
	
	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
	}
	
	function byteLength (b64) {
	  // base64 is 4/3 + up to two characters of the original data
	  return b64.length * 3 / 4 - placeHoldersCount(b64)
	}
	
	function toByteArray (b64) {
	  var i, j, l, tmp, placeHolders, arr
	  var len = b64.length
	  placeHolders = placeHoldersCount(b64)
	
	  arr = new Arr(len * 3 / 4 - placeHolders)
	
	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len
	
	  var L = 0
	
	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
	    arr[L++] = (tmp >> 16) & 0xFF
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }
	
	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
	    arr[L++] = tmp & 0xFF
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }
	
	  return arr
	}
	
	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}
	
	function encodeChunk (uint8, start, end) {
	  var tmp
	  var output = []
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	    output.push(tripletToBase64(tmp))
	  }
	  return output.join('')
	}
	
	function fromByteArray (uint8) {
	  var tmp
	  var len = uint8.length
	  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	  var output = ''
	  var parts = []
	  var maxChunkLength = 16383 // must be multiple of 3
	
	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	  }
	
	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1]
	    output += lookup[tmp >> 2]
	    output += lookup[(tmp << 4) & 0x3F]
	    output += '=='
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
	    output += lookup[tmp >> 10]
	    output += lookup[(tmp >> 4) & 0x3F]
	    output += lookup[(tmp << 2) & 0x3F]
	    output += '='
	  }
	
	  parts.push(output)
	
	  return parts.join('')
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]
	
	  i += d
	
	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}
	
	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	
	  value = Math.abs(value)
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	
	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	
	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 11 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var device = __webpack_require__(13);
	
	module.exports = {
	  weixin: {
	    name: '微信好友',
	    icon: __webpack_require__(14)
	  },
	  weixintimeline: {
	    name: '朋友圈',
	    icon: __webpack_require__(15)
	  },
	  qq: {
	    name: 'QQ好友',
	    icon: __webpack_require__(16),
	    scheme: 'mqqapi://share/to_fri?src_type=web&version=1&file_type=news'
	  },
	  qzone: {
	    name: 'QQ空间',
	    icon: __webpack_require__(17),
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
	    icon: __webpack_require__(19),
	    api: 'http://service.weibo.com/share/share.php?url={{url}}&title={{title}}&pic={{pic}}'
	  },
	  tqq: {
	    name: '腾讯微博',
	    icon: __webpack_require__(20),
	    api: 'http://share.v.t.qq.com/index.php?c=share&a=index&url={{url}}&title={{title}}&pic={{pic}}'
	  },
	  renren: {
	    name: '人人网',
	    icon: __webpack_require__(21),
	    api: 'http://widget.renren.com/dialog/share?resourceUrl={{url}}&title={{title}}&pic={{pic}}&description={{digest}}'
	  },
	  douban: {
	    name: '豆瓣',
	    icon: __webpack_require__(22),
	    api: 'http://douban.com/recommend/?url={{url}}&title={{title}}&image={{pic}}'
	  },
	  tieba: {
	    name: '百度贴吧',
	    icon: __webpack_require__(23),
	    api: 'http://tieba.baidu.com/f/commit/share/openShareApi?url={{url}}&title={{title}}&desc={{digest}}'
	  }
	}


/***/ },
/* 13 */
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
	
	module.exports = {
	  isIOS: deviceDetect('iPhone') || deviceDetect('iPad') || deviceDetect('iPod'),
	  isAndroid: deviceDetect('Android'),
	  isUCBrowser: deviceDetect('UCBrowser'),
	  isQQBrowser: deviceDetect('MQQBrowser'),
	  isWeixin: deviceDetect('MicroMessenger'),
	  qqBrowserVersion: this.isQQBrowser ? getVersion(ua.split('mqqbrowser/')[1]) : 0,
	  ucBrowserVersion: this.isUCBrowser ? getVersion(ua.split('ucbrowser/')[1]) : 0,
	  iOSVersion: this.isIOS ? parseInt(ua.match(/\s*os\s*\d/gi)[0].split(' ')[2], 10) : 0
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFEUlEQVR4Xu2bi3HcNhCGdyuIVUGiCuxUEKmCWBXYqsBKBbEqiF1B5AqiVGCpAssV2K4gcgWb+TDAhUeCxIIPkdEJMzfiDPHg/vvAvwtI5cCbHrj88gTAkwUcOAJPLnDgBjBPEDSzn0TkuYi8iIDy91l8/ioi/O5F5E5EPqsqz5too13AzF6JyImIvGwI6xUKIG5E5IOq8rxaqwIgavqNiLweIXSfkFjHWxH5ew3LcAFgZpjz7yJysaCqcIu3qvp+wTU6UxcBMDNM/M8ZNV6SD5c4fyjXGATAzP5YWOtDYFw8hDVkAYgmj9bR/prtSlXPl/yAPgA+xgi/5NreuRcFoQOAmaF5ovyW2ntVXSQA7wFgZggOAN72TUR+9HbO9KsZf6aq1xPWyg7dARD9/osz2v+mqu+YMY7jGWLkaZ8JrKoKEWI8rBHBSkCyTR7PzRWaAFw5hbhUVYjLXjMzCE1JCMb83N7i4lb7lwM9mOOs7hkAiAwP7XvaadJes7OZodFfChOQB6R8Ydc1WtE/nsWjFQD2LC0BgEZhep4GScFa2hbwqZEMDc1z1DZjMyOnYOfxtFkDYgIA7ZPReRq+SEAKPkwzMyI0pMnT8HdADBlh1D7mDwiedq+qR56Onj5aaf7NOQEAU8SkO2ZdWDylxoxHcC/4adpOHPEIm+sDALA9TwAau0btuO8xVQbgu1y8qZ1wqD8A1Pj/nGu352J7ZDu9xj2iaxBUsa7kHlgKv2RBzBGAEpHbMVvkFgCADJEGX0Whf40JWK1bAQbxBQA/eDW1NgDk/giPxlO9IZXSvDLk+oUiiweINQEI22ncAqHftYHQA1CxtrAWAEl4tN5hlR7JKvv01hYAoIaEVK6b7Z6Ef+isM5tWJyJkc0jmmCPkESum3B0QEgBET6Lvki3kASNS7rm/aY/KJwBq6wBjPuo0Mkdyhjki/Zhv6DDJZjrsTWfHLAxJOTEzT8oNEyRosUPAUgmSnDoNtctIothJ6F+y5htVRSH/HY0tTInPIlvzpNx7JhrJEcr5oQeBAG7znTM1D2l9uyS2RCz4rqrPzAyay6lSqXXqDWY2lGp30mPnWpxEvWwDgG9CHjyVnZIg6X1YyMy8KTdUFosJzRE090pllaW9o1xVGA5OgtFncl7BUz/8E9/3mH8aw/r8+BbP2QQgsAYKrDmsPe07F5gThBBsKio+tQBP6X/ZezQWq7VzWAIAAKi3YjRFoNqx/QBE/8OkAKG0DQ0tDABEaW/NsVaIKf2HAWgEIgLjWBAAgP255sBlilA1Y90AULIey962HAPOvfcDptQME0vz1v1rNDi177EHgBx9ha5CbHCNVLPjb27rTDxgihtNFTQ3PiRnHgCa5p8Ef5crQEYS0q7lUce/qzw7WELg9pyBcpduiKSS+aDgnq91cHrPNHP1+aaqoQRXAgAzh2VlNV77NRsqwe/yjaIL1ApZ6m9ma8eCveRpDQDmpNklvNvvO6nzgwMQGeYaIHDydNIO3qsAsAIIt2SJuZ1rNQAaIMAzxtJsjwsM3ipZFYBGrrHUAe1XVT0eQmkTAERrSAVNuMdcxRim5mJV75WazQDQsIZU1QEI0mgPGAQ4tlc4CyX+5pjdjbacJWwOgPZHxsIMoLSv0KQ7Alyi2P0DRrzxgkula3udra+5xuYB8ES5XJ8IBAGWSxadi1lpzKMFoOFSWE5IyP6XLjDWArzjHr0FlIB4AqCE0GN/f/AW8C/Ru/AIav2j6wAAAABJRU5ErkJggg=="

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFQklEQVR4XuWb7VVUMRCGZyoQKxAqACtQKxAqUCoQKxAqECsQKxAqECtQKhA7wArG896TXLPZfE4m6w9yzv7gcPdm3ieTyWSSZXrkjR+5ftoJABHZI6JDInpJRPvuk2J/T0T43BLRHTM/zB6gaQBE5IiI3hDRcUFwTZ+H8YmZf9Ye1vx/CgARuSai1xqDMt+5YOZzEYEH3TMzwJg0EwDOxT8QEQx9cH/DjeH2Fs0DOCci9HPl+hoGMQxARN4REQzDPIebvpoAIQYAqIgPl8x8MUJYDUBEEMw+u8AW2jADQgqA7xP9nWinhQqAiLwloo9u1FMDYA2hBMB7w3tmxtToat0ARARzEC5fa5YQagC8LVfMfFozLPx/FwARgctj9FubFYRWALCrC0IzAIX4cI6OBsYeAF0QmgAMiLeC0AsA/SImXNZctQrABTy4/mgbmQ4aALAXqwOSsmwrAnBL3Y9CtO+FooWgBYBc4aC0p6gBgHjk9JZNA0ELAHZfM/NJTkAWgIj4tNNSvDYmjAAoToUkAJfL/zJ0/RTEHk/wALAEa+JRdirkAMwc/RBGK4RwN/hN6ZKnqUxxC8CORr8XwiiAL8ycTOBSAEoVGyX86tfWPX5mKz0CICseVlXzgKrpEx5IQNACWMW7CtVZ7AkbANy6jzKWZUNtr5iMpDqLIGgAxOIRO1CzeBrmBTEApI4ocFi1O9QLtMXNAALWcl8SawmCOfHQtREMYwCWic+QeD8CDgIgXruaYA1ASTxee8PMKNQuLQYgRkNvIj62pQFATTxeiYB7sAWg4eWtbKaIR+cVG0PxmOvwlFwav8aB1QNE5MyVuVqFpp6bJr4CoEc8XoX6BKrW/6aAQe4/VXwBQK94vGqtFYQeMHKYMV18BoBGPF61LKuxB8AlXij8fxXvIvaetkRd61tEEL2/uue04vH19buhB2gAxOIReOBey/yybsE0HREPs74zM47ZNmJAL4CUeETdNcBMArDv01nncaVonzNhzQW0HpATvxFhJwA48qfEA+KHY0BJ/FQAHuig+CyAliJITfx0AAbiswBq5aYW8VMBGInPJkKIirmNRqv4aQAMxcPG7VTYJRqpzVCP+CkAjMX/ZmZUvZYW7wZRpAxvdfSKXwG4pOVWWwswDHjxYlTcDocbIo34EACC6mHpUKK2TBqPvO9u48wwVRLDeYBWfAxguc/Te2YfjD4GBFtbywZ71rtFqaowblmgeOgvO/VmWksmGO0u1RAslafeVToaqxUVcralAODZDQiuSvtktsDo/VuXL0tHY70j7/vKAdiA4ABg/7ErCBvRP7kKRHMPl6A0rQTgf0JIbtJKHoBAoRmdGoD/AWHd/sYjWooB2hphC4BdQ8hu0WsXJHprBKllsDSN1sA4MSbgojUGM9lqAJAyIjvsmQqtHuANmgmhWqusHo4qLkn1Apg5HZ7XrtlXAcC6TggaADMgJC9ENAfB+EERQYbYcnKsBYAuEXNwtQ1ZKOqL2jyhSTw6bPKAID9ogTACAF2F12Y0EJouSBYToVLYbjhBGgUwAqF55NUAXEzAAQW8IbU6WADohfDH3UPo/l1R1xQIPcPt1XGcFp8mWQFohXCDG+zawosaQBAXkGSg+OG9wRJACQJGHcK7r9+EAzkMwE0JbJ0BAp/jRD2gFFZa/hcHRkxB/F5o+HeFJgACb1iqN24ZazlnaBHvnyled+t5kbkHpDr319Lcj6qeKQ1EKotgi0tSwz+RS9lg6gE5kS5gYk1fTmQTvzTzX4Wr44N7PFNOmGMbdwJAOfo7+dqjB/AXqVO4biSDbO4AAAAASUVORK5CYII="

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAE7UlEQVR4Xu2bjVEVMRDHdysQK1AqUCoQK1AqECpQKxAqUCoQKxAqECoQKhAqkA7W+T2TN4+buySb3Lu7EXfmDQzcJbv/7PfmqTxy0kcuv8wCgJm9FJEnHfDvVPV26gOZBIAg8DsR2RcRhE/RpYhci8ilql5sG5CtAmBmCH0sIs8rBbkXkS8icqqq/D46bQUAM3srIp8bBO8KugJCVU/GRmB0AMwMwT+MzWhYD9M4UlV+jkKjAWBmOyLyo8DGWxlHGw5UFV/RTKMAMKHwmwLvjaEJYwHwXUSw+ykJTXjdCkIzAGaGvWP3c9C1qu61bNwEgJkR3n6KCPY/F52oKqG2iloBOBMRYv2chCns1uYJ1QCE0/81p+Qbe1drQQsASzj9iMGtqu7WHEYLAL9ntv2uvEQEd25QBUBIdQl9SyLqBXcGWgsAXvfTkqQXkStVpdp0US0AqNor104TPKyqbnncLyCHmdkE8tRsQTh0NVX+NQDcjtANgJlhZ1R9S6T/AHhD4X8N8OrxQnOAKMYkJnAuIm+8wE30vDsZcplAKIBwgodLzANE5JuqwlsxeQEgA6RNDdGYfFa80/YfpGMMTxRGxU1TNwCx+RCGHVSEL7YvW3aH9cmb2bGnQVIMQGh8Hqpq1AAyQjpBpMVzgvCgF7BNAGh69qoXm85QHF0xf+iqe+hRnpV2iDwawGRmsNwMDhLt2HaEQHDUvLf2D5nqjqoSrbJUBEBYlPo/24YOvgGg0JjuBDjL0MADNyKCvznPFTtBA96LCHOD7DwxC0Cwczq/ccDJaApmkhTeAwSmwYTOUj9xh6nFCXGYEmcFgRkzo0cRO8RFOUEJAH32jXoBRBFjEalgJkOT4ntP+NpEP4CNhnYbItnyOAlAWJjOb1/fH+EBocjWchpT+/8wgsf39PGIyRyk1s4BUOLdcUaEIndDslbooO6cNiqfa4MltSAHAKdferkhq24tAm+YEYMY0t2c4PGVZHo8CEDw5ji/IqrpxxUt/Ne5EVoRGKdaeiBxeXzL06G9UgCUqH9cN9mRDWGUKECOnrwMZWY0WxGST7xT1Dp7HCyTUwB4Or9JNTOzuadIg6OzFAAe+0/O5szMA2apZXieGzygFACe1vfSARg00bEASGaHC9CAKgBIR7sND9LUvibIkgDo47HKBPp6f4ygsecuCJSfR0NGOaEGrCrFnrlFlRMk2fi6IdRqETPr/j0+gsaw+UW3RjAzj0P1OLfus1yfOzez7uEN3ihL+QBiL0JR0t6o6vqOr5kRz1PVHVoSZ3TEcm/yUgPC2s5DDRN5T+YouVQ4ppx0XtaVnzdLrJGm4p0HqXjgcdXETdUp2XI4YddzXo/rslXUo+iTpRqAUJHNneHBhnsWsAlEEwALAKFJePhvBiCAQNWY+yJEhVknX2m+JdoEQHAyNB8pUVurtVpwcMyEPEK062ZI3LBKA7b8nYBaMIhUp96X3QDMNAQplcsdDVwAhASDC5JLJbJQ17V9LwBkdGPeD2bgwZpjDVA+bs4uS07JBcDIYW8VwhK1RQn/m88A5r53VuEGIIBAFkiaWXty3Ykuaktvv/a+Ad8vZHLtGtS0hkFCH4zzoeDJgRHne4OT23D/KK6XA4O6nxBIrl8VApsA6OpncJC9yVDN0KRnPQCPJ0wS5D7t0WsBr5Eu8fkqH7BEQWp5+gO5lQdfthI0CgAAAABJRU5ErkJggg=="

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEhklEQVR4Xu1ai20UMRCdqQBSAaQCSAWQCiAVECogHUAqIKkAUkGSCkgqIKmAUAGhgkHvNI58u/baHnu9J+4sne6k82/evPnuMm354C2Xn3YA7Biw5QgsbgIi8oOI3hLRPjM/9NbHogCICAQHABgXzHy8bQBcEdE7T+juLFiMASLykoh+DTTenQVLAvCdiD4EKN+VBYsAENG+w+KKmY96+YKlAIhp38l9yMw3PUDoDoCIPCeiPwnhbpj58H8F4AsRfc4QrgsLujJAtQ/PDxakRhcW9AYgV/vdfEFvAGD7Odp3AMzOgm4AiAjS3G8p3gf+/8jMiBqzjJ4AwPaR/ZWOB2beL12UO78LABXad3LMxoLZASj0/DHFoUw+YObHXM3mzusBQKnnj939lJmxV9MxKwCJnL9UEGgfLGjaNFkBICKviehZ6Y0y5p8Q0fuMeblT0D84y52cmHcPk3IADBsTjc7Y6G3ApjsHAJIT2NenBle+J6LmzipyrzfG+z5FlTUfoKYAilk3dvcBAHf6gc3i94pyxguPlokIkqrSHuJfNGChebdh0AmKCGz3a6vLevsADHxQ669+M/NtyTkaVi+1k1yyFMw89oXH4mgU0I4tfMMcznF48SEwYMuTltxkFR5dZDjtkgHhofkRAyfDoJoEQHhRclrl3KCmNKRC86XCXxDRScz8knmAog7KvqoULGf5tdJ0TVOqCGi+pJLEeckucxIAzRNwMJxjqIubI1jOnHNmhu9ZGxXCZ9UPWQB4NphqZuYIOpwDzwyKjkreiiIqS/hJJxiTpOJSoS1HYckD29I/iO4Xk6eIAd7lkN5CYzURIuqZRQQheGQOCXr9Rtodih5T60wAqF+AN4ZztIAQdU7GBCcKZsomzQB4zrE0QgTtU6MNNF+a3SGRguZNWWYVAAoCAMhJnWGfuOjoiU9FgoMrVPUJegEAikL4US1fKTwAuGZmc8ndAoBUszOaiVXEeN+075j5IGXrTaOAv5mIyMThUXpqavvTkN2NjmNmsyLNCz0nGHrQCXtH5YU6YnJo0YWIgtdl8G2pO1bNjdRZof9rAfDf8XH7B4uZ3MupT3BguO9UqDU/SG0NQFVImsg+wQz3ASjDwswcCWoB8BsniMOtGpY5hAEQ+GAkq75ZnKCItOr55wg8NeeWmR0YRXvVMmCO6rBIAJ38yMx7loW1AORmgZa7la7Zs6TDSwOAcAkzQoZYW12aIkEtAFNJUEqDaxmihr+aZxPZTRD/YksAgLodSVLwNThNj8GG0h6kKRSaAdCLIpXNHaD7We4TXn02AUakkiB3vikS1AAQygJjYCBBgtaLnuyqWYAN/gvVsTNMRVENAChB0aefGqA7Gp7JmmBqE60XAMRknWApimoASCVBp0p5U6cmBEhG4lVcFM0BAOgOrZuqs5RD0TIabAh1oY5K2VYDwDAJivb3U0JZ/hcRmCBqD98siiNBKwDOkdBYMjGL8G5NIHcoLopqAIAPQImK0Nbl1fYYWBqScZ/iu5gBqNHcJq3dAbBJ2ljiLjsGLIH6Jp35DzCCzFCPi11QAAAAAElFTkSuQmCC"

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,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"

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,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"

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,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"

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFJElEQVR4XuWbj1EVMRDGdytQK1AqACpQK1AqUCsQKxArECoQKhAqUCtQKhAqUCpY53uTnLm8/NlcNveYITNvxOG4JL/sbr7d5DE98MYPfP40FICIPCaiV0T0gojumPlYA1xEvhHRDRF9J6IfzIyfh7QhAETkDRG9dp9p4Mys6k9EJJrtLyI6J6ILZv5rSUI1IG2HbuInRPQs9TcdAPzrMPlLIvpkZRUmAEQEq/05N3E/egMAIVdYxIdei+gCICJYaUwcAKrNGAD6g0UcM/NFtfPMA4sBiMhbN3kEOlXTAHCB84/qhf8fQrA8WmINzQDcALHqANDUlACwY2AXaG0IlO+YGf+qWxMAZ/JfiehA3UPw4GAA3iUAAYFS1dQARASTxsqoTT4ewQoAfJcvmRluUW0qABaTx0hWBIDgCAhVd6gCcD6PlV9k9uESrAjAu0MVggYAJo/A1N1WBoDxwgIAIaseiwBEBNodEd+k7QAAxn1WykGyAJzf/zSZuXvJjgCgd2iE5M5QAmBm+h7iDgEgmzxMuUISgIgsFSNFg9khAIwLCRQStVnLAfhdS2yWuMaOASAQ7sVWsAVg1OqvrANy67NlBSkACBao4pi3HVsA5nPDzHszbRL+x2l9mP+Qdg8AbO0IMwuw3ve3Ao6iJDbSBd14UFabMtkYABKI50OWX5kLoO9ETdB0SKElxgDiYuSwjksvHg3AyeNNtjgBWMH0VNngGhbgaomnMQBT3Z9Y4WtmVmWUK1jAFTNv6pihBUAlfTS1+fnLcMChyipFZGgsQpbIzIcxgNGdTtRrkFcAMLljaAGjASS1eAqGiIy2xp0AyKakMYQ1A3JoASO3QByMNhVTRQTJy6Oau3T8flM4DQGgfLTf8cLSn87Ul6YPEcHRFw5ZhzQvhtaKAeoytZ+tO2/EGcSQtiaAW2ZOnhbXZjbSDVIARqXB6uifCIajdoNpUUYLoTtUlpYcWjpJjMCJep51MJxEWQgA0tDa5xavfhALRljBNK4QAPzUshjStfoBgBFWgANU7DLzS1IiAnN7WgtOyt9PneSed8ducJHiGZ67i/BF2a/msSfeLeN6AFLE95o3VJ5RJT4igsC7H9fpMvLYSqrPstIYgEUcgOkf1C4xRfVHlKuLV+GctVgERNwr2tQCtlzARd5eN1BpfhEJrU2lFN1xHSyhZ1eYwU6VxXuirnYiCGwIuD4/SB5aZFwBBc2l8WArJU8BwKBaLylhrKrJOytLVZ/UW2ZHUNyS5LmjsVYraCl3xavvF1ptBQ5iqyUkA3MOQMvee4UbY1q1Vyl2FM/yE1K5BUIyISsdj2terjZ7t2ooitbuHDRljkp3yJbjajdESjWC2Xai0Q4igsnXKsPZs/yCoML2DWWX2h2KirQGIOUKt7gaW1NvCXNtEVmXzHykgRpIZoAFhLioU7QozSWp8LLEGRGdaP09GJzGneL5qneFKG9AAPdqtvqOKgDnuzAxHC1X790lVr5HXVbziYxWQGIHK50UX86aVABaTDF81uiC5SII2jEPA2A0eT+PYRCGAFhylV6xYkMgmANQ7suK+SYfMYdgCkBEcKtU9c2wpQTcVtf9VRnfvwkA5+/I0Goip2Pesz+FWELa3bwrxQOwAgDBhJXHpydX1wCCssP2dtqqR1IvNwEQbX0QPfhY3zWCAoXSM5m4qQuUxIi7ar/03uG1+/bouYW5r2IBhYQF8QEfqDS4TBwv/Fdc4N+4wdHt3xp/MncBTaf36ZkHD+AfQGFqXwwMj+wAAAAASUVORK5CYII="

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACiUlEQVR4Xu1b7VEjMQx96oAOgA6gAqAC6OCgA64CoAIoASoAKuCoAKgAroO7Ch6jmYUJO7Y3spVskpV/8cMrS09PH7GFYOJLJm4/AoBgwMQRiBAoEYDkDoBfa0ySvyJyW9K/yACShwCe1hiAZxFRG7IrABgIgWBAhMCUc8AaJ7+5VY8+YG6oNnRjMMDqWJIX1m+WuH+w8+vrYmYASS7RIOtRg51fANBDIBhg5ViEQDoH/AfwagWzcf9B4vvRcoD54EbjkWGiWQ+vHGA+OABoRCAYkM5FZiZGCFiZ6EU967n9/V56BAOsnvBC3npuMKCHgJcjIgSsVMwg/2+EVjj14DFaGbTiuKj9AcDQU1hciMSFyE8EaqrA5aIC2EHux9BzeHMIOCi5UiLMDFgp7R2UCQAcQPwWQVLHaU4BvInIuZdsklsA3gHouMudiLjdPzYzgOReN0ekhquiX+tIRP54gEBSwbyekfUB4AbAo4jo39XLAwA1MnVD+yoi+9WazXxIUr2vA1v9Ze783KtAx4CXjKFn1rLUl0PyBMB9Rn4zy5oZoIqR1N4g9WiqdXm3hQUkHwAcL8L7KtMLAI19TUzbCUWrWdDNKSr9U6vZ+24AdCzITZRVs4CkZv3UoKY+g6dygplsLgz4OpVkLiGaWbAM77syYIAF5opQ8L6WPk2MLsuVAR0IOdruz9vADHh/t7X2zyK3CAA0NlOJSzs4bZYGV8H7VyLi+ms0CwBJVbZ2Uly7w9muUI223BvmBpy10qgc6/qdY18JgFxttx6+CvuzJTMAyLmn0N2tgketOgQDcr9MSyGgiaj43xZWN4y4/zZXOt3L4IhGVh0dAFTBtkEfBQM2yJlVpkyeAZ+hn1VQwzv9UAAAAABJRU5ErkJggg=="

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADJElEQVR4Xu1a0XXUMBCcqQA6IFQQqABSAVABSQVABZAKoANCBYQKSCoIqQCogKOC4a0j33POklZ35yNWTvq1JUuj2dnRysSeN+75+tEAaAzYcwRmHwKSnqX2iOTltvvnAiDp/bYfifUneVoyriRlAHDn733DHSA3AW/w3HOS7retfwOgMaCFQNOAOYrgXwA/CkXwCYAHq+/WLoKXJJ+XACDpAsAolzcAKk+DSwYkdth7jikYAKCIhYGp1yQXo1D0aJwwIt4CvedTAeBNf/j8iKSF463murEGQNyJeTvsPW8MmEgDWgisgUDTgHsngqVhlD2WexSacxZoABS6ycaADAJVG6EWAi0EygqrTQOaBqQRuHMRlPTd8SK5M//oeLsyltUA3t5FCHwheRwuNrIlsV1dvIRFu6W7XTHglOSHBsDN1da9Z8AVACt9D9teMSB2c7MfAEh6COBPRGWnAOA3gDPvtBqem+A+iry7WxGU9BLA18iH35H8tKUIupPvv5vSGQDuGFtlAUm2Q68jANi1mZWgFpIMiFWNsKJol98zadCd/H8BIEXBQP+fACwMYu2c5CuPwjUDYA7ro7PApRZkgExdf8+XAWH3Lf0deDsM4IRkUsyqZIAkc3mlP0/ZfZzpQfQ6vToAJJmg2e6v034BeBq7nKwKgALq248To58hAlIXJI9WUasNAMv5lvtj7TpcV9tup0A4I3ky7FwNAJI+A+iOuInWXT1lzFHf7ZYoVgFAweK/kVwyI5ifNxmwTA86UcwAYExaxwrHMpKbSrNOMMS8VWxGTm6wOIv7g6HAhX62wJg/t66WGR4Hp5j8DW4dlU28uzkAQe2N9rnF23ejt66SzOrmyl3d5GZbEZJkp7yUze0Bzzq9TCiYYB5bGMwZAM/qLut+OapKslA4HLzTZYs+ZGYLQBCocwAvIgssWnwYY2icRv3mDoCFwGpeL158D1ywzou+RlDoAybQwGnqAUMxyx5sNplxLT7ADj92vi/9P7gYiyoAKF7NBi82AG78QqyZZhQxLniWWMp2x3BrghtsalVdGgBVbdcOJtsYsANQqxryH0I9XG7X3kS+AAAAAElFTkSuQmCC"

/***/ }
/******/ ])
});
;
//# sourceMappingURL=soshm.js.map