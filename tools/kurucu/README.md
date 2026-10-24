# Kurucu fotoğrafı

Ana sayfadaki "Kurucumuz" bölümünün fotoğrafı, Ayla Özalp'in seçtiği orijinalden üretilir. Orijinal `kaynak/` klasöründe durur ve depoya girmez.

Kemerli çerçeve 4:5 oranındadır; yüz ortada kalacak şekilde kırpılır, konum bilgileri (EXIF) silinir:

```bash
for w in 900 600; do
  magick tools/kurucu/kaynak/kurucu-kaynak.jpg -auto-orient -crop 909x1136+238+0 +repage -strip \
    -resize "${w}x" -quality 82 "public/assets/img/kurucu-ayla-ozalp-$w.webp"
done
```

Gerekli: ImageMagick 7.
