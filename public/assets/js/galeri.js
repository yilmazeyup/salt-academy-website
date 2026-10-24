/* SALT galeri: fotoğrafa tıklanınca büyük görünüm. Ok tuşları, Esc ve parmakla kaydırma ile gezilir.
   Manaliza Agency, Ekim 2026. Tarayıcı <dialog> desteklemezse fotoğraflar küçük hâlleriyle kalır. */
(function () {
  'use strict';
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var box = document.querySelector('.lightbox');
  if (!items.length || !box || typeof box.showModal !== 'function') return;

  var img = box.querySelector('.lightbox__img');
  var count = box.querySelector('.lightbox__count');
  var alt = box.querySelector('.lightbox__alt');
  var current = 0;
  var opener = null;
  if (items.length < 2) box.classList.add('lightbox--single');

  function show(i) {
    current = (i + items.length) % items.length;
    var item = items[current];
    var thumb = item.querySelector('img');
    img.src = item.getAttribute('data-full');
    img.alt = thumb.alt;
    alt.textContent = thumb.alt;
    count.textContent = (current + 1) + ' / ' + items.length;
    /* Sıradaki fotoğraf önceden yüklenir; geçiş beklemesiz olur. */
    new Image().src = items[(current + 1) % items.length].getAttribute('data-full');
  }

  items.forEach(function (b, i) {
    b.addEventListener('click', function () {
      opener = b;
      show(i);
      box.showModal();
      document.documentElement.classList.add('has-lightbox');
    });
  });

  box.addEventListener('close', function () {
    document.documentElement.classList.remove('has-lightbox');
    img.removeAttribute('src');
    if (opener) opener.focus();
  });
  box.querySelector('.lightbox__close').addEventListener('click', function () { box.close(); });
  box.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
  });

  /* Parmakla sola/sağa kaydırma; boş alana dokunmak pencereyi kapatır. */
  var x0 = null;
  var swiped = false;
  box.addEventListener('pointerdown', function (e) { x0 = e.clientX; swiped = false; });
  box.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50 && items.length > 1) { swiped = true; show(current + (dx < 0 ? 1 : -1)); }
  });
  box.addEventListener('click', function (e) {
    if (swiped) { swiped = false; return; }
    if (e.target === box || e.target.classList.contains('lightbox__figure')) box.close();
  });
})();
