/**
 * data/mockRestaurants.ts
 * 8 mock restaurants, each with 3 dishes.
 * Shape mirrors real Swiggy MCP menu tool response (Phase 4 swap target).
 *
 * Tags on both restaurants and dishes drive mood/schedule matching.
 * SpiceLevel: 1 = mild, 2 = medium, 3 = spicy
 */

export type SpiceLevel = 1 | 2 | 3;

export interface McpDish {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  spiceLevel: SpiceLevel;
  tags: string[];
}

export interface McpRestaurant {
  id: string;
  name: string;
  cuisine: string;
  avgPriceForTwo: number;
  vegOnly: boolean;
  tags: string[];
  rating: number;
  distanceKm: number;
}

export interface MockRestaurant extends McpRestaurant {
  dishes: McpDish[];
}

export const MOCK_RESTAURANTS: MockRestaurant[] = [
  {
    id: "r1",
    name: "Comfort Curry House",
    cuisine: "North Indian",
    avgPriceForTwo: 400,
    vegOnly: true,
    tags: ["comfort", "curry", "north-indian"],
    rating: 4.6,
    distanceKm: 3.2,
    dishes: [
      {
        id: "d1-1",
        name: "Dal Makhani",
        price: 280,
        isVeg: true,
        spiceLevel: 1,
        tags: ["comfort", "cozy"],
      },
      {
        id: "d1-2",
        name: "Paneer Butter Masala",
        price: 320,
        isVeg: true,
        spiceLevel: 2,
        tags: ["comfort", "curry"],
      },
      {
        id: "d1-3",
        name: "Chole Bhature",
        price: 180,
        isVeg: true,
        spiceLevel: 2,
        tags: ["comfort", "light"],
      },
    ],
  },
  {
    id: "r2",
    name: "Biryani Hub",
    cuisine: "Biryani",
    avgPriceForTwo: 500,
    vegOnly: false,
    tags: ["comfort", "spicy", "biryani"],
    rating: 4.4,
    distanceKm: 4.5,
    dishes: [
      {
        id: "d2-1",
        name: "Chicken Biryani",
        price: 280,
        isVeg: false,
        spiceLevel: 3,
        tags: ["comfort", "biryani"],
      },
      {
        id: "d2-2",
        name: "Mutton Biryani",
        price: 350,
        isVeg: false,
        spiceLevel: 3,
        tags: ["celebration", "biryani"],
      },
      {
        id: "d2-3",
        name: "Veg Biryani",
        price: 220,
        isVeg: true,
        spiceLevel: 2,
        tags: ["comfort", "biryani"],
      },
    ],
  },
  {
    id: "r3",
    name: "Healthy Greens Bowl",
    cuisine: "Salads & Bowls",
    avgPriceForTwo: 350,
    vegOnly: true,
    tags: ["healthy", "light", "salad"],
    rating: 4.2,
    distanceKm: 2.0,
    dishes: [
      {
        id: "d3-1",
        name: "Quinoa Power Bowl",
        price: 290,
        isVeg: true,
        spiceLevel: 1,
        tags: ["healthy", "fresh", "high-protein"],
      },
      {
        id: "d3-2",
        name: "Greek Salad",
        price: 220,
        isVeg: true,
        spiceLevel: 1,
        tags: ["healthy", "light", "fresh"],
      },
      {
        id: "d3-3",
        name: "Protein Smoothie Bowl",
        price: 250,
        isVeg: true,
        spiceLevel: 1,
        tags: ["high-protein", "healthy", "fitness"],
      },
    ],
  },
  {
    id: "r4",
    name: "Pizza Fiesta",
    cuisine: "Pizza",
    avgPriceForTwo: 600,
    vegOnly: false,
    tags: ["party", "cheese", "celebration", "pizza", "cheat-meal"],
    rating: 4.5,
    distanceKm: 5.8,
    dishes: [
      {
        id: "d4-1",
        name: "Chicken Supreme Pizza",
        price: 450,
        isVeg: false,
        spiceLevel: 2,
        tags: ["celebration", "party", "pizza"],
      },
      {
        id: "d4-2",
        name: "Margherita Pizza",
        price: 380,
        isVeg: true,
        spiceLevel: 1,
        tags: ["cheat-meal", "pizza", "celebration"],
      },
      {
        id: "d4-3",
        name: "BBQ Chicken Pizza",
        price: 480,
        isVeg: false,
        spiceLevel: 2,
        tags: ["celebration", "cheat-meal", "pizza"],
      },
    ],
  },
  {
    id: "r5",
    name: "Daily Work Lunch",
    cuisine: "Indian Thali",
    avgPriceForTwo: 300,
    vegOnly: true,
    tags: ["weekday-lunch", "light", "office"],
    rating: 4.0,
    distanceKm: 1.5,
    dishes: [
      {
        id: "d5-1",
        name: "Rajma Rice",
        price: 180,
        isVeg: true,
        spiceLevel: 2,
        tags: ["weekday-lunch", "comfort", "office"],
      },
      {
        id: "d5-2",
        name: "Mixed Veg Thali",
        price: 220,
        isVeg: true,
        spiceLevel: 1,
        tags: ["weekday-lunch", "light", "office"],
      },
      {
        id: "d5-3",
        name: "Dal Rice",
        price: 150,
        isVeg: true,
        spiceLevel: 1,
        tags: ["light", "quick", "office"],
      },
    ],
  },
  {
    id: "r6",
    name: "Burger Brothers",
    cuisine: "Burgers",
    avgPriceForTwo: 450,
    vegOnly: false,
    tags: ["cheat-meal", "burger", "comfort"],
    rating: 4.3,
    distanceKm: 3.5,
    dishes: [
      {
        id: "d6-1",
        name: "Classic Chicken Burger",
        price: 220,
        isVeg: false,
        spiceLevel: 1,
        tags: ["cheat-meal", "burger", "comfort"],
      },
      {
        id: "d6-2",
        name: "Spicy Fiesta Burger",
        price: 260,
        isVeg: false,
        spiceLevel: 3,
        tags: ["cheat-meal", "burger", "spicy"],
      },
      {
        id: "d6-3",
        name: "Aloo Tikki Burger",
        price: 180,
        isVeg: true,
        spiceLevel: 2,
        tags: ["cheat-meal", "burger", "light"],
      },
    ],
  },
  {
    id: "r7",
    name: "Protein Kitchen",
    cuisine: "Fitness Food",
    avgPriceForTwo: 550,
    vegOnly: false,
    tags: ["high-protein", "fitness", "healthy"],
    rating: 4.3,
    distanceKm: 4.0,
    dishes: [
      {
        id: "d7-1",
        name: "Grilled Chicken Breast",
        price: 320,
        isVeg: false,
        spiceLevel: 1,
        tags: ["high-protein", "fitness", "healthy"],
      },
      {
        id: "d7-2",
        name: "Egg White Omelette",
        price: 180,
        isVeg: false,
        spiceLevel: 1,
        tags: ["high-protein", "light", "gym"],
      },
      {
        id: "d7-3",
        name: "Tuna Salad Bowl",
        price: 290,
        isVeg: false,
        spiceLevel: 1,
        tags: ["high-protein", "fresh", "protein"],
      },
    ],
  },
  {
    id: "r8",
    name: "South Spice",
    cuisine: "South Indian",
    avgPriceForTwo: 250,
    vegOnly: true,
    tags: ["weekday-lunch", "light", "office", "south-indian"],
    rating: 4.4,
    distanceKm: 2.5,
    dishes: [
      {
        id: "d8-1",
        name: "Masala Dosa",
        price: 150,
        isVeg: true,
        spiceLevel: 2,
        tags: ["weekday-lunch", "light", "quick"],
      },
      {
        id: "d8-2",
        name: "Idli Sambar",
        price: 120,
        isVeg: true,
        spiceLevel: 1,
        tags: ["light", "healthy", "office"],
      },
      {
        id: "d8-3",
        name: "Medu Vada",
        price: 100,
        isVeg: true,
        spiceLevel: 2,
        tags: ["weekday-lunch", "quick"],
      },
    ],
  },
];
