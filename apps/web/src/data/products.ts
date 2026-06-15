export interface Product {
  id: number | string;
  title: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  seller: string;
  username: string;
  location: string;
  likes: number;
  avatar: string;
  videoBg: string;
  videoUrl?: string;
  productThumb: string;
  dataAlt: string;
  
  // Detail page specifics
  stockLeft?: number;
  rating?: number;
  reviewsCount?: number;
  viewsCount?: string;
  deliveryDate?: string;
  returnPolicy?: string;
  returnPolicyDesc?: string;
  freeDelivery?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: 0,
    title: "Organic Cotton Throw",
    category: "home-decor",
    description: "Hand-loomed organic cotton throw. Perfect for cozy evenings. Limited stock available from our latest batch.",
    price: 2499,
    originalPrice: 3499,
    discount: "28% OFF",
    seller: "Artisan Threads",
    username: "@ArtisanThreads",
    location: "Kerala, India",
    likes: 1200,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsbXPxGIJG5JIJtA1ZX7RJz2dAFV7kkwFJSimqHHEPFCyU2LE0nOsdbE7lDoQgFjy4XAu0kRG700X0E05pQ9DoT_6WG1pGklhfoe0BS6OULGd1GlOOuKrmTkafMCqJ_c7IeVAetvao_Mqobktj8I7TZ0nwzNwxPS00-ENflG_l8BCwR0RPcw9RTo2R8X3iF1efpEAOaLHLdbEpfLu8nP6sFOpCYH7CD_ZL59gLtsGk4n8wDQ_RQvGYX1Dk193Y-atoBBeonPwTXIF6",
    videoBg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwb_xHRjb0aQTDbRLAS2av8GgVZKmDFhXj19dloFD7On4gdrFSTaHt5P60piRfi3G85fWZxVlP-B9oFSjny7UCgZ1atqwCGbGz_WdP_8jjkbY1e2Z6HhVpW25CoSMhg9S0-zIg8tK9ruOBPO5_xK0UKWmeJ35kVMJMSPom_40Mz0XGomWvdi1RBOuAPgJ8Vh4xFM8kipOgN-a21MsjowoKnXLKpVIE4mD-Oi1OuN_1KKgIcVpSazQMehFVz4zxKB8htq7TkdmXstsh",
    productThumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXpDM-4AY5Rnz3IKeYtmhRLtS74oqkq5jyt4D_xhgXg7LyEsa95d0HDqz46nbdndRtF4mZJowoKYxsp8YuZw5WmUiAOTQXbM38eoJfOBb3Jq1BvNXQQhpy33XLuahOvTi7uQwxqrt8GJDJ3TdyK0zjgo7vLJ3zQDBjZJZ_qbT0zvrebR3T3sw9EUqwF_GDtTOa7Vwp6LryVJPmeX6gvz0pvrmEx7nxpPZHTy3KvDEmtlnhV6pwyODpflzL67OcLWJCrh0Ztr44pJnL",
    dataAlt: "A high-quality, vertically oriented video still showing a beautifully hand-woven textile in rich earthy tones. Draped over wood frames.",
    stockLeft: 12,
    rating: 4.8,
    reviewsCount: 85,
    viewsCount: "3,120 views",
    deliveryDate: "Oct 24 - 26",
    returnPolicy: "7 Days Return Policy",
    returnPolicyDesc: "No questions asked returns on undamaged items.",
    freeDelivery: true
  },
  {
    id: 1,
    title: "Hand-thrown Ceramic Breakfast Bowl",
    category: "handmade",
    description: "Beautifully crafted ceramic breakfast bowl. Hand-thrown by master potters using local organic clay and lead-free glazes.",
    price: 1200,
    originalPrice: 1600,
    discount: "25% OFF",
    seller: "Studio Earth",
    username: "@StudioEarth",
    location: "Puducherry, India",
    likes: 845,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    videoBg: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3fuGRbIJWE_Xw_-QGxSkObMts6gXq_tQCEatfJ3GAH4n-LzWpdYfUkFeiYIgyiNqeAxvtONdgP_O8eGfoayxqFr_V9_AQ6mbs0sNNX3UG-DOHkQLKBsTM49F-XVu3fACsaOEqttQM1bC7VBXKQNANwKRwUOE_Jtnk_fEzuev821yrCpNa_SjsJUHGmCnq_KXECZzYmBYzNyhcqgPvNkKjcqBCjCVRam8GIq5vUXU_Jp9icO0lkeG7j17mCRHYuBs9XK5XP0fMmEMa",
    productThumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3fuGRbIJWE_Xw_-QGxSkObMts6gXq_tQCEatfJ3GAH4n-LzWpdYfUkFeiYIgyiNqeAxvtONdgP_O8eGfoayxqFr_V9_AQ6mbs0sNNX3UG-DOHkQLKBsTM49F-XVu3fACsaOEqttQM1bC7VBXKQNANwKRwUOE_Jtnk_fEzuev821yrCpNa_SjsJUHGmCnq_KXECZzYmBYzNyhcqgPvNkKjcqBCjCVRam8GIq5vUXU_Jp9icO0lkeG7j17mCRHYuBs9XK5XP0fMmEMa",
    dataAlt: "A beautifully crafted ceramic bowl on a wooden table. Earthy textures of the pottery, hand-thrown craft.",
    stockLeft: 8,
    rating: 4.7,
    reviewsCount: 64,
    viewsCount: "2,410 views",
    deliveryDate: "Oct 24 - 26",
    returnPolicy: "7 Days Return Policy",
    returnPolicyDesc: "No questions asked returns on undamaged items.",
    freeDelivery: true
  },
  {
    id: 2,
    title: "Minimalist Sterling Silver Ring",
    category: "fashion",
    description: "Elegant 92.5 sterling silver band with a polished natural stone layout. Designed and finished in traditional silver workshops.",
    price: 899,
    originalPrice: 1199,
    discount: "25% OFF",
    seller: "Silver Lining",
    username: "@SilverLining",
    location: "Jaipur, India",
    likes: 2150,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    videoBg: "https://lh3.googleusercontent.com/aida-public/AB6AXuChZ8WmjOsSSDReGE9XJVAZd4s3B89kFVcbY7sAp0joabSVbR1vOQa83H2u1CwYt4axHOMylOFTeAdT1WDOwFJDkUAKYRBEaCdv0Blvbumz8iaZ217RDfwZU3mTKvr0vL6vzA257ClIyLKXSq_g0PSdv_wsHvh0s4l_NbeynTDUzmwHpm-KkOCbNVxOz_Jf33t3IyQnMO5S7GrA9U0rmuMfBSxiEqn8cAxiIXRQJwPMhn4cOPtUDMsZIchckBg4IZL2K0rw56-JUTNf",
    productThumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuChZ8WmjOsSSDReGE9XJVAZd4s3B89kFVcbY7sAp0joabSVbR1vOQa83H2u1CwYt4axHOMylOFTeAdT1WDOwFJDkUAKYRBEaCdv0Blvbumz8iaZ217RDfwZU3mTKvr0vL6vzA257ClIyLKXSq_g0PSdv_wsHvh0s4l_NbeynTDUzmwHpm-KkOCbNVxOz_Jf33t3IyQnMO5S7GrA9U0rmuMfBSxiEqn8cAxiIXRQJwPMhn4cOPtUDMsZIchckBg4IZL2K0rw56-JUTNf",
    dataAlt: "A minimalist silver ring resting on a smooth grey stone. Bright natural lighting emphasizing fine silver work.",
    stockLeft: 5,
    rating: 4.9,
    reviewsCount: 142,
    viewsCount: "5,890 views",
    deliveryDate: "Oct 24 - 26",
    returnPolicy: "7 Days Return Policy",
    returnPolicyDesc: "No questions asked returns on undamaged items.",
    freeDelivery: true
  },
  {
    id: 3,
    title: "Handcrafted Ceramic Vase - Forest Green Glaze",
    category: "handmade",
    description: "Elevate your living space with this meticulously handcrafted ceramic vase. Thrown on a traditional potter's wheel, each piece features a unique, organic shape and is finished with our signature Forest Green glaze that subtly shifts in different lighting. Perfect for minimalist dried arrangements or as a standalone sculptural piece.",
    price: 1299,
    originalPrice: 1899,
    discount: "32% OFF",
    seller: "Studio Maati",
    username: "@StudioMaati",
    location: "Rajasthan, India",
    likes: 2840,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXl0sRIY7-1Pl_jqkcJo13bD5EUPsI3aT0f08wUTNT1yPD7vzQs5LEDuaTr7eCV5L67ptppe-Jr1eFFUYTOBzMGTHCOAtxpoxnhzGXLjO9KKgxyXy-okqRunQW2-YJM7CeziS1jVUxRRovMfs3S-c4ynCQK-_AWzQDQz4jKOh8sGvqseUbQ2bHlINCyQyYFhOznoboCqP6TMbsObRK5DO0kKXazzLDIMUIpr8pj3QQQjfF6EWtK0oO2jEVGoX6I9oL4JYkMUaSJS-h",
    videoBg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtWdmzdrg47tfq6PPIZ1Pfu1H_5qxBphfnedlWG254uMR51zLSLod7SE46upmLyplZwzA5OLxbplSzb4aAc6As5OUaKyQmA15kDt_KMisLH4GLO6HZIXZDvuJffWquUsPi9P-RmS1YLe8iigkLgCc_1NKhQKWob-wKWMMdaFRQa7FjKiF9nrPYZFxpIYRsH1FkdDpxHSRE5oxRw2xlc_d2UMr2u2wgYziEuFedgOhl-3SnB_SHkjRFK6IyTdueaZgINQWqhItKersr",
    productThumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtWdmzdrg47tfq6PPIZ1Pfu1H_5qxBphfnedlWG254uMR51zLSLod7SE46upmLyplZwzA5OLxbplSzb4aAc6As5OUaKyQmA15kDt_KMisLH4GLO6HZIXZDvuJffWquUsPi9P-RmS1YLe8iigkLgCc_1NKhQKWob-wKWMMdaFRQa7FjKiF9nrPYZFxpIYRsH1FkdDpxHSRE5oxRw2xlc_d2UMr2u2wgYziEuFedgOhl-3SnB_SHkjRFK6IyTdueaZgINQWqhItKersr",
    dataAlt: "A high-quality, beautifully lit, slow-motion product showcase video thumbnail. The product, a meticulously handcrafted ceramic vase with a subtle, earthy green glaze, is centered on a minimalist light-oak surface against a soft, bright white background. The lighting is soft and directional, highlighting the texture of the clay and creating gentle, elegant shadows.",
    stockLeft: 4,
    rating: 4.9,
    reviewsCount: 120,
    viewsCount: "4,210 views",
    deliveryDate: "Oct 24 - 26",
    returnPolicy: "7 Days Return Policy",
    returnPolicyDesc: "No questions asked returns on undamaged items.",
    freeDelivery: true
  }
];
