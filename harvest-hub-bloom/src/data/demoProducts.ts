export interface DemoProduct {
  id: number;
  name: string;
  price: string;
  farmer: string;
  rating: string;
  image: string;
  category: string;
}

export const demoProducts: DemoProduct[] = [
  {
    id: 1,
    name: 'Fresh Tomato Basket',
    price: '₹30/kg',
    farmer: 'Green Valley Farm',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80',
    category: 'Fresh Produce',
  },
  {
    id: 2,
    name: 'Organic Spinach Bundle',
    price: '₹20/bunch',
    farmer: 'Sunrise Acres',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80',
    category: 'Seasonal Greens',
  },
  {
    id: 3,
    name: 'Ripe Mango Box',
    price: '₹80/kg',
    farmer: 'Tropical Paradise Farm',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80',
    category: 'Fruit Box',
  },
  {
    id: 4,
    name: 'Fresh Red Onions',
    price: '₹35/kg',
    farmer: 'Harvest Ridge',
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80',
    category: 'Root Vegetables',
  },
  {
    id: 5,
    name: 'Farm Fresh Eggs',
    price: '₹70/dozen',
    farmer: 'Happy Hen Farm',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=900&q=80',
    category: 'Dairy & Eggs',
  },
  {
    id: 6,
    name: 'Golden Honey Jar',
    price: '₹95/bottle',
    farmer: 'Golden Bloom Apiary',
    rating: '4.5',
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80',
    category: 'Natural Sweetener',
  },
];
