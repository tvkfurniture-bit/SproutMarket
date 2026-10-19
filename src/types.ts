export interface Product {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  category: 'indoor' | 'outdoor' | 'succulents' | 'herbs' | 'pots-soil' | 'care-tools';
  image: string;
  nurseryId: string;
  nurseryName: string;
  stock: number;
  light: 'low' | 'indirect' | 'direct';
  water: 'low' | 'moderate' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  features: string[];
  size: string;
  isPrime?: boolean;
}

export interface Nursery {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  location: string;
  description: string;
  logo: string;
  banner: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    nurseryName: string;
  }[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  shippingAddress: string;
}

export interface QuizAnswers {
  location: 'indoor' | 'outdoor' | 'both';
  light: 'low' | 'indirect' | 'direct';
  watering: 'forgetful' | 'moderate' | 'attentive';
  pets: 'yes' | 'no';
  difficulty: 'beginner' | 'intermediate' | 'expert';
  size: 'small' | 'medium' | 'large' | 'any';
}
