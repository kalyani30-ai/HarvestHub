export interface Product {
  id: number;
  name: string;
  farmer: string;
  image: string;
  price: number;
  unit: string;
  organic: boolean;
  category: string;
}

export const categories = [
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'grains', name: 'Grains' },
  { id: 'pulses', name: 'Pulses' },
  { id: 'millets', name: 'Millets' },
  { id: 'other', name: 'Other' },
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Organic Carrots',
    farmer: 'Green Valley Farm',
    image:
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=900&auto=format&fit=crop',
    price: 42,
    unit: 'kg',
    organic: true,
    category: 'vegetables',
  },
  {
    id: 2,
    name: 'Green Capsicum',
    farmer: 'Farm Fresh Fields',
    image:
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=900&q=80',
    price: 55,
    unit: 'kg',
    organic: true,
    category: 'vegetables',
  },
  {
    id: 3,
    name: 'Fresh Mangoes',
    farmer: 'Tropical Paradise Farm',
    image:
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80',
    price: 80,
    unit: 'kg',
    organic: true,
    category: 'fruits',
  },
  {
    id: 4,
    name: 'Red Apples',
    farmer: 'Orchard Hills',
    image:
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80',
    price: 33,
    unit: 'kg',
    organic: false,
    category: 'fruits',
  },
  {
    id: 5,
    name: 'Fresh Spinach',
    farmer: 'Sunrise Acres',
    image:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80',
    price: 24,
    unit: 'bunch',
    organic: true,
    category: 'vegetables',
  },
  {
    id: 6,
    name: 'Vine Tomatoes',
    farmer: 'Harvest Ridge',
    image:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80',
    price: 30,
    unit: 'kg',
    organic: true,
    category: 'vegetables',
  },
  {
    id: 7,
    name: 'Sweet Corn',
    farmer: 'Golden Fields',
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80',
    price: 28,
    unit: 'piece',
    organic: false,
    category: 'vegetables',
  },
  {
    id: 8,
    name: 'Broccoli Crowns',
    farmer: 'Morning Dew Farm',
    image:
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80',
    price: 45,
    unit: 'kg',
    organic: true,
    category: 'vegetables',
  },
  {
    id: 9,
    name: 'Fresh Strawberries',
    farmer: 'Berry Best Farm',
    image:
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80',
    price: 70,
    unit: 'basket',
    organic: true,
    category: 'fruits',
  },
  {
    id: 10,
    name: 'Purple Eggplant',
    farmer: 'Valley Grove',
    image:
      'https://images.unsplash.com/photo-1598514783710-8f6d4b1b2d78?auto=format&fit=crop&w=900&q=80',
    price: 40,
    unit: 'kg',
    organic: false,
    category: 'vegetables',
  },
  {
    id: 11,
    name: 'Yellow Bananas',
    farmer: 'Tropical Paradise Farm',
    image:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80',
    price: 36,
    unit: 'dozen',
    organic: false,
    category: 'fruits',
  },
  {
    id: 12,
    name: 'Crisp Cucumbers',
    farmer: 'Green Valley Farm',
    image:
      'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=900&q=80',
    price: 32,
    unit: 'kg',
    organic: true,
    category: 'vegetables',
  },
  {
    id: 13,
    name: 'Fresh Milk',
    farmer: 'Sunrise Dairy',
    image:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=900&auto=format&fit=crop',
    price: 60,
    unit: 'litre',
    organic: true,
    category: 'dairy',
  },
  {
    id: 14,
    name: 'Farm Eggs',
    farmer: 'Happy Hen Farm',
    image:
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=900&auto=format&fit=crop',
    price: 70,
    unit: 'dozen',
    organic: true,
    category: 'dairy',
  },
  {
    id: 16,
    name: 'Basmati Rice',
    farmer: 'River Grain Farm',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=900&auto=format&fit=crop',
    price: 65,
    unit: 'kg',
    organic: false,
    category: 'grains',
  },
  {
    id: 17,
    name: 'Wheat Atta',
    farmer: 'Golden Harvest Mill',
    image:
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80',
    price: 52,
    unit: 'kg',
    organic: true,
    category: 'grains',
  },
  {
    id: 19,
    name: 'Red Lentils',
    farmer: 'Pulse Valley Farm',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    price: 78,
    unit: 'kg',
    organic: true,
    category: 'pulses',
  },
  {
    id: 20,
    name: 'Chana Dal',
    farmer: 'Saffron Bean Farm',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    price: 74,
    unit: 'kg',
    organic: true,
    category: 'pulses',
  },
  {
    id: 21,
    name: 'Black Gram',
    farmer: 'Indigo Pulse Estate',
    image:
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
    price: 82,
    unit: 'kg',
    organic: true,
    category: 'pulses',
  },
  {
    id: 23,
    name: 'Finger Millet',
    farmer: 'Hilltop Millet Co-op',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
    price: 48,
    unit: 'kg',
    organic: true,
    category: 'millets',
  },
  {
    id: 24,
    name: 'Foxtail Millet',
    farmer: 'Sunset Millet Fields',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    price: 50,
    unit: 'kg',
    organic: true,
    category: 'millets',
  },
  {
    id: 25,
    name: 'Fresh Honey',
    farmer: 'Golden Bloom Apiary',
    image:
      'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80',
    price: 95,
    unit: 'jar',
    organic: true,
    category: 'other',
  },
  {
    id: 26,
    name: 'Groundnut',
    farmer: 'Nutri Soil Farm',
    image:
      'https://images.unsplash.com/photo-1531171074112-24d9f36f7f4f?auto=format&fit=crop&w=900&q=80',
    price: 90,
    unit: 'kg',
    organic: false,
    category: 'other',
  },
  {
    id: 27,
    name: 'Organic Jaggery',
    farmer: 'Sweet Cane Estates',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    price: 70,
    unit: 'kg',
    organic: true,
    category: 'other',
  },
];

export const featuredProductIds = [1, 2, 3, 6, 7, 8, 5, 12];
