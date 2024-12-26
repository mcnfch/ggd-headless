declare module '@woocommerce/woocommerce-rest-api' {
  interface WooCommerceRestApiOptions {
    url: string;
    consumerKey: string;
    consumerSecret: string;
    version: string;
    queryStringAuth?: boolean;
    axiosConfig?: {
      headers?: Record<string, string>;
    };
  }

  interface WooCommerceRestApiResponse<T> {
    data: T;
    status: number;
    headers: {
      [key: string]: string;
    };
  }

  class WooCommerceRestApi {
    constructor(options: WooCommerceRestApiOptions);
    get<T>(endpoint: string, params?: object): Promise<WooCommerceRestApiResponse<T>>;
    post<T>(endpoint: string, data: object): Promise<WooCommerceRestApiResponse<T>>;
    put<T>(endpoint: string, data: object): Promise<WooCommerceRestApiResponse<T>>;
    delete<T>(endpoint: string): Promise<WooCommerceRestApiResponse<T>>;
    options<T>(endpoint: string): Promise<WooCommerceRestApiResponse<T>>;
  }

  export default WooCommerceRestApi;
} 