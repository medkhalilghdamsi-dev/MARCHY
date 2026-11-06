    // If no explicit multi-offers, create a default offer from the product itself
    if (offers.length === 0) {
      const prod = this.getProductById(numId)
      if (prod) {
        return [{
          id: `off-default-${numId}`,
          productId: numId,
          sellerSlug: 'atlas-tech-tunis',
          sellerName: prod.seller || 'Atlas Tech',
          sellerCity: 'Tunis',
          sellerRating: prod.rating || 4.7,
          price: prod.price,
          oldPrice: prod.oldPrice || null,
          condition: 'Brand New',
          shippingFee: 0,
          deliveryTime: '24–48h courier',
          stock: inventory[`atlas-tech-tunis-${numId}`] ?? 15,
          isFeatured: true
        }]
      }
    }
    return offers.map(offer => ({
      ...offer,
      stock: inventory[`${offer.sellerSlug}-${numId}`] ?? offer.stock
    }))
  },

  addSellerOffer(offer) {
    const stored = readJson(OFFERS_KEY, DEFAULT_OFFERS)
    const pId = Number(offer.productId)
    const list = stored[pId] || []
    const updated = {
      ...stored,
      [pId]: [offer, ...list.filter(o => o.sellerSlug !== offer.sellerSlug)]
    }