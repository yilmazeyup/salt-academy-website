# SALT Academy & Consulting · Web sitesi

Kurumlar ve profesyoneller için iletişim, liderlik ve satış eğitimleri veren **SALT Academy & Consulting**'in web sitesi. Tasarım ve geliştirme: **Manaliza Agency**.

**Canlı:** [saltacademyconsulting.com](https://saltacademyconsulting.com) · Klasik tasarım: [?v=a](https://saltacademyconsulting.com/?v=a) · Sinematik tasarım: [?v=b](https://saltacademyconsulting.com/?v=b)

![Kurucumuz bölümü](public/assets/img/kurucu-ayla-ozalp-600.webp)

## Öne çıkanlar

- **İki tasarım, tek içerik.** A sade ve klasik; B sinematik: WebGL ile çizilen altın ipek kahraman alanı, harf harf açılan başlıklar, kaydırdıkça üst üste binen bölümler. Metinler ikisinde de aynı.
- **A/B testi.** Sayfanın başındaki küçük bir betik ziyaretçiyi oturum boyunca aynı tasarımda tutar ve 50/50 dağıtır; `?v=a` ya da `?v=b` ile tasarım seçilebilir. Talep formu ve WhatsApp dönüşümleri her tasarım için ayrı teşekkür sayfalarıyla, çerezsiz Cloudflare Web Analytics üzerinden ölçülür.
- **Site içi arama.** Derleme adımı ya da dizin dosyası yok: arama açıldığında ana sayfa, eğitimler ve galeri okunur, başlıklar, modüller ve dersler aranır. Türkçe karakter ve büyük/küçük harf duyarsızdır ("musteri" → Müşteri); kısayol `Ctrl/Cmd + K` ya da `/`.
- **Galeri.** Duvar düzeni ve büyük görünüm; ok tuşları, Esc ve parmakla kaydırma. Fotoğraflar bir araçla kırpılır, kurum logoları ve öne çıkan yüzler yumuşak kenarlı olarak bulanıklaştırılır, WebP'ye çevrilir ve konum bilgileri silinir.
- **Eğitim kataloğu.** Beş program ailesi, filtreler, sekmeli ders listesi ve modül kartları.
- **Erişilebilirlik.** İçeriğe geç bağlantısı, klavyeyle gezinme, ARIA etiketleri, hareket azaltma tercihine uyum; animasyon kütüphaneleri yüklenmezse sayfa sade hâliyle çalışır.
- **Hız.** Statik HTML, CSS ve sade JavaScript; çatı (framework) yok. Görseller WebP ve `srcset` ile, yalnızca görünür olduklarında yüklenir.
- **Gizlilik ve arama motorları.** KVKK aydınlatma metni ve çerez politikası, site haritası, güvenlik başlıkları; önizleme adresleri arama sonuçlarına kapalıdır.

## Yapı

```
public/                 Yayınlanan site
  index.html            Ana sayfa (A)
  egitimler.html        Eğitim kataloğu (A)
  galeri.html           Galeri (A)
  b/                    Aynı sayfaların sinematik tasarımı (B)
  assets/css/style.css  Ortak stiller
  assets/js/main.js     Animasyonlar, menü, filtreler, sayfa geçişleri
  assets/js/arama.js    Site içi arama
  assets/js/galeri.js   Galeri büyük görünümü
  b/assets/             B tasarımına özel stil, WebGL ve animasyonlar
  _headers              Güvenlik ve önbellek başlıkları
tools/galeri/           Galeri fotoğraflarını üreten araç (galeri.json + galeri.py)
tools/kurucu/           Kurucu fotoğrafının nasıl üretildiği
```

## Yerelde çalıştırma

```bash
python3 -m http.server 4317 --directory public
```

Ardından `http://localhost:4317/?v=a` ya da `http://localhost:4317/?v=b`.

## Yayın

`main` dalına yapılan her gönderim, `.github/workflows/deploy.yml` ile Cloudflare Pages'e yayınlanır. İş akışı yalnızca `CLOUDFLARE_PAGES_PROJECT` değişkeni tanımlı depoda çalışır; anahtar, depo ayarlarındaki `CLOUDFLARE_API_TOKEN` gizli değişkeninde durur.

## Galeriye fotoğraf eklemek

1. Fotoğrafı `tools/galeri/kaynak/` klasörüne koyun (bu klasör depoya girmez).
2. `tools/galeri/galeri.json` dosyasına bir satır ekleyin: kırpma, bulanıklaştırılacak alanlar ve açıklama.
3. `python3 -I tools/galeri/galeri.py` çalıştırın; araç küçük ve büyük WebP'leri üretir, iki tasarımın galeri sayfasını günceller.

Gerekli: Python 3 ve ImageMagick 7.

## Teknolojiler

HTML · CSS · JavaScript · [GSAP 3.12.5](https://gsap.com) ve ScrollTrigger · [Lenis 1.1.13](https://lenis.darkroom.engineering) · WebGL · Cloudflare Pages · GitHub Actions

## Lisans

Kod ve tasarım © 2026 Manaliza Agency; metinler, logo, fotoğraflar ve eğitim içerikleri © SALT Academy & Consulting. Tüm hakları saklıdır. Depo portföy amacıyla herkese açıktır; ayrıntılar [LICENSE](LICENSE) dosyasında.

---

### English

Website of **SALT Academy & Consulting**, a training and consulting firm for communication, leadership and sales, designed and built by **Manaliza Agency**. Two designs share one set of content and are A/B tested 50/50 per session (`?v=a` classic, `?v=b` cinematic with a WebGL hero). It includes build-free site search that is insensitive to Turkish characters, a gallery whose photos are blurred and converted by a small Python tool, and plain HTML, CSS and JavaScript with GSAP and Lenis. Every push to `main` deploys to Cloudflare Pages through GitHub Actions. All rights reserved.
