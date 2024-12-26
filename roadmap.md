{
  "title": "Secure Payment and WooCommerce Order Integration",
  "description": "Implement a secure payment processing solution and WooCommerce order integration for an e-commerce application.",
  "requirements": {
    "payment_processing": {
      "description": "Integrate a payment gateway (Stripe or PayPal) to securely process payments.",
      "details": [
        "Use tokenization to prevent sensitive data exposure and ensure PCI compliance.",
        "Handle payment processing on the frontend using Stripe Elements or PayPal SDK.",
        "Transmit data securely over HTTPS."
      ]
    },
    "woocommerce_order_creation": {
      "description": "Create an order in WooCommerce upon successful payment.",
      "details": [
        "Send a POST request to the WooCommerce REST API.",
        "Include customer information, billing/shipping addresses, line items, and payment metadata.",
        "Update order status to reflect payment status (e.g., 'processing' for successful payments)."
      ]
    },
    "error_handling": {
      "description": "Gracefully handle errors during payment processing and order creation.",
      "details": [
        "Provide user-friendly error messages for failed payments or validation errors.",
        "Log errors securely for troubleshooting, without exposing sensitive information."
      ]
    },
    "configurations": {
      "description": "Ensure secure configurations and best practices.",
      "details": [
        "Store API keys securely in environment variables.",
        "Configure WooCommerce REST API access and ensure HTTPS for all requests.",
        "Use test credentials during development."
      ]
    }
  },
  "deliverables": {
    "frontend": {
      "description": "Implement the frontend to securely collect payment details and display the checkout flow.",
      "details": [
        "Create a payment form using Stripe Elements or PayPal SDK.",
        "Handle payment tokenization securely.",
        "Display success and error messages to users."
      ]
    },
    "backend": {
      "description": "Implement the backend to process payments and create WooCommerce orders.",
      "details": [
        "Create a secure endpoint to process payments and handle payment responses.",
        "Send order details to WooCommerce REST API upon successful payment.",
        "Update WooCommerce order status based on payment results."
      ]
    }
  },
  "examples": {
    "frontend_payment_processing": {
      "description": "Example code for securely handling payment details on the frontend using Stripe.",
      "code": "import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';\n\nconst handlePayment = async (orderDetails) => {\n  const stripe = useStripe();\n  const elements = useElements();\n\n  const card = elements.getElement(CardElement);\n\n  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {\n    payment_method: {\n      card,\n      billing_details: orderDetails.billing,\n    },\n  });\n\n  if (error) {\n    console.error('Payment error:', error.message);\n    return { success: false, error: error.message };\n  }\n\n  return { success: true, paymentIntent };\n};"
    },
    "backend_order_creation": {
      "description": "Example code for creating an order in WooCommerce using the REST API.",
      "code": "const WooCommerceAPI = require('@woocommerce/woocommerce-rest-api').default;\n\nconst wooCommerce = new WooCommerceAPI({\n  url: 'https://yourstore.com',\n  consumerKey: process.env.WC_CONSUMER_KEY,\n  consumerSecret: process.env.WC_CONSUMER_SECRET,\n  version: 'wc/v3',\n});\n\napp.post('/api/create-order', async (req, res) => {\n  const { customer, lineItems, paymentMetadata } = req.body;\n\n  try {\n    const orderData = {\n      payment_method: 'stripe',\n      payment_method_title: 'Credit Card (Stripe)',\n      set_paid: true,\n      billing: customer.billing,\n      shipping: customer.shipping,\n      line_items: lineItems,\n      meta_data: [{ key: 'payment_transaction_id', value: paymentMetadata.transactionId }],\n    };\n\n    const order = await wooCommerce.post('orders', orderData);\n    res.status(200).json(order.data);\n  } catch (error) {\n    console.error('Order creation error:', error.response.data);\n    res.status(500).send('Order creation failed');\n  }\n});"
    }
  },
  "notes": [
    "Validate WooCommerce API access by testing endpoints with GET /wp-json/wc/v3/orders.",
    "Ensure all user inputs and payment details are validated before processing.",
    "Test the workflow thoroughly in the payment gateway's test environment before going live."
  ]
}
