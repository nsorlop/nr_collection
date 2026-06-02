/* =============================================
   NR COLLECTION — cart.js
   Carrito con localStorage + sidebar + WhatsApp
   ============================================= */

const WHATSAPP_NUMBER = "34644219118"; // ← Cambia por tu número real

let cart = JSON.parse(localStorage.getItem('nr_cart')) || [];

/* ---------- Persistencia ---------- */
function saveCart() {
  localStorage.setItem('nr_cart', JSON.stringify(cart));
}

/* ---------- Añadir al carrito ---------- */
function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
  flyAnimation(id);
}

/* ---------- Cambiar cantidad ---------- */
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

/* ---------- Calcular total ---------- */
function cartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

/* ---------- Renderizar sidebar ---------- */
function renderCart() {
  // Contador header (todas las páginas)
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = cart.reduce((s, i) => s + i.qty, 0);
  });

  const container = document.getElementById('cart-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-msg">
        <div class="empty-icon">🛍️</div>
        <p>Tu cesta está vacía</p>
      </div>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img"
             src="${item.img || './placeholder.jpg'}"
             alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="item-size">${item.price.toFixed(2)} € / lote</div>
          <div class="qty-controls">
            <button onclick="changeQty('${item.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-price">${(item.price * item.qty).toFixed(2)} €</div>
      </div>
    `).join('');
  }

  const totalEl = document.getElementById('cart-total-amount');
  if (totalEl) totalEl.textContent = cartTotal().toFixed(2) + ' €';
}

/* ---------- Abrir / Cerrar sidebar ---------- */
function openCart() {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('show');
}
function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('show');
}
function toggleCart() {
  const open = document.getElementById('cart-sidebar')?.classList.contains('open');
  open ? closeCart() : openCart();
}

/* ---------- Menú móvil ---------- */
function toggleMobileMenu() {
  const nav  = document.getElementById('nav-links');
  const ham  = document.getElementById('hamburger');
  const open = nav?.classList.contains('open');
  nav?.classList.toggle('open', !open);
  ham?.classList.toggle('open', !open);
}

/* ---------- Animación "volar al carrito" ---------- */
function flyAnimation(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  const cartBtn = document.querySelector('.cart-btn');
  if (!card || !cartBtn) return;

  const img = card.querySelector('img');
  if (!img) return;

  const src = img.src;
  const btnRect  = card.querySelector('.btn-add-cart')?.getBoundingClientRect() || card.getBoundingClientRect();
  const cartRect = cartBtn.getBoundingClientRect();

  const fly = document.createElement('img');
  fly.src = src;
  Object.assign(fly.style, {
    position: 'fixed',
    left: `${btnRect.left + btnRect.width / 2}px`,
    top:  `${btnRect.top  + btnRect.height / 2}px`,
    width: '56px', height: '56px',
    borderRadius: '50%',
    objectFit: 'cover',
    zIndex: '9999',
    pointerEvents: 'none',
    transition: 'all .75s cubic-bezier(.25,1,.5,1)',
    transform: 'translate(-50%,-50%)',
    boxShadow: '0 4px 14px rgba(0,0,0,.25)',
  });
  document.body.appendChild(fly);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    Object.assign(fly.style, {
      left: `${cartRect.left + cartRect.width / 2}px`,
      top:  `${cartRect.top  + cartRect.height / 2}px`,
      width: '12px', height: '12px',
      opacity: '.15',
    });
  }));

  setTimeout(() => {
    fly.remove();
    cartBtn.classList.remove('cart-bounce');
    void cartBtn.offsetWidth;
    cartBtn.classList.add('cart-bounce');
  }, 760);
}

/* ---------- Enviar por WhatsApp ---------- */
function sendToWhatsApp() {
  if (cart.length === 0) {
    alert('Añade algún lote a la cesta primero.');
    return;
  }

  const lines = cart.map(i =>
    `▪️ ${i.qty}x ${i.name}%0A   └ ${(i.price * i.qty).toFixed(2)} €`
  ).join('%0A');

  const total = cartTotal().toFixed(2);

  const msg =
    `Hola! Me gustaría realizar el siguiente pedido en NR Collection 🛍️%0A%0A` +
    `${lines}%0A%0A` +
    `💰 *Total: ${total} €*%0A` +
    `🚚 Envío gratis a toda España (a vuestra cuenta)%0A%0A` +
    `¿Podríais confirmarme disponibilidad y los datos para el envío? Pagaré por Bizum o transferencia. ¡Muchas gracias! 😊`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

/* ---------- Botón flotante de WhatsApp ---------- */
function injectWhatsAppButton() {
  if (document.querySelector('.wa-float')) return;
  const wa = document.createElement('a');
  wa.className = 'wa-float';
  wa.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  wa.target = '_blank';
  wa.rel = 'noopener';
  wa.setAttribute('aria-label', 'Escríbenos por WhatsApp');
  wa.textContent = '💬';
  document.body.appendChild(wa);
}

/* ---------- Aviso de envío gratis en el carrito ---------- */
function injectShippingNote() {
  const footer = document.querySelector('.cart-footer');
  if (!footer || footer.querySelector('.cart-shipping-note')) return;
  const note = document.createElement('div');
  note.className = 'cart-shipping-note';
  note.textContent = '🚚 Envío gratis a toda España, a nuestra cuenta';
  footer.insertBefore(note, footer.firstChild);
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  injectWhatsAppButton();
  injectShippingNote();

  // Cerrar carrito al hacer clic en overlay
  document.getElementById('cart-overlay')?.addEventListener('click', () => {
    closeCart();
    document.getElementById('nav-links')?.classList.remove('open');
    document.getElementById('hamburger')?.classList.remove('open');
  });
});
