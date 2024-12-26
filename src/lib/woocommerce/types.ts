export interface WooOrder {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
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
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    product_id: number;
    quantity: number;
    variation_id?: number;
  }>;
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
}
