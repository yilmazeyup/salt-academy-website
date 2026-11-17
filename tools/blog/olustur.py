"""Blogu üretir: public/blog/index.html (yazı listesi) ve her yazı için public/blog/<adres>.html.

Yazılar tools/blog/yazilar/*.md dosyalarındadır: üstte künye (başlık, arama motoru başlığı ve açıklaması, adres,
tarih, kategori), altında Ayla Hanım'ın onayladığı metin olduğu gibi. Metinler SALT-Gunluk-Rapor/ciktilar'daki
onaylı taslaklardan alındı; taslaklardaki "Notlar" bölümü yayımlanmaz.

Blog iki tasarımda ortaktır: sayfalar A tasarımının görünümündedir ve A/B yönlendirmesi yapmaz. Üst menü, mobil menü
ve alt bilgi A'nın galeri sayfasından alınır; menüye eklenen her bağlantı bloga da gelir. Ziyaretçinin oturumdaki
sürümü (A ya da B) korunur; B'deki ziyaretçide sayfa içi bağlantılar ve WhatsApp düğmesi B sayfalarına gider.
Bağlantılar <base href="/"> ile kökten çözülür, böylece site içi arama blogda da çalışır.

Kullanım (depo kökünden): python3 -I tools/blog/olustur.py
Yeni yazı: yazilar/ klasörüne aynı künyeyle bir .md ekleyin, betiği çalıştırın, public/sitemap.xml'e adresi ekleyin.
"""
import html
import json
import math
import re
from datetime import date
from pathlib import Path

KOK = Path(__file__).resolve().parents[2]
PUBLIC = KOK / "public"
YAZILAR = Path(__file__).resolve().parent / "yazilar"
SITE = "https://saltacademyconsulting.com"
GORSEL = SITE + "/assets/img/paylasim.jpg"
YAZAR = "Ayla Özalp"
YAZAR_UNVAN = "Kurucu"
DAKIKADA_KELIME = 200
AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
B_SAYFALARI = ("index.html", "egitimler.html", "galeri.html", "zaman-testi.html", "wa.html")
OK = ('<svg class="btn__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>')


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


def tarih_tr(t):
    return f"{t.day} {AYLAR[t.month - 1]} {t.year}"


def kimlik(s):
    tablo = str.maketrans("çğıöşüâîûÇĞİÖŞÜÂÎÛ", "cgiosuaiucgiosuaiu")
    return re.sub(r"[^a-z0-9]+", "-", s.translate(tablo).lower()).strip("-")


# ---------- Yazıları oku ----------

def yazi_oku(yol):
    metin = yol.read_text(encoding="utf-8")
    m = re.match(r"---\n(.*?)\n---\n(.*)", metin, flags=re.S)
    assert m, yol
    kunye = dict(satir.split(": ", 1) for satir in m.group(1).split("\n"))
    govde = m.group(2).strip("\n")
    duz = re.sub(r"[*#|\-\[\]()]", " ", re.sub(r"\]\([^)]*\)", "]", govde))
    kelime = len(duz.split())
    y = {
        "baslik": kunye["baslik"],
        "seo_baslik": kunye["seo_baslik"],
        "aciklama": kunye["aciklama"],
        "adres": kunye["slug"],
        "tarih": date.fromisoformat(kunye["tarih"]),
        "kategori": kunye["kategori"],
        "govde": govde,
        "kelime": kelime,
        "dakika": max(1, math.ceil(kelime / DAKIKADA_KELIME)),
    }
    assert len(y["seo_baslik"]) <= 60, (yol, len(y["seo_baslik"]))
    assert len(y["aciklama"]) <= 155, (yol, len(y["aciklama"]))
    assert re.fullmatch(r"[a-z0-9-]+", y["adres"]), y["adres"]
    y["url"] = f"{SITE}/blog/{y['adres']}"
    return y


# ---------- Markdown'dan HTML'e (taslaklarda kullanılan kadarı) ----------

def satir_ici(s):
    s = esc(s)

    def baglanti(m):
        metin, href = m.group(1), m.group(2)
        if href.startswith(SITE + "/"):
            yol = href[len(SITE) + 1:]
            href = yol if ("." in yol or yol.endswith("/") or not yol) else yol + ".html"
            return f'<a href="{attr(href)}">{metin}</a>'
        return f'<a href="{attr(href)}" target="_blank" rel="noopener">{metin}</a>'

    s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", baglanti, s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])", r"<em>\1</em>", s)
    return s


def tablo(satirlar):
    hucre = lambda s: [h.strip() for h in s.strip().strip("|").split("|")]
    bas, govde = hucre(satirlar[0]), [hucre(s) for s in satirlar[2:]]
    assert re.fullmatch(r"\|?(\s*:?-+:?\s*\|)+\s*:?-*:?\s*\|?", satirlar[1].strip()), satirlar[1]
    p = ['<div class="post-table"><table>', "<thead><tr>" + "".join(f'<th scope="col">{satir_ici(h)}</th>' for h in bas) + "</tr></thead>", "<tbody>"]
    for r in govde:
        p.append("<tr>" + "".join(f"<td>{satir_ici(h)}</td>" for h in r) + "</tr>")
    p.append("</tbody></table></div>")
    return "\n".join(p)


def md_html(govde):
    bloklar = re.split(r"\n\s*\n", govde.strip())
    cikti = []
    for b in bloklar:
        satirlar = b.split("\n")
        if b.startswith("## "):
            assert len(satirlar) == 1, b
            t = b[3:].strip()
            cikti.append(f'<h2 id="{kimlik(t)}">{satir_ici(t)}</h2>')
        elif all(s.startswith("- ") for s in satirlar):
            cikti.append("<ul>\n" + "\n".join(f"  <li>{satir_ici(s[2:])}</li>" for s in satirlar) + "\n</ul>")
        elif all(re.match(r"\d+\. ", s) for s in satirlar):
            maddeler = [satir_ici(re.sub(r"^\d+\. ", "", s)) for s in satirlar]
            cikti.append("<ol>\n" + "\n".join(f"  <li>{m}</li>" for m in maddeler) + "\n</ol>")
        elif all(s.lstrip().startswith("|") for s in satirlar):
            cikti.append(tablo(satirlar))
        else:
            assert not any(s.startswith(("#", "- ", "|", ">")) for s in satirlar), b
            metin = " ".join(s.strip() for s in satirlar)
            sinif = ' class="post-ornek"' if metin.startswith("Tek cümle:") else ""
            cikti.append(f"<p{sinif}>{satir_ici(metin)}</p>")
    return "\n".join(cikti)


# ---------- Sayfa iskeleti (A tasarımının galeri sayfasından) ----------

def iskelet():
    s = (PUBLIC / "galeri.html").read_text(encoding="utf-8")
    ust = re.search(r"\n(  <header class=\"site-header\">.*?)\n\n  <main", s, flags=re.S).group(1)
    alt = re.search(r"\n(  <footer class=\"site-footer\">.*?</footer>)\n", s, flags=re.S).group(1)
    betikler = [b for b in re.findall(r"\n(  <script src=\"[^\"]+\" defer></script>)", s) if "galeri.js" not in b]
    fontlar = re.search(r'\n(  <link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]+">)', s).group(1)
    stil = re.search(r'\n(  <link rel="stylesheet" href="assets/css/style\.css\?v=\d+">)', s).group(1)
    ust = ust.replace(' aria-current="page"', "")
    assert ust.count('href="/blog/"') == 2 and alt.count('href="/blog/"') == 1, "galeri.html menüsünde Blog bağlantısı yok"
    assert 'href="galeri.html"' in ust and "lightbox" not in ust + alt
    return ust, alt, "\n".join(betikler), fontlar, stil


def secili(ust, deger):
    ust = ust.replace('<a class="nav__link" href="/blog/">', f'<a class="nav__link" href="/blog/" aria-current="{deger}">', 1)
    return ust.replace('    <a href="/blog/">Blog</a>', f'    <a href="/blog/" aria-current="{deger}">Blog</a>', 1)


AB_BETIGI = """  <script>
    (function () {
      var d = document.documentElement;
      /* Blog iki tasarımda ortaktır; yönlendirme yapmaz. A/B testi için ziyaretçinin sürümü burada da seçilir ya da
         korunur (?v=a / ?v=b ile değiştirilebilir); sayfa sonundaki betik bağlantıları bu sürümün sayfalarına yöneltir. */
      var v = 'a';
      try {
        var q = /[?&]v=(a|b)(?:&|$)/i.exec(location.search);
        if (q) { v = q[1].toLowerCase(); sessionStorage.setItem('salt-variant', v); }
        else { v = sessionStorage.getItem('salt-variant'); if (v !== 'a' && v !== 'b') { v = Math.random() < 0.5 ? 'a' : 'b'; sessionStorage.setItem('salt-variant', v); } }
      } catch (e) { v = 'a'; }
      window.SALT_VARIANT = v.toUpperCase();
      if (!/(^|\\.)saltacademyconsulting\\.com$/.test(location.hostname)) {
        var m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow'; document.head.appendChild(m);
      }
      d.classList.add('js');
      setTimeout(function () { if (!window.SALT_READY) d.classList.remove('js'); }, 4000);
      try {
        if (sessionStorage.getItem('salt-wipe')) { d.classList.add('arrive'); sessionStorage.removeItem('salt-wipe'); }
      } catch (e) { /* özel pencere */ }
    })();
  </script>"""

B_BAGLANTI_BETIGI = """  <script>
    /* B sürümündeki ziyaretçi: bağlantılar ve WhatsApp düğmesi doğrudan B sayfalarına gitsin (dönüşüm B'ye sayılır) */
    (function () {
      if (window.SALT_VARIANT !== 'B') return;
      var B = { %s };
      Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
        var m = /^([\\w-]+\\.html)(#.*)?$/.exec(a.getAttribute('href'));
        if (m && B[m[1]]) a.setAttribute('href', B[m[1]] + (m[2] || ''));
      });
    })();
  </script>""" % ", ".join(f"'{p}': 'b/{'' if p == 'index.html' else p}'" for p in B_SAYFALARI)


def json_ld(veri):
    return ('  <script type="application/ld+json">\n' +
            json.dumps(veri, ensure_ascii=False, indent=2).replace("</", "<\\/") + "\n  </script>")


def sayfa(*, baslik, aciklama, url, og_tur, og_baslik, ek_head, ust, govde, alt, betikler, fontlar, stil):
    return f"""<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="/">
  <title>{esc(baslik)}</title>
  <meta name="description" content="{attr(aciklama)}">
  <meta name="theme-color" content="#07182a">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="{og_tur}">
  <meta property="og:site_name" content="SALT Academy &amp; Consulting">
  <meta property="og:locale" content="tr_TR">
  <meta property="og:title" content="{attr(og_baslik)}">
  <meta property="og:description" content="{attr(aciklama)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{GORSEL}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
{ek_head}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="assets/img/salt-ikon-48.png">
  <link rel="apple-touch-icon" href="assets/img/salt-ikon-180.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{fontlar}
{stil}
  <link rel="stylesheet" href="assets/css/blog.css?v=1">
{AB_BETIGI}
</head>
<body>
  <a class="skip-link" href="#icerik">İçeriğe geç</a>
  <div class="page-wipe" aria-hidden="true"></div>

{ust}

  <main id="icerik" tabindex="-1">
{govde}
  </main>

{alt}

{B_BAGLANTI_BETIGI}
{betikler}
</body>
</html>
"""


YAYINCI = {"@type": "Organization", "name": "SALT Academy & Consulting", "url": SITE + "/",
           "logo": {"@type": "ImageObject", "url": SITE + "/assets/img/salt-ikon-180.png"}}
KISI = {"@type": "Person", "name": YAZAR, "jobTitle": YAZAR_UNVAN, "url": SITE + "/#kurucu"}


def yazi_sayfasi(y, digerleri, parcalar):
    ust, alt, betikler, fontlar, stil = parcalar
    t = y["tarih"].isoformat()
    ld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": y["baslik"],
        "description": y["aciklama"],
        "url": y["url"],
        "mainEntityOfPage": {"@type": "WebPage", "@id": y["url"]},
        "image": GORSEL,
        "datePublished": t,
        "dateModified": t,
        "inLanguage": "tr-TR",
        "articleSection": y["kategori"],
        "wordCount": y["kelime"],
        "author": KISI,
        "publisher": YAYINCI,
        "isPartOf": {"@type": "Blog", "@id": SITE + "/blog/", "name": "SALT Academy & Consulting Blog"},
    }
    ek_head = "\n".join([
        f'  <meta property="article:published_time" content="{t}">',
        f'  <meta property="article:section" content="{attr(y["kategori"])}">',
        f'  <meta name="author" content="{YAZAR}">',
        json_ld(ld),
    ])
    kartlar = []
    for i, d in enumerate(digerleri):
        kartlar.append(f"""          <article class="insight" data-reveal style="--d:{i * 0.08:.2f}s">
            <span class="insight__cat">{esc(d["kategori"])}</span>
            <h3>{esc(d["baslik"])}</h3>
            <p class="insight__meta"><time datetime="{d["tarih"].isoformat()}">{tarih_tr(d["tarih"])}</time> · {d["dakika"]} dk okuma</p>
            <p>{esc(d["aciklama"])}</p>
            <a class="insight__more" href="blog/{d["adres"]}">Yazıyı okuyun</a>
          </article>""")
    icerik = "\n".join("          " + s if s else s for s in md_html(y["govde"]).split("\n"))
    govde = f"""    <article class="post" aria-labelledby="yazi-baslik">
      <header class="page-hero post-hero">
        <div class="post-hero__inner">
          <p class="eyebrow" data-hero style="--d:.05s"><a href="blog/">Blog</a><span aria-hidden="true">·</span>{esc(y["kategori"])}</p>
          <h1 class="post-hero__title" id="yazi-baslik" data-hero style="--d:.15s">{esc(y["baslik"])}</h1>
          <p class="post-meta" data-hero style="--d:.3s"><span><a href="index.html#kurucu">{YAZAR}</a>, {YAZAR_UNVAN}</span><span aria-hidden="true">·</span><time datetime="{t}">{tarih_tr(y["tarih"])}</time><span aria-hidden="true">·</span><span>{y["dakika"]} dk okuma</span></p>
        </div>
      </header>
      <div class="post-body-wrap">
        <div class="post-body">
{icerik}
        </div>
      </div>
    </article>

    <section class="section cta-band" aria-labelledby="cta-baslik">
      <div class="container">
        <p class="eyebrow" data-reveal>Kuruma özel</p>
        <h2 class="h2 split" id="cta-baslik">Bu konuyu ekibinizle <em>çalışalım.</em></h2>
        <p class="lead" data-reveal>Programlarımızı inceleyin ya da ihtiyacınızı bize yazın; içeriği kurumunuza göre birlikte belirleyelim.</p>
        <div class="post-cta__actions" data-reveal>
          <a class="btn btn--solid" href="egitimler.html" data-magnetic>Eğitimleri inceleyin
            {OK}
          </a>
          <a class="btn" href="index.html#iletisim" data-magnetic>Eğitim talep et</a>
          <a class="btn" href="wa.html" target="_blank" rel="noopener" data-magnetic>WhatsApp'tan yazın</a>
        </div>
      </div>
    </section>

    <section class="section section--cream post-more" aria-labelledby="diger-baslik">
      <div class="container">
        <p class="eyebrow" data-reveal>Blog</p>
        <h2 class="h2 split" id="diger-baslik">Diğer <em>yazılar</em></h2>
        <div class="insights">
{chr(10).join(kartlar)}
        </div>
        <p class="post-more__all" data-reveal><a href="blog/">Tüm yazılar</a></p>
      </div>
    </section>"""
    return sayfa(baslik=y["seo_baslik"], aciklama=y["aciklama"], url=y["url"], og_tur="article",
                 og_baslik=y["seo_baslik"], ek_head=ek_head, ust=secili(ust, "true"), govde=govde, alt=alt,
                 betikler=betikler, fontlar=fontlar, stil=stil)


def liste_sayfasi(yazilar, parcalar):
    ust, alt, betikler, fontlar, stil = parcalar
    url = SITE + "/blog/"
    aciklama = "SALT Academy & Consulting blogu: kurumsal iletişim, müşteri iletişimi ve eğitimde öğrenileni işe taşımak üzerine kısa okumalar."
    assert len(aciklama) <= 155, len(aciklama)
    ld = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": url,
        "name": "SALT Academy & Consulting Blog",
        "description": aciklama,
        "url": url,
        "inLanguage": "tr-TR",
        "publisher": YAYINCI,
        "blogPost": [{"@type": "BlogPosting", "headline": y["baslik"], "url": y["url"],
                      "datePublished": y["tarih"].isoformat(), "author": KISI} for y in yazilar],
    }
    ogeler = []
    for i, y in enumerate(yazilar):
        ogeler.append(f"""          <li class="blog-item" data-reveal style="--d:{i * 0.08:.2f}s">
            <div class="blog-item__meta">
              <span class="insight__cat">{esc(y["kategori"])}</span>
              <time datetime="{y["tarih"].isoformat()}">{tarih_tr(y["tarih"])}</time>
              <span>{y["dakika"]} dk okuma</span>
            </div>
            <div>
              <h2 class="blog-item__title"><a href="blog/{y["adres"]}">{esc(y["baslik"])}</a></h2>
              <p class="blog-item__summary">{esc(y["aciklama"])}</p>
              <span class="blog-item__more" aria-hidden="true">Yazıyı okuyun <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
            </div>
          </li>""")
    govde = f"""    <section class="page-hero" aria-labelledby="sayfa-baslik">
      <div class="container">
        <p class="eyebrow" data-hero style="--d:.05s">Blog</p>
        <h1 class="page-hero__title" id="sayfa-baslik" data-hero style="--d:.15s">Kısa okumalar, <em>uzun etkiler.</em></h1>
        <p class="lead" data-hero style="--d:.35s">İletişim ve gelişim üzerine kısa okumalar. Her yazı, iş hayatından bir örnek üzerinden ilerliyor.</p>
      </div>
    </section>

    <section class="section--cream blog-list-section" aria-label="Yazılar">
      <div class="container">
        <ul class="blog-list" role="list">
{chr(10).join(ogeler)}
        </ul>
      </div>
    </section>"""
    return sayfa(baslik="Blog · SALT Academy & Consulting", aciklama=aciklama, url=url, og_tur="website",
                 og_baslik="SALT Academy & Consulting Blog", ek_head=json_ld(ld), ust=secili(ust, "page"),
                 govde=govde, alt=alt, betikler=betikler, fontlar=fontlar, stil=stil)


def main():
    yazilar = sorted((yazi_oku(p) for p in YAZILAR.glob("*.md")), key=lambda y: y["tarih"], reverse=True)
    assert len({y["adres"] for y in yazilar}) == len(yazilar)
    parcalar = iskelet()
    hedef = PUBLIC / "blog"
    hedef.mkdir(exist_ok=True)
    (hedef / "index.html").write_text(liste_sayfasi(yazilar, parcalar), encoding="utf-8")
    print("yazıldı: public/blog/index.html")
    for y in yazilar:
        digerleri = [d for d in yazilar if d is not y]
        (hedef / f"{y['adres']}.html").write_text(yazi_sayfasi(y, digerleri, parcalar), encoding="utf-8")
        print(f"yazıldı: public/blog/{y['adres']}.html  ({y['kelime']} kelime, {y['dakika']} dk)")


if __name__ == "__main__":
    main()
