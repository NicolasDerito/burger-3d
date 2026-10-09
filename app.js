(function () {
  var S = Math.min(1, Math.max(0.5, window.innerWidth / 1360));
  var spec = [
    { id: 'l-topbun', tag: 'Pan brioche' },
    { id: 'l-lettuce', tag: 'Lechuga' },
    { id: 'l-tomato', tag: 'Tomate' },
    { id: 'l-cheese', tag: 'Cheddar' },
    { id: 'l-bacon', tag: 'Panceta' },
    { id: 'l-patty', tag: 'Carne' },
    { id: 'l-bunbottom', tag: 'Pan' }
  ];
  var n = spec.length;
  var items = spec.map(function (s) {
    var el = document.getElementById(s.id);
    el.style.width = (200 * S) + 'px';
    return { el: el, tag: s.tag };
  });
  var tagsBox = document.getElementById('tags');
  var rowEls = items.map(function (it) {
    var t = document.createElement('span');
    t.className = 'tag';
    t.textContent = it.tag;
    tagsBox.appendChild(t);
    return t;
  });

  var baseEl = document.getElementById('l-base');
  baseEl.style.width = (700 * S) + 'px';
  var boxEl = document.getElementById('l-box');
  boxEl.style.width = (760 * S) + 'px';
  var friesEl = document.getElementById('l-fries');
  friesEl.style.width = (360 * S) + 'px';
  var sodaEl = document.getElementById('l-soda');
  sodaEl.style.width = (320 * S) + 'px';
  var barEl = document.querySelector('.bar span');

  var rowW = Math.min(window.innerWidth * 0.84, 1180);
  var step = rowW / (n - 1);

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
  window.addEventListener('pointermove', function (e) { mx = (e.clientX / window.innerWidth) * 2 - 1; });
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll);

  function frame(ts) {
    var t = ts / 1000;
    var tBase = smooth(0.06, 0.26, p);
    var tBox = smooth(0.52, 0.66, p);
    var tSides = smooth(0.88, 1.0, p);
    var floatY = Math.sin(t * 1.05) * 11 * (1 - tBase);

    baseEl.style.opacity = 1 - tBase;
    baseEl.style.transform = 'translate(-50%,-50%) translate(' + (mx * 18) + 'px,' + floatY + 'px) rotate(' + (mx * 2.4) + 'deg)';

    for (var i = 0; i < n; i++) {
      var it = items[i];
      var fi = smooth(0.08 + i * 0.03, 0.46 + i * 0.03, p);
      var gi = smooth(0.68 + i * 0.02, 0.90 + i * 0.02, p);
      var x0 = 0, y0 = 0;
      var xr = (i - (n - 1) / 2) * step;
      var yr = (i % 2 === 0 ? -74 : 66) * S;
      var x = x0 + (xr - x0) * fi;
      var y = y0 + (yr - y0) * fi;
      var fx = 0, fy = (175 * S);
      x = x + (fx - x) * gi;
      y = y + (fy - y) * gi;
      var s = (0.55 + 0.45 * fi) * (1 - 0.5 * gi);
      var drift = Math.sin(t * 0.9 + i) * 6 * (1 - gi) * fi;
      it.el.style.opacity = tBase;
      it.el.style.transform = 'translate(-50%,-50%) translate(' + (x + mx * 14 * (1 - gi)) + 'px,' + (y + drift) + 'px) scale(' + s + ')';
      var h = 200 * S;
      rowEls[i].style.opacity = fi * (1 - gi);
      rowEls[i].style.transform = 'translate(-50%,-50%) translate(' + x + 'px,' + (y + h * 0.62) + 'px)';
    }

    boxEl.style.opacity = tBox;
    boxEl.style.transform = 'translate(-50%,-50%) translate(0px,' + (255 * S + (1 - tBox) * 280) + 'px) scale(' + (0.62 + 0.38 * tBox) + ')';
    friesEl.style.opacity = tSides;
    friesEl.style.transform = 'translate(-50%,-50%) translate(' + (-380 * S) + 'px,' + (245 * S + (1 - tSides) * 200) + 'px) scale(' + (0.62 + 0.38 * tSides) + ')';
    sodaEl.style.opacity = tSides;
    sodaEl.style.transform = 'translate(-50%,-50%) translate(' + (385 * S) + 'px,' + (190 * S + (1 - tSides) * 200) + 'px) scale(' + (0.62 + 0.38 * tSides) + ')';

    if (barEl) barEl.style.height = (p * 100).toFixed(1) + '%';
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.35 });
    document.querySelectorAll('.slide').forEach(function (s) { io.observe(s); });
  } else {
    document.querySelectorAll('.slide').forEach(function (s) { s.classList.add('in'); });
  }

  var qp = new URLSearchParams(location.search);
  function start() {
    readScroll();
    if (qp.has('p')) p = Math.min(1, Math.max(0, parseFloat(qp.get('p'))));
    requestAnimationFrame(frame);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
