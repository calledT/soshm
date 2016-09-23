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
