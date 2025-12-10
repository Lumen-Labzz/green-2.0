// script.js
document.addEventListener('DOMContentLoaded', () => {
  const addBtns = document.querySelectorAll('.add-to-cart');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartTotalInput = document.getElementById('cartTotalInput');
  const selectedProductsEl = document.getElementById('selectedProducts');
  const emptyCartMsg = document.querySelector('.empty-cart');
  const yearEl = document.getElementById('year');

  // simple cart structure: { "Product Name": quantity, ... }
  const cart = {};

  // set year
  yearEl.textContent = new Date().getFullYear();

  function formatKsh(n){
    return 'KSh ' + Number(n).toLocaleString();
  }

  function renderCart(){
    // clear
    cartItemsEl.innerHTML = '';
    const keys = Object.keys(cart);
    if(keys.length === 0){
      cartItemsEl.innerHTML = '<p class="empty-cart">Cart is empty. Add items from Products.</p>';
      cartTotalEl.textContent = formatKsh(0);
      cartTotalInput.value = 0;
      selectedProductsEl.value = '';
      return;
    }

    let total = 0;
    const fragment = document.createDocumentFragment();

    keys.forEach(name => {
      const item = cart[name]; // { qty, price }
      const row = document.createElement('div');
      row.className = 'cart-row';

      const left = document.createElement('div');
      left.innerHTML = `<div class="name">${name}</div><div class="small">${item.qty} x ${formatKsh(item.price)}</div>`;

      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.gap = '8px';
      right.style.alignItems = 'center';

      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.min = 0;
      qtyInput.value = item.qty;
      qtyInput.style.width = '64px';
      qtyInput.className = 'qty';

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn';
      removeBtn.textContent = 'Remove';

      right.appendChild(qtyInput);
      right.appendChild(removeBtn);

      row.appendChild(left);
      row.appendChild(right);
      fragment.appendChild(row);

      // events
      qtyInput.addEventListener('change', (e) => {
        const v = Math.max(0, parseInt(e.target.value) || 0);
        if(v === 0){
          delete cart[name];
        } else {
          cart[name].qty = v;
        }
        renderCart();
      });

      removeBtn.addEventListener('click', () => {
        delete cart[name];
        renderCart();
      });

      total += item.qty * item.price;
    });

    cartItemsEl.appendChild(fragment);
    cartTotalEl.textContent = formatKsh(total);
    cartTotalInput.value = total;

    // fill selected products textarea
    const lines = keys.map(name => {
      const it = cart[name];
      return `${name} — qty: ${it.qty} — unit: KSh ${it.price} — subtotal: KSh ${it.qty * it.price}`;
    });
    selectedProductsEl.value = lines.join('\n');
  }

  // attach add-to-cart buttons
  addBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const name = card.dataset.name || card.querySelector('h3').innerText;
      const price = Number(card.dataset.price || 0);
      const qtyInput = card.querySelector('.qty');
      const qty = Math.max(0, parseInt(qtyInput.value || 0));

      if(qty <= 0){
        // small UX: if qty is zero, bump it to 1
        // but user wanted 0, so we show a quick alert-like style
        qtyInput.value = 1;
        addToCart(name, price, 1);
      } else {
        addToCart(name, price, qty);
      }

      // reset qty input to 0 after adding
      qtyInput.value = 0;
    });
  });

  function addToCart(name, price, qty){
    if(!cart[name]) cart[name] = { price, qty: 0 };
    cart[name].qty += qty;
    renderCart();
  }

  // When the order form is submitted, ensure hidden/textarea are up to date
  const orderForm = document.getElementById('orderForm');
  orderForm.addEventListener('submit', (e) => {
    // ensure we have something in cart
    if(Object.keys(cart).length === 0){
      e.preventDefault();
      alert('Your cart is empty — please add items before submitting an order.');
      return;
    }
    // selectedProductsEl and cartTotalInput already updated by renderCart
    // encode to avoid weird characters (Formspree will decode)
    // no extra action required; let the form post to Formspree
  });

  // initial render if needed
  renderCart();
});
