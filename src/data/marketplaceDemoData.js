// Initial Seed Multi-Seller Offers for canonical products
export const DEFAULT_OFFERS = {
  1: [
    {
      id: 'off-1-1',
      productId: 1,
      sellerSlug: 'atlas-tech-tunis',
      sellerName: 'Atlas Tech',
      sellerCity: 'Tunis',
      sellerRating: 4.8,
      price: 189,
      oldPrice: 239,
      condition: 'Brand New',
      shippingFee: 0,
      deliveryTime: '24–48h courier',
      stock: 18,
      isFeatured: true
    },
    {
      id: 'off-1-2',
      productId: 1,
      sellerSlug: 'daily-essentials-monastir',
      sellerName: 'Daily Essentials',
      sellerCity: 'Monastir',
      sellerRating: 4.6,
      price: 182,
      oldPrice: 220,
      condition: 'New (Open Box)',
      shippingFee: 7,
      deliveryTime: '48–72h courier',
      stock: 5,
      isFeatured: false
    },
    {
      id: 'off-1-3',
      productId: 1,
      sellerSlug: 'nour-beauty-tunis',
      sellerName: 'Nour Beauty',
      sellerCity: 'Tunis',
      sellerRating: 4.9,
      price: 195,
      oldPrice: null,
      condition: 'Brand New · Bundle with pouch',
      shippingFee: 0,
      deliveryTime: 'Same-day Grand Tunis',
      stock: 9,
      isFeatured: false
    }
  ],
  2: [
    {
      id: 'off-2-1',
      productId: 2,
      sellerSlug: 'maison-sousse',
      sellerName: 'Maison & Co',
      sellerCity: 'Sousse',
      sellerRating: 4.7,
      price: 79,
      oldPrice: 99,
      condition: 'Brand New',
      shippingFee: 7,
      deliveryTime: '24–48h courier',
      stock: 12,
      isFeatured: true
    },
    {
      id: 'off-2-2',
      productId: 2,
      sellerSlug: 'paper-trail-tunis',
      sellerName: 'Paper Trail',
      sellerCity: 'Tunis',
      sellerRating: 4.5,
      price: 75,
      oldPrice: null,
      condition: 'Handmade Batch',
      shippingFee: 6,
      deliveryTime: '48h courier',
      stock: 4,
      isFeatured: false
    }
  ],
  3: [
    {
      id: 'off-3-1',
      productId: 3,
      sellerSlug: 'urban-steps-sfax',
      sellerName: 'Urban Steps',
      sellerCity: 'Sfax',
      sellerRating: 4.9,
      price: 229,
      oldPrice: null,
      condition: 'Brand New',
      shippingFee: 0,
      deliveryTime: '24–48h express',
      stock: 22,
      isFeatured: true
    },
    {
      id: 'off-3-2',
      productId: 3,
      sellerSlug: 'active-life-bizerte',
      sellerName: 'Active Life',
      sellerCity: 'Bizerte',
      sellerRating: 4.6,
      price: 219,
      oldPrice: 249,
      condition: 'End of Series',
      shippingFee: 7,
      deliveryTime: '48h courier',
      stock: 3,
      isFeatured: false
    }
  ]
}

// Seed QA
export const DEFAULT_QA = {
  1: [
    {
      id: 'qa-1-1',
      productId: 1,
      author: 'Kais M.',
      date: '2026-10-24',
      question: 'Is this model compatible with both iOS and Android for ANC control?',
      answers: [
        {
          id: 'ans-1-1',
          author: 'Atlas Tech (Official Seller)',
          isSeller: true,
          date: '2026-10-25',
          answer: 'Yes! Bluetooth 5.0 connects seamlessly to both iPhones and Android phones, and the physical noise-cancelling toggle works independently without requiring an app.'
        }
      ]
    },
    {
      id: 'qa-1-2',
      productId: 1,
      author: 'Selim B.',
      date: '2026-10-28',
      question: 'Does the package include a 3.5mm backup audio cable for wired listening?',
      answers: [
        {
          id: 'ans-1-2',
          author: 'Atlas Tech (Official Seller)',
          isSeller: true,
          date: '2026-10-29',
          answer: 'Yes, it comes with a 1.2m gold-plated 3.5mm aux cable and a USB-C charging cord in the travel case.'
        }
      ]
    }
  ],
  2: [
    {
      id: 'qa-2-1',
      productId: 2,
      author: 'Ines K.',
      date: '2026-10-18',
      question: 'Can I use a warm LED filament bulb with this ceramic lamp?',
      answers: [
        {
          id: 'ans-2-1',
          author: 'Maison & Co (Official Seller)',
          isSeller: true,
          date: '2026-10-19',
          answer: 'Absolutely. Any standard E27 bulb up to 40W equivalent works safely.'
        }
      ]
    }
  ]
}

// Seed Promotions
export const DEFAULT_PROMOTIONS = [
  {
    code: 'MARCHY10',
    type: 'percentage',
    value: 10,
    minSpend: 50,
    label: '10% off all orders over 50 TND',
    active: true,
    seller: 'All Marketplace'
  },
  {
    code: 'BIENVENUE',
    type: 'fixed',
    value: 5,
    minSpend: 30,
    label: '5 TND welcome voucher',
    active: true,
    seller: 'All Marketplace'
  },
  {
    code: 'EMERALD15',
    type: 'percentage',
    value: 15,
    minSpend: 100,
    label: '15% Emerald member discount over 100 TND',
    active: true,
    seller: 'All Marketplace'
  }
]

// Seed Notifications
export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Welcome to MARCHY Tunisia',
    message: 'Explore verified independent Tunisian sellers and enjoy Cash on Delivery inspection on every order.',
    time: '2 hours ago',
    type: 'system',
    read: false,
    link: '/'
  },
  {
    id: 'notif-2',
    title: 'Atlas Tech dispatched order #MRCH-7082',
    message: 'Your parcel is in transit with the local courier. Estimated arrival in 24h.',
    time: 'Yesterday',
    type: 'order',
    read: false,
    link: '/orders'
  },
  {
    id: 'notif-3',
    title: 'Emerald Member Perks Activated',
    message: 'Use coupon code EMERALD15 for 15% off cart orders above 100 TND.',
    time: '2 days ago',
    type: 'promo',
    read: true,
    link: '/cart'
  }
]
