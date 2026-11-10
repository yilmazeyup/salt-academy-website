"""Zaman yönetimi testi sayfasını iki tasarımda üretir: public/zaman-testi.html (A) ve public/b/zaman-testi.html (B).

Sayfa iskeleti (üst menü, alt bilgi, A/B betiği) aynı tasarımın galeri sayfasından alınır; galeriye özgü
bölümler testle değiştirilir. Sorular, katsayılar ve sonuç aralıkları Ayla Hanım'ın 10 Kasım 2026'da onayladığı
puanlamadır (SALT-Gunluk-Rapor/ciktilar/2026-10-28-egitim-zaman-testi.md). Puanı assets/js/zaman-testi.js hesaplar.

Kullanım (depo kökünden): python3 -I tools/zaman-testi/olustur.py
"""
import html
import re
from pathlib import Path

KOK = Path(__file__).resolve().parents[2] / "public"

SORULAR = [
    ("Günün sonunda zamanımın nereye gittiğini tam olarak söyleyemiyorum.", "Zamanın nereye gittiğini bilmemek", 1),
    ("Güne yazılı bir plan ya da öncelik listesi olmadan başlıyorum.", "Plansızlık", 2),
    ("Acil görünen işler, önemli işlerimin önüne geçiyor.", "Acil ile önemliyi karıştırmak", 2),
    ("En verimli olduğum saatleri rutin, az önemli işlere harcıyorum.", "Verimli saatleri korumamak", 1),
    ("Plan dışı bir iş çıktığında günümün geri kalanı dağılıyor.", "Değişikliğe uyum sağlayamamak", 1),
    ("E-posta, mesaj ve bildirimler işimi sık sık bölüyor.", "Kesintiler", 1),
    ("Amacı ya da gündemi belli olmayan toplantılarda vakit geçiriyorum.", "Verimsiz toplantılar", 1),
    ("Bana ait olmayan işlere \"hayır\" diyemiyorum.", "Hayır diyememek", 1),
    ("Zor ya da sevmediğim işleri son ana bırakıyorum.", "Erteleme", 1),
    ("Bitmiş bir işle \"daha iyi olsun\" diye gereğinden uzun uğraşıyorum.", "Mükemmeliyetçilik", 1),
]
SECENEKLER = [("Neredeyse her zaman", 0), ("Sık sık", 1), ("Bazen", 2), ("Nadiren ya da hiç", 3)]

STIL = """
  <style>
    .zt { max-width: 860px; }
    .zt-nasil { color: var(--muted-on-navy); margin: 0 0 28px; font-size: 0.95rem; }
    .zt-soru { border: 1px solid var(--line); border-radius: 18px; padding: 22px 24px 20px; margin: 0 0 14px; background: rgba(4, 13, 23, 0.35); transition: border-color .3s; }
    .zt-soru.is-eksik { border-color: var(--gold-400); }
    .zt-soru legend { float: left; width: 100%; padding: 0; margin: 0 0 16px; font-family: var(--font-display); font-size: clamp(1.3rem, 2.4vw, 1.6rem); line-height: 1.2; }
    .zt-soru legend span { font-family: var(--font-body); font-size: 0.78rem; letter-spacing: 0.14em; color: var(--gold-400); display: block; margin-bottom: 6px; }
    .zt-secenekler { clear: both; display: flex; flex-wrap: wrap; gap: 8px; }
    .zt-secenek { position: relative; }
    .zt-secenek input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
    .zt-secenek span { display: inline-block; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--line); font-size: 0.9rem; cursor: pointer; transition: background .2s, color .2s, border-color .2s; }
    .zt-secenek input:hover + span { border-color: var(--gold-500); }
    .zt-secenek input:focus-visible + span { outline: 2px solid var(--gold-400); outline-offset: 3px; }
    .zt-secenek input:checked + span { background: var(--gold-400); border-color: var(--gold-400); color: var(--navy-900); font-weight: 600; }
    .zt-alt { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; margin-top: 26px; }
    .zt-alt output { color: var(--muted-on-navy); font-size: 0.9rem; }
    .zt-uyari { color: var(--gold-300); margin: 0; font-size: 0.9rem; }
    .zt-gizlilik { color: var(--muted-on-navy); font-size: 0.8rem; margin: 18px 0 0; }
    .zt-sonuc { margin-top: 40px; padding: clamp(24px, 4vw, 44px); border-radius: 24px; border: 1px solid rgba(224, 183, 128, 0.4); background: rgba(224, 183, 128, 0.08); outline: none; }
    .zt-puan { font-family: var(--font-display); line-height: 1; margin: 0 0 8px; color: var(--gold-300); }
    .zt-puan__deger { font-size: clamp(4rem, 10vw, 6.5rem); }
    .zt-puan__en { font-size: 1.6rem; color: var(--muted-on-navy); }
    .zt-baslik { font-family: var(--font-display); font-size: clamp(1.7rem, 3.4vw, 2.4rem); line-height: 1.1; margin: 0 0 12px; }
    .zt-yorum { margin: 0 0 24px; max-width: 60ch; }
    .zt-hirsiz-baslik { font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold-400); margin: 0 0 10px; }
    .zt-hirsizlar { margin: 0 0 24px; padding-left: 20px; }
    .zt-hirsizlar li { margin-bottom: 4px; }
    .zt-sonuc__not { color: var(--muted-on-navy); font-size: 0.88rem; margin: 0 0 24px; max-width: 62ch; }
    .zt-sonuc__eylem { display: flex; flex-wrap: wrap; gap: 12px; }
    .zt-yeniden { background: none; border: 1px solid var(--line); color: inherit; border-radius: 999px; padding: 12px 20px; font: inherit; cursor: pointer; }
    .zt-yeniden:hover { border-color: var(--gold-400); }
    .is-bitti .zt-gonder { display: none; }
  </style>"""


def form_html():
    p = []
    for n, (cumle, hirsiz, k) in enumerate(SORULAR, 1):
        secenek = "".join(
            f'<label class="zt-secenek"><input type="radio" name="s{n}" value="{v}" required><span>{html.escape(ad)}</span></label>'
            for ad, v in SECENEKLER)
        p.append(f'          <fieldset class="zt-soru" data-katsayi="{k}" data-hirsiz="{html.escape(hirsiz)}">\n'
                 f'            <legend><span>{n:02d} / {len(SORULAR)}</span>{html.escape(cumle)}</legend>\n'
                 f'            <div class="zt-secenekler">{secenek}</div>\n'
                 f'          </fieldset>')
    return "\n".join(p)


def bolum(egitim_href, iletisim_href):
    return f"""    <section class="section" aria-label="Zaman yönetimi testi">
      <div class="container zt">
        <p class="zt-nasil">Son bir haftanızı düşünün ve her cümleyi ne sıklıkla yaşadığınızı işaretleyin. On cümle, yaklaşık iki dakika.</p>
        <form id="zaman-testi" novalidate>
{form_html()}
          <div class="zt-alt">
            <button class="btn btn--solid zt-gonder" type="submit">Sonucumu göster</button>
            <output id="zt-ilerleme" aria-live="polite">0 / {len(SORULAR)} yanıtlandı</output>
            <p class="zt-uyari" id="zt-uyari" role="alert" hidden></p>
          </div>
          <p class="zt-gizlilik">Yanıtlarınız kaydedilmez ve hiçbir yere gönderilmez; puanınız yalnızca bu sayfada hesaplanır.</p>
        </form>

        <div class="zt-sonuc" id="zt-sonuc" tabindex="-1" aria-live="polite" hidden>
          <p class="zt-puan"><span class="zt-puan__deger">0</span> <span class="zt-puan__en">/ 36</span></p>
          <h2 class="zt-baslik"></h2>
          <p class="zt-yorum"></p>
          <p class="zt-hirsiz-baslik"></p>
          <ol class="zt-hirsizlar"></ol>
          <p class="zt-sonuc__not">Bu test, Kadınlar için Liderlik programının zaman yönetimi çalışmasında kullandığımız formdur. Eğitimde her katılımcı kendi zaman hırsızları için bir haftalık adım belirler.</p>
          <div class="zt-sonuc__eylem">
            <a class="btn btn--solid" href="{iletisim_href}" data-magnetic>Ekibiniz için eğitim talep edin</a>
            <a class="zt-yeniden" href="{egitim_href}">Programı inceleyin</a>
            <button class="zt-yeniden" type="button" id="zt-yeniden">Testi yeniden yap</button>
          </div>
        </div>
      </div>
    </section>

"""


def uret(kaynak, hedef, js):
    s = kaynak.read_text(encoding="utf-8")
    s = s.replace("<title>Galeri · SALT Academy &amp; Consulting</title>",
                  "<title>Zaman yönetimi testi · SALT Academy &amp; Consulting</title>")
    s = re.sub(r'<meta name="description" content="[^"]*">',
               '<meta name="description" content="Zamanımıza ne ölçüde hâkimiz? On soruluk zaman yönetimi testiyle puanınızı ve sizi en çok zorlayan üç zaman hırsızını görün.">', s)
    s = s.replace('https://saltacademyconsulting.com/galeri"', 'https://saltacademyconsulting.com/zaman-testi"')
    s = s.replace(' aria-current="page"', "")
    s = s.replace("</head>", STIL + "\n</head>", 1)
    s = s.replace('<p class="eyebrow" data-hero style="--d:.05s">Galeri</p>',
                  '<p class="eyebrow" data-hero style="--d:.05s">Zaman yönetimi testi</p>')
    s = re.sub(r'(<h1 class="page-hero__title"[^>]*>)Sahadan <em>kareler</em>\.(</h1>)',
               r"\1Zamanımıza ne ölçüde <em>hâkimiz</em>?\2", s)
    s = re.sub(r'<p class="lead" data-hero style="--d:\.35s">.*?</p>',
               '<p class="lead" data-hero style="--d:.35s">Günü kim, ne çalıyor? On cümlelik bu testle zaman yönetimi puanınızı ve sizi en çok zorlayan üç zaman hırsızını görün.</p>', s, count=1)
    s = re.sub(r'    <section class="section gallery-section".*?</section>\n\n',
               lambda m: bolum("egitimler.html#kadinlar-icin-liderlik", "index.html#iletisim"), s, count=1, flags=re.S)
    s = re.sub(r'(<h2 class="h2 split" id="cta-baslik">).*?(</h2>)', r"\1Ekibinizin zamanı <em>kimde</em>?\2", s, count=1)
    s = re.sub(r'(<p class="lead" data-reveal>)Online ya da yüz yüze.*?(</p>)',
               r"\1Zaman yönetimini ekibinizle uygulamalı bir oturumda çalışalım; içeriği ihtiyacınıza göre birlikte belirleyelim.\2", s, count=1)
    s = re.sub(r'\n  <dialog class="lightbox".*?</dialog>\n', "\n", s, count=1, flags=re.S)
    s = re.sub(r'  <script src="[^"]*galeri\.js\?v=1" defer></script>', f'  <script src="{js}?v=1" defer></script>', s)
    for kalinti in ("gallery", "lightbox", "Sahadan"):
        assert kalinti not in s, (hedef, kalinti)
    hedef.write_text(s, encoding="utf-8")
    print("yazıldı:", hedef.relative_to(KOK.parent))


if __name__ == "__main__":
    uret(KOK / "galeri.html", KOK / "zaman-testi.html", "assets/js/zaman-testi.js")
    uret(KOK / "b" / "galeri.html", KOK / "b" / "zaman-testi.html", "../assets/js/zaman-testi.js")
