-- SALT CRM · D1 şeması (salt-crm). Uygulama: npx --yes wrangler@4.86.0 d1 execute salt-crm --remote --file schema.sql
-- Tablolar yoksa oluşturulur; var olan veriye dokunmaz.

-- Kişi ve kurum kayıtları: site talepleri, webinar listesi, iş birliği kurumları, elle eklenen kişiler
CREATE TABLE IF NOT EXISTS kisiler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  olusturma TEXT NOT NULL,                 -- ISO, UTC
  guncelleme TEXT NOT NULL,
  tur TEXT NOT NULL DEFAULT 'talep',       -- talep | kurum | webinar | kisi
  kaynak TEXT,                             -- site-a | site-b | gaib | ortaklik | etkinlik | whatsapp | telefon | eposta | elle
  ad TEXT,
  kurum TEXT,
  unvan TEXT,
  eposta TEXT,
  telefon TEXT,
  program TEXT,
  mesaj TEXT,
  bulten INTEGER NOT NULL DEFAULT 0,       -- e-bülten / duyuru izni
  kvkk INTEGER NOT NULL DEFAULT 0,         -- formdaki KVKK onayı
  durum TEXT NOT NULL DEFAULT 'yeni',      -- yeni | iletisim | gorusme | teklif | kazanildi | kaybedildi | beklemede
  sonraki_adim TEXT,
  sonraki_tarih TEXT,                      -- YYYY-AA-GG
  deger INTEGER,                           -- tahmini tutar, TL
  sayfa TEXT,                              -- formun gönderildiği sayfa
  utm TEXT,
  ip_ozet TEXT,                            -- IP'nin kısaltılmış özeti (yalnızca kötüye kullanımı sınırlamak için)
  bildirim TEXT,                           -- bildirim e-postasının durumu
  dis_anahtar TEXT,                        -- dışarıdan eşitlenen kayıtlar için (ör. "ortaklik:13")
  oto INTEGER NOT NULL DEFAULT 0           -- 1: eşitleme betiği güncelleyebilir; panelde elle değiştirilince 0 olur
);
CREATE INDEX IF NOT EXISTS kisiler_durum ON kisiler (durum);
CREATE INDEX IF NOT EXISTS kisiler_eposta ON kisiler (eposta);
CREATE UNIQUE INDEX IF NOT EXISTS kisiler_dis ON kisiler (dis_anahtar);

-- Her kayıt için zaman çizelgesi: notlar, durum değişiklikleri, gönderilen e-postalar
CREATE TABLE IF NOT EXISTS notlar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kisi_id INTEGER NOT NULL,
  zaman TEXT NOT NULL,
  yazan TEXT,
  metin TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS notlar_kisi ON notlar (kisi_id);

-- Panele girebilecek kişiler ve bildirim alacaklar (adresler depoda değil, yalnızca veritabanında)
CREATE TABLE IF NOT EXISTS yetkililer (
  eposta TEXT PRIMARY KEY,
  ad TEXT,
  bildirim TEXT NOT NULL DEFAULT 'yok'     -- 'kime' | 'gizli' | 'yok'
);

-- Tek kullanımlık giriş bağlantıları ve oturumlar; yalnızca SHA-256 özetleri saklanır
CREATE TABLE IF NOT EXISTS girisler (
  ozet TEXT PRIMARY KEY,
  eposta TEXT NOT NULL,
  bitis TEXT NOT NULL,
  kullanildi INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS oturumlar (
  ozet TEXT PRIMARY KEY,
  eposta TEXT NOT NULL,
  bitis TEXT NOT NULL
);

-- Kötüye kullanım sınırı: anahtar başına saatlik sayaç
CREATE TABLE IF NOT EXISTS sinir (
  anahtar TEXT PRIMARY KEY,
  pencere TEXT NOT NULL,
  sayi INTEGER NOT NULL
);
