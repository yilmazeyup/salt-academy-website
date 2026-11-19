// SALT CRM arayüzü. __NONCE__ her yanıtta CSP için değiştirilir. İstemci kodunda ters tırnak ve ${ kullanılmaz.

const STIL = `
:root{--lacivert:#07182a;--lacivert2:#0f2740;--altin:#c9a46a;--altin-koyu:#8a6a3a;--krem:#fbf8f2;--krem2:#f4eee4;--cizgi:#e6dccb;--murekkep:#0d1d2e;--gri:#5b6878;--kirmizi:#a8432f;--yesil:#2f6b4f}
*{box-sizing:border-box}html,body{margin:0}body{background:var(--krem2);color:var(--murekkep);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
a{color:var(--altin-koyu)}button,input,select,textarea{font:inherit;color:inherit}
.ust{background:var(--lacivert);color:#efe7da;padding:14px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.marka{font-family:Georgia,"Times New Roman",serif;letter-spacing:5px;font-size:20px;color:#e0b780}.marka small{display:block;font:600 9px/1.2 -apple-system,Arial,sans-serif;letter-spacing:2.5px;color:#c9b99f;margin-top:2px}
.ust .bosluk{flex:1}.ust .ben{font-size:13px;color:#c9b99f}.ust a{color:#e0b780;font-size:13px;text-decoration:none}
.kap{max-width:1180px;margin:0 auto;padding:20px 16px 60px}
h1{font:400 28px/1.2 Georgia,"Times New Roman",serif;margin:6px 0 4px}h1 em{color:var(--altin-koyu)}.alt{color:var(--gri);margin:0 0 18px;font-size:14px}
.sayilar{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-bottom:18px}
.sayi{background:var(--krem);border:1px solid var(--cizgi);border-radius:10px;padding:12px 14px;text-align:left;cursor:pointer}
.sayi b{display:block;font:400 26px/1.1 Georgia,serif}.sayi span{font-size:12px;color:var(--gri)}.sayi.secili{border-color:var(--altin);box-shadow:0 0 0 2px rgba(201,164,106,.35)}.sayi.uyari b{color:var(--kirmizi)}
.arac{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
.sekme{border:1px solid var(--cizgi);background:var(--krem);border-radius:999px;padding:6px 13px;font-size:13px;cursor:pointer}.sekme.secili{background:var(--lacivert);color:#efe7da;border-color:var(--lacivert)}
.ara{flex:1;min-width:180px;border:1px solid var(--cizgi);background:#fff;border-radius:8px;padding:8px 12px}
.dugme{border:1px solid var(--lacivert);background:var(--lacivert);color:#efe7da;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:14px;text-decoration:none;display:inline-block}
.dugme.ikincil{background:transparent;color:var(--lacivert)}.dugme.tehlike{background:transparent;border-color:var(--kirmizi);color:var(--kirmizi)}
.liste{display:flex;flex-direction:column;gap:8px}
.satir{display:grid;grid-template-columns:minmax(0,2.2fr) minmax(0,1.6fr) auto;gap:12px;align-items:center;background:#fff;border:1px solid var(--cizgi);border-radius:10px;padding:12px 14px;cursor:pointer;text-align:left;width:100%}
.satir:hover{border-color:var(--altin)}.satir .ad{font-weight:600}.satir .kucuk{font-size:13px;color:var(--gri);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.satir .adim{font-size:13px}.satir .adim.gec{color:var(--kirmizi);font-weight:600}
.rozet{display:inline-block;font-size:12px;border-radius:999px;padding:3px 10px;white-space:nowrap;background:var(--krem2);border:1px solid var(--cizgi)}
.r-yeni{background:#fdf1dc;border-color:#ecd3a3}.r-iletisim{background:#e8eef6;border-color:#c8d6ea}.r-gorusme{background:#e6f0ec;border-color:#bfd8cc}.r-teklif{background:#efe8f6;border-color:#d6c8ea}.r-kazanildi{background:#2f6b4f;color:#fff;border-color:#2f6b4f}.r-kaybedildi{background:#f3e6e3;border-color:#e2c3bb;color:#7a3324}.r-beklemede{background:#eee;border-color:#ddd}
.bos{background:var(--krem);border:1px dashed var(--cizgi);border-radius:10px;padding:28px;text-align:center;color:var(--gri)}
details.yardim{background:var(--krem);border:1px solid var(--cizgi);border-radius:10px;padding:10px 14px;margin:22px 0 0;font-size:14px}details.yardim summary{cursor:pointer;font-weight:600}
dialog{border:0;padding:0;width:min(760px,100vw);max-height:92vh;border-radius:14px;background:var(--krem);color:var(--murekkep)}dialog::backdrop{background:rgba(7,24,42,.55)}
.d-ust{background:var(--lacivert);color:#efe7da;padding:16px 20px;display:flex;gap:12px;align-items:flex-start}.d-ust h2{font:400 22px/1.2 Georgia,serif;margin:0;flex:1}.d-ust .kapat{background:none;border:0;color:#e0b780;font-size:26px;line-height:1;cursor:pointer}
.d-ic{padding:18px 20px 22px}.izgara{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}.izgara .tam{grid-column:1/-1}
label.alan{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--gri);font-weight:600;letter-spacing:.2px}
label.alan input,label.alan select,label.alan textarea{border:1px solid var(--cizgi);background:#fff;border-radius:8px;padding:8px 10px;font-weight:400;font-size:14px;color:var(--murekkep)}
textarea{min-height:80px;resize:vertical}.onay{flex-direction:row!important;align-items:center;gap:8px!important}
.d-dugmeler{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 4px}.d-dugmeler .bosluk{flex:1}
.bilgi-s{font-size:12px;color:var(--gri);margin-top:10px}
h3{font:400 18px/1.2 Georgia,serif;margin:22px 0 10px}.notlar{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.not{background:#fff;border:1px solid var(--cizgi);border-radius:8px;padding:8px 12px;font-size:14px;white-space:pre-wrap}.not small{display:block;color:var(--gri);font-size:12px;margin-bottom:2px}
.not-ekle{display:flex;gap:8px;align-items:flex-start}.not-ekle textarea{flex:1;min-height:56px;border:1px solid var(--cizgi);border-radius:8px;padding:8px 10px;background:#fff}
.uyari-k{background:#fdf1dc;border:1px solid #ecd3a3;border-radius:8px;padding:8px 12px;font-size:13px;margin-bottom:12px}
@media (max-width:760px){.sayilar{grid-template-columns:repeat(3,minmax(0,1fr))}.satir{grid-template-columns:1fr auto}.satir .orta{display:none}.izgara{grid-template-columns:1fr}dialog{max-height:100vh;height:100vh;border-radius:0}}
`;

const ISTEMCI = `
(function () {
  var D = { kisiler: [], durumlar: {}, turler: {}, bugun: '' };
  var F = { tur: 'hepsi', durum: '', ara: '', takip: false };
  var KAYNAK = { 'site-a': 'Site (A)', 'site-b': 'Site (B)', gaib: 'GAİB sayfası', ortaklik: 'İş birliği e-postası', etkinlik: 'Etkinlik', whatsapp: 'WhatsApp', telefon: 'Telefon', eposta: 'E-posta', elle: 'Elle eklendi' };
  var $ = function (id) { return document.getElementById(id); };

  function api(yol, s) {
    s = s || {};
    s.headers = { 'X-Istek': 'salt' };
    if (s.body) s.headers['Content-Type'] = 'application/json';
    return fetch('/api/panel/' + yol, s).then(function (r) {
      if (r.status === 401) { location.href = '/giris'; throw new Error('oturum'); }
      return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error(j.hata || 'İşlem yapılamadı'); return j; });
    });
  }
  function el(t, c, m) { var e = document.createElement(t); if (c) e.className = c; if (m != null) e.textContent = m; return e; }
  function gun(iso) { return iso ? new Date(iso).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'short', year: 'numeric' }) : ''; }
  function zaman(iso) { return iso ? new Date(iso).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''; }
  function kapali(k) { return k.durum === 'kazanildi' || k.durum === 'kaybedildi'; }
  function takipte(k) {
    if (kapali(k) || k.tur === 'webinar') return false;
    return (k.tur === 'talep' && k.durum === 'yeni') || (!!k.sonraki_tarih && k.sonraki_tarih <= D.bugun);
  }
  function rozet(d) { return el('span', 'rozet r-' + d, D.durumlar[d] || d); }

  function yukle() {
    return api('kisiler').then(function (v) { D = v; $('ben').textContent = v.ben; ciz(); hashAc(); }).catch(function (h) { if (h.message !== 'oturum') alert(h.message); });
  }

  function suzulmus() {
    var a = F.ara.toLocaleLowerCase('tr');
    return D.kisiler.filter(function (k) {
      if (F.tur === 'hepsi' ? k.tur === 'webinar' : k.tur !== F.tur) return false;
      if (F.durum && k.durum !== F.durum) return false;
      if (F.takip && !takipte(k)) return false;
      if (a) {
        var m = [k.ad, k.kurum, k.unvan, k.eposta, k.telefon, k.program, k.mesaj, k.sonraki_adim].join(' ').toLocaleLowerCase('tr');
        if (m.indexOf(a) < 0) return false;
      }
      return true;
    });
  }

  function ciz() {
    var ana = D.kisiler.filter(function (k) { return k.tur !== 'webinar'; });
    var s = $('sayilar'); s.textContent = '';
    var kartlar = [['', 'Takip günü gelen', ana.filter(takipte).length, true]];
    ['yeni', 'iletisim', 'gorusme', 'teklif', 'kazanildi'].forEach(function (d) { kartlar.push([d, D.durumlar[d], ana.filter(function (k) { return k.durum === d; }).length]); });
    kartlar.forEach(function (x) {
      var b = el('button', 'sayi' + (x[3] && x[2] ? ' uyari' : ''));
      b.type = 'button';
      var secili = x[3] ? F.takip : (F.durum === x[0] && !F.takip);
      if (secili) b.className += ' secili';
      b.appendChild(el('b', '', String(x[2]))); b.appendChild(el('span', '', x[1]));
      b.addEventListener('click', function () {
        if (x[3]) { F.takip = !F.takip; F.durum = ''; } else { F.takip = false; F.durum = F.durum === x[0] ? '' : x[0]; }
        ciz();
      });
      s.appendChild(b);
    });
    var t = $('sekmeler'); t.textContent = '';
    [['hepsi', 'Tümü'], ['talep', 'Site talepleri'], ['kurum', 'Kurumlar'], ['kisi', 'Kişiler'], ['webinar', 'Webinar listesi']].forEach(function (x) {
      var n = x[0] === 'hepsi' ? ana.length : D.kisiler.filter(function (k) { return k.tur === x[0]; }).length;
      var b = el('button', 'sekme' + (F.tur === x[0] ? ' secili' : ''), x[1] + ' · ' + n);
      b.type = 'button';
      b.addEventListener('click', function () { F.tur = x[0]; ciz(); });
      t.appendChild(b);
    });
    var l = $('liste'); l.textContent = '';
    var liste = suzulmus();
    liste.sort(function (a, b) {
      var ta = takipte(a) ? 0 : 1, tb = takipte(b) ? 0 : 1;
      if (ta !== tb) return ta - tb;
      if (kapali(a) !== kapali(b)) return kapali(a) ? 1 : -1;
      return (b.guncelleme || '').localeCompare(a.guncelleme || '');
    });
    if (!liste.length) { l.appendChild(el('div', 'bos', D.kisiler.length ? 'Bu süzgeçle eşleşen kayıt yok.' : 'Henüz kayıt yok. Sitedeki formdan gelen talepler burada görünecek.')); return; }
    liste.forEach(function (k) {
      var r = el('button', 'satir'); r.type = 'button';
      var sol = el('div');
      sol.appendChild(el('div', 'ad', k.ad || k.kurum || k.eposta || 'Adsız kayıt'));
      sol.appendChild(el('div', 'kucuk', [k.ad ? k.kurum : '', k.unvan, k.program].filter(Boolean).join(' · ') || (D.turler[k.tur] || '')));
      var orta = el('div', 'orta');
      var gec = k.sonraki_tarih && k.sonraki_tarih <= D.bugun && !kapali(k);
      if (k.sonraki_adim || k.sonraki_tarih) orta.appendChild(el('div', 'adim' + (gec ? ' gec' : ''), (k.sonraki_tarih ? gun(k.sonraki_tarih + 'T09:00:00+03:00') + ' · ' : '') + (k.sonraki_adim || 'Sonraki adım')));
      else if (k.tur === 'talep' && k.durum === 'yeni') orta.appendChild(el('div', 'adim gec', 'İlk dönüş bekliyor'));
      orta.appendChild(el('div', 'kucuk', (KAYNAK[k.kaynak] || k.kaynak || '') + ' · ' + gun(k.olusturma)));
      var sag = el('div'); sag.appendChild(rozet(k.durum));
      r.appendChild(sol); r.appendChild(orta); r.appendChild(sag);
      r.addEventListener('click', function () { ac(k.id); });
      l.appendChild(r);
    });
  }

  function alan(etiket, ad, deger, tur, secenekler, tam) {
    var l = el('label', 'alan' + (tam ? ' tam' : ''));
    l.appendChild(document.createTextNode(etiket));
    var g;
    if (tur === 'select') {
      g = el('select');
      Object.keys(secenekler).forEach(function (k) { var o = el('option', '', secenekler[k]); o.value = k; if (k === deger) o.selected = true; g.appendChild(o); });
    } else if (tur === 'textarea') { g = el('textarea'); g.value = deger || ''; }
    else { g = el('input'); g.type = tur || 'text'; g.value = deger == null ? '' : deger; }
    g.name = ad; l.appendChild(g);
    return l;
  }

  function formOku(f) {
    var d = {};
    f.querySelectorAll('input, select, textarea').forEach(function (g) {
      if (!g.name) return;
      d[g.name] = g.type === 'checkbox' ? g.checked : g.value;
    });
    return d;
  }

  function wa(tel) {
    var t = String(tel || '').replace(/\\D/g, '');
    if (!t) return '';
    if (t.indexOf('0') === 0) t = '9' + t;
    if (t.length === 10 && t.indexOf('5') === 0) t = '90' + t;
    return 'https://wa.me/' + t;
  }

  function ac(id) {
    var dlg = $('detay');
    var yeni = !id;
    var dol = function (k, notlar) {
      $('d-baslik').textContent = yeni ? 'Yeni kayıt' : (k.ad || k.kurum || k.eposta || 'Kayıt');
      var ic = $('d-ic'); ic.textContent = '';
      if (!yeni && k.tur === 'talep' && k.durum === 'yeni') ic.appendChild(el('div', 'uyari-k', 'Bu talebe henüz dönüş yapılmadı. Sitede 24 saat içinde dönüş sözü veriyoruz. Dönüş yaptıktan sonra durumu "İletişime geçildi" yapın.'));
      var f = el('form', 'izgara');
      f.appendChild(alan('Durum', 'durum', k.durum || 'yeni', 'select', D.durumlar));
      f.appendChild(alan('Tür', 'tur', k.tur || 'kisi', 'select', D.turler));
      f.appendChild(alan('Ad Soyad', 'ad', k.ad));
      f.appendChild(alan('Kurum', 'kurum', k.kurum));
      f.appendChild(alan('Unvan', 'unvan', k.unvan));
      f.appendChild(alan('İlgilendiği program', 'program', k.program));
      f.appendChild(alan('E-posta', 'eposta', k.eposta, 'email'));
      f.appendChild(alan('Telefon', 'telefon', k.telefon, 'tel'));
      f.appendChild(alan('Sonraki adım', 'sonraki_adim', k.sonraki_adim));
      f.appendChild(alan('Sonraki adım tarihi', 'sonraki_tarih', k.sonraki_tarih, 'date'));
      f.appendChild(alan('Tahmini tutar (TL)', 'deger', k.deger, 'number'));
      f.appendChild(alan('Kaynak', 'kaynak', k.kaynak || 'elle', 'select', KAYNAK));
      f.appendChild(alan('Mesaj / not', 'mesaj', k.mesaj, 'textarea', null, true));
      var b = el('label', 'alan onay tam'); var c = el('input'); c.type = 'checkbox'; c.name = 'bulten'; c.checked = !!k.bulten;
      b.appendChild(c); b.appendChild(document.createTextNode('E-bülten ve duyuru izni var')); f.appendChild(b);
      ic.appendChild(f);
      var dg = el('div', 'd-dugmeler');
      var kaydet = el('button', 'dugme', yeni ? 'Kaydı ekle' : 'Kaydet'); kaydet.type = 'button';
      kaydet.addEventListener('click', function () {
        kaydet.disabled = true;
        var v = formOku(f);
        (yeni ? api('kisiler', { method: 'POST', body: JSON.stringify(v) }) : api('kisiler/' + k.id, { method: 'PATCH', body: JSON.stringify(v) }))
          .then(function (j) { return yukle().then(function () { ac(yeni ? j.id : k.id); }); })
          .catch(function (h) { alert(h.message); }).then(function () { kaydet.disabled = false; });
      });
      dg.appendChild(kaydet);
      if (!yeni && k.eposta) { var a = el('a', 'dugme ikincil', 'E-posta yaz'); a.href = 'mailto:' + k.eposta; dg.appendChild(a); }
      if (!yeni && wa(k.telefon)) { var w = el('a', 'dugme ikincil', 'WhatsApp'); w.href = wa(k.telefon); w.target = '_blank'; w.rel = 'noopener'; dg.appendChild(w); }
      dg.appendChild(el('span', 'bosluk'));
      if (!yeni) {
        var sil = el('button', 'dugme tehlike', 'Sil'); sil.type = 'button';
        sil.addEventListener('click', function () {
          if (!confirm('Bu kayıt ve bütün notları kalıcı olarak silinecek. Geri alınamaz. Devam edilsin mi?')) return;
          api('kisiler/' + k.id, { method: 'DELETE' }).then(function () { dlg.close(); history.replaceState(null, '', '/'); yukle(); }).catch(function (h) { alert(h.message); });
        });
        dg.appendChild(sil);
      }
      ic.appendChild(dg);
      if (yeni) return;
      var bil = [];
      bil.push('Oluşturma: ' + zaman(k.olusturma));
      if (k.sayfa) bil.push('Sayfa: ' + k.sayfa);
      if (k.kvkk) bil.push('KVKK onayı: formda verildi');
      if (k.bildirim) bil.push('Bildirim e-postası: ' + k.bildirim.split(' · ')[0]);
      ic.appendChild(el('div', 'bilgi-s', bil.join(' · ')));
      ic.appendChild(el('h3', '', 'Notlar ve geçmiş'));
      var ne = el('div', 'not-ekle'); var nt = el('textarea'); nt.placeholder = 'Görüşme notu, yapılan iş, karar…';
      var nb = el('button', 'dugme', 'Not ekle'); nb.type = 'button';
      nb.addEventListener('click', function () {
        if (!nt.value.trim()) return;
        nb.disabled = true;
        api('kisiler/' + k.id + '/notlar', { method: 'POST', body: JSON.stringify({ metin: nt.value }) })
          .then(function () { return yukle().then(function () { ac(k.id); }); }).catch(function (h) { alert(h.message); }).then(function () { nb.disabled = false; });
      });
      ne.appendChild(nt); ne.appendChild(nb); ic.appendChild(ne);
      var nl = el('div', 'notlar');
      (notlar || []).forEach(function (n) {
        var d = el('div', 'not'); d.appendChild(el('small', '', zaman(n.zaman) + (n.yazan ? ' · ' + n.yazan : ''))); d.appendChild(document.createTextNode(n.metin)); nl.appendChild(d);
      });
      ic.appendChild(nl);
    };
    if (yeni) { dol({ tur: F.tur !== 'hepsi' && F.tur !== 'webinar' ? F.tur : 'kisi' }, []); if (!dlg.open) dlg.showModal(); return; }
    api('kisiler/' + id).then(function (j) {
      dol(j.kisi, j.notlar);
      history.replaceState(null, '', '#k' + id);
      if (!dlg.open) dlg.showModal();
    }).catch(function (h) { alert(h.message); });
  }

  function hashAc() {
    var m = /^#k(\\d+)$/.exec(location.hash);
    if (m && !$('detay').open) ac(Number(m[1]));
  }

  $('d-kapat').addEventListener('click', function () { $('detay').close(); });
  $('detay').addEventListener('close', function () { history.replaceState(null, '', '/'); });
  $('ara').addEventListener('input', function (e) { F.ara = e.target.value; ciz(); });
  $('yeni').addEventListener('click', function () { ac(0); });
  window.addEventListener('hashchange', hashAc);
  yukle();
})();
`;

export const PANEL_HTML = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>SALT CRM</title>
<style nonce="__NONCE__">${STIL}</style></head>
<body>
<header class="ust"><div class="marka">SALT<small>CRM · Müşteri takibi</small></div><span class="bosluk"></span>
<span class="ben" id="ben"></span><a href="/disari.csv">CSV indir</a><a href="/cikis">Çıkış</a></header>
<main class="kap">
  <h1>Talepler ve <em>ilişkiler</em></h1>
  <p class="alt">Sitedeki formlardan gelen talepler buraya kendiliğinden düşer; kurumlar, kişiler ve görüşmeler aynı yerde izlenir.</p>
  <div class="sayilar" id="sayilar"></div>
  <div class="arac" id="sekmeler"></div>
  <div class="arac"><input class="ara" id="ara" type="search" placeholder="Ad, kurum, e-posta, program ara"><button class="dugme" id="yeni" type="button">+ Yeni kayıt</button></div>
  <div class="liste" id="liste"></div>
  <details class="yardim"><summary>Nasıl kullanılır?</summary>
    <p><b>Siteden gelen talepler:</b> Formu dolduran her ziyaretçi "Yeni" durumuyla buraya eklenir ve size aynı anda e-posta gelir. O e-postayı yanıtladığınızda yanıtınız doğrudan ziyaretçiye gider.</p>
    <p><b>Durum:</b> Dönüş yaptıktan sonra kaydı açıp durumu "İletişime geçildi", görüşmeden sonra "Görüşme", teklif gönderince "Teklif", iş kesinleşince "Kazanıldı" yapın. Her değişiklik notlara tarihiyle yazılır.</p>
    <p><b>Sonraki adım:</b> Bir tarih yazarsanız, o gün geldiğinde kayıt listenin başına çıkar ve sabah 09.00'da size kısa bir takip e-postası gelir. Henüz dönüş yapılmamış talepler de bu e-postada hatırlatılır.</p>
    <p><b>Kurumlar ve kişiler:</b> WhatsApp'tan, telefondan ya da etkinlikten tanıştığınız kişileri "+ Yeni kayıt" ile ekleyebilirsiniz. İş birliği e-postası gönderdiğimiz kurumlar "Kurumlar" sekmesinde.</p>
    <p><b>Silme ve dışa aktarma:</b> Bir kişi verilerinin silinmesini isterse kaydı açıp "Sil"e basın. "CSV indir" bütün kayıtları Excel'de ya da başka bir CRM'de açılabilecek bir dosya olarak verir.</p>
  </details>
</main>
<dialog id="detay"><div class="d-ust"><h2 id="d-baslik"></h2><button class="kapat" id="d-kapat" type="button" aria-label="Kapat">×</button></div><div class="d-ic" id="d-ic"></div></dialog>
<script nonce="__NONCE__">${ISTEMCI}</script>
</body></html>`;

export const GIRIS_HTML = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>SALT CRM · Giriş</title>
<style nonce="__NONCE__">${STIL}
.giris{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--lacivert)}
.kutu{background:var(--krem);border-radius:14px;padding:30px 28px;width:min(420px,100%)}
.kutu .marka{color:var(--lacivert);margin-bottom:18px}.kutu .marka small{color:var(--altin-koyu)}
.kutu h1{font-size:24px;margin:0 0 6px}.kutu p{color:var(--gri);font-size:14px}
.kutu form{display:flex;flex-direction:column;gap:10px;margin-top:14px}.kutu label{font-size:13px;font-weight:600}
.kutu input{border:1px solid var(--cizgi);border-radius:8px;padding:10px 12px;background:#fff}.kutu .dugme{padding:11px 14px}
.kutu .bilgi{color:var(--murekkep)}</style></head>
<body><main class="giris"><div class="kutu"><div class="marka">SALT<small>CRM · Müşteri takibi</small></div>
<h1>Giriş</h1><p>Şifre yok: e-posta adresinize tek kullanımlık bir giriş bağlantısı gönderiyoruz.</p>
__ICERIK__
</div></main></body></html>`;
