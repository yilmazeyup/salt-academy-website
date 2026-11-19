// SALT CRM · https://crm.saltacademyconsulting.com
// - POST /api/talep: sitedeki eğitim talebi ve webinar formları buraya yazar (CORS: yalnızca SALT alan adları)
// - Panel: e-posta ile tek kullanımlık bağlantıyla giriş; şifre yok. Yetkililer D1'deki "yetkililer" tablosunda.
// - Bildirimler: salt-ortaklik worker'ına hizmet bağlantısıyla (env.POSTA) gider; SMTP şifresi bu worker'da yok.
// - Zamanlı görev: her iş günü 09.00'da bekleyen talepler için takip özeti.
import { PANEL_HTML, GIRIS_HTML } from "./panel.js";

const SITE = "https://crm.saltacademyconsulting.com";
const KOKENLER = ["https://saltacademyconsulting.com", "https://www.saltacademyconsulting.com", "https://gaib.saltacademyconsulting.com"];
const CEREZ = "salt_crm";
const OTURUM_GUN = 30;
const GIRIS_DK = 15;

export const DURUMLAR = {
  yeni: "Yeni", iletisim: "İletişime geçildi", gorusme: "Görüşme", teklif: "Teklif",
  kazanildi: "Kazanıldı", kaybedildi: "Olumsuz", beklemede: "Beklemede",
};
export const TURLER = { talep: "Site talebi", kurum: "Kurum / iş birliği", webinar: "Webinar listesi", kisi: "Kişi" };
const ALANLAR = ["tur", "kaynak", "ad", "kurum", "unvan", "eposta", "telefon", "program", "mesaj", "durum",
  "sonraki_adim", "sonraki_tarih", "deger", "bulten"];
const SINIR = { ad: 120, kurum: 160, unvan: 120, eposta: 160, telefon: 40, program: 120, mesaj: 4000, sonraki_adim: 300, kaynak: 40, sayfa: 200, utm: 300 };

// ---------- yardımcılar ----------
const simdi = () => new Date().toISOString();
const trGun = (d = new Date()) => new Date(d.getTime() + 3 * 3600e3).toISOString().slice(0, 10);
const trZaman = (iso) => new Date(iso).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "long", timeStyle: "short" });
const EPOSTA_RE = /^[^@\s<>,;"]+@[^@\s<>,;"]+\.[^@\s<>,;"]{2,}$/;
const kirp = (v, n) => (v == null ? null : String(v).replace(/\u0000/g, "").trim().slice(0, n) || null);

async function ozet(metin) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(metin));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function rastgele() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function cerezler(istek) {
  const c = {};
  for (const p of (istek.headers.get("Cookie") || "").split(";")) {
    const i = p.indexOf("=");
    if (i > 0) c[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  }
  return c;
}
const GUVENLIK = {
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
};
function yanit(govde, durum = 200, ek = {}) {
  const h = { ...GUVENLIK, ...ek };
  if (typeof govde === "string") return new Response(govde, { status: durum, headers: { "Content-Type": "text/html; charset=utf-8", ...h } });
  return new Response(JSON.stringify(govde), { status: durum, headers: { "Content-Type": "application/json; charset=utf-8", ...h } });
}
function sayfa(html, nonce) {
  return yanit(html.replaceAll("__NONCE__", nonce), 200, {
    "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`,
  });
}

async function sinirla(env, anahtar, enCok) {
  const pencere = new Date().toISOString().slice(0, 13);
  const s = await env.DB.prepare("SELECT pencere, sayi FROM sinir WHERE anahtar = ?").bind(anahtar).first();
  if (s && s.pencere === pencere) {
    if (s.sayi >= enCok) return false;
    await env.DB.prepare("UPDATE sinir SET sayi = sayi + 1 WHERE anahtar = ?").bind(anahtar).run();
  } else {
    await env.DB.prepare("INSERT OR REPLACE INTO sinir (anahtar, pencere, sayi) VALUES (?, ?, 1)").bind(anahtar, pencere).run();
  }
  return true;
}

async function alicilar(env) {
  const { results } = await env.DB.prepare("SELECT eposta, bildirim FROM yetkililer WHERE bildirim != 'yok'").all();
  return { kime: results.filter((r) => r.bildirim === "kime").map((r) => r.eposta), gizli: results.filter((r) => r.bildirim === "gizli").map((r) => r.eposta) };
}

async function postala(env, ileti) {
  const r = await env.POSTA.fetch("https://salt-ortaklik/bildir", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ileti),
  });
  if (!r.ok) throw new Error(`bildirim ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

async function notEkle(env, kisiId, yazan, metin) {
  await env.DB.prepare("INSERT INTO notlar (kisi_id, zaman, yazan, metin) VALUES (?, ?, ?, ?)").bind(kisiId, simdi(), yazan, metin).run();
}

// ---------- sitedeki formlar ----------
async function govdeOku(istek) {
  const tur = istek.headers.get("Content-Type") || "";
  if (tur.includes("application/json")) return await istek.json();
  const f = await istek.formData();
  return Object.fromEntries([...f.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
}

async function talep(istek, env, ctx) {
  const koken = istek.headers.get("Origin") || "";
  const cors = KOKENLER.includes(koken) ? { "Access-Control-Allow-Origin": koken, Vary: "Origin" } : {};
  if (istek.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" } });
  }
  if (istek.method !== "POST") return yanit({ ok: false }, 405, cors);
  if (!cors["Access-Control-Allow-Origin"]) return yanit({ ok: false, hata: "köken" }, 403);
  let b;
  try { b = await govdeOku(istek); } catch { return yanit({ ok: false, hata: "biçim" }, 400, cors); }
  // Bot tuzağı: görünmeyen alan doluysa kaydetmeden "tamam" de
  if (b.web) return yanit({ ok: true }, 200, cors);
  const ip = istek.headers.get("CF-Connecting-IP") || "";
  const ipOzet = (await ozet(ip + "|salt-crm")).slice(0, 16);
  if (!(await sinirla(env, `talep:${ipOzet}`, 8))) return yanit({ ok: false, hata: "sınır" }, 429, cors);

  const tur = b.tur === "webinar" ? "webinar" : "talep";
  const eposta = kirp(b.eposta, SINIR.eposta);
  if (!eposta || !EPOSTA_RE.test(eposta)) return yanit({ ok: false, hata: "eposta" }, 400, cors);
  const ad = kirp(b.ad, SINIR.ad);
  if (tur === "talep" && (!ad || b.kvkk !== "1")) return yanit({ ok: false, hata: "eksik" }, 400, cors);
  if (tur === "webinar" && b.izin !== "1") return yanit({ ok: false, hata: "izin" }, 400, cors);
  const surum = b.surum === "B" ? "B" : "A";
  const kaynak = koken.includes("gaib.") ? "gaib" : `site-${surum.toLowerCase()}`;
  const z = simdi();

  if (tur === "webinar") {
    const var_ = await env.DB.prepare("SELECT id FROM kisiler WHERE tur = 'webinar' AND lower(eposta) = lower(?)").bind(eposta).first();
    if (var_) {
      await env.DB.prepare("UPDATE kisiler SET guncelleme = ? WHERE id = ?").bind(z, var_.id).run();
      return yanit({ ok: true }, 200, cors);
    }
  }
  const r = await env.DB.prepare(
    `INSERT INTO kisiler (olusturma, guncelleme, tur, kaynak, ad, kurum, eposta, telefon, program, mesaj, bulten, kvkk, durum, sayfa, utm, ip_ozet)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'yeni', ?, ?, ?)`
  ).bind(z, z, tur, kaynak, ad, kirp(b.kurum, SINIR.kurum), eposta, kirp(b.telefon, SINIR.telefon), kirp(b.program, SINIR.program),
    kirp(b.mesaj, SINIR.mesaj), tur === "webinar" || b.bulten === "1" ? 1 : 0, b.kvkk === "1" ? 1 : 0,
    kirp(b.sayfa, SINIR.sayfa), kirp(b.utm, SINIR.utm), ipOzet).run();
  const id = r.meta.last_row_id;
  await notEkle(env, id, "site", tur === "webinar" ? "Webinar duyuru listesine katıldı." : `Siteden eğitim talebi geldi (Sürüm ${surum}).`);
  ctx.waitUntil(talepBildir(env, id));
  return yanit({ ok: true }, 200, cors);
}

async function talepBildir(env, id) {
  const k = await env.DB.prepare("SELECT * FROM kisiler WHERE id = ?").bind(id).first();
  const { kime, gizli } = await alicilar(env);
  if (!kime.length) return;
  const webinar = k.tur === "webinar";
  const satirlar = webinar
    ? ["Sitemizden webinar duyuru listesine yeni bir kayıt geldi.", "", `E-posta: ${k.eposta}`]
    : ["Sitemizden yeni bir eğitim talebi geldi.", "",
      `Ad Soyad: ${k.ad}`, `Kurum: ${k.kurum || "-"}`, `E-posta: ${k.eposta}`, `Telefon: ${k.telefon || "-"}`,
      `İlgilendiği program: ${k.program || "-"}`, `Mesaj: ${k.mesaj || "-"}`, `E-bülten izni: ${k.bulten ? "Evet" : "Hayır"}`];
  satirlar.push(`Kaynak: ${k.kaynak === "gaib" ? "GAİB sayfası" : `Site, Sürüm ${k.kaynak.slice(-1).toUpperCase()}`}${k.sayfa ? ` (${k.sayfa})` : ""}`,
    `Zaman: ${trZaman(k.olusturma)}`, "");
  if (!webinar) satirlar.push(`Bu e-postayı yanıtladığınızda yanıtınız doğrudan ${k.ad} adlı kişiye gider. Sitede 24 saat içinde dönüş sözü veriyoruz.`, "");
  satirlar.push(`Kaydı CRM'de açmak için: ${SITE}/#k${k.id}`, "", "SALT CRM");
  let durum = "gönderildi";
  try {
    await postala(env, {
      kime, gizli, yanit: webinar ? undefined : k.eposta,
      konu: webinar ? `Webinar listesine yeni kayıt: ${k.eposta}` : `Yeni eğitim talebi: ${k.ad}${k.kurum ? ` · ${k.kurum}` : ""}`,
      metin: satirlar.join("\n"),
    });
  } catch (h) {
    durum = `hata: ${String(h.message || h).slice(0, 150)}`;
    console.error("bildirim", id, durum);
  }
  await env.DB.prepare("UPDATE kisiler SET bildirim = ? WHERE id = ?").bind(`${durum} · ${simdi()}`, id).run();
}

// ---------- giriş ----------
async function oturum(istek, env) {
  const t = cerezler(istek)[CEREZ];
  if (!t) return null;
  const o = await env.DB.prepare("SELECT eposta, bitis FROM oturumlar WHERE ozet = ?").bind(await ozet(t)).first();
  return o && o.bitis > simdi() ? o.eposta : null;
}

async function girisIste(istek, env, nonce) {
  const f = await istek.formData().catch(() => null);
  const eposta = (f && String(f.get("eposta") || "").trim().toLowerCase()) || "";
  const ip = istek.headers.get("CF-Connecting-IP") || "";
  const tamam = sayfa(GIRIS_HTML.replace("__ICERIK__", `<p class="bilgi">Bu adres yetkiliyse giriş bağlantısı birkaç dakika içinde e-postanıza gelir. Bağlantı ${GIRIS_DK} dakika geçerlidir.</p><p><a href="/giris">Yeniden dene</a></p>`), nonce);
  if (!EPOSTA_RE.test(eposta)) return tamam;
  if (!(await sinirla(env, `giris-ip:${(await ozet(ip)).slice(0, 16)}`, 6)) || !(await sinirla(env, `giris:${eposta}`, 4))) return tamam;
  const y = await env.DB.prepare("SELECT eposta FROM yetkililer WHERE lower(eposta) = ?").bind(eposta).first();
  if (!y) return tamam;
  const t = rastgele();
  await env.DB.prepare("INSERT INTO girisler (ozet, eposta, bitis) VALUES (?, ?, ?)")
    .bind(await ozet(t), y.eposta, new Date(Date.now() + GIRIS_DK * 60e3).toISOString()).run();
  await postala(env, {
    kime: [y.eposta], konu: "SALT CRM · giriş bağlantınız",
    metin: `Merhaba,\n\nSALT CRM paneline girmek için aşağıdaki bağlantıyı ${GIRIS_DK} dakika içinde açın:\n\n${SITE}/giris/${t}\n\nBağlantı tek kullanımlıktır. Bu isteği siz yapmadıysanız e-postayı yok sayabilirsiniz.\n\nSALT Academy & Consulting`,
  });
  return tamam;
}

// Bağlantı yalnızca bir onay sayfası açar; oturum düğmeye basınca (POST) başlar. E-posta tarayıcılarının
// bağlantıyı önceden açması tek kullanımlık kodu harcamasın diye.
function girisOnaySayfasi(t, nonce) {
  const guvenli = t.replace(/[^A-Za-z0-9_-]/g, "");
  return sayfa(GIRIS_HTML.replace("__ICERIK__", `<form method="post" action="/giris/onay"><input type="hidden" name="t" value="${guvenli}"><button class="dugme" type="submit">Panele gir</button></form>`), nonce);
}

async function girisOnay(istek, env, nonce) {
  const f = await istek.formData().catch(() => null);
  const t = (f && String(f.get("t") || "")) || "";
  const oz = await ozet(t);
  const g = await env.DB.prepare("SELECT eposta, bitis, kullanildi FROM girisler WHERE ozet = ?").bind(oz).first();
  if (!g || g.kullanildi || g.bitis < simdi()) {
    return sayfa(GIRIS_HTML.replace("__ICERIK__", `<p class="bilgi">Bu bağlantının süresi dolmuş ya da kullanılmış. Yeni bir bağlantı isteyin.</p><p><a href="/giris">Giriş sayfası</a></p>`), nonce);
  }
  await env.DB.prepare("UPDATE girisler SET kullanildi = 1 WHERE ozet = ?").bind(oz).run();
  const o = rastgele();
  await env.DB.prepare("INSERT INTO oturumlar (ozet, eposta, bitis) VALUES (?, ?, ?)")
    .bind(await ozet(o), g.eposta, new Date(Date.now() + OTURUM_GUN * 864e5).toISOString()).run();
  await env.DB.prepare("DELETE FROM girisler WHERE bitis < ?").bind(simdi()).run();
  return new Response(null, {
    status: 303,
    headers: { ...GUVENLIK, Location: "/", "Set-Cookie": `${CEREZ}=${o}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${OTURUM_GUN * 86400}` },
  });
}

async function cikis(istek, env) {
  const t = cerezler(istek)[CEREZ];
  if (t) await env.DB.prepare("DELETE FROM oturumlar WHERE ozet = ?").bind(await ozet(t)).run();
  return new Response(null, { status: 303, headers: { ...GUVENLIK, Location: "/giris", "Set-Cookie": `${CEREZ}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
}

// ---------- panel API ----------
function temizle(b, yeni) {
  const d = {};
  for (const a of ALANLAR) {
    if (!(a in b)) continue;
    let v = b[a];
    if (a === "durum") { if (!(v in DURUMLAR)) continue; }
    else if (a === "tur") { if (!(v in TURLER)) continue; }
    else if (a === "deger") { v = v === "" || v == null ? null : Math.max(0, Math.round(Number(v)) || 0); }
    else if (a === "bulten") { v = v ? 1 : 0; }
    else if (a === "sonraki_tarih") { v = /^\d{4}-\d{2}-\d{2}$/.test(v || "") ? v : null; }
    else if (a === "eposta") { v = kirp(v, SINIR.eposta); if (v && !EPOSTA_RE.test(v)) continue; }
    else v = kirp(v, SINIR[a] || 300);
    d[a] = v;
  }
  if (yeni) { d.tur = d.tur || "kisi"; d.durum = d.durum || "yeni"; d.kaynak = d.kaynak || "elle"; }
  return d;
}

async function panelApi(istek, env, eposta, yol) {
  // Yalnızca panelin kendi isteği: özel başlık başka sitelerden CORS olmadan gönderilemez
  if (istek.headers.get("X-Istek") !== "salt") return yanit({ ok: false }, 403);
  const m = istek.method;
  const parca = yol.split("/").filter(Boolean); // api, panel, kisiler, :id, notlar
  if (parca[2] === "kisiler" && !parca[3]) {
    if (m === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT k.*, (SELECT COUNT(*) FROM notlar n WHERE n.kisi_id = k.id) AS not_sayisi,
                (SELECT MAX(zaman) FROM notlar n WHERE n.kisi_id = k.id) AS son_not
         FROM kisiler k ORDER BY k.guncelleme DESC`).all();
      return yanit({ ok: true, kisiler: results, durumlar: DURUMLAR, turler: TURLER, ben: eposta, bugun: trGun() });
    }
    if (m === "POST") {
      const d = temizle(await istek.json(), true);
      if (!d.ad && !d.kurum) return yanit({ ok: false, hata: "Ad ya da kurum gerekli" }, 400);
      const z = simdi();
      const a = Object.keys(d);
      const r = await env.DB.prepare(`INSERT INTO kisiler (olusturma, guncelleme, ${a.join(", ")}) VALUES (?, ?, ${a.map(() => "?").join(", ")})`)
        .bind(z, z, ...a.map((k) => d[k])).run();
      await notEkle(env, r.meta.last_row_id, eposta, "Kayıt elle eklendi.");
      return yanit({ ok: true, id: r.meta.last_row_id });
    }
  }
  const id = Number(parca[3]);
  if (parca[2] === "kisiler" && id) {
    const k = await env.DB.prepare("SELECT * FROM kisiler WHERE id = ?").bind(id).first();
    if (!k) return yanit({ ok: false }, 404);
    if (parca[4] === "notlar" && m === "POST") {
      const metin = kirp((await istek.json()).metin, 4000);
      if (!metin) return yanit({ ok: false }, 400);
      await notEkle(env, id, eposta, metin);
      await env.DB.prepare("UPDATE kisiler SET guncelleme = ? WHERE id = ?").bind(simdi(), id).run();
      return yanit({ ok: true });
    }
    if (m === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM notlar WHERE kisi_id = ? ORDER BY zaman DESC, id DESC").bind(id).all();
      return yanit({ ok: true, kisi: k, notlar: results });
    }
    if (m === "PATCH") {
      const d = temizle(await istek.json(), false);
      const a = Object.keys(d).filter((x) => d[x] !== k[x]);
      if (a.length) {
        // Elle yapılan değişiklikten sonra eşitleme betiği bu kaydın durumuna ve adımına dokunmaz (oto = 0)
        await env.DB.prepare(`UPDATE kisiler SET guncelleme = ?, oto = 0, ${a.map((x) => `${x} = ?`).join(", ")} WHERE id = ?`)
          .bind(simdi(), ...a.map((x) => d[x]), id).run();
        if (a.includes("durum")) await notEkle(env, id, eposta, `Durum: ${DURUMLAR[k.durum] || k.durum} → ${DURUMLAR[d.durum]}`);
        if (a.includes("sonraki_adim") || a.includes("sonraki_tarih")) {
          const adim = d.sonraki_adim ?? k.sonraki_adim, tarih = d.sonraki_tarih ?? k.sonraki_tarih;
          if (adim || tarih) await notEkle(env, id, eposta, `Sonraki adım: ${adim || "-"}${tarih ? ` (${tarih})` : ""}`);
        }
      }
      return yanit({ ok: true });
    }
    if (m === "DELETE") {
      await env.DB.batch([env.DB.prepare("DELETE FROM notlar WHERE kisi_id = ?").bind(id), env.DB.prepare("DELETE FROM kisiler WHERE id = ?").bind(id)]);
      return yanit({ ok: true });
    }
  }
  return yanit({ ok: false }, 404);
}

async function disari(env) {
  const { results } = await env.DB.prepare("SELECT * FROM kisiler ORDER BY olusturma").all();
  const basliklar = ["id", "olusturma", "tur", "kaynak", "ad", "kurum", "unvan", "eposta", "telefon", "program", "mesaj", "bulten", "kvkk",
    "durum", "sonraki_adim", "sonraki_tarih", "deger"];
  const h = (v) => { const s = v == null ? "" : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const satirlar = [basliklar.join(","), ...results.map((r) => basliklar.map((b) => h(b === "durum" ? DURUMLAR[r[b]] || r[b] : b === "tur" ? TURLER[r[b]] || r[b] : r[b])).join(","))];
  return new Response("\ufeff" + satirlar.join("\r\n"), {
    headers: { ...GUVENLIK, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="salt-crm-${trGun()}.csv"` },
  });
}

// ---------- zamanlı takip özeti ----------
async function takipOzeti(env) {
  const bugun = trGun();
  const dun = new Date(Date.now() - 864e5).toISOString();
  const { results } = await env.DB.prepare(
    `SELECT * FROM kisiler WHERE tur IN ('talep', 'kisi') AND durum NOT IN ('kazanildi', 'kaybedildi')
       AND ((durum = 'yeni' AND olusturma <= ?) OR (sonraki_tarih IS NOT NULL AND sonraki_tarih <= ?))
     ORDER BY olusturma`).bind(dun, bugun).all();
  await env.DB.prepare("DELETE FROM oturumlar WHERE bitis < ?").bind(simdi()).run();
  if (!results.length) return "takip edilecek kayıt yok";
  const { kime, gizli } = await alicilar(env);
  if (!kime.length) return "alıcı yok";
  const satir = (k) => {
    const neden = k.durum === "yeni" ? `yanıt bekliyor (${trZaman(k.olusturma)})` : `sonraki adım ${k.sonraki_tarih}: ${k.sonraki_adim || "-"}`;
    return `- ${k.ad || k.kurum}${k.kurum && k.ad ? ` · ${k.kurum}` : ""}: ${neden}\n  ${SITE}/#k${k.id}`;
  };
  await postala(env, {
    kime, gizli,
    konu: `SALT CRM · bugün takip edilecek ${results.length} kayıt`,
    metin: ["Günaydın,", "", "Bugün dönüş bekleyen kayıtlar:", "", ...results.map(satir), "",
      "Bir kayda dönüş yaptıktan sonra panelde durumunu güncellemeniz yeterli; o kayıt bu listeden çıkar.", "", "SALT CRM"].join("\n"),
  });
  return `${results.length} kayıt bildirildi`;
}

export default {
  async fetch(istek, env, ctx) {
    const url = new URL(istek.url);
    const yol = url.pathname;
    const nonce = rastgele().slice(0, 22);
    try {
      if (yol === "/api/talep") return await talep(istek, env, ctx);
      if (yol === "/robots.txt") return new Response("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain" } });
      if (yol === "/giris" && istek.method === "GET") return sayfa(GIRIS_HTML.replace("__ICERIK__",
        `<form method="post" action="/giris"><label for="e">E-posta adresiniz</label><input id="e" name="eposta" type="email" autocomplete="email" required><button class="dugme" type="submit">Giriş bağlantısı gönder</button></form>`), nonce);
      if (yol === "/giris" && istek.method === "POST") return await girisIste(istek, env, nonce);
      if (yol === "/giris/onay" && istek.method === "POST") return await girisOnay(istek, env, nonce);
      if (yol.startsWith("/giris/") && istek.method === "GET") return girisOnaySayfasi(yol.slice(7), nonce);
      if (yol === "/cikis") return await cikis(istek, env);
      const eposta = await oturum(istek, env);
      if (!eposta) {
        if (yol.startsWith("/api/")) return yanit({ ok: false, hata: "oturum" }, 401);
        return new Response(null, { status: 303, headers: { ...GUVENLIK, Location: "/giris" } });
      }
      if (yol === "/" && istek.method === "GET") return sayfa(PANEL_HTML, nonce);
      if (yol === "/disari.csv") return await disari(env);
      if (yol.startsWith("/api/panel/")) return await panelApi(istek, env, eposta, yol);
      return yanit({ ok: false }, 404);
    } catch (h) {
      console.error(yol, h && h.stack || h);
      return yanit({ ok: false, hata: "sunucu" }, 500);
    }
  },
  async scheduled(olay, env, ctx) {
    console.log(await takipOzeti(env));
  },
};
