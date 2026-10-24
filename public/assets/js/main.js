/* SALT Academy & Consulting — prototip etkileşimleri
   Manaliza Agency, Ekim 2026. GSAP ve Lenis yüklenmezse sayfa sade haliyle çalışır. */
(function () {
  'use strict';

  var root = document.documentElement;
  window.SALT_READY = true;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGSAP) window.gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- Açılış ekranı ve kahraman alan ---------- */
  var heroShown = false;
  function showHero() {
    if (heroShown) return;
    heroShown = true;
    document.querySelectorAll('[data-hero]').forEach(function (el) { el.classList.add('is-in'); });
  }
  var pre = document.querySelector('.preloader');
  var preActive = pre && window.getComputedStyle(pre).display !== 'none';
  function finishPreloader() {
    if (pre) pre.classList.add('is-done');
    showHero();
  }
  if (preActive && !reduce) {
    var count = pre.querySelector('.preloader__count');
    var t0 = performance.now();
    var tick = function (now) {
      var p = Math.min(1, (now - t0) / 1150);
      if (count) count.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p < 1) requestAnimationFrame(tick); else setTimeout(finishPreloader, 220);
    };
    requestAnimationFrame(tick);
    setTimeout(finishPreloader, 2600);
  } else if (root.classList.contains('arrive') && !reduce) {
    setTimeout(finishPreloader, 380);
  } else {
    finishPreloader();
  }

  /* ---------- Yumuşak kaydırma ---------- */
  var lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var lenisRaf = function (t) { lenis.raf(t); requestAnimationFrame(lenisRaf); };
      requestAnimationFrame(lenisRaf);
    }
  }

  /* ---------- Menü, bağlantılar, sayfa geçişi ---------- */
  var toggle = document.querySelector('.menu-toggle');
  function closeMenu() {
    root.classList.remove('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = !root.classList.contains('menu-open');
      root.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) { closeMenu(); if (toggle) toggle.focus(); }
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented) return;
    var href = a.getAttribute('href');
    if (href.charAt(0) === '#' && href.length > 1) {
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -10 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    var internal = /^[\w-]+\.html(#[\w-]+)?$/.test(href);
    if (internal && !a.target && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !reduce) {
      var wipe = document.querySelector('.page-wipe');
      if (!wipe) return;
      e.preventDefault();
      closeMenu();
      try { sessionStorage.setItem('salt-wipe', '1'); } catch (err) { /* özel pencere */ }
      wipe.classList.add('is-in');
      setTimeout(function () { window.location.href = href; }, 520);
    }
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var w = document.querySelector('.page-wipe');
      if (w) w.classList.remove('is-in');
    }
  });

  /* ---------- Üst bilgi: aşağı kaydırınca gizlen, yukarıda belir ---------- */
  var header = document.querySelector('.site-header');
  var sticky = document.querySelector('.sticky-cta');
  var contactSec = document.getElementById('iletisim');
  var footerEl = document.querySelector('.site-footer');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 30);
      if (y > lastY + 2 && y > 500 && !root.classList.contains('menu-open')) header.classList.add('is-hidden');
      else if (y < lastY - 2) header.classList.remove('is-hidden');
    }
    if (sticky) {
      var vh = window.innerHeight;
      var atContact = contactSec ? contactSec.getBoundingClientRect().top < vh * 0.85 : false;
      var atFooter = footerEl ? footerEl.getBoundingClientRect().top < vh * 0.9 : false;
      sticky.classList.toggle('is-visible', y > vh * 0.85 && !atContact && !atFooter);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Kelime kelime bölme ---------- */
  function splitWords(el) {
    var i = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var outer = document.createElement('span');
            outer.className = 'word';
            var inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--i', i++);
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
  }

  /* ---------- Görünür olma ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }) : null;

  document.querySelectorAll('.split').forEach(splitWords);
  document.querySelectorAll('[data-reveal], .split').forEach(function (el) {
    if (io) io.observe(el); else el.classList.add('is-in');
  });

  /* ---------- Manifesto: kaydırdıkça yanan kelimeler ---------- */
  var mani = document.querySelector('.manifesto__text');
  if (mani) {
    splitWords(mani);
    if (hasGSAP && !reduce) {
      mani.classList.add('is-scrub');
      window.gsap.to(mani.querySelectorAll('.word > span'), {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: mani, start: 'top 78%', end: 'bottom 42%', scrub: 0.6 }
      });
    }
  }

  /* ---------- Kahraman alan: altın ipek çizgiler ---------- */
  var canvas = document.querySelector('.hero__canvas');
  if (canvas && canvas.getContext) heroLines(canvas);
  function heroLines(cv) {
    var ctx = cv.getContext('2d');
    var w = 0, h = 0, t = 3.4, mx = 0.62, my = 0.4, tx = mx, ty = my, raf = 0, visible = true;
    var N = 44;
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      for (var i = 0; i < N; i++) {
        var p = i / (N - 1);
        var base = h * (0.16 + p * 0.64);
        ctx.beginPath();
        for (var x = -24; x <= w + 24; x += 18) {
          var nx = x / w;
          var bump = Math.exp(-Math.pow(nx - mx, 2) / 0.03);
          var y = base
            + Math.sin(nx * 2.6 + t * 0.55 + p * 2.2) * h * 0.07
            + Math.sin(nx * 6.3 - t * 0.35 + p * 4.6) * h * 0.016
            - bump * (my - 0.2) * h * 0.12 * Math.sin(p * Math.PI);
          if (x === -24) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var alpha = 0.04 + 0.2 * Math.pow(Math.sin(p * Math.PI), 3);
        ctx.strokeStyle = 'rgba(224,183,128,' + alpha.toFixed(3) + ')';
        ctx.lineWidth = i % 9 === 4 ? 1.3 : 0.7;
        ctx.stroke();
      }
      t += 0.006;
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    }
    resize();
    frame();
    window.addEventListener('resize', function () { resize(); if (reduce) frame(); });
    if (!reduce) {
      window.addEventListener('pointermove', function (e) {
        tx = e.clientX / window.innerWidth; ty = e.clientY / window.innerHeight;
      }, { passive: true });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting;
          cancelAnimationFrame(raf);
          if (visible) raf = requestAnimationFrame(frame);
        }).observe(cv);
      }
    }
  }

  if (hasGSAP && !reduce && document.querySelector('.hero')) {
    window.gsap.to('.hero__inner', {
      yPercent: -8, opacity: 0.3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- Programlar: dikey kaydırma yatay şeride döner ---------- */
  var programs = document.querySelector('.programs');
  if (programs) {
    var track = programs.querySelector('.programs__track');
    var bar = programs.querySelector('.programs__progress span');
    if (hasGSAP && !reduce && window.matchMedia('(min-width: 901px)').matches) {
      var dist = function () { return Math.max(0, track.scrollWidth - document.documentElement.clientWidth); };
      window.gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: programs, start: 'top top', end: function () { return '+=' + dist(); },
          pin: true, scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: function (s) { if (bar) bar.style.transform = 'scaleX(' + s.progress.toFixed(3) + ')'; }
        }
      });
    } else {
      programs.classList.add('is-scroller');
    }
  }

  /* ---------- Yöntem döngüsü ---------- */
  var loop = document.querySelector('.loop');
  if (loop) {
    var ring = loop.querySelector('.loop__progress');
    var nodes = Array.prototype.slice.call(loop.querySelectorAll('.loop__node'));
    var daysEl = loop.querySelector('[data-days]');
    var len = ring.getTotalLength ? ring.getTotalLength() : 1257;
    ring.style.strokeDasharray = String(len);
    var setLoop = function (p) {
      ring.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
      nodes.forEach(function (n, i) { n.classList.toggle('is-on', p >= (i + 0.15) / nodes.length); });
      if (daysEl) daysEl.textContent = String(Math.round(p * 30));
    };
    if (hasGSAP && !reduce) {
      setLoop(0);
      window.ScrollTrigger.create({ trigger: loop, start: 'top 75%', end: 'bottom 35%', scrub: 0.5, onUpdate: function (s) { setLoop(s.progress); } });
    } else {
      setLoop(1);
    }
  }

  /* ---------- Duygu çarkı (Plutchik) ---------- */
  var wheel = document.querySelector('[data-wheel]');
  var panel = document.querySelector('[data-emotion-panel]');
  if (wheel && panel) buildWheel(wheel, panel);
  function buildWheel(host, pane) {
    var E = [
      { name: 'Sevinç', levels: ['Dinginlik', 'Sevinç', 'Coşku'], color: '#E7C25F', opp: 'Üzüntü', tip: 'Başarıyı adıyla takdir edin; neyin işe yaradığını görünür kılın.' },
      { name: 'Güven', levels: ['Kabul', 'Güven', 'Hayranlık'], color: '#9DCB84', opp: 'Tiksinme', tip: 'Verdiğiniz sözü tutun; bilmediğiniz bir şeyi kesinmiş gibi sunmayın.' },
      { name: 'Korku', levels: ['Çekinme', 'Korku', 'Dehşet'], color: '#4FA27A', opp: 'Öfke', tip: 'Belirsizliği azaltın: ne biliniyor, ne bilinmiyor, ne zaman haber vereceksiniz?' },
      { name: 'Şaşkınlık', levels: ['Dalgınlık', 'Şaşkınlık', 'Hayret'], color: '#62B6CB', opp: 'Beklenti', tip: 'Önce bağlamı anlatın; ani bir değişikliği gerekçesiyle açıklayın.' },
      { name: 'Üzüntü', levels: ['Hüzün', 'Üzüntü', 'Keder'], color: '#5C82C7', opp: 'Sevinç', tip: 'Çözüme koşmadan önce dinleyin; yaşanan etkiyi kabul edin.' },
      { name: 'Tiksinme', levels: ['Sıkılma', 'Tiksinme', 'Nefret'], color: '#9273BF', opp: 'Güven', tip: 'Kişiyi değil davranışı konuşun; değer çatışmasını açıkça adlandırın.' },
      { name: 'Öfke', levels: ['Kızgınlık', 'Öfke', 'Gazap'], color: '#D0605E', opp: 'Korku', tip: 'Sesinizi alçaltın, kısa cümleler kurun, konuşmayı bir sonraki adıma taşıyın.' },
      { name: 'Beklenti', levels: ['İlgi', 'Beklenti', 'Tetikte olma'], color: '#E39452', opp: 'Şaşkınlık', tip: 'Beklentiyi gerçekçi tutun; tarihi, sorumluyu ve çıktıyı netleştirin.' }
    ];
    var LV = ['Hafif', 'Temel', 'Yoğun'];
    var NS = 'http://www.w3.org/2000/svg';
    var cx = 300, cy = 300;
    var rings = [[210, 282], [138, 208], [66, 136]];
    var step = Math.PI * 2 / 8, gap = 0.012;

    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    }
    function pol(r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    function sector(r0, r1, a0, a1) {
      var p0 = pol(r1, a0), p1 = pol(r1, a1), p2 = pol(r0, a1), p3 = pol(r0, a0);
      return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
        'A' + r1 + ' ' + r1 + ' 0 0 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) +
        'L' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2) +
        'A' + r0 + ' ' + r0 + ' 0 0 0 ' + p3[0].toFixed(2) + ' ' + p3[1].toFixed(2) + 'Z';
    }
    function mix(hex, to, k) {
      var a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
      var r = Math.round(((a >> 16) & 255) * (1 - k) + ((b >> 16) & 255) * k);
      var g = Math.round(((a >> 8) & 255) * (1 - k) + ((b >> 8) & 255) * k);
      var bl = Math.round((a & 255) * (1 - k) + (b & 255) * k);
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
    }

    var svg = el('svg', { viewBox: '0 0 600 600', role: 'group', 'aria-label': 'Plutchik duygu çarkı: sekiz temel duygu, üç yoğunluk' });
    E.forEach(function (e, i) {
      var a0 = -Math.PI / 2 - step / 2 + i * step + gap;
      var a1 = a0 + step - 2 * gap;
      [0, 1, 2].forEach(function (lv) {
        var fill = lv === 0 ? mix(e.color, '#ffffff', 0.4) : lv === 1 ? e.color : mix(e.color, '#000000', 0.24);
        var seg = el('path', {
          d: sector(rings[lv][0], rings[lv][1], a0, a1), fill: fill, class: 'seg', tabindex: '0', role: 'button',
          'aria-label': e.levels[lv] + ', ' + e.name + ' ailesi, ' + LV[lv].toLowerCase() + ' yoğunluk',
          'data-i': i, 'data-lv': lv
        });
        svg.appendChild(seg);
      });
      var lp = pol(173, (a0 + a1) / 2);
      var label = el('text', { x: lp[0].toFixed(1), y: lp[1].toFixed(1), class: 'wheel__label', 'aria-hidden': 'true' });
      label.textContent = e.name;
      svg.appendChild(label);
    });
    var center = el('g', { class: 'wheel__center', 'aria-hidden': 'true' });
    center.appendChild(el('circle', { cx: cx, cy: cy, r: 58 }));
    var num = el('text', { x: cx, y: cy - 6, class: 'wheel__center-num' });
    num.textContent = '8';
    var txt = el('text', { x: cx, y: cy + 26, class: 'wheel__center-txt' });
    txt.textContent = 'temel duygu';
    center.appendChild(num);
    center.appendChild(txt);
    svg.appendChild(center);
    host.appendChild(svg);

    var lvlEl = pane.querySelector('[data-level]'), wordEl = pane.querySelector('[data-word]');
    var scaleEl = pane.querySelector('[data-scale]'), tipEl = pane.querySelector('[data-tip]'), oppEl = pane.querySelector('[data-opp]');
    function select(i, lv) {
      var e = E[i];
      svg.querySelectorAll('.seg').forEach(function (s) {
        s.classList.toggle('is-active', +s.getAttribute('data-i') === i && +s.getAttribute('data-lv') === lv);
      });
      host.classList.add('has-active');
      lvlEl.textContent = e.name + ' · ' + LV[lv] + ' yoğunluk';
      wordEl.textContent = e.levels[lv];
      scaleEl.innerHTML = '';
      e.levels.forEach(function (wd, k) {
        var s = document.createElement('span');
        s.textContent = wd;
        if (k === lv) s.className = 'is-current';
        scaleEl.appendChild(s);
      });
      tipEl.textContent = e.tip;
      oppEl.textContent = 'Zıttı: ' + e.opp + '. Zıt duygular çarkta karşılıklı durur.';
    }
    function fromEvent(ev) {
      var s = ev.target.closest && ev.target.closest('.seg');
      if (s) select(+s.getAttribute('data-i'), +s.getAttribute('data-lv'));
      return s;
    }
    if (fine) svg.addEventListener('pointerover', fromEvent);
    svg.addEventListener('click', fromEvent);
    svg.addEventListener('focusin', fromEvent);
    svg.addEventListener('keydown', function (ev) {
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList && ev.target.classList.contains('seg')) {
        ev.preventDefault();
        fromEvent(ev);
      }
    });
    select(0, 1);
    host.classList.remove('has-active');

    if (hasGSAP && !reduce) {
      var segs = svg.querySelectorAll('.seg');
      host.classList.add('is-entering');
      window.gsap.fromTo(segs, { opacity: 0, scale: 0.6, svgOrigin: '300 300' }, {
        opacity: 1, scale: 1, svgOrigin: '300 300', duration: 1.1, ease: 'expo.out',
        stagger: { each: 0.02, from: 'random' },
        scrollTrigger: { trigger: host, start: 'top 75%' },
        onComplete: function () {
          window.gsap.set(segs, { clearProps: 'all' });
          host.classList.remove('is-entering');
        }
      });
    }
  }

  /* ---------- Liderliğin beş evresi ---------- */
  var stairs = Array.prototype.slice.call(document.querySelectorAll('.stair'));
  var stairsDetail = document.querySelector('[data-stairs-detail]');
  if (stairs.length && stairsDetail) {
    var h3 = stairsDetail.querySelector('h3'), para = stairsDetail.querySelector('p');
    var pick = function (btn) {
      stairs.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      h3.textContent = btn.getAttribute('data-title');
      para.textContent = btn.getAttribute('data-text');
    };
    stairs.forEach(function (b) {
      b.addEventListener('click', function () { pick(b); });
      b.addEventListener('focus', function () { pick(b); });
      if (fine) b.addEventListener('mouseenter', function () { pick(b); });
    });
  }

  /* ---------- Sayaçlar ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !io) return;
    el.textContent = '0';
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var start = performance.now();
      var f = function (now) {
        var p = Math.min(1, (now - start) / 1400);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* ---------- Ders seçici (Eğitimler sayfası) ---------- */
  var lessonBtns = Array.prototype.slice.call(document.querySelectorAll('.lesson-btn'));
  var lessonPane = document.querySelector('[data-lesson-detail]');
  if (lessonBtns.length && lessonPane) {
    var nEl = lessonPane.querySelector('[data-n]'), tEl = lessonPane.querySelector('[data-title]');
    var uEl = lessonPane.querySelector('[data-topics]'), fEl = lessonPane.querySelector('[data-foot]');
    var showLesson = function (b, focus) {
      lessonBtns.forEach(function (x) {
        var on = x === b;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
      });
      nEl.textContent = b.getAttribute('data-n');
      tEl.textContent = b.getAttribute('data-title');
      uEl.innerHTML = '';
      b.getAttribute('data-topics').split('|').forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        uEl.appendChild(li);
      });
      fEl.textContent = b.getAttribute('data-foot') || 'Ders sonunda: bugünkü dersten sizin için en değerli olan neydi?';
      lessonPane.setAttribute('aria-labelledby', b.id);
      if (focus) b.focus();
    };
    lessonBtns.forEach(function (b, i) {
      b.addEventListener('click', function () { showLesson(b); });
      b.addEventListener('keydown', function (e) {
        var j = null, last = lessonBtns.length - 1;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = i === last ? 0 : i + 1;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = i === 0 ? last : i - 1;
        if (e.key === 'Home') j = 0;
        if (e.key === 'End') j = last;
        if (j !== null) { e.preventDefault(); showLesson(lessonBtns[j], true); }
      });
    });
    showLesson(lessonBtns[0]);
  }

  /* ---------- Filtreler ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var filterStatus = document.querySelector('[data-filter-status]');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      var tag = f.getAttribute('data-filter');
      filters.forEach(function (x) { x.setAttribute('aria-pressed', String(x === f)); });
      document.querySelectorAll('[data-tags]').forEach(function (el) {
        var show = tag === 'all' || el.getAttribute('data-tags').split(' ').indexOf(tag) > -1;
        el.classList.toggle('is-hidden', !show);
      });
      if (filterStatus) filterStatus.textContent = f.textContent.trim() + ' programları gösteriliyor';
      if (hasGSAP) window.ScrollTrigger.refresh();
    });
  });

  /* ---------- Formlar: ziyaretçinin e-posta uygulamasında hazır mesaj açılır ----------
     Bilgiler sitede saklanmaz; mesaj doğrudan ziyaretçinin e-postasından gelir.
     Konu satırı sürümü (A ya da B) taşır, teşekkür sayfası da dönüşüm sayımı için sürüme göre ayrıdır. */
  document.querySelectorAll('form[data-mailto]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var variant = window.SALT_VARIANT || 'A';
      var lines = [];
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.type === 'checkbox' || !el.name || !String(el.value).trim()) return;
        var lab = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
        lines.push((lab ? lab.textContent.replace('*', '').trim() : el.name) + ': ' + String(el.value).trim());
      });
      var optin = form.querySelector('input[name="bulten"]');
      if (optin) lines.push('E-bülten izni: ' + (optin.checked ? 'Evet' : 'Hayır'));
      lines.push('', '— saltacademyconsulting.com formu · Sürüm ' + variant);
      var subject = (form.getAttribute('data-subject') || 'Web sitesi talebi') + ' (Sürüm ' + variant + ')';
      var href = 'mailto:' + form.getAttribute('data-mailto') +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      var ok = form.querySelector('.form__success');
      if (ok) { ok.hidden = false; ok.setAttribute('tabindex', '-1'); ok.focus({ preventScroll: true }); }
      window.location.href = href;
      var thanks = form.getAttribute('data-thanks');
      if (thanks) setTimeout(function () { window.location.href = thanks; }, 1200);
    });
  });

  /* ---------- İmleç ve mıknatıslı düğmeler ---------- */
  if (fine && !reduce) {
    var dot = document.createElement('div');
    var ringEl = document.createElement('div');
    dot.className = 'cursor';
    ringEl.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ringEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    document.body.appendChild(ringEl);
    var px = -100, py = -100, rx = px, ry = py;
    window.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      dot.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0)';
    }, { passive: true });
    var follow = function () {
      rx += (px - rx) * 0.16; ry += (py - ry) * 0.16;
      ringEl.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      requestAnimationFrame(follow);
    };
    follow();
    var hoverSel = 'a, button, .seg, input, select, textarea, label';
    document.addEventListener('pointerover', function (e) { if (e.target.closest(hoverSel)) ringEl.classList.add('is-hover'); });
    document.addEventListener('pointerout', function (e) { if (e.target.closest(hoverSel)) ringEl.classList.remove('is-hover'); });

    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px,' + (dy * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Yazı tipleri yüklenince ölçüleri tazele ---------- */
  if (hasGSAP) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { window.ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
  }
})();
