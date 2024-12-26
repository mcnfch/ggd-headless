import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = 'https://woo.groovygallerydesigns.com';
const WC_CONSUMER_KEY = 'ck_90846993a7f31d0c512aee435ac278edd2b07a63';
const WC_CONSUMER_SECRET = 'cs_8cccc3b94095049498243682dc77f6f5bf502e84';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Registration data:', data);
    
    const url = `${API_URL}/wp-json/wc/v3/customers`;
    console.log('Making request to:', url);
    
    // Create WooCommerce customer
    const response = await axios.post(
      url,
      {
        email: data.email,
        username: data.username,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName
      },
      {
        auth: {
          username: WC_CONSUMER_KEY,
          password: WC_CONSUMER_SECRET
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('WooCommerce response:', response.data);

    return NextResponse.json({ 
      success: true,
      user: {
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        firstName: response.data.first_name,
        lastName: response.data.last_name
      }
    });
  } catch (error: any) {
    console.error('Registration error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });

    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed',
        details: error.response?.data
      },
      { status: error.response?.status || 500 }
    );
  }
}
