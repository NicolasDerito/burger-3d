(function () {
  var burgerSel = [
    ['l-bunbottom', 460],
    ['l-patty', 450],
    ['l-cheese', 430],
    ['l-bacon', 440],
    ['l-tomato', 420],
    ['l-lettuce', 470],
    ['l-topbun', 480]
  ];
  var burger = burgerSel.map(function (p) {
    var el = document.getElementById(p[0]);
    el.style.width = p[1] + 'px';
    return { el: el, w: p[1], aY: 0, eY: 0 };
  });
  var boxEl = document.getElementById('l-box');
  var friesEl = document.getElementById('l-fries');
  var sodaEl = document.getElementById('l-soda');
  boxEl.style.width = '680px';
  friesEl.style.width = '330px';
  sodaEl.style.width = '300px';
  var progressBar = document.querySelector('.progress span');

  function compute() {
    var hs = burger.map(function (b) {
      var nw = b.el.naturalWidth || 900;
      var nh = b.el.naturalHeight || 600;
      return nh / nw * b.w;
    });
    var overlap = 0.74;
    var aCenters = [];
    var cursor = 0;
    for (var i = 0; i < burger.length; i++) {
      var h = hs[i];
      aCenters.push(cursor + h / 2);
      if (i < burger.length - 1) cursor += (h / 2 + hs[i + 1] / 2) * overlap;
      else cursor += h / 2;
    }
    var totalH = cursor;
    var gap = 86;
    var eCenters = [];
    var ec = 0;
    for (var j = 0; j < burger.length; j++) {
      var hh = hs[j];
      eCenters.push(ec + hh / 2);
      if (j < burger.length - 1) ec += (hh / 2 + hs[j + 1] / 2) + gap;
      else ec += hh / 2;
    }
    var eTotal = ec;
    for (var k = 0; k < burger.length; k++) {
      burger[k].aY = totalH / 2 - aCenters[k];
      burger[k].eY = eTotal / 2 - eCenters[k];
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

  var mx = 0, my = 0;
  window.addEventListener('pointermove', function (e) {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  });
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll);

  function frame(ts) {
    var t = ts / 1000;
    var tExplode = smooth(0.10, 0.45, p);
    var tBox = smooth(0.46, 0.62, p);
    var tInto = smooth(0.62, 0.88, p);
    var tSides = smooth(0.86, 1.0, p);

    var floatY = Math.sin(t * 1.1) * 9 * (1 - tInto);
    var rot = mx * 5 * (1 - tInto);

    for (var i = 0; i < burger.length; i++) {
      var b = burger[i];
      var y = b.aY + (b.eY - b.aY) * tExplode;
      var finalY = b.aY * 0.52 + 165;
      y = y + (finalY - y) * tInto;
      var s = 1 - 0.48 * tInto;
      b.el.style.transform = 'translate(-50%,-50%) translate(' + (mx * 16 * (1 - tInto)) + 'px,' + (y + floatY) + 'px) scale(' + s + ') rotate(' + rot + 'deg)';
      b.el.style.opacity = 1;
    }

    boxEl.style.opacity = tBox;
    boxEl.style.transform = 'translate(-50%,-50%) translate(0px,' + (235 + (1 - tBox) * 240) + 'px) scale(' + (0.55 + 0.45 * tBox) + ')';

    friesEl.style.opacity = tSides;
    friesEl.style.transform = 'translate(-50%,-50%) translate(-360px,' + (225 + (1 - tSides) * 170) + 'px) scale(' + (0.55 + 0.45 * tSides) + ')';
    sodaEl.style.opacity = tSides;
    sodaEl.style.transform = 'translate(-50%,-50%) translate(365px,' + (170 + (1 - tSides) * 170) + 'px) scale(' + (0.55 + 0.45 * tSides) + ')';

    if (progressBar) progressBar.style.height = (p * 100).toFixed(1) + '%';
    requestAnimationFrame(frame);
  }

  var qp = new URLSearchParams(location.search);
  function start() { compute(); readScroll(); if (qp.has('p')) p = Math.min(1, Math.max(0, parseFloat(qp.get('p')))); requestAnimationFrame(frame); }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
