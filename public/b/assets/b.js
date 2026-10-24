/* SALT Academy & Consulting — B sürümü etkileşimleri
   main.js'ten önce yüklenir ve sahneyi hazırlar; main.js'in kurduğu öğelere (duygu çarkı, imleç)
   dokunan kısımlar DOMContentLoaded'da çalışır. Manaliza Agency, Ekim 2026. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var gsap = window.gsap;
  if (hasGSAP) gsap.registerPlugin(window.ScrollTrigger);
  var motion = hasGSAP && !reduce;

  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function onFrameScroll(fn) {
    var queued = false;
    var run = function () { queued = false; fn(); };
    var req = function () { if (!queued) { queued = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    return req;
  }

  /* ---------- Harf harf bölme ----------
     Ekran okuyucu metni tek parça okur; bölünmüş kopya gizlenir. Kelimeler satır sonunda bölünmez. */
  function splitChars(el) {
    var sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    var vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    while (el.firstChild) vis.appendChild(el.firstChild);
    el.appendChild(sr);
    el.appendChild(vis);
    var c = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'b-w';
            Array.from(part).forEach(function (ch) {
              var s = document.createElement('span');
              s.className = 'b-c';
              s.textContent = ch;
              s.style.setProperty('--c', c++);
              w.appendChild(s);
            });
            frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(vis);
    return vis;
  }

  $$('[data-chars-in]').forEach(splitChars);

  /* ---------- Sayfa ilerleme çizgisi ---------- */
  var bar = document.createElement('div');
  bar.className = 'b-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  onFrameScroll(function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? clamp(window.scrollY / max, 0, 1) : 0).toFixed(4) + ')';
  })();

  /* ---------- Altın ipek: WebGL gölgelendirici ---------- */
  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform vec2 uMouse;',
    'uniform float uFade;',
    'float hash(vec2 p) { p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
    '}',
    'float fbm(vec2 p) {',
    '  float v = 0.0, a = 0.5;',
    '  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + 7.13; a *= 0.5; }',
    '  return v;',
    '}',
    /* İpeğin kıvrımları: çapraz akan, yavaşça bükülen uzun dalgalar */
    'float surf(vec2 p, float t) {',
    '  p = mat2(0.8, -0.6, 0.6, 0.8) * p;',
    '  float w = fbm(p * 0.5 + vec2(t * 0.05, -t * 0.03));',
    '  p.x += (w - 0.5) * 2.0;',
    '  float v = sin(p.x * 1.7 + sin(p.y * 0.8 + t * 0.25) * 1.5 + t * 0.2);',
    '  v += 0.55 * sin(p.x * 3.1 - p.y * 0.4 + sin(p.y * 1.2 - t * 0.2) * 1.1 - t * 0.15);',
    '  v += 0.18 * sin(p.x * 5.6 + p.y * 0.9 + t * 0.3);',
    '  return v;',
    '}',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y * 2.6;',
    '  float t = uTime, e = 0.02;',
    '  float h = surf(p, t), hx = surf(p + vec2(e, 0.0), t), hy = surf(p + vec2(0.0, e), t);',
    '  vec3 n = normalize(vec3((h - hx) / e * 0.5, (h - hy) / e * 0.5, 1.0));',
    '  vec2 m = uMouse - 0.5;',
    /* Ana ışık imleçle hafifçe yer değiştirir; ikinci ışık kıvrımların kenarına altın dokunuş verir */
    '  vec3 L = normalize(vec3(-0.55 + m.x, 0.65 + m.y * 0.6, 0.75));',
    '  vec3 L2 = normalize(vec3(0.7, -0.4, 0.5));',
    '  float dif = max(dot(n, L), 0.0);',
    '  float spe = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 18.0);',
    '  float rim = pow(max(dot(n, L2), 0.0), 3.0);',
    '  vec3 deep = vec3(0.016, 0.051, 0.09), navy = vec3(0.045, 0.13, 0.225);',
    '  vec3 gold = vec3(0.86, 0.66, 0.40), pale = vec3(0.96, 0.86, 0.68);',
    '  vec3 col = mix(deep, navy, pow(dif, 1.8));',
    '  col += gold * spe * 0.55 + pale * pow(spe, 8.0) * 0.16 + gold * rim * 0.06;',
    /* Yazıların durduğu sol alt bölge sakin kalır */
    '  float calm = smoothstep(0.7, 0.0, uv.y) * 0.5 + smoothstep(0.55, 0.0, uv.x) * 0.2;',
    '  col = mix(col, deep, clamp(calm + uFade, 0.0, 0.92));',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function silk(cv) {
    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
    if (!gl) return;
    function shader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = shader(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}');
    var fs = shader(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, 'uRes'), uTime = gl.getUniformLocation(prog, 'uTime');
    var uMouse = gl.getUniformLocation(prog, 'uMouse'), uFade = gl.getUniformLocation(prog, 'uFade');

    /* İpek yumuşak bir yüzey: düşük çözünürlükte çizip büyütmek görüntüyü bozmaz, pili korur. */
    var scale = Math.min(window.devicePixelRatio || 1, 1.5) * (fine ? 0.6 : 0.42);
    var t = 12 + Math.random() * 30, last = 0, raf = 0, inView = true, pageOn = !document.hidden;
    var mx = 0.62, my = 0.6, tx = mx, ty = my, fade = 0;
    function draw() {
      var w = Math.max(1, Math.round(cv.clientWidth * scale)), h = Math.max(1, Math.round(cv.clientHeight * scale));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uFade, fade);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function frame(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      t += dt * 0.9;
      mx += (tx - mx) * 0.035;
      my += (ty - my) * 0.035;
      var r = cv.getBoundingClientRect();
      fade = clamp(-r.top / Math.max(1, r.height), 0, 1) * 0.7;
      draw();
      raf = inView && pageOn ? requestAnimationFrame(frame) : 0;
    }
    function wake() { if (inView && pageOn && !raf) { last = 0; raf = requestAnimationFrame(frame); } }
    if (reduce) {
      draw();
      window.addEventListener('resize', draw);
      return;
    }
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX / window.innerWidth;
      ty = 1 - e.clientY / window.innerHeight;
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; wake(); }).observe(cv);
    }
    document.addEventListener('visibilitychange', function () { pageOn = !document.hidden; wake(); });
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); inView = false; });
    wake();
  }
  $$('.b-shader').forEach(silk);

  /* ---------- Dönen kelime: iletişim · liderlik · satış ---------- */
  $$('.b-rotator').forEach(function (rot) {
    var track = rot.querySelector('.b-rotator__track');
    var items = track ? track.children : [];
    if (items.length < 2) return;
    var i = 0, n = items.length - 1; /* son öğe ilkinin kopyası: döngü dikişsiz kapanır */
    function size() { rot.style.width = items[i].offsetWidth + 'px'; }
    size();
    window.addEventListener('resize', size);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
    if (reduce) return;
    setInterval(function () {
      if (document.hidden) return;
      i += 1;
      track.style.transition = 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
      track.style.transform = 'translateY(' + (-100 * i / items.length) + '%)';
      size();
      if (i === n) {
        setTimeout(function () {
          track.style.transition = 'none';
          track.style.transform = 'none';
          i = 0;
        }, 950);
      }
    }, 2400);
  });

  /* ---------- Kahraman: SALT harfleri kaydırınca dağılır ---------- */
  var hero = document.querySelector('.b-hero');
  if (hero && motion) {
    var spread = [-1, -0.36, 0.36, 1];
    $$('.b-word__l', hero).forEach(function (l, k) {
      gsap.to(l, {
        x: function () { return spread[k] * window.innerWidth * 0.1; },
        yPercent: -14 - Math.abs(spread[k]) * 12, rotation: spread[k] * 5, opacity: 0.2, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true }
      });
    });
    gsap.to('.b-hero__grid', {
      yPercent: -14, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- Yaklaşım: kaydırdıkça harf harf yanan cümle ---------- */
  var statement = document.querySelector('[data-scrub-chars]');
  if (statement) {
    var vis = splitChars(statement);
    if (motion) {
      statement.classList.add('is-scrub');
      gsap.to(vis.querySelectorAll('.b-c'), {
        opacity: 1, stagger: 0.02, ease: 'none',
        scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 42%', scrub: 0.5 }
      });
    }
  }

  /* ---------- İkonlar kendini çizer ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var drawIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        drawIO.unobserve(en.target);
        $$('path', en.target).forEach(function (p) { p.style.strokeDashoffset = '0'; });
      });
    }, { threshold: 0.4 });
    $$('.b-draw').forEach(function (svg) {
      $$('path', svg).forEach(function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len.toFixed(1);
        p.style.strokeDashoffset = len.toFixed(1);
      });
      drawIO.observe(svg);
    });
  }

  /* ---------- Kartlar: imleci izleyen ışık ve hafif eğim ---------- */
  $$('[data-spot]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
    });
  });
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.transform = 'perspective(1100px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-tilting');
        el.style.transform = '';
      });
    });
  }

  /* ---------- Karışıp yerine oturan yazı ---------- */
  var UPPER = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ', LOWER = 'abcçdefgğhıijklmnoöprsştuüvyz';
  function scramble(el) {
    if (el.bScr) return;
    if (!el.hasAttribute('data-text')) el.setAttribute('data-text', el.textContent);
    el.bScr = true;
    var t0 = performance.now(), dur = 460;
    (function step(now) {
      /* Hedef metin her karede yeniden okunur: karışma sürerken menü "Kapat"a dönerse doğru yazıda biter. */
      var text = el.getAttribute('data-text');
      var p = Math.min(1, (now - t0) / dur), done = Math.floor(p * text.length), out = '';
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (i < done || ch === ' ') { out += ch; continue; }
        var set = ch === ch.toLocaleLowerCase('tr') ? LOWER : UPPER;
        out += set.charAt((Math.random() * set.length) | 0);
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
      else { el.textContent = text; el.bScr = false; }
    })(t0);
  }
  if (fine && !reduce) {
    $$('[data-scramble]').forEach(function (el) {
      var host = el.closest('a, button') || el;
      host.addEventListener('pointerenter', function () { scramble(el); });
    });
  }

  /* Menü düğmesi açıkken "Kapat" der */
  var toggle = document.querySelector('.menu-toggle');
  var label = toggle && toggle.querySelector('.b-menu-btn__label');
  if (toggle && label) {
    new MutationObserver(function () {
      var text = toggle.getAttribute('aria-expanded') === 'true' ? 'Kapat' : 'Menü';
      if (label.getAttribute('data-text') === text) return;
      label.setAttribute('data-text', text);
      label.textContent = text;
      if (!reduce) scramble(label);
    }).observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });
  }

  /* ---------- Yöntem: üst üste binen perdeler, dolan cümleler, 30 günlük kadran ---------- */
  var stack = document.querySelector('.b-stack');
  if (stack) {
    var cards = $$('.b-chapter', stack);
    var fills = cards.map(function (c) { return $$('[data-fill]', c); });
    var dialBar = stack.querySelector('.b-dial__bar'), dialNum = stack.querySelector('[data-dial]');
    var dialLen = dialBar ? dialBar.getTotalLength() : 0;
    if (dialBar) dialBar.style.strokeDasharray = dialLen.toFixed(1);
    var paint = function (k, f) {
      fills[k].forEach(function (el) { el.style.backgroundSize = (f * 100).toFixed(2) + '% 100%'; });
      if (k === cards.length - 1) {
        if (dialBar) dialBar.style.strokeDashoffset = (dialLen * (1 - f)).toFixed(1);
        if (dialNum) dialNum.textContent = String(Math.round(f * 30));
      }
    };
    if (reduce) {
      cards.forEach(function (c, k) { paint(k, 1); });
    } else {
      onFrameScroll(function () {
        var vh = window.innerHeight;
        var sticky = window.getComputedStyle(cards[0]).position === 'sticky';
        var top = stack.getBoundingClientRect().top, acc = 0;
        cards.forEach(function (card, k) {
          var natural = top + acc; /* yapışmadan önceki doğal konum */
          acc += card.offsetHeight;
          if (cards[k + 1]) {
            var p = sticky ? clamp((vh - (top + acc)) / vh, 0, 1) : 0;
            card.style.transform = p ? 'scale(' + (1 - 0.06 * p).toFixed(4) + ')' : '';
            card.style.setProperty('--dim', (0.6 * p).toFixed(3));
          }
          paint(k, clamp((vh * 0.8 - natural) / (vh * 0.95), 0, 1));
        });
      })();
    }
  }

  /* ---------- On iki derslik yol: kaydırdıkça çizilir ---------- */
  var pathWrap = document.querySelector('[data-path]');
  if (pathWrap) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = pathWrap.querySelector('.b-path__svg');
    var track = svg.querySelector('.b-path__track'), line = svg.querySelector('.b-path__line');
    var list = pathWrap.querySelector('.b-path__list');
    var items = $$('.b-path__item', pathWrap);
    var dots = items.map(function () {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', '6');
      c.setAttribute('class', 'b-path__dot');
      svg.appendChild(c);
      return c;
    });
    var pathLen = 0, marks = [], pathH = 1;
    var update = function () {
      var r = pathWrap.getBoundingClientRect();
      var p = reduce ? 1 : clamp((window.innerHeight * 0.62 - r.top) / pathH, 0, 1);
      line.style.strokeDashoffset = (pathLen * (1 - p)).toFixed(1);
      marks.forEach(function (m, i) {
        var on = p >= m;
        items[i].classList.toggle('is-on', on);
        dots[i].classList.toggle('is-on', on);
      });
    };
    var layout = function () {
      var w = pathWrap.clientWidth;
      pathH = Math.max(1, pathWrap.clientHeight);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + pathH);
      var narrow = window.matchMedia('(max-width: 760px)').matches;
      var cx = narrow ? 16 : w / 2, amp = narrow ? 5 : Math.min(64, w * 0.045);
      var pts = items.map(function (it, i) { return [cx + (i % 2 ? amp : -amp), list.offsetTop + it.offsetTop + 34]; });
      var all = [[cx, 0]].concat(pts, [[cx, pathH]]);
      var d = 'M' + cx.toFixed(1) + ' 0';
      for (var i = 1; i < all.length; i++) {
        var a = all[i - 1], b = all[i], my = ((a[1] + b[1]) / 2).toFixed(1);
        d += 'C' + a[0].toFixed(1) + ' ' + my + ' ' + b[0].toFixed(1) + ' ' + my + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
      }
      track.setAttribute('d', d);
      line.setAttribute('d', d);
      pathLen = line.getTotalLength();
      line.style.strokeDasharray = pathLen.toFixed(1);
      pts.forEach(function (pt, i) {
        dots[i].setAttribute('cx', pt[0].toFixed(1));
        dots[i].setAttribute('cy', pt[1].toFixed(1));
      });
      marks = pts.map(function (pt) { return pt[1] / pathH; });
      update();
    };
    layout();
    onFrameScroll(update);
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  }

  /* ---------- Alt bilgideki SALT harfleri yükselir ---------- */
  $$('.footer__word').forEach(function (fw) {
    var text = fw.textContent.trim();
    fw.textContent = '';
    Array.from(text).forEach(function (ch, k) {
      var s = document.createElement('span');
      s.textContent = ch;
      s.style.setProperty('--k', k);
      fw.appendChild(s);
    });
    if (reduce || !('IntersectionObserver' in window)) { fw.classList.add('is-in'); return; }
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { fw.classList.add('is-in'); o.disconnect(); }
    }, { threshold: 0.3 });
    o.observe(fw);
  });

  /* ---------- Kaydırma hızı: mühür ve kayan yazı hızlanır ---------- */
  if (!reduce) {
    var spinners = [], lastY = window.scrollY, rate = 1;
    var collect = function () {
      spinners = [];
      $$('.b-seal__ring, .marquee__track').forEach(function (el) {
        if (el.getAnimations) spinners = spinners.concat(el.getAnimations());
      });
    };
    var tick = function () {
      var y = window.scrollY, v = Math.abs(y - lastY);
      lastY = y;
      rate += (1 + Math.min(v / 6, 5) - rate) * 0.08;
      spinners.forEach(function (a) { if (Math.abs(a.playbackRate - rate) > 0.02) a.playbackRate = rate; });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(function () { collect(); tick(); });
  }

  /* ---------- main.js kurulduktan sonra ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    /* İmleç büyük başlıkların üstünde genişler */
    if (fine && !reduce) {
      document.addEventListener('pointerover', function (e) {
        var ring = document.querySelector('.cursor-ring');
        if (ring) ring.classList.toggle('is-big', !!e.target.closest('.h2, .b-hero__title, .b-chapter__word, .contact__title, .page-hero__title, .b-statement__text'));
      });
    }
    if (!motion) return;

    /* Duygu çarkı yerine dönerek oturur */
    var wheelSvg = document.querySelector('[data-wheel] svg');
    if (wheelSvg) {
      gsap.fromTo(wheelSvg, { rotation: -50 }, {
        rotation: 0, ease: 'none',
        scrollTrigger: { trigger: '[data-wheel]', start: 'top bottom', end: 'center 55%', scrub: 0.8 }
      });
    }

    /* Liderlik basamakları sırayla yükselir */
    var stairs = $$('.stair');
    if (stairs.length) {
      stairs.forEach(function (s) { s.classList.add('b-no-tr'); });
      gsap.from(stairs, {
        scaleY: 0, transformOrigin: '50% 100%', duration: 1.3, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: '.stairs', start: 'top 82%' },
        onComplete: function () {
          gsap.set(stairs, { clearProps: 'transform' });
          stairs.forEach(function (s) { s.classList.remove('b-no-tr'); });
        }
      });
    }

    /* Kurucu portresi derinlik kazanır */
    /* Gerçek fotoğrafta kayma saçın üstünü keserdi; yalnızca monogramda uygulanır */
    var portraitImg = document.querySelector('.portrait:not(.portrait--photo) img');
    if (portraitImg) {
      gsap.fromTo(portraitImg, { yPercent: -14 }, {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: '.portrait', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    window.ScrollTrigger.refresh();
  });
})();
