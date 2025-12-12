export enum Category {
  SANDWICH = 'SANDWICH',
  APPETIZER = 'APPETIZER',
  DRINK = 'DRINK',
  SAUCE = 'SAUCE'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
}

export interface CartItem extends MenuItem {
  quantity: number;
  customizations?: string[]; // Added for storing modifications like "No Pickles", "Extra Cheese"
}

export type ViewState = 'home' | 'menu' | 'cart' | 'contact';