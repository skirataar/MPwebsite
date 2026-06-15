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

export function toggleLikeProduct(productId: number | string): boolean {
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
  return liked;
}

export function isProductLiked(productId: number | string): boolean {
  const likes = getLikes();
  return likes.includes(productId);
}
