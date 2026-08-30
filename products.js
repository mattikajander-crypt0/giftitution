const products = [
  {
    name: "Minecraft Reversible Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "American Greetings reversible Minecraft wrapping paper for birthdays and celebrations.",
    image: "https://m.media-amazon.com/images/I/51tgC772UTL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/4zMm1HM"
  },
  {
    name: "Bluey Reversible Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A playful Bluey-themed reversible wrapping paper for birthdays and kids' celebrations.",
    image: "https://m.media-amazon.com/images/P/B0F3PJCJQQ.01.LZZZZZZZ.jpg",
    amazon: "https://amzn.to/4i2lk6P"
  },
  {
    name: "Building Blocks Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A colorful building-block design that makes birthdays and kids' gifts even more fun.",
    image: "https://m.media-amazon.com/images/I/41SH9hqiDvL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/45Xqolz"
  },
  {
    name: "Baby Shower Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A cheerful RUSPEPA design for baby showers and welcoming a little one.",
    image: "https://m.media-amazon.com/images/I/51+Dtf7KYxL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/3SIutXR"
  },
  {
    name: "Dinosaur Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A fun dinosaur design for birthdays and adventurous little gift recipients.",
    image: "https://m.media-amazon.com/images/I/71DClubnrQL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/4zNfoVo"
  },
  {
    name: "Kraft Kids' Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A playful kraft-paper birthday design for kids' presents and celebrations.",
    image: "https://m.media-amazon.com/images/I/517Ur4fma-L._AC_.jpg",
    amazon: "https://amzn.to/4wT5I9v"
  },
  {
    name: "Spider Birthday Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A fun spider-themed design for superhero-style birthdays and kids' gifts.",
    image: "https://m.media-amazon.com/images/I/81dO8CQ7gwL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/4cjpsvu"
  },
  {
    name: "Dinosaur Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "Another colorful dinosaur option for birthdays, parties and little surprises.",
    image: "https://m.media-amazon.com/images/I/515BV4t-EXL.jpg",
    amazon: "https://amzn.to/4qLqE0E"
  },
  {
    name: "Animal Birthday Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A cheerful reversible animal design for birthdays and kids' celebrations.",
    image: "https://m.media-amazon.com/images/I/81vtQZ8+CjL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/3SnpITw"
  },
  {
    name: "Dog Birthday Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A playful puppy-and-balloons design for dog lovers and birthday gifts.",
    image: "https://m.media-amazon.com/images/I/71k+D6WsWSL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/4i3d6LI"
  },
  {
    name: "Birthday Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A colorful birthday wrapping option selected for fun, cheerful gift giving.",
    image: "https://m.media-amazon.com/images/I/917Rkq8Q-tL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/4hX38LM"
  },
  {
    name: "Disney Mickey Mouse Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "Hallmark Disney Mickey Mouse mini rolls for fun kids' birthday gifts.",
    image: "https://m.media-amazon.com/images/P/B0GR6R19CJ.01.LZZZZZZZ.jpg",
    amazon: "https://amzn.to/45WS1eE"
  },
  {
    name: "Baseball Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A baseball-themed wrapping paper for young sports fans and birthday gifts.",
    image: "https://m.media-amazon.com/images/I/51ljltLjl7L.jpg",
    amazon: "https://amzn.to/4gsDGN8"
  },
  {
    name: "Baseball Birthday Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A reversible baseball design made for birthdays and sports-loving kids.",
    image: "https://m.media-amazon.com/images/P/B0H1MRBT9H.01.LZZZZZZZ.jpg",
    amazon: "https://amzn.to/3T5quoi"
  },
  {
    name: "Reversible Birthday Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A colorful reversible birthday design for cheerful kids' presents.",
    image: "https://m.media-amazon.com/images/P/B0GTRK2JXG.01.LZZZZZZZ.jpg",
    amazon: "https://amzn.to/4wV7eb6"
  },
  {
    name: "Hallmark Birthday Wrapping Paper Rolls",
    category: "Kids' Gift Wrapping",
    description: "A set of Hallmark birthday wrapping paper rolls for colorful celebrations.",
    image: "https://m.media-amazon.com/images/I/814m-BhcmKL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/4y57MvR"
  },
  {
    name: "Colorful Dinosaur Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A colorful dinosaur-themed birthday wrapping option for playful celebrations.",
    image: "https://m.media-amazon.com/images/I/61Nj3yt9N5L.jpg",
    amazon: "https://amzn.to/4h10mUJ"
  },
  {
    name: "Jumbo Reversible Birthday Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A jumbo reversible birthday wrapping option for bigger gifts and cheerful celebrations.",
    image: "https://m.media-amazon.com/images/I/71ewu215vXL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/4gYmcbs"
  },
  {
    name: "Gold Star Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "A festive gold star design that works beautifully for birthdays and celebrations.",
    image: "https://m.media-amazon.com/images/I/911LYOL7QXL._AC_SL1500_.jpg",
    amazon: "https://amzn.to/4xw3Zbl"
  },
  {
    name: "Disney Princess Wrapping Paper",
    category: "Kids' Gift Wrapping",
    description: "Hallmark Disney Princess wrapping paper for magical birthdays and special gifts.",
    image: "https://m.media-amazon.com/images/P/B0C47C29CQ.01.LZZZZZZZ.jpg",
    amazon: "https://amzn.to/3ULVKJr"
  }
];
