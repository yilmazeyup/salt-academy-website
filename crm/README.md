# SALT CRM

Sitedeki formların kaydı ve müşteri takip paneli: **https://crm.saltacademyconsulting.com**

- **Formlar:** `public/assets/js/main.js`, eğitim talebi ve webinar formlarını `POST /api/talep` adresine gönderir. Bağlantı kurulamazsa eski yol devreye girer ve ziyaretçinin e-posta uygulaması hazır bir mesajla açılır.
- **Bildirim:** Her yeni talep Ayla Hanım'a e-postayla bildirilir; yanıtla dendiğinde yanıt doğrudan ziyaretçiye gider.
  - E-posta, `salt-ortaklik` worker'ı üzerinden hizmet bağlantısıyla gider.
  - SMTP şifresi yalnızca o worker'da durur; bu projede yoktur.
- **Giriş:** Şifre yoktur. `yetkililer` tablosundaki adreslere tek kullanımlık, 15 dakika geçerli bir giriş bağlantısı gönderilir. Oturum 30 gün açık kalır.
- **Takip özeti:** Her iş günü 09.00'da gider. İçinde iki tür kayıt olur:
  - 24 saati geçmiş ve hâlâ "Yeni" durumundaki talepler;
  - sonraki adım tarihi gelmiş kayıtlar.
- **Kurumlar:** İş birliği e-postalarının durumu her iş günü eşitlenir.
  - Eşitlemeyi `SALT-Gunluk-Rapor/araclar/crm_esitle.py` yapar; `ortaklik/hatirlatma.py --onaylandi` her çalıştığında onu çağırır.
  - Panelde elle değiştirilen kayıtların durumuna eşitleme dokunmaz.

## Komutlar (bu klasörden)

```bash
npx --yes wrangler@4.86.0 deploy
```

```bash
npx --yes wrangler@4.86.0 d1 execute salt-crm --remote --file schema.sql
```

Kişisel veriler ve yetkili adresler depoda değil, yalnızca D1 veritabanında (`salt-crm`, Batı Avrupa) tutulur.
