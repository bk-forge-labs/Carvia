export type Car = {
  isDemo?: boolean;
  imageCredit?: {source:string;author:string;license:string;licenseUrl:string};
  _id: string;
  title: string;
  price: number;
  brand?: string;
  model?: string;
  bodyStyle?: string;
  year?: number;
  mileage: number;
  fuelType: string;
  transmission?: string;
  location?: string;
  condition?: string;
  dealer?: string | Dealer;
  buyer?: string | Buyer;
  admin?: string | Admin;
  owner?: string;
  isPublished?: boolean;

  mainImage?: string;
  images?: string[];

  description?: string;
};

export type Dealer = {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'dealer' | 'admin';
};

export type Buyer = {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'dealer' | 'admin';
};

export type Admin = {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'dealer' | 'admin';
};
