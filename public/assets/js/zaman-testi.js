/* Zaman yönetimi testi: puan yalnızca tarayıcıda hesaplanır, hiçbir yere gönderilmez ve kaydedilmez. */
(function () {
  var form = document.getElementById('zaman-testi');
  if (!form) return;
  var sorular = Array.prototype.slice.call(form.querySelectorAll('fieldset[data-katsayi]'));
  var ilerleme = document.getElementById('zt-ilerleme');
  var dugme = form.querySelector('.zt-gonder');
  var uyari = document.getElementById('zt-uyari');
  var sonuc = document.getElementById('zt-sonuc');
  var ARALIKLAR = [
    [0, 17, 'Sizi başkaları mı yönetiyor?', 'Gününüzü büyük ölçüde kesintiler ve başkalarının talepleri belirliyor. Bir hafta boyunca zamanınızın nereye gittiğini yazarak başlayın.'],
    [18, 24, 'Çabalarınız var ancak zaman yönetiminiz yetersiz.', 'Niyetiniz ve planınız var, ama gün içinde dağılıyor. En verimli saatlerinizi önemli işe ayırın ve bu saatleri takviminizde kapatın.'],
    [25, 30, 'Zamanı etkin kullanıyorsunuz. Daha iyi olabilir mi?', 'Temel alışkanlıklarınız yerinde. 0 ya da 1 puan aldığınız bir soruyu seçin; tek bir zaman hırsızını azaltmak bile fark yaratır.'],
    [31, 36, 'Zaman hâkimiyetiniz çok başarılı.', 'Önceliklerinizi koruyor, kesintileri yönetiyorsunuz. Bu düzeni ekibinize nasıl taşıyabileceğinizi düşünün; başkalarının zamanına saygı da zaman yönetiminin parçası.']
  ];

  function secilen(fs) {
    var r = fs.querySelector('input:checked');
    return r ? Number(r.value) : null;
  }

  function guncelle() {
    var n = sorular.filter(function (fs) { return secilen(fs) !== null; }).length;
    ilerleme.textContent = n + ' / ' + sorular.length + ' yanıtlandı';
    if (n === sorular.length) uyari.hidden = true;
  }

  form.addEventListener('change', function (e) {
    var fs = e.target.closest('fieldset');
    if (fs) fs.classList.remove('is-eksik');
    guncelle();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var eksik = sorular.filter(function (fs) { return secilen(fs) === null; });
    sorular.forEach(function (fs) { fs.classList.toggle('is-eksik', eksik.indexOf(fs) > -1); });
    if (eksik.length) {
      uyari.hidden = false;
      uyari.textContent = eksik.length === 1 ? 'Bir soru yanıtsız kaldı.' : eksik.length + ' soru yanıtsız kaldı.';
      eksik[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      eksik[0].querySelector('input').focus({ preventScroll: true });
      return;
    }
    var toplam = 0;
    var hirsizlar = sorular.map(function (fs, i) {
      var v = secilen(fs);
      var k = Number(fs.getAttribute('data-katsayi'));
      toplam += v * k;
      return { i: i, v: v, k: k, ad: fs.getAttribute('data-hirsiz') };
    }).filter(function (h) { return h.v < 3; })
      .sort(function (a, b) { return a.v - b.v || b.k - a.k || a.i - b.i; })
      .slice(0, 3);
    var aralik = ARALIKLAR.filter(function (a) { return toplam >= a[0] && toplam <= a[1]; })[0];
    sonuc.querySelector('.zt-puan__deger').textContent = toplam;
    sonuc.querySelector('.zt-baslik').textContent = aralik[2];
    sonuc.querySelector('.zt-yorum').textContent = aralik[3];
    var liste = sonuc.querySelector('.zt-hirsizlar');
    liste.innerHTML = '';
    if (hirsizlar.length) {
      hirsizlar.forEach(function (h) {
        var li = document.createElement('li');
        li.textContent = h.ad;
        liste.appendChild(li);
      });
      sonuc.querySelector('.zt-hirsiz-baslik').textContent = hirsizlar.length === 1 ? 'Zamanınızı en çok çalan şey' : 'Zamanınızı en çok çalan ' + (hirsizlar.length === 2 ? 'iki' : 'üç') + ' şey';
    } else {
      sonuc.querySelector('.zt-hirsiz-baslik').textContent = 'Belirgin bir zaman hırsızınız görünmüyor.';
    }
    sonuc.hidden = false;
    form.classList.add('is-bitti');
    sonuc.scrollIntoView({ behavior: 'smooth', block: 'start' });
    sonuc.focus({ preventScroll: true });
  });

  document.getElementById('zt-yeniden').addEventListener('click', function () {
    form.reset();
    sonuc.hidden = true;
    form.classList.remove('is-bitti');
    sorular.forEach(function (fs) { fs.classList.remove('is-eksik'); });
    guncelle();
    sorular[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  guncelle();
})();
