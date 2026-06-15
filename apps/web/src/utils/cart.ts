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

const INITIAL_MOCK_CART: CartItem[] = [
  {
    id: "item-1",
    title: "Handwoven Linen Shirt - Beige",
    shop: "Vastra Studio",
    price: 1299,
    quantity: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPLIewEDhsvv5_jFWvXLf7mm-bSIupmyNhzN8YoOoswWRvcstrlgvMzE687Xyz1BmoE-EYzXKLDP1vfdgnnITWarM6hrgjmPv58HGnaE-Lv01MkpH9kY6RSLoIID2Ho30BUWg6-qhG0GuMf6xzsCeRqtIY13DDELOkWghu0tvN6Fo_XjLkeh9qpO1_0EeuCoNE3ZlO2Toh3JuoQvWJ-mBnCrmhJ1Zc1lSlKHZ6UJ7qjN4lNDgLvYTHB7LzGawqQJ-YBgj5wX8tr97Y",
    dataAlt: "A close-up studio shot of a hand-woven linen shirt in a natural beige tone, neatly folded. Diffused light."
  },
  {
    id: "item-2",
    title: "Ceramic Matcha Bowl",
    shop: "Earthy Wares",
    price: 850,
    quantity: 2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiGh5DMo5IVNRV0Y4MSs09z8ROt9c44LrJnLlV3Sah9YbI1U0AWRMArYY8NPdDEK5TxTy-CwQbPNe_w7LYqWVZQwcPrdIsZZy7VdFFr7aZUEPrA2qxRXKq2FArBAF6f7oVF2LjCblpC9FhNdJ3NEbJTNxg1-I6jRjrfNMCfj87mB-Lk5mBQPXuGmsZujXNebdmSFtfnkWJneMcuRFUECbdkGLaFMCXBt4gDAN5vdhPeBfQFpSERiChJ6267QJnZP0ttKdrCDAcQK7X",
    dataAlt: "A premium minimalist shot of a handcrafted ceramic matcha bowl with sage green matte glaze finish."
  }
];

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("v-market-cart");
    if (data === null) {
      // Initialize with mock items on first visit
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
