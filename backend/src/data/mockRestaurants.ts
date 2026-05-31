export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  avgPriceForTwo: number;
  vegOnly: boolean;
  tags: string[];
  rating: number; // 1–5
  distanceKm: number;
};

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "r1",
    name: "Comfort Curry House",
    cuisine: "North Indian",
    avgPriceForTwo: 400,
    vegOnly: true,
    tags: ["comfort", "curry", "north-indian"],
    rating: 4.6,
    distanceKm: 3.2,
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
  },
  {
    id: "r3",
    name: "Healthy Greens Bowl",
    cuisine: "Salad/Bowls",
    avgPriceForTwo: 350,
    vegOnly: true,
    tags: ["healthy", "light", "salad"],
    rating: 4.2,
    distanceKm: 2.0,
  },
  {
    id: "r4",
    name: "Pizza Fiesta",
    cuisine: "Pizza",
    avgPriceForTwo: 600,
    vegOnly: false,
    tags: ["party", "cheese", "celebration"],
    rating: 4.5,
    distanceKm: 5.8,
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
  },
];
