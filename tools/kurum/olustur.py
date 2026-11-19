"""Kuruma özel öneri sayfaları (alt alan adları): igem.saltacademyconsulting.com, gdg-gaziantep.saltacademyconsulting.com.

Görünüm gaib.saltacademyconsulting.com ile aynıdır: CSS, gaib/index.html içindeki <style> bloğundan okunur.
Her kurum depo kökünde kendi klasörüne yazılır (igem/, gdg-gaziantep/) ve ayrı bir Cloudflare Pages projesi olarak yayımlanır:
  npx --yes wrangler@4.86.0 pages deploy igem --project-name salt-igem --branch main
  npx --yes wrangler@4.86.0 pages deploy gdg-gaziantep --project-name salt-gdg-gaziantep --branch main
Slayt görselleri (assets/sunum/slayt-NN.webp) ve PDF'ler sunumun PDF'inden üretilip klasöre kopyalanır; bu betik yalnızca index.html yazar.
Yeni kurum eklemek için KURUMLAR'a bir kayıt ekleyip çalıştırın (depo kökünden):  python3 -I tools/kurum/olustur.py
"""
import re
from html import escape
from pathlib import Path
from urllib.parse import quote

KOK = Path(__file__).resolve().parents[2]
CSS = re.search(r"<style>(.*?)</style>", (KOK / "gaib" / "index.html").read_text(encoding="utf-8"), re.S).group(1)
INDIR = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
         'stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 19h16"/></svg>')
BIO = ("Operasyon yönetimi, müşteri deneyimi, şikâyet yönetimi, süreç geliştirme ve proje koordinasyonunda edindiği deneyimi "
       "SALT Academy &amp; Consulting çatısında topladı. Kurumlara ve profesyonellere iletişim, liderlik, müşteri deneyimi ve satış "
       "alanlarında uygulamalı eğitim ve danışmanlık sunuyor.")
ADIMLAR = [("İhtiyaç görüşmesi", "Ekibin zorlandığı durumları, hedefleri ve katılımcı profilini birlikte netleştiriyoruz."),
           ("Uyarlama", "Vakaları ve rol oyunlarını kurumun kendi örnekleriyle hazırlıyoruz."),
           ("Uygulamalı eğitim", "Vaka çalışması, rol oyunu ve atölyeyle; ön ve son değerlendirmeyle."),
           ("30 günlük plan", "Her katılımcı öğrendiğini işine taşımak için kendi eylem planıyla ayrılır.")]

KURUMLAR = [
    {
        "klasor": "igem", "alan": "igem.saltacademyconsulting.com", "kisa": "İGEM",
        "baslik": "Belediye Ekipleri İçin Eğitim Önerisi",
        "aciklama": "SALT Academy & Consulting'in Gaziantep Büyükşehir Belediyesi İGEM için hazırladığı eğitim önerisi: vatandaş iletişimi, kurumsal yazışma, liderlik ve dijital beceriler.",
        "ust": "Gaziantep Büyükşehir Belediyesi İGEM için öneri",
        "h1": "Belediye ekipleri için <em>iletişim</em> ve liderlik",
        "giris": "Vatandaş iletişimi, kurumsal yazışma, liderlik ve dijital beceriler üzerine uygulamalı programlarımızı belediyenizin ekipleri için bir araya getirdik. Her program birimlerin kendi örnekleriyle uyarlanır ve 30 günlük bir eylem planıyla biter.",
        "kemer": ("5", "program · 3 başlangıç yolu"),
        "pdf": ("SALT-Belediye-Ekipleri-Egitim-Onerisi.pdf", "Eğitim önerisi sunumu", "PDF · 17 slayt · 0,4 MB"),
        "ihtiyac": {
            "ust": "Belediye ekiplerinin ihtiyaçları", "h2": "İletişimin <em>sınandığı</em> dört alan",
            "metin": "Belediye hizmetinin vatandaş gözündeki karşılığı çoğu zaman tek bir görüşmede, tek bir yazıda oluşuyor. Programlarımız bu dört alanın üzerine kurulu.",
            "kartlar": [("Vatandaş", "Şikâyet ve talep", "Masada, telefonda ya da sahada öfkeli bir vatandaşı dinlemek, sakinleştirmek ve net bir dönüş sözü vermek."),
                        ("Yazışma", "Resmî yazı ve e-posta", "Vatandaşa ve kurumlara yazılan yanıtlarda açık, saygılı ve anlaşılır bir dil kurmak."),
                        ("Birimler", "Birimler arası iş birliği", "Bir talebin birimden birime aktarılırken kaybolmaması; toplantıda ve ekip içinde net iletişim."),
                        ("Yöneticilik", "Ekibi yönetmek", "Yeni yöneticilerin geri bildirim, görev dağılımı, motivasyon ve çatışma yönetiminde güç kazanması.")],
        },
        "programlar": {
            "ust": "Beş program", "h2": "Birimlere göre <em>beş</em> program",
            "metin": "Vatandaşla doğrudan temas eden birimler, yazışma yapan ekipler, yöneticiler ve kadın çalışanlar için. Süreler birimlerin çalışma düzenine göre bölünebilir.",
            "liste": [
                ("Program 1", "Vatandaş İletişimi ve Şikâyet Yönetimi", "Yarım gün", "Beyaz masa, çağrı merkezi, saha ve hizmet birimleri",
                 [("Yüz yüze ve telefonda", ["Söz kesmeden dinlemek ve talebi netleştirmek", "Öfkeli vatandaşla sakin ve çözüm odaklı konuşmak", "“En kısa sürede” yerine net bir dönüş zamanı vermek"]),
                  ("Yazılı yanıtta", ["Şikâyete yanıt: kabul, açıklama, çözüm ve tarih", "Yetkiyi aşan konuda doğru birime yönlendirmek"])]),
                ("Program 2", "Kurumsal Yazışma", "Yarım gün", "Vatandaşa ve kurumlara yazan birimler",
                 [("", ["<strong>Anlaşılır resmî dil:</strong> uzun cümleyi sadeleştirmek", "<strong>E-posta:</strong> konu satırından imzaya iyi bir kurumsal e-posta",
                        "<strong>Kime, bilgi ve gizli kopya:</strong> amacına göre kullanmak", "<strong>Son kontrol:</strong> talep, sorumlu ve tarih yazıyor mu?"])]),
                ("Program 3", "Liderlik ve Ekip İletişimi", "Modüler", "Modül başına yaklaşık 3 saat",
                 [("", ["<strong>Geri bildirim:</strong> geleceğe odaklı bir geri bildirim kültürü", "<strong>Delegasyon:</strong> işi beklentisi ve takibi net biçimde devretmek",
                        "<strong>Çatışma yönetimi:</strong> taraf tutmadan, hızlı ve adil", "<strong>Motivasyon:</strong> ekibi hedefe bağlayan toplantılar"])]),
                ("Program 4", "Kadınlar için Liderlik", "12 ders", "Kadın çalışanlar ve yöneticiler · 3 atölye",
                 [("", ["İşyerinde kadın olmak ve dayanıklılık", "Görünürlük, müzakere ve çatışma yönetimi", "Geri bildirim verme ve alma", "Network, başarı ve öz bakım"])]),
                ("Program 5", "Dijital Zihin", "6 saat", "Tüm birimler",
                 [("", ["Bilgiyi kaynağı ve kanıtıyla sorgulamak", "Dikkati ve odaklanmayı yönetmek", "Yapay zekâdan güvenli ve amaçlı yararlanmak", "Yedi günlük kişisel dijital gelişim planı"])]),
            ],
        },
        "slaytlar": [(1, "Kapak", "Kapak: Belediye ekipleri için iletişim ve liderlik"), (7, "İletişimin sınandığı dört alan", "Her gün yaşanan dört durum"),
                     (10, "Beş program", "Birimlere göre beş program önerisi"), (11, "Program 1 · Vatandaş iletişimi", "Vatandaş iletişimi: yüz yüze, telefonda ve yazılı yanıtta"),
                     (12, "Programlar ve süreler", "Programlar, kimler için oldukları ve süreleri"), (14, "Süreç", "İhtiyaçtan uygulamaya dört adım"),
                     (15, "Başlangıç yolları", "İGEM ile üç başlangıç yolu")],
        "sunum_metin": "17 slaytlık sunumda programların içeriği, süreleri ve İGEM ile nasıl başlayabileceğimiz yer alıyor. Kaydırarak göz atabilir, tamamını PDF olarak indirebilirsiniz.",
        "modeller": {"ust": "İGEM ile birlikte", "h2": "Üç <em>başlangıç</em> yolu", "metin": "En hızlısı pilot atölye: bir birimle başlayıp sonucu birlikte ölçeriz.",
                     "kartlar": [("3 saat", "Pilot atölye", "Vatandaşla en çok temas eden bir birimle 15–20 kişilik bir atölye; ön ve son değerlendirmeyle sonucu ölçeriz."),
                                 ("Eğitim takvimi", "Hizmet içi eğitim planı", "Seçilen programların İGEM'in yıllık hizmet içi eğitim takvimine modüller hâlinde yerleştirilmesi."),
                                 ("Kente açık", "Gençlere ve kadınlara atölye", "Belediyenin gençlere ve kadınlara yönelik merkezlerinde iletişim ve kariyer atölyeleri.")]},
        "kapanis": "Kısa bir görüşmede birimlerinizin ihtiyaçlarını dinleyip pilot atölyenin birimini ve tarihini birlikte planlayalım.",
        "posta_konu": "İGEM · Tanışma görüşmesi",
        "wa": "Merhaba, belediye ekipleri için hazırladığınız eğitim önerisi hakkında görüşmek istiyorum.",
        "alt": "Bu sayfa, SALT Academy &amp; Consulting tarafından Gaziantep Büyükşehir Belediyesi İGEM'e sunulan eğitim önerisidir.",
    },
    {
        "klasor": "gdg-gaziantep", "alan": "gdg-gaziantep.saltacademyconsulting.com", "kisa": "GDG Gaziantep",
        "baslik": "GDG Gaziantep İçin Topluluk Atölyesi Önerisi",
        "aciklama": "SALT Academy & Consulting'in GDG Gaziantep için hazırladığı iki iletişim atölyesi: geliştiricilere “Kod Derlenir, İnsan Yorumlar”, öğrencilere “Dijital Kariyer Atölyesi”.",
        "ust": "GDG Gaziantep için öneri",
        "h1": "Kod derlenir, <em>insan yorumlar</em>",
        "giris": "Geliştiriciler ve öğrenciler için iki uygulamalı iletişim atölyesi. İyi ürün yalnızca iyi kodla değil, ekip içinde ve müşteriyle kurulan iletişimle çıkıyor. İlk atölyeyi GDG Gaziantep topluluğu için ücretsiz yapmayı öneriyoruz.",
        "kemer": ("2", "atölye · ilki ücretsiz"),
        "pdf": ("SALT-GDG-Gaziantep-Atolye-Onerisi.pdf", "Atölye önerisi sunumu", "PDF · 13 slayt · 0,4 MB"),
        "ihtiyac": {
            "ust": "Teknik ekiplerde iletişim", "h2": "Geliştiricinin <em>dört</em> anı",
            "metin": "DevFest Gaziantep'te en çok bunu konuştuk: kod derlenir ama insanlar yorumlar. Atölyede bu dört an için kısa uygulamalar yapıyoruz.",
            "kartlar": [("Anlatmak", "Teknik olmayan birine", "Bir mimari kararı ya da gecikmenin nedenini yöneticiye veya müşteriye jargonsuz anlatmak."),
                        ("Kod inceleme", "Yapıcı geri bildirim", "Kod incelemesinde kişiyi değil kodu konuşmak; yorumu kırıcı değil yol gösterici yazmak."),
                        ("Beklenti", "Net söz vermek", "“Yakında biter” yerine kapsamı, riski ve tarihi açıkça söylemek."),
                        ("Sunum", "Demo ve toplantı", "Demoyu ve sprint toplantısını kısa, odaklı ve dinleyiciye göre anlatmak.")],
        },
        "programlar": {
            "ust": "İki atölye", "h2": "Geliştiriciler ve <em>öğrenciler</em> için",
            "metin": "İki atölye de GDG buluşmalarının biçimine uygun; yüz yüze ya da çevrim içi yapılabilir.",
            "liste": [
                ("Atölye 1 · Geliştiriciler", "Kod Derlenir, İnsan Yorumlar", "60 dk", "GDG buluşması ya da çevrim içi",
                 [("", ["<strong>Teknik konuyu sade anlatmak:</strong> bir kavramı üç cümlede, dinleyiciye göre", "<strong>Kod incelemede geri bildirim:</strong> gözlem, etki, öneri",
                        "<strong>Beklenti yönetimi:</strong> kapsam, risk ve tarih konuşması", "<strong>Kısa demo anlatımı:</strong> sorun, çözüm ve sonuç akışı"])]),
                ("Atölye 2 · Öğrenciler ve yeni mezunlar", "Dijital Kariyer Atölyesi", "90 dk", "Üniversite kulüpleri ve GDG on Campus",
                 [("", ["<strong>Kendini 60 saniyede anlatmak:</strong> projeler ve hedef", "<strong>Dijital görünürlük:</strong> LinkedIn ve GitHub'ı işverenin gözüyle okumak",
                        "<strong>Profesyonel yazışma:</strong> başvuru, staj ve takip e-postası", "<strong>İş görüşmesine hazırlık:</strong> teknik olmayan sorular"])]),
                ("Biçim", "Nasıl yapabiliriz", "Ücretsiz", "İlk atölye topluluk için",
                 [("", ["<strong>GDG buluşması:</strong> Gaziantep'te yüz yüze, teknik oturumun yanında ikinci oturum", "<strong>Çevrim içi:</strong> topluluğun yayın kanalında, kayıt paylaşılabilir",
                        "<strong>Kampüs buluşması:</strong> üniversite kulüpleriyle, Dijital Kariyer Atölyesi için"])]),
            ],
        },
        "slaytlar": [(1, "Kapak", "Kapak: Kod derlenir, insan yorumlar"), (6, "Geliştiricinin dört anı", "Teknik ekiplerde iletişimin sınandığı dört an"),
                     (9, "Atölye 1 · Geliştiriciler", "Kod Derlenir, İnsan Yorumlar atölyesinin içeriği"), (10, "Atölye 2 · Öğrenciler", "Dijital Kariyer Atölyesi'nin içeriği"),
                     (11, "Biçim", "Atölyenin yapılabileceği üç biçim"), (12, "Dört adımda atölye", "Konu ve tarihten geri bildirime dört adım")],
        "sunum_metin": "13 slaytlık sunumda iki atölyenin içeriği, biçim seçenekleri ve birlikte nasıl ilerleyeceğimiz yer alıyor. Kaydırarak göz atabilir, tamamını PDF olarak indirebilirsiniz.",
        "adimlar": [("Konu ve tarih", "Atölyeyi ve tarihi birlikte seçiyoruz; ilk atölye topluluk için ücretsiz."),
                    ("Duyuru", "Duyuru görselini ve metnini biz hazırlıyoruz, topluluk kanallarınızda paylaşıyorsunuz."),
                    ("Atölye", "Uygulamalı oturum; katılımcılara çalışma sayfası veriyoruz."),
                    ("Geri bildirim", "Katılımcı geri bildirimine göre bir sonraki buluşmayı birlikte planlıyoruz.")],
        "surec_baslik": ("Birlikte nasıl", "Dört <em>adımda</em> atölye", "Bizden içerik, eğitmen, duyuru görseli ve çalışma sayfaları; sizden tarih, salon ya da yayın ve topluluğa duyuru."),
        "kurucu_ek": "Sakarya Üniversitesi Bilgisayar Programcılığı mezunu; teknik ekiplerin dilini de, müşterinin beklentisini de yakından biliyor.",
        "kapanis": "Kısa bir görüşmede topluluğunuzun ilgisini dinleyip ilk atölyenin konusunu ve tarihini birlikte belirleyelim.",
        "posta_konu": "GDG Gaziantep · Atölye",
        "wa": "Merhaba, GDG Gaziantep için hazırladığınız atölye önerisi hakkında görüşmek istiyorum.",
        "alt": "Bu sayfa, SALT Academy &amp; Consulting tarafından GDG Gaziantep'e sunulan atölye önerisidir.",
    },
]


def kartlar(liste, sinif="grid grid--4"):
    return f'<div class="{sinif}">' + "".join(
        f'<article class="card"><p class="card__tag">{a}</p><h3>{b}</h3><p>{c}</p></article>' for a, b, c in liste) + "</div>"


def program(etiket, ad, sure, kim, bolumler):
    ic = "".join((f'<p class="program__sub">{alt}</p>' if alt else "") + "<ul>" + "".join(f"<li>{m}</li>" for m in maddeler) + "</ul>"
                 for alt, maddeler in bolumler)
    return (f'<article class="card program"><p class="card__tag">{etiket}</p><h3>{ad}</h3>'
            f'<div class="program__meta"><span class="program__time">{sure}</span><span class="program__who">{kim}</span></div>{ic}</article>')


def bolum(sinif, kimlik, ust, h2, metin, govde):
    return (f'<section class="section {sinif}" aria-labelledby="{kimlik}"><div class="wrap"><div class="head"><p class="eyebrow">{ust}</p>'
            f'<h2 id="{kimlik}">{h2}</h2><p>{metin}</p></div>{govde}</div></section>')


def sayfa(k):
    pdf, pdf_ad, pdf_bilgi = k["pdf"]
    url = f"https://{k['alan']}/"
    slaytlar = "".join(f'<figure><img src="assets/sunum/slayt-{n:02d}.webp" width="1600" height="900" alt="{escape(alt)}" loading="lazy">'
                       f'<figcaption>{yazi}</figcaption></figure>' for n, yazi, alt in k["slaytlar"])
    indir = (f'<a class="dl" href="{pdf}" download><span class="dl__icon">{INDIR}</span><span><strong>{pdf_ad}</strong><span>{pdf_bilgi}</span></span></a>'
             f'<a class="dl" href="SALT-Tanitim-Dosyasi.pdf" download><span class="dl__icon">{INDIR}</span><span><strong>Tanıtım dosyası</strong>'
             f'<span>PDF · tek sayfa · 0,2 MB</span></span></a>')
    s_ust, s_h2, s_metin = k.get("surec_baslik", ("Nasıl çalışıyoruz", "İhtiyaçtan <em>uygulamaya</em>", "Hazır bir içeriği olduğu gibi anlatmıyoruz; önce ekibi dinliyoruz."))
    adimlar = "".join(f'<div class="step"><h3>{a}</h3><p>{m}</p></div>' for a, m in k.get("adimlar", ADIMLAR))
    p = k["programlar"]
    govde = [
        f"""<section class="hero"><div class="wrap"><div>
<p class="eyebrow">{k['ust']}</p>
<h1>{k['h1']}</h1>
<p class="lead">{k['giris']}</p>
<div class="actions"><a class="btn btn--solid" href="{pdf}" download>{INDIR} Sunumu indirin (PDF)</a>
<a class="btn btn--ghost" href="#tanisalim">Tanışma görüşmesi planlayalım</a></div></div>
<div class="arch" aria-hidden="true"><div><div class="arch__num">{k['kemer'][0]}</div><div class="arch__txt">{k['kemer'][1]}</div></div></div>
</div></section>""",
        bolum("section--white", "ihtiyac", k["ihtiyac"]["ust"], k["ihtiyac"]["h2"], k["ihtiyac"]["metin"], kartlar(k["ihtiyac"]["kartlar"])),
        bolum("section--cream", "programlar", p["ust"], p["h2"], p["metin"], '<div class="grid grid--3">' + "".join(program(*x) for x in p["liste"]) + "</div>"),
        bolum("section--navy", "sunum", "Sunum ve tanıtım dosyası", "Önerinin <em>tamamı</em>", k["sunum_metin"],
              f'<div class="slides" tabindex="0" aria-label="Sunumdan slaytlar">{slaytlar}</div><div class="downloads">{indir}</div>'),
        bolum("section--white", "surec", s_ust, s_h2, s_metin, f'<div class="steps">{adimlar}</div>'),
    ]
    if k.get("modeller"):
        m = k["modeller"]
        govde.append(bolum("section--cream", "modeller", m["ust"], m["h2"], m["metin"], kartlar(m["kartlar"], "grid grid--3")))
    kurucu_ek = f"<p>{k['kurucu_ek']}</p>" if k.get("kurucu_ek") else ""
    govde.append(f"""<section class="section section--white" aria-labelledby="kurucu"><div class="wrap founder">
<div class="founder__img"><img src="assets/img/kurucu-ayla-ozalp-600.webp" width="600" height="800" alt="Ayla Özalp" loading="lazy"></div>
<div><p class="eyebrow">Kurucu</p><h2 id="kurucu">Ayla <em>Özalp</em></h2><p>{BIO}</p>{kurucu_ek}
<p class="quote">“Gelişim; bilgiyi uygulamaya, deneyimi uzmanlığa, potansiyeli somut sonuca dönüştürmektir.”</p></div></div></section>""")
    govde.append(f"""<section class="section section--navy contact" id="tanisalim" aria-labelledby="iletisim"><div class="wrap">
<p class="eyebrow">Sonraki adım</p><h2 id="iletisim">Tanışalım</h2><p>{k['kapanis']}</p>
<div class="actions"><a class="btn btn--solid" href="mailto:ayla@saltacademyconsulting.com?subject={quote(k['posta_konu'])}">E-posta gönderin</a>
<a class="btn btn--ghost" href="https://wa.me/905445315914?text={quote(k['wa'])}" target="_blank" rel="noopener">WhatsApp'tan yazın</a></div>
<ul class="contact__list"><li><a href="mailto:ayla@saltacademyconsulting.com">ayla@saltacademyconsulting.com</a></li>
<li><a href="tel:+905445315914">+90 544 531 59 14</a></li><li><a href="https://saltacademyconsulting.com/">saltacademyconsulting.com</a></li></ul>
</div></section>""")
    return f"""<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{k['baslik']} · SALT Academy &amp; Consulting</title>
  <meta name="description" content="{escape(k['aciklama'])}">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#07182a">
  <meta property="og:title" content="{escape(re.sub('<[^>]+>', '', k['h1']))}">
  <meta property="og:description" content="{escape(k['aciklama'])}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="https://saltacademyconsulting.com/assets/img/paylasim.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="assets/img/salt-ikon-48.png">
  <link rel="apple-touch-icon" href="assets/img/salt-ikon-180.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap">
  <style>{CSS}</style>
</head>
<body>
  <a class="skip" href="#icerik">İçeriğe geç</a>
  <header class="top"><div class="wrap">
    <a class="brand" href="https://saltacademyconsulting.com/" aria-label="SALT Academy & Consulting ana sayfa"><span class="brand__mark">SALT</span><span class="brand__sub">Academy &amp; Consulting</span></a>
    <a class="top__link" href="https://saltacademyconsulting.com/egitimler.html">Tüm eğitimlerimiz</a>
  </div></header>
  <main id="icerik">
{chr(10).join(govde)}
  </main>
  <footer class="foot"><div class="wrap">
    <span>{k['alt']}</span>
    <span>© 2026 SALT Academy &amp; Consulting · <a href="https://saltacademyconsulting.com/kvkk.html">KVKK</a></span>
  </div></footer>
</body>
</html>
"""


if __name__ == "__main__":
    for k in KURUMLAR:
        hedef = KOK / k["klasor"] / "index.html"
        hedef.write_text(sayfa(k), encoding="utf-8")
        print("yazıldı:", hedef.relative_to(KOK))
