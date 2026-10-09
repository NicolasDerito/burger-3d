(function () {
  var S = Math.min(1, Math.max(0.44, window.innerWidth / 1280));
  var spec = [
    ['l-bunbottom', 560],
    ['l-patty', 560],
    ['l-cheese', 520],
    ['l-bacon', 570],
    ['l-tomato', 520],
    ['l-lettuce', 590],
    ['l-topbun', 570]
  ];
  var burger = spec.map(function (s) {
    var el = document.getElementById(s[0]);
    el.style.width = (s[1] * S) + 'px';
    return { el: el, w: s[1] * S, aY: 0, eY: 0 };
  });
  var baseEl = document.getElementById('l-base');
  baseEl.style.width = (660 * S) + 'px';
  var boxEl = document.getElementById('l-box');
  boxEl.style.width = (720 * S) + 'px';
  var friesEl = document.getElementById('l-fries');
  friesEl.style.width = (350 * S) + 'px';
  var sodaEl = document.getElementById('l-soda');
  sodaEl.style.width = (310 * S) + 'px';
  var progressBar = document.querySelector('.progress span');

  function compute() {
    var hs = burger.map(function (b) {
      return (b.el.naturalHeight || 600) / (b.el.naturalWidth || 900) * b.w;
    });
    var overlap = 0.72;
    var aC = [];
    var cur = 0;
    for (var i = 0; i < burger.length; i++) {
      aC.push(cur + hs[i] / 2);
      cur += (i < burger.length - 1) ? (hs[i] / 2 + hs[i + 1] / 2) * overlap : hs[i] / 2;
    }
    var eC = [];
    var ec = 0;
    var gap = 96 * S;
    for (var j = 0; j < burger.length; j++) {
      eC.push(ec + hs[j] / 2);
      ec += (j < burger.length - 1) ? (hs[j] / 2 + hs[j + 1] / 2) + gap : hs[j] / 2;
    }
    for (var k = 0; k < burger.length; k++) {
      burger[k].aY = cur / 2 - aC[k];
      burger[k].eY = ec / 2 - eC[k];
    }
  }

  var p = 0;
  function smooth(a, b, x) {
    var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function readScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }

  var mx = 0;
  window.addEventListener('pointermove', function (e) {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
  });
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll);

  function frame(ts) {
    var t = ts / 1000;
    var tBase = smooth(0.10, 0.34, p);
    var tExplode = smooth(0.10, 0.46, p);
    var tBox = smooth(0.50, 0.64, p);
    var tInto = smooth(0.64, 0.90, p);
    var tSides = smooth(0.88, 1.0, p);

    var floatY = Math.sin(t * 1.1) * 10 * (1 - tBase);
    var rot = mx * 5 * (1 - tInto);

    baseEl.style.opacity = 1 - tBase;
    baseEl.style.transform = 'translate(-50%,-50%) translate(' + (mx * 16) + 'px,' + floatY + 'px) rotate(' + (mx * 3) + 'deg)';

    for (var i = 0; i < burger.length; i++) {
      var b = burger[i];
      var y = b.aY + (b.eY - b.aY) * tExplode;
      var finalY = b.aY * 0.5 + (185 * S);
      y = y + (finalY - y) * tInto;
      var s = 1 - 0.5 * tInto;
      b.el.style.transform = 'translate(-50%,-50%) translate(' + (mx * 18 * (1 - tInto)) + 'px,' + y + 'px) scale(' + s + ') rotate(' + rot + 'deg)';
      b.el.style.opacity = tBase;
    }

    boxEl.style.opacity = tBox;
    boxEl.style.transform = 'translate(-50%,-50%) translate(0px,' + (250 * S + (1 - tBox) * 260) + 'px) scale(' + (0.6 + 0.4 * tBox) + ')';

    friesEl.style.opacity = tSides;
    friesEl.style.transform = 'translate(-50%,-50%) translate(' + (-370 * S) + 'px,' + (240 * S + (1 - tSides) * 180) + 'px) scale(' + (0.6 + 0.4 * tSides) + ')';
    sodaEl.style.opacity = tSides;
    sodaEl.style.transform = 'translate(-50%,-50%) translate(' + (375 * S) + 'px,' + (185 * S + (1 - tSides) * 180) + 'px) scale(' + (0.6 + 0.4 * tSides) + ')';

    if (progressBar) progressBar.style.height = (p * 100).toFixed(1) + '%';
    requestAnimationFrame(frame);
  }

  var qp = new URLSearchParams(location.search);
  function start() {
    compute(); readScroll();
    if (qp.has('p')) p = Math.min(1, Math.max(0, parseFloat(qp.get('p'))));
    requestAnimationFrame(frame);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
