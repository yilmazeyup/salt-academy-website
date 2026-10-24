/* SALT site içi arama (Ayla Hanım'ın isteği, 23 Ekim). Arama açılınca ana sayfa, eğitimler ve galeri okunur;
   siteye eklenen her başlık, modül ve ders kendiliğinden aranabilir olur. Kısayol: / ya da Ctrl/Cmd + K.
   Manaliza Agency, Ekim 2026. */
(function () {
  'use strict';
  var toggles = Array.prototype.slice.call(document.querySelectorAll('.search-toggle'));
  if (!toggles.length || typeof HTMLDialogElement !== 'function') {
    toggles.forEach(function (t) { t.hidden = true; });
    return;
  }

  var root = document.documentElement;
  var PAGES = [['index.html', 'Ana sayfa'], ['egitimler.html', 'Eğitimler'], ['galeri.html', 'Galeri']];
  var SUGGEST = ['CRM', 'Müzakere', 'Şikâyet yönetimi', 'Kadınlar için Liderlik', 'Webinar'];
  var here = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') + '.html';

  var box = document.createElement('dialog');
  box.className = 'search';
  box.setAttribute('aria-label', 'Sitede ara');
  box.setAttribute('data-lenis-prevent', '');
  box.innerHTML =
    '<div class="search__panel">' +
      '<div class="search__bar">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>' +
        '<input class="search__input" type="search" placeholder="Eğitim, konu ya da kelime yazın" aria-label="Sitede ara" autocomplete="off" spellcheck="false" enterkeyhint="search">' +
        '<button class="search__close" type="button" aria-label="Aramayı kapat">Esc</button>' +
      '</div>' +
      '<div class="search__body"><p class="search__status" aria-live="polite"></p><div class="search__chips"></div><ul class="search__results"></ul></div>' +
    '</div>';
  document.body.appendChild(box);

  var input = box.querySelector('.search__input');
  var status = box.querySelector('.search__status');
  var chips = box.querySelector('.search__chips');
  var list = box.querySelector('.search__results');
  var entries = null;
  var loading = null;
  var opener = null;

  /* Türkçe harfler ve büyük/küçük harf farkı aramayı etkilemesin: "musteri" ile "Müşteri" eşleşir */
  function norm(s) {
    return s.toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  var CLASS = { a: '[aâAÂ]', c: '[cçCÇ]', g: '[gğGĞ]', i: '[iıİIîÎ]', o: '[oöOÖ]', s: '[sşSŞ]', u: '[uüûUÜÛ]' };
  function pattern(term) {
    return term.split('').map(function (ch) {
      return CLASS[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
  }
  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  /* textContent maddeleri ve etiketleri boşluksuz birleştirir ("vermekSorumluluk");
     burada her blok öğenin arasına boşluk konur, <b>S</b>trategy gibi satır içi biçimler bitişik kalır */
  var INLINE = /^(B|STRONG|EM|I|U|MARK|ABBR|CODE|SUP|SUB)$/;
  function textOf(node) {
    var out = [];
    (function walk(n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) { out.push(c.data); continue; }
        if (c.nodeType !== 1) continue;
        var tag = c.tagName.toUpperCase();
        if (/^(SCRIPT|STYLE|SVG|TEMPLATE)$/.test(tag)) continue;
        var inline = INLINE.test(tag);
        if (!inline) out.push(' ');
        walk(c);
        if (!inline) out.push(' ');
      }
    })(node);
    return clean(out.join(''));
  }

  function extract(doc, page, label) {
    var out = [];
    var main = doc.querySelector('main') || doc.body;
    Array.prototype.forEach.call(main.querySelectorAll('section'), function (sec) {
      var h = sec.querySelector('h1, h2');
      var secTitle = h ? textOf(h) : '';
      if (!secTitle) return;
      var base = { page: page, label: label, id: sec.id || '', sec: secTitle };
      var add = function (t, x, kind) {
        t = clean(t);
        if (t) out.push({ page: base.page, label: base.label, id: base.id, sec: base.sec, t: t, x: clean(x), kind: kind, nt: norm(t), nx: norm(clean(x)) });
      };
      add(secTitle, textOf(sec).replace(secTitle, ''), 'sec');
      Array.prototype.forEach.call(sec.querySelectorAll('h3'), function (h3) {
        var block = h3.closest('article, li, a, .pillar, .module, .insight') || h3.parentElement;
        var t3 = textOf(h3);
        add(t3, textOf(block).replace(t3, ''), 'sub');
      });
      Array.prototype.forEach.call(sec.querySelectorAll('[data-title]'), function (el) {
        add(el.getAttribute('data-title'), (el.getAttribute('data-topics') || '').split('|').join(' · ') + ' ' + (el.getAttribute('data-foot') || ''), 'sub');
      });
      Array.prototype.forEach.call(sec.querySelectorAll('.short'), function (el) {
        var sub = el.querySelector('span');
        add(el.firstChild ? el.firstChild.textContent : textOf(el), sub ? textOf(sub) : '', 'sub');
      });
    });
    return out;
  }

  function load() {
    if (loading) return loading;
    var parser = new DOMParser();
    loading = Promise.all(PAGES.map(function (p) {
      return fetch(p[0], { credentials: 'same-origin' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (html) { return extract(parser.parseFromString(html, 'text/html'), p[0], p[1]); })
        .catch(function () {
          /* Sayfa okunamazsa (ör. çevrimdışı) en azından açık olan sayfada arar */
          return p[0] === here ? extract(document, p[0], p[1]) : [];
        });
    })).then(function (parts) {
      entries = [].concat.apply([], parts);
      return entries;
    });
    return loading;
  }

  function search(q) {
    var terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    var hits = [];
    entries.forEach(function (e) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        var inTitle = e.nt.indexOf(term) > -1;
        if (!inTitle && e.nx.indexOf(term) < 0) return;
        score += inTitle ? (e.nt.indexOf(term) === 0 ? 14 : 10) : 1;
      }
      var titleHit = terms.some(function (t) { return e.nt.indexOf(t) > -1; });
      /* Başlığı eşleşen program ya da bölüm, kendi modüllerinden önce gelir */
      score += e.kind === 'sec' ? (titleHit ? 4 : 0) : 2;
      hits.push({ e: e, score: score, titleHit: titleHit });
    });
    /* Aynı bölümde daha kesin bir sonuç varsa, başlığı eşleşmeyen bölüm kaydı tekrar gösterilmez */
    var precise = {};
    hits.forEach(function (h) { if (h.e.kind === 'sub') precise[h.e.page + '#' + h.e.id] = true; });
    hits = hits.filter(function (h) { return h.e.kind === 'sub' || h.titleHit || !precise[h.e.page + '#' + h.e.id]; });
    var seen = {};
    return hits.sort(function (a, b) { return b.score - a.score; }).filter(function (h) {
      var k = h.e.page + '#' + h.e.id + '|' + h.e.nt;
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    }).slice(0, 12);
  }

  function highlight(text, terms) {
    var safe = esc(text);
    if (!terms.length) return safe;
    var re = new RegExp('(' + terms.map(pattern).join('|') + ')', 'gi');
    return safe.replace(re, '<mark>$1</mark>');
  }

  function snippet(text, terms) {
    if (!text) return '';
    var re = new RegExp(terms.map(pattern).join('|'), 'i');
    var m = re.exec(text);
    var at = m ? m.index : 0;
    var start = Math.max(0, at - 60);
    var end = Math.min(text.length, at + 110);
    return (start > 0 ? '… ' : '') + text.slice(start, end) + (end < text.length ? ' …' : '');
  }

  function hrefFor(e) {
    if (e.page === here) return '#' + (e.id || 'icerik');
    return e.page + (e.id ? '#' + e.id : '');
  }

  function showChips(on) {
    chips.hidden = !on;
    if (on && !chips.childNodes.length) {
      SUGGEST.forEach(function (word) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'search__chip';
        b.textContent = word;
        b.addEventListener('click', function () { input.value = word; render(); input.focus(); });
        chips.appendChild(b);
      });
    }
  }

  function render() {
    var q = input.value.trim();
    list.innerHTML = '';
    if (!q) {
      status.textContent = 'Örnek aramalar:';
      showChips(true);
      return;
    }
    showChips(false);
    if (!entries) { status.textContent = 'Aranıyor…'; return; }
    var terms = norm(q).split(/\s+/).filter(Boolean);
    var hits = search(q);
    if (!hits.length) {
      status.innerHTML = '“' + esc(q) + '” için sonuç bulunamadı. Başka bir kelime deneyin ya da <a href="' +
        (here === 'index.html' ? '#iletisim' : 'index.html#iletisim') + '">bize yazın</a>.';
      return;
    }
    status.textContent = hits.length + ' sonuç';
    hits.forEach(function (h) {
      var e = h.e;
      var where = e.label + (e.kind === 'sub' && e.sec !== e.t ? ' · ' + e.sec : '');
      var li = document.createElement('li');
      li.innerHTML = '<a class="search__hit" href="' + esc(hrefFor(e)) + '">' +
        '<span class="search__where">' + esc(where) + '</span>' +
        '<span class="search__title">' + highlight(e.t, terms) + '</span>' +
        (e.x ? '<span class="search__snip">' + highlight(snippet(e.x, terms), terms) + '</span>' : '') +
        '</a>';
      list.appendChild(li);
    });
  }

  var timer = null;
  input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(render, 80); });

  function open(from) {
    if (box.open) return;
    opener = from || document.activeElement;
    box.showModal();
    root.classList.add('has-search');
    input.focus();
    input.select();
    render();
    load().then(render);
  }
  function close() { if (box.open) box.close(); }

  box.addEventListener('close', function () {
    root.classList.remove('has-search');
    if (opener && opener.focus) opener.focus();
  });
  box.querySelector('.search__close').addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  /* Sonuca tıklanınca önce pencere kapanır; kaydırma ve sayfa geçişini sitenin kendi kodu yapar */
  box.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    opener = null;
    root.classList.remove('has-search');
    box.close();
  });

  input.addEventListener('keydown', function (e) {
    var first = list.querySelector('a');
    if (e.key === 'ArrowDown' && first) { e.preventDefault(); first.focus(); }
    else if (e.key === 'Enter' && first) { e.preventDefault(); first.click(); }
  });
  list.addEventListener('keydown', function (e) {
    var links = Array.prototype.slice.call(list.querySelectorAll('a'));
    var i = links.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); (links[i + 1] || links[i]).focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (i ? links[i - 1] : input).focus(); }
  });

  toggles.forEach(function (t) { t.addEventListener('click', function () { open(t); }); });
  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(toggles[0]); }
    else if (e.key === '/' && !typing && !box.open) { e.preventDefault(); open(toggles[0]); }
  });
})();
