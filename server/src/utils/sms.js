const AfricasTalking = require('africastalking');
require('dotenv').config();

const africastalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = africastalking.SMS;

const sendSMS = async (to, message) => {
  try {
    // Ensure phone number is in international format
    const phone = to.startsWith('+') ? to : `+256${to.slice(1)}`;

    const result = await sms.send({
      to: [phone],
      message,
    });

    console.log('SMS sent:', result);
    return result;
  } catch (error) {
    console.error('SMS error:', error);
    // Don't throw — SMS failure shouldn't break the main operation
  }
};

// SMS templates
const sendCheckInAlert = async (phone, plate_number, driver_name) => {
  const message = `MizigoFlow Alert: Vehicle ${plate_number} driven by ${driver_name} has checked in at the warehouse.`;
  return sendSMS(phone, message);
};

const sendLowStockAlert = async (phone, product_name, quantity) => {
  const message = `MizigoFlow Alert: Low stock warning! ${product_name} is at ${quantity} units — below reorder level.`;
  return sendSMS(phone, message);
};

const sendOrderCompletedAlert = async (phone, order_id, order_type) => {
  const message = `MizigoFlow Alert: Order #${order_id} (${order_type}) has been completed successfully.`;
  return sendSMS(phone, message);
};

module.exports = { sendSMS, sendCheckInAlert, sendLowStockAlert, sendOrderCompletedAlert };