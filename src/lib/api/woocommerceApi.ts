import axios from 'axios';
import { authApi } from './authApi';
import { AddressData } from '@/components/profile/AddressForm';
import Cookies from 'js-cookie';
import { logger } from '../logger';

const API_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY;
const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET;

class WooCommerceAPI {
  private static instance: WooCommerceAPI;

  private constructor() {}

  public static getInstance(): WooCommerceAPI {
    if (!WooCommerceAPI.instance) {
      WooCommerceAPI.instance = new WooCommerceAPI();
    }
    return WooCommerceAPI.instance;
  }

  private getHeaders() {
    // Use WooCommerce API authentication
    const basicAuth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
    };
  }

  public async getCustomer(customerId: number) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await axios.get(
        `${API_URL}/wp-json/wc/v3/customers/${customerId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      logger.error('getCustomer', error);
      throw new Error(`Error getting customer: ${JSON.stringify(error.response?.data || {})}`);
    }
  }

  public async updateCustomer(customerId: number, data: any) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await axios.put(
        `${API_URL}/wp-json/wc/v3/customers/${customerId}`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      logger.error('updateCustomer', error);
      throw new Error(`Error updating customer: ${JSON.stringify(error.response?.data || {})}`);
    }
  }

  public async updateAddress(customerId: number, billingAddress: AddressData, useForShipping: boolean = false) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const updateData: any = {
        billing: billingAddress
      };

      if (useForShipping) {
        updateData.shipping = billingAddress;
      }

      const response = await this.updateCustomer(customerId, updateData);
      return response;
    } catch (error: any) {
      logger.error('updateAddress', error);
      throw new Error(`Error updating address: ${JSON.stringify(error.response?.data || {})}`);
    }
  }

  public async getCurrentCustomer() {
    try {
      // First, get all customers and find the one matching the current user's email
      const response = await axios.get(
        `${API_URL}/wp-json/wc/v3/customers`,
        { 
          headers: this.getHeaders(),
          params: {
            // Add email parameter if available from auth
            per_page: 100  // Adjust based on your needs
          }
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new Error('No customers found');
      }

      // For debugging
      console.log('[WooCommerce] Found customers:', response.data.length);

      // Return the first customer for now (we'll need to implement proper user association later)
      return response.data[0];
    } catch (error: any) {
      // Enhanced error logging
      const errorContext = {
        endpoint: `${API_URL}/wp-json/wc/v3/customers`,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      };
      
      logger.error('getCurrentCustomer', {
        ...error,
        context: errorContext
      });

      throw new Error(`Error getting current customer: ${JSON.stringify(errorContext)}`);
    }
  }
}

export const wooCommerceApi = WooCommerceAPI.getInstance();
