const products = [

  {
    name: "Snake Bracelet",
    category: "Jewelry",
    description: "An emerald-green enamel snake charm bracelet with celestial details — the jewelry pick of this edit.",
    price: 22.00,
    image: "https://cdn.shopify.com/s/files/1/0986/0290/files/snake-bracelet-enamel-charm-bracelet-unclasped.jpg?v=1779918771",
    url: "https://yellowowlworkshop.com/products/snake-bracelet"
  },

  {
    name: "Avocado Toast Earrings",
    category: "Jewelry",
    description: "Bright avocado-green enamel earrings — a playful, wearable dose of jewel tone.",
    price: 24.00,
    image: "https://cdn.shopify.com/s/files/1/0986/0290/files/avocado-toast-earrings-mismatched-cloisonne-stud-earrings.jpg?v=1780440057",
    url: "https://yellowowlworkshop.com/products/avocado-toast-earrings"
  },

  {
    name: "Cactus Sunset Earrings",
    category: "Jewelry",
    description: "Deep and light green cactus studs against a warm sunset backdrop, in mismatched enamel.",
    price: 24.00,
    image: "https://cdn.shopify.com/s/files/1/0986/0290/files/j251-cactus-sunset-post-gold-earrings-white-background.jpg?v=1788293931",
    url: "https://yellowowlworkshop.com/products/cactus-sunset-earrings"
  },

  {
    name: "Radish & Artichoke Earrings",
    category: "Jewelry",
    description: "A mismatched pair in rich artichoke green, with just a touch of radish red.",
    price: 24.00,
    image: "https://cdn.shopify.com/s/files/1/0986/0290/files/j262-radish-and-artichoke-post-gold-earrings-white-background.jpg?v=1785794613",
    url: "https://yellowowlworkshop.com/products/radish-artichoke-earrings"
  },

  {
    name: "Color Wheel Crew Socks",
    category: "Apparel",
    description: "Crew socks printed with a full color wheel — a fun, colorful pick for anyone who loves color.",
    price: 12.95,
    image: "https://yellowowlworkshop.com/cdn/shop/files/color-wheel-socks-small-crew-socks_2048x.jpg",
    url: "https://yellowowlworkshop.com/products/color-wheel-crew-socks-womens"
  },

  {
    name: "\"You Grow Girl\" Smiley Face Plant Risograph Card",
    category: "Cards & Paper",
    description: "A cheerful risograph greeting card with a smiley-face plant, printed in bright, saturated color.",
    price: 5.95,
    image: "https://yellowowlworkshop.com/cdn/shop/products/yow-you-grow-girl-birthday-risograph-card_2048x.jpg",
    url: "https://yellowowlworkshop.com/products/hbd-you-grow-girl-smiley-face-plant-risograph-card"
  },

  {
    name: "End Bits Linen Shower Curtain, Rose",
    category: "Shower Curtains",
    description: "An upcycled linen shower curtain in a soft rose colorway, part of Quiet Town's End Bits line.",
    price: 175.00,
    image: "https://quiettownhome.com/cdn/shop/files/linen_1.jpg?v=1729887592&width=2048",
    url: "https://quiettownhome.com/products/end-bits-linen-shower-curtain-rose"
  },

  {
    name: "End Bits Upcycled Linen Robe",
    category: "Apparel",
    description: "A cozy upcycled linen robe, made from Quiet Town's own remnant fabric.",
    price: 150.00,
    image: "https://quiettownhome.com/cdn/shop/files/robe_1.jpg?v=1729886214&width=1680",
    url: "https://quiettownhome.com/products/end-bits-upcycled-linen-robe"
  },

  {
    name: "Lost Coast Candy",
    category: "Bath Rugs",
    description: "A candy-pink bath rug from Quiet Town's Lost Coast line, for a playful pop of color.",
    price: 88.00,
    image: "https://quiettownhome.com/cdn/shop/files/LostCoast_Candy_Mat_40673.jpg?v=1780843692&width=2048",
    url: "https://quiettownhome.com/products/lost-coast-candy"
  },

  {
    name: "Yellow and Blue Paint Splatter Lounge Shirt",
    category: "Apparel",
    description: "An all-over-print lounge shirt in a bold yellow and blue paint-splatter design.",
    price: 59.95,
    priceOriginal: 79.95,
    image: "https://cdn.shopify.com/s/files/1/0385/6229/files/BigTex-HawaiianShirtV3-YellowAndBluePaintSplatter-2048x2730.jpg?v=1712121146",
    url: "https://iedm.com/products/yellow-and-blue-paint-splatter-lounge-shirt"
  },

  {
    name: "Lennon Men's T-Shirt",
    category: "Apparel",
    description: "An all-over-print tee with Riza Peker's colorful Lennon artwork.",
    price: 34.95,
    priceOriginal: 59.95,
    image: "https://cdn.shopify.com/s/files/1/0385/6229/products/riza-peker-lennon-men-s-t-shirt-10922126868555.jpg?v=1756849840",
    url: "https://iedm.com/products/lennon-mens-t-shirt"
  },

  {
    name: "Lennon Weekend Shorts",
    category: "Apparel",
    description: "Vibrant all-over-print shorts featuring Riza Peker's Lennon design, in a 4-way stretch fabric.",
    price: 34.95,
    priceOriginal: 49.95,
    image: "https://cdn.shopify.com/s/files/1/0385/6229/products/riza-peker-lennon-weekend-shorts-4239190425675.jpg?v=1755566428",
    url: "https://iedm.com/products/lennon-weekend-shorts"
  },

  {
    name: "Deep Jungle Men's T-Shirt",
    category: "Apparel",
    description: "A richly colored all-over-print tee with a deep jungle graphic, front to back.",
    price: 34.95,
    priceOriginal: 59.95,
    image: "https://cdn.shopify.com/s/files/1/0385/6229/products/iEDM-TShirtFrontVer02-DeepJungle-2048x2730.jpg?v=1756849298",
    url: "https://iedm.com/products/deep-jungle-mens-t-shirt"
  },

  {
    name: "Hipiwe Vintage Jewelry Box, Antique Green",
    category: "Jewelry Organizers",
    description: "An antique-green oval trinket box with a vintage floral design, for rings and small jewelry.",
    price: 11.20,
    image: "https://m.media-amazon.com/images/I/81yNM3ub0eL._AC_SL1500_.jpg",
    url: "https://amzn.to/4iroDVo"
  },

  {
    name: "Reyes Pine",
    category: "Bath Rugs",
    description: "The statement piece of this edit — a deep pine-green bath rug rich enough to build a whole room around.",
    price: 88.00,
    priceOriginal: 135.00,
    url: "https://quiettownhome.com/products/reyes-pine"
  },

  {
    name: "Sun Shower Pine",
    category: "Shower Curtains",
    description: "A deep pine-green shower curtain that turns an everyday bathroom into a jewel-toned retreat.",
    price: 48.00,
    url: "https://quiettownhome.com/products/sun-shower-pine"
  },

  {
    name: "Sun Shower Olive",
    category: "Shower Curtains",
    description: "An olive-toned take on the Sun Shower print, rich enough to anchor a whole bathroom refresh.",
    price: 48.00,
    url: "https://quiettownhome.com/products/sun-shower-olive"
  },

  {
    name: "Sun Shower 2x2 in Olive",
    category: "Shower Curtains",
    description: "The same jewel-toned richness in a bolder checkered pattern, in a deep olive colorway.",
    price: 58.00,
    url: "https://quiettownhome.com/products/sun-shower-2x2-olive"
  },

  {
    name: "Alex Mill x Quiet Town Perfect Weekender Tote",
    category: "Bags",
    description: "A collaboration weekender tote from Quiet Town's Upcycled Collection, made with Alex Mill.",
    price: 275.00,
    url: "https://quiettownhome.com/products/alex-mill-x-quiet-town-perfect-weekender-tote"
  },

  {
    name: "Beauty of Life Women's Tank",
    category: "Apparel",
    description: "A colorful all-over-print tank top from iEDM's Beauty of Life collection.",
    price: 29.95,
    url: "https://iedm.com/products/beauty-of-life-womens-tank"
  },

  {
    name: "Unicorn Unisex Zip-Up Hoodie",
    category: "Apparel",
    description: "A rainbow unicorn print zip-up hoodie, for anyone who wants their color loud and proud.",
    price: 69.95,
    url: "https://iedm.com/products/unicorn-unisex-zip-up-hoodie"
  }

];
