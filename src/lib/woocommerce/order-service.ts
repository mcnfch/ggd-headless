import { api } from '@/lib/api';
import type { WooOrder, CartItem } from '@/lib/types';

interface OrderUpdateResponse {
  success: boolean;
  message: string;
  order?: {
    id: number;
    status: string;
  };
}

interface OrderUpdateData {
  status: string;
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
}

export class OrderService {
  static async createOrder(orderData: Partial<WooOrder>): Promise<WooOrder> {
    try {
      const response = await api.orders.create(orderData);
      const { id, status, total, line_items, billing, shipping } = response;
      
      const transformedLineItems: CartItem[] = line_items.map(item => ({
        product_id: Number(item.product_id),
        quantity: item.quantity,
        name: item.name,
        price: item.price ? Number(item.price) : 0,
        variation_id: item.variation_id ? Number(item.variation_id) : undefined,
        attributes: item.attributes
      }));

      return {
        id: Number(id),
        status,
        total,
        line_items: transformedLineItems,
        billing,
        shipping
      };
    } catch (error) {
      console.error('WooCommerce order creation failed:', error);
      throw new Error('Failed to create order in WooCommerce');
    }
  }

  static async updateOrderStatus(
    orderId: string,
    status: string,
    transactionId?: string
  ): Promise<OrderUpdateResponse> {
    try {
      const updateData: OrderUpdateData = {
        status
      };

      if (transactionId) {
        updateData.meta_data = [
          {
            key: 'payment_transaction_id',
            value: transactionId
          }
        ];
      }

      const response = await api.orders.update(orderId, updateData);
      
      return {
        success: true,
        message: 'Order status updated successfully',
        order: {
          id: Number(response.id),
          status: response.status
        }
      };
    } catch (error) {
      console.error('WooCommerce order update failed:', error);
      throw new Error('Failed to update order status');
    }
  }
}
