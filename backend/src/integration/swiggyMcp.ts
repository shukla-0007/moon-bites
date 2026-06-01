/**
 * integration/swiggyMcp.ts
 *
 * Defines the TypeScript interfaces for the Swiggy MCP Server tools
 * and provides a high-fidelity Mock implementation that simulates
 * network latency and robust random failures.
 */

import { MOCK_RESTAURANTS, McpDish, McpRestaurant, SpiceLevel } from "../data/mockRestaurants";

export { McpDish, McpRestaurant, SpiceLevel };

export interface McpCartItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface McpCart {
  cartId: string;
  restaurantId: string;
  restaurantName: string;
  items: McpCartItem[];
  subtotal: number;
  deliveryFee: number;
  packagingCharge: number;
  tax: number;
  totalBill: number;
}

export interface McpOrderResult {
  orderId: string;
  status: "placed" | "confirmed" | "delivered" | "failed";
  etaMinutes: number;
  trackUrl: string;
  cart: McpCart;
}

export class SwiggyMcpError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "SwiggyMcpError";
  }
}

// In-memory cart registry
const carts = new Map<string, McpCart>();

export class SwiggyMcpClient {
  private failureRate: number; // 0 to 1 (e.g. 0.05 = 5% failures)

  constructor(failureRate = 0.05) {
    this.failureRate = failureRate;
  }

  private simulateDelay(ms = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private checkFailure(methodName: string) {
    if (Math.random() < this.failureRate) {
      const errorTypes = [
        { code: "NETWORK_TIMEOUT", message: `Swiggy API network timeout during ${methodName}.` },
        { code: "RATE_LIMIT_EXCEEDED", message: `Too many requests to Swiggy MCP server during ${methodName}.` },
        { code: "SWIGGY_INTERNAL_ERROR", message: `Swiggy internal order processing failed during ${methodName}.` },
      ];
      const selected = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      throw new SwiggyMcpError(selected.code, selected.message);
    }
  }

  async discoverRestaurants(latitude: number, longitude: number, cuisine?: string): Promise<McpRestaurant[]> {
    await this.simulateDelay(150);
    this.checkFailure("discoverRestaurants");

    let results = MOCK_RESTAURANTS.map(({ dishes, ...rest }) => rest);

    if (cuisine) {
      const lowerCuisine = cuisine.toLowerCase();
      results = results.filter(
        (r) => r.cuisine.toLowerCase() === lowerCuisine || r.tags.includes(lowerCuisine)
      );
    }
    return results;
  }

  async getRestaurantMenu(restaurantId: string): Promise<McpDish[]> {
    await this.simulateDelay(150);
    this.checkFailure("getRestaurantMenu");

    const restaurant = MOCK_RESTAURANTS.find((r) => r.id === restaurantId);
    if (!restaurant) {
      throw new SwiggyMcpError("RESTAURANT_NOT_FOUND", `Restaurant with ID ${restaurantId} not found.`);
    }
    return restaurant.dishes;
  }

  async createCart(restaurantId: string): Promise<McpCart> {
    await this.simulateDelay(100);
    this.checkFailure("createCart");

    const restaurant = MOCK_RESTAURANTS.find((r) => r.id === restaurantId);
    if (!restaurant) {
      throw new SwiggyMcpError("RESTAURANT_NOT_FOUND", `Restaurant with ID ${restaurantId} not found.`);
    }

    const cartId = `cart_${Math.random().toString(36).substring(2, 11)}`;
    const newCart: McpCart = {
      cartId,
      restaurantId,
      restaurantName: restaurant.name,
      items: [],
      subtotal: 0,
      deliveryFee: 30,
      packagingCharge: 15,
      tax: 0,
      totalBill: 45,
    };

    carts.set(cartId, newCart);
    return newCart;
  }

  async addToCart(cartId: string, dishId: string, quantity: number): Promise<McpCart> {
    await this.simulateDelay(100);
    this.checkFailure("addToCart");

    const cart = carts.get(cartId);
    if (!cart) {
      throw new SwiggyMcpError("CART_NOT_FOUND", `Cart with ID ${cartId} not found.`);
    }

    const restaurant = MOCK_RESTAURANTS.find((r) => r.id === cart.restaurantId);
    if (!restaurant) {
      throw new SwiggyMcpError("RESTAURANT_NOT_FOUND", `Restaurant associated with cart not found.`);
    }

    const dish = restaurant.dishes.find((d) => d.id === dishId);
    if (!dish) {
      throw new SwiggyMcpError("DISH_NOT_FOUND", `Dish ${dishId} not found in restaurant menu.`);
    }

    const existingItem = cart.items.find((item) => item.dishId === dishId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        dishId,
        name: dish.name,
        price: dish.price,
        quantity,
      });
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.tax = Math.round(cart.subtotal * 0.05); // 5% GST
    cart.totalBill = cart.subtotal + cart.deliveryFee + cart.packagingCharge + cart.tax;

    carts.set(cartId, cart);
    return cart;
  }

  async placeOrder(cartId: string, addressId: string, paymentMethod: string): Promise<McpOrderResult> {
    await this.simulateDelay(200);
    this.checkFailure("placeOrder");

    const cart = carts.get(cartId);
    if (!cart) {
      throw new SwiggyMcpError("CART_NOT_FOUND", `Cart with ID ${cartId} not found.`);
    }

    if (cart.items.length === 0) {
      throw new SwiggyMcpError("EMPTY_CART", "Cannot place an order with an empty cart.");
    }

    const orderId = `swg_${Math.random().toString(36).substring(2, 11)}`;
    const etaMinutes = Math.round(20 + Math.random() * 25); // 20-45 minutes estimate

    const result: McpOrderResult = {
      orderId,
      status: "confirmed",
      etaMinutes,
      trackUrl: `https://swiggy.com/track/${orderId}`,
      cart,
    };

    // Remove cart after successful checkouts
    carts.delete(cartId);

    return result;
  }
}

// Export default singleton client
export const swiggyMcpClient = new SwiggyMcpClient(0.05); // 5% simulated failure rate
