import type { FoodCategory } from '../types/game';

export const FOOD_CATEGORIES: FoodCategory[] = [
  'SUSHI', 'RAMEN', 'TACO', 'PIZZA', 'CURRY', 'BURGER', 'DESSERT',
];

export const CATEGORY_DISPLAY: Record<FoodCategory, string> = {
  SUSHI:   'Temaki',
  RAMEN:   'Tonkotsu',
  TACO:    'Carnitas',
  PIZZA:   'Margherita',
  CURRY:   'Katsu',
  BURGER:  'Smash',
  DESSERT: 'Mochi',
};

export const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  SUSHI:   '🍣',
  RAMEN:   '🍜',
  TACO:    '🌮',
  PIZZA:   '🍕',
  CURRY:   '🍛',
  BURGER:  '🍔',
  DESSERT: '🍡',
};

export const CATEGORY_COLOR: Record<FoodCategory, string> = {
  SUSHI:   '#e8a87c',
  RAMEN:   '#e8c87c',
  TACO:    '#f0a86c',
  PIZZA:   '#e87c7c',
  CURRY:   '#d4b87c',
  BURGER:  '#c87c5a',
  DESSERT: '#c87ca8',
};
