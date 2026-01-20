import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init('jwybb66KbgoQTWuRt');

/**
 * Send order/shipment confirmation email to customer
 * @param {Object} orderData - Order details
 * @param {string} orderData.customerName - Customer's name
 * @param {string} orderData.customerEmail - Customer's email address
 * @param {string} orderData.orderId - Order/Shipment ID
 * @param {Date} orderData.orderDate - Order date
 * @param {number} orderData.totalAmount - Total order amount
 * @param {Array} orderData.items - Array of order items with {name, quantity, price}
 * @param {string} orderData.status - Order status (e.g., 'Shipped', 'Processing')
 * @param {string} orderData.trackingNumber - Optional tracking number
 * @returns {Promise<Object>} Result with success status
 */
export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    // Format items list for email with proper structure
    const ordersArray = orderData.items.map((item) => ({
      name: item.name,
      units: item.quantity,
      price: (item.price * item.quantity).toFixed(2)
    }));

    // Calculate costs
    const subtotal = orderData.totalAmount;
    const shipping = 0; // Free shipping
    const tax = (subtotal * 0.07).toFixed(2); // 7% tax
    const totalWithTax = (parseFloat(subtotal) + parseFloat(tax)).toFixed(2);

    // Prepare template parameters matching your EmailJS template exactly
    const templateParams = {
      to_email: orderData.customerEmail,      // EmailJS standard recipient field
      to_name: orderData.customerName,
      date: new Date(orderData.orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      order_id: orderData.orderId,
      orders: ordersArray,                    // Array for the {{#orders}} loop
      cost: {
        shipping: shipping.toFixed(2),
        tax: tax
      },
      total_amount: totalWithTax,
      reply_to: orderData.customerEmail
    };

    console.log('Sending email with params:', templateParams);

    // Send email via EmailJS
    const response = await emailjs.send(
      'service_io5eyf8',        // Your Service ID
      'template_q96z6td',        // Your Template ID
      templateParams
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    console.error('Error details:', error.text || error.message || JSON.stringify(error));
    return { success: false, error: error.text || error.message || 'Unknown error' };
  }
};

/**
 * Send shipment notification email to customer
 * @param {Object} shipmentData - Shipment details
 * @returns {Promise<Object>} Result with success status
 */
export const sendShipmentNotificationEmail = async (shipmentData) => {
  try {
    const templateParams = {
      to_email: shipmentData.customerEmail,      // EmailJS standard recipient field
      to_name: shipmentData.customerName,
      customer_name: shipmentData.customerName,
      customer_email: shipmentData.customerEmail,
      shipment_id: shipmentData.shipmentId,
      item_name: shipmentData.itemName,
      quantity: shipmentData.quantity,
      shipment_date: new Date(shipmentData.shipmentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      tracking_number: shipmentData.trackingNumber || 'Will be provided soon',
      estimated_delivery: shipmentData.estimatedDelivery || '3-5 business days',
      notes: shipmentData.notes || '',
      reply_to: shipmentData.customerEmail
    };

    console.log('Sending shipment email with params:', templateParams);

    // Send email via EmailJS
    const response = await emailjs.send(
      'service_io5eyf8',        // Your Service ID
      'template_q96z6td',        // Your Template ID
      templateParams
    );

    console.log('Shipment email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send shipment notification email:', error);
    console.error('Error details:', error.text || error.message || JSON.stringify(error));
    return { success: false, error: error.text || error.message || 'Unknown error' };
  }
};
