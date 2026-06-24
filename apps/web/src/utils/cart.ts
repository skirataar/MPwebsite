import { Product } from "../data/products";

export interface CartItem {
  id: string;
  title: string;
  shop: string;
  price: number;
  quantity: number;
  image: string;
  dataAlt: string;
}

// Emptied mock cart items to ensure cart is empty by default before login
const INITIAL_MOCK_CART: CartItem[] = [];

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("v-market-cart");
    if (data === null) {
      localStorage.setItem("v-market-cart", JSON.stringify(INITIAL_MOCK_CART));
      return INITIAL_MOCK_CART;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("v-market-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));

    // Sync in background to database if logged in
    if (localStorage.getItem("v-market-logged-in") === "true") {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      }).catch((err) => console.error("[cart sync] Failed to sync cart in background:", err));
    }
  } catch {}
}

export function addToCart(product: Product) {
  const cart = getCart();
  const idStr = String(product.id);
  const existingIndex = cart.findIndex((item) => item.id === idStr);
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: idStr,
      title: product.title,
      shop: product.seller,
      price: product.price,
      quantity: 1,
      image: product.productThumb,
      dataAlt: product.dataAlt,
    });
  }
  saveCart(cart);
}

export function updateCartItemQuantity(id: string, delta: number) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.id === id);
  if (index > -1) {
    const newQty = cart[index].quantity + delta;
    cart[index].quantity = newQty < 1 ? 1 : newQty;
    saveCart(cart);
  }
}

export function removeFromCart(id: string) {
  const cart = getCart();
  const filtered = cart.filter((item) => item.id !== id);
  saveCart(filtered);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

// Sync the local cart with database on mount or login
export async function syncCartWithDatabase() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("v-market-logged-in") !== "true") return;
  try {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      if (data.cart) {
        localStorage.setItem("v-market-cart", JSON.stringify(data.cart));
        window.dispatchEvent(new Event("cart-updated"));
      }
    }
  } catch (err) {
    console.error("[cart sync] Failed to fetch database cart:", err);
  }
}
