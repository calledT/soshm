# Social Share

## 特性

- 仅需调用`msosh.js`，无其他库依赖
-支持`微信`,`QQ`,`微博`的原生应用分享(借用UC浏览器或者QQ浏览器或者URL scheme进行)
- 支持使用`dataset`配置


### 使用构造函数初始化
移动版的构造函数为`Msosh`，移动版不会进行默认的初始化调用，需要手动初始化，构造函数的参数和PC版类似，第一个参数代表`selector`，支持`querySelectorAll`所支持的参数类型，第二个参数配置分享相关的内容。同样也支持使用`dataset`配置。

```html
<div class="msosh"></div>
<script src="dist/soshm.min.js"></script>
<script>
  var msosh = new Msosh('.msosh', {
    // 默认显示的网站为以下六个个,支持设置的网站有
    // weixin,weixintimeline,qq,qzone,yixin,weibo,tqq,renren,douban,tieba
    sites: ['weixin', 'weixintimeline', 'yixin', 'weibo', 'qq', 'qzone']
  });

  // 初始化过后可以调用popIn函数来弹出分享窗口，一般用来做更多分享的用途
  // 在第一个调用这个函数的时候可以传入配置参数，不传则使用初始化时
  // 所使用的配置，参数仅在第一个调用的时候生效。
  msosh.popIn({
    sites: ['weixin', 'weixintimeline', 'yixin', 'weibo', 'qq', 'qzone', 'tqq', 'renren', 'tieba']
  })
</script>
```

在微信里点击微信分享会在右上角浮出分享操作的提示，也可以手动调用`Msosh.wxShareTip()`函数，此函数仅在微信里生效。

在UC浏览器和QQ浏览器里支持唤起微信、QQ、微博客户端进行分享。其他浏览器里支持唤起QQ客户端的分享，微博分享使用webapi进行，而微信分享需要借用QQ浏览器进行，如果用户没有安装，则点击无反应。


## License

MIT © calledT
