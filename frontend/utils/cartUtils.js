// Cart utility functions for managing shopping cart in localStorage

export const getCart = () => {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('shoppingCart');
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.ItemID === product.ItemID);
  
  if (existingItem) {
    existingItem.quantity += quantity;
    // Don't exceed available stock
    if (existingItem.quantity > product.Quantity) {
      existingItem.quantity = product.Quantity;
    }
  } else {
    cart.push({
      ...product,
      quantity: Math.min(quantity, product.Quantity)
    });
  }
  
  saveCart(cart);
  return cart;
};

export const removeFromCart = (itemId) => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.ItemID !== itemId);
  saveCart(updatedCart);
  return updatedCart;
};

export const updateCartItemQuantity = (itemId, quantity) => {
  const cart = getCart();
  const item = cart.find(item => item.ItemID === itemId);
  
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
  
  return cart;
};

export const clearCart = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('shoppingCart');
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => {
    return total + (parseFloat(item.UnitPrice || 0) * item.quantity);
  }, 0);
};

export const getCartItemCount = () => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};
