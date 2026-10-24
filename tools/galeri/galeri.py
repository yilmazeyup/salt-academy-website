"""Galeri: tools/galeri/kaynak'taki fotoğraflardan sitedeki galeriyi üretir.

Her fotoğrafın ayarı galeri.json'da durur:
  kaynak   tools/galeri/kaynak içindeki dosya (bu klasör depoya girmez; orijinallerde kurum logoları açık durur)
  ad       çıktı adı (assets/img/galeri/<ad>-640.webp ve -1280.webp)
  kirp     [x, y, genişlik, yükseklik] ya da null; koordinatlar kaynak fotoğrafa göre
  bulanik  bulanıklaştırılacak alanlar: [[x, y, genişlik, yükseklik], ...] (logolar, ekranlar, yüzler); kırpmadan önce uygulanır
  alt      fotoğrafın sesli okuyucular için açıklaması

Çalıştırma (depo kökünden):  python3 -I tools/galeri/galeri.py
Gerekli: ImageMagick 7 (magick). Konum ve fotoğraf makinesi bilgileri (EXIF) çıktıdan silinir.
"""
import html
import json
import subprocess
import sys
from pathlib import Path

KOK = Path(__file__).resolve().parent
SITE = KOK.parents[1] / "public"
CIKTI = SITE / "assets/img/galeri"
SAYFALAR = {"galeri.html": "", "b/galeri.html": "../"}
BASLA, BITIR = "<!-- galeri:basla -->", "<!-- galeri:bitir -->"
BOYUTLAR = (640, 1280)


def magick(*arg):
    return subprocess.run(["magick", *map(str, arg)], check=True, capture_output=True, text=True).stdout


def isle(f):
    girdi = KOK / "kaynak" / f["kaynak"]
    adim = [girdi, "-auto-orient"]
    if f.get("bulanik"):
        # Bulanık kopya, kenarları yumuşatılmış bir maskeyle yalnızca işaretli alanlara bindirilir
        W, H = magick("identify", "-format", "%w %h", girdi).split()
        maske = ["(", "-size", f"{W}x{H}", "xc:black", "-fill", "white"]
        for x, y, w, h in f["bulanik"]:
            maske += ["-draw", f"rectangle {x - 6},{y - 6} {x + w + 6},{y + h + 6}"]
        # -draw maskeye saydamlık kanalı ekler; kapatılmazsa bütün fotoğraf bulanıklaşır
        adim += ["(", "+clone", "-blur", "0x16", ")", *maske, "-alpha", "off", "-blur", "0x7", ")", "-composite"]
    if f.get("kirp"):
        x, y, w, h = f["kirp"]
        adim += ["-crop", f"{w}x{h}+{x}+{y}", "+repage"]
    adim += ["-strip"]
    olcu = {}
    for b in BOYUTLAR:
        hedef = CIKTI / f"{f['ad']}-{b}.webp"
        magick(*adim, "-resize", f"{b}x{b}>" if b > 640 else f"{b}x>", "-quality", "80", hedef)
        olcu[b] = tuple(int(v) for v in magick("identify", "-format", "%w %h", hedef).split())
    return olcu


def kart(f, olcu, onek, sira):
    w, h = olcu[640]
    alt = html.escape(f["alt"], quote=True)
    yol = f"{onek}assets/img/galeri/{f['ad']}"
    return (
        f'          <figure class="gallery__fig" data-reveal style="--d:{(sira % 3) * 0.08:.2f}s">\n'
        f'            <button class="gallery__item" type="button" data-full="{yol}-1280.webp" aria-label="Büyüt: {alt}">\n'
        f'              <img src="{yol}-640.webp" srcset="{yol}-640.webp {olcu[640][0]}w, {yol}-1280.webp {olcu[1280][0]}w"'
        f' sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" width="{w}" height="{h}" alt="{alt}" loading="lazy" decoding="async">\n'
        f'            </button>\n'
        f'          </figure>'
    )


def main():
    liste = json.loads((KOK / "galeri.json").read_text(encoding="utf-8"))
    CIKTI.mkdir(parents=True, exist_ok=True)
    olculer = {f["ad"]: isle(f) for f in liste}
    for f in liste:
        print(f"{f['ad']}: {olculer[f['ad']][1280][0]}x{olculer[f['ad']][1280][1]}")

    beklenen = {f"{f['ad']}-{b}.webp" for f in liste for b in BOYUTLAR}
    for fazla in sorted(p.name for p in CIKTI.glob("*.webp") if p.name not in beklenen):
        print("uyarı: listede olmayan dosya:", fazla, file=sys.stderr)

    for rel, onek in SAYFALAR.items():
        p = SITE / rel
        s = p.read_text(encoding="utf-8")
        assert s.count(BASLA) == 1 and s.count(BITIR) == 1, rel
        once, kalan = s.split(BASLA)
        _, sonra = kalan.split(BITIR)
        kartlar = "\n".join(kart(f, olculer[f["ad"]], onek, i) for i, f in enumerate(liste))
        p.write_text(f"{once}{BASLA}\n{kartlar}\n          {BITIR}{sonra}", encoding="utf-8")
        print("güncellendi:", rel)


if __name__ == "__main__":
    main()
