# Social Share

[PC版请查看](https://github.com/calledT/sosh)

## 特性

- 仅需调用`soshm.js`，无其他库依赖
- 支持`微信`,`QQ`,`微博`的原生应用分享(借用UC浏览器或者QQ浏览器或者URL scheme进行)
- 支持使用`dataset`配置
- 支持AMD、CommonJS和浏览器全局变量（使用UMD）
- 图标及样式打包在js里，无需额外请求

## 安装

通过npm进行安装

```shell
npm install -S soshm
```

或者把脚本引进你的页面里

```html
<script src="soshm.min.js"></script>
```

## 使用

### 参数
1. 第一个参数为字符串类型，代表选择器。支持`querySelectorAll` 所支持的参数类型。。
2. 第二个参数为对象字面量，配置分享的相关内容。

```html
<div class="soshm"></div>
<script src="dist/soshm.min.js"></script>
<script>
  soshm('#share', {
    // 分享的链接，默认使用location.href
    url: '',
    // 分享的标题，默认使用document.title
    title: '',
    // 分享的摘要，默认使用<meta name="description" content="">content的值
    digest: '',
    // 分享的图片，默认获取本页面第一个img元素的src
    pic: '',
    // 默认显示的网站为以下六个个,支持设置的网站有
    // weixin,weixintimeline,qq,qzone,yixin,weibo,tqq,renren,douban,tieba
    sites: ['weixin', 'weixintimeline', 'yixin', 'weibo', 'qq', 'qzone']
  });
</script>
```

### 使用dataset进行配置

除了函数参数配置外，也可以用`[data-*]`的方式进行配置。
`TIP:` 函数参数配置优先级高于dataset配置

```html
<div class="datasetconfig" data-title="分享标题" data-sites="yixin,weibo,weixin,tqq,qzone"></div>
<script>
  soshm('.datasetconfig', {
    sites: ['weixin,', 'weibo', 'yixin', 'qzone']
  })
</script>
```

### 弹窗形式
`soshm.popIn`函数已弹窗的形式展示分享的站点，接收一个表示配置分享内容的对象字面量参数。

```html
<button id="shareBtn"></button>
<script>
  document.getElementById('shareBtn').addEventListener('click', function() {
    soshm.popIn({
      title: '弹窗分享',
      sites: ['weixin', 'weixintimeline', 'weibo', 'yixin', 'qzone', 'tqq', 'qq']
    });
  }, false);
</script>
```

## 原生分享
在UC浏览器和QQ浏览器里支持唤起微信、QQ、微博客户端进行分享。其他浏览器里支持唤起QQ客户端的分享，微博分享使用webapi进行，而微信分享需要借用QQ浏览器进行，如果用户没有安装，则点击无反应。

在微信里点击微信分享会在右上角浮出分享操作的提示，也可以手动调用`soshm.weixinSharetip()` 函数，此函数仅在微信里生效。

## License

MIT © calledT
