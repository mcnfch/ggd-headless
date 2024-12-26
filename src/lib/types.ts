export interface WooImage {
  id: number;
  src: string;
  name: string;
  alt: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
  count?: number;
}

export interface WooVariantAttribute {
  id: number;
  name: string;
  option: string;
}

export interface WooVariation {
  id: number;
  attributes: WooVariantAttribute[];
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  sku: string;
  image: WooImage;
  images: WooImage[];
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  categories: Category[];
  images: WooImage[];
  attributes: Array<{
    id: number;
    name: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }>;
  variations?: WooVariation[];
  type: string;
  sku: string;
  stock_status: string;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  average_rating?: string;
  rating_count?: number;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  name: string;
  price?: number;
  image?: string;
  variation_id?: number;
  attributes?: WooVariantAttribute[];
  optionsRequired: boolean;
  optionsSelected: boolean;
}

export interface CartState {
  items: CartItem[];
  total: number;
  count: number;
}

export interface CartResponse {
  success: boolean;
  message: string;
  product_id: number;
  quantity: number;
  variation_id?: number;
}

export interface AddToCartInput {
  product_id: number;
  quantity: number;
  variation_id?: number;
  name?: string;
  price?: number;
  image?: string;
  attributes?: WooVariantAttribute[];
}

export interface CartContextType {
  cart: CartState | null;
  loading: boolean;
  error: string | null;
  addToCart: (item: AddToCartInput) => Promise<CartResponse>;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export interface WooLinks {
  self: Array<{
    href: string;
    targetHints?: {
      allow: string[];
    };
  }>;
  collection: Array<{ href: string }>;
  up?: Array<{ href: string }>;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: WooImage | null;
  menu_order: number;
  count: number;
  _links: WooLinks;
}

export interface WooPage {
  id: number;
  title: { rendered: string };
  slug: string;
  content: { rendered: string };
  status: string;
}

export interface CategoryNode extends WooCategory {
  children: CategoryNode[];
  menuOrder: number;
  visible: boolean;
  key: string;
}

export interface WooCommerceError {
  message: string;
  code: string;
  data: {
    status: number;
  };
}

export interface WooOrder {
  id: number;
  status: string;
  total: string;
  line_items: CartItem[];
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

export function convertToNodes(categories: WooCategory[]): CategoryNode[] {
  // Create a map of id to category with children array
  const categoryMap = new Map<number, CategoryNode>();
  
  // First pass: Create CategoryNode objects for each category
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: [],
      menuOrder: category.menu_order,
      visible: true,
      key: category.id.toString()
    });
  });
  
  // Second pass: Build the tree structure
  const roots: CategoryNode[] = [];
  categoryMap.forEach(node => {
    if (node.parent === 0) {
      // This is a root node
      roots.push(node);
    } else {
      // This is a child node
      const parent = categoryMap.get(node.parent);
      if (parent) {
        parent.children.push(node);
      }
    }
  });
  
  // Sort the categories
  const sortCategories = (categories: CategoryNode[]) => {
    categories.sort((a, b) => a.menuOrder - b.menuOrder);
    categories.forEach(category => {
      if (category.children.length > 0) {
        sortCategories(category.children);
      }
    });
  };
  
  sortCategories(roots);
  return roots;
}