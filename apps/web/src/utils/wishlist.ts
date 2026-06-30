export function getWishlist(): (number | string)[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("v-market-wishlist");
    if (data === null) {
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveWishlist(wishlist: (number | string)[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("v-market-wishlist", JSON.stringify(wishlist));
    window.dispatchEvent(new Event("wishlist-updated"));
  } catch {}
}

export async function toggleWishlistProduct(productId: number | string): Promise<boolean> {
  const wishlist = getWishlist();
  const index = wishlist.indexOf(productId);
  let wishlisted = false;
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
    wishlisted = true;
  }
  saveWishlist(wishlist);

  // If logged in, sync with server
  if (typeof window !== "undefined" && localStorage.getItem("v-market-logged-in") === "true") {
    try {
      const res = await fetch(`/api/products/${productId}/wishlist`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        wishlisted = data.wishlisted;
        // Adjust client wishlist array based on server response to resolve mismatch
        const currentWishlist = getWishlist();
        const idx = currentWishlist.indexOf(productId);
        if (wishlisted && idx === -1) {
          currentWishlist.push(productId);
        } else if (!wishlisted && idx > -1) {
          currentWishlist.splice(idx, 1);
        }
        saveWishlist(currentWishlist);
      }
    } catch (err) {
      console.error("Failed to sync wishlist toggle with backend:", err);
    }
  }

  return wishlisted;
}

export function isProductInWishlist(productId: number | string): boolean {
  const wishlist = getWishlist();
  return wishlist.includes(productId);
}

export async function syncWishlistWithDatabase() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("v-market-logged-in") !== "true") return;

  try {
    const res = await fetch("/api/user/wishlist");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.wishlist)) {
        saveWishlist(data.wishlist);
      }
    }
  } catch (err) {
    console.error("Failed to sync wishlist with database:", err);
  }
}
