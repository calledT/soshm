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
