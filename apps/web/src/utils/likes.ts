export function getLikes(): (number | string)[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("v-market-likes");
    if (data === null) {
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveLikes(likes: (number | string)[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("v-market-likes", JSON.stringify(likes));
    window.dispatchEvent(new Event("likes-updated"));
  } catch {}
}

export async function toggleLikeProduct(productId: number | string): Promise<boolean> {
  const likes = getLikes();
  const index = likes.indexOf(productId);
  let liked = false;
  if (index > -1) {
    likes.splice(index, 1);
  } else {
    likes.push(productId);
    liked = true;
  }
  saveLikes(likes);

  // If logged in, sync with server
  if (typeof window !== "undefined" && localStorage.getItem("v-market-logged-in") === "true") {
    try {
      const res = await fetch(`/api/products/${productId}/like`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        liked = data.liked;
        // Adjust client likes array based on server response to resolve mismatch
        const currentLikes = getLikes();
        const idx = currentLikes.indexOf(productId);
        if (liked && idx === -1) {
          currentLikes.push(productId);
        } else if (!liked && idx > -1) {
          currentLikes.splice(idx, 1);
        }
        saveLikes(currentLikes);
      }
    } catch (err) {
      console.error("Failed to sync like toggle with backend:", err);
    }
  }

  return liked;
}

export function isProductLiked(productId: number | string): boolean {
  const likes = getLikes();
  return likes.includes(productId);
}

export async function syncLikesWithDatabase() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("v-market-logged-in") !== "true") return;

  try {
    const res = await fetch("/api/user/likes");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.likes)) {
        saveLikes(data.likes);
      }
    }
  } catch (err) {
    console.error("Failed to sync likes with database:", err);
  }
}
