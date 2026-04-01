import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Checkout.css';
import DeliveryAddress from './DeliveryAddress';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import AddAddressModal from './AddAddressModal';

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    // Load saved addresses
    const savedAddresses = localStorage.getItem('addresses');
    if (savedAddresses) {
      const parsed = JSON.parse(savedAddresses);
      setAddresses(parsed);
      if (parsed.length > 0) {
        setSelectedAddress(parsed[0]);
      }
    }
  }, []);

  const handleAddAddress = (newAddress) => {
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
    setSelectedAddress(newAddress);
    setShowAddressModal(false);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    const orderId = 'ORD-' + Date.now();
    const trackingNumber = 'TRK-' + Math.floor(Math.random() * 1000000000);
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const order = {
      id: orderId,
      trackingNumber,
      date: new Date().toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        icon: item.icon,
        specs: item.specs || ''
      })),
      subtotal: getCartTotal(),
      shippingFee: 0,
      total: getCartTotal(),
      address: selectedAddress,
      paymentMethod: selectedPayment,
      status: 'pending'
    };

    // Save order
    const existingOrders = localStorage.getItem('orders');
    const orders = existingOrders ? JSON.parse(existingOrders) : [];
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    alert(`Order placed successfully!\nOrder ID: ${orderId}\nTracking: ${trackingNumber}\nEstimated Delivery: ${order.estimatedDelivery}`);
    
    clearCart();
    navigate('/my-orders');
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <div className="checkout-header-content">
            <button className="back-btn" onClick={() => navigate('/shop')}>←</button>
            <h1 className="checkout-title">Checkout</h1>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/shop')} className="place-order-btn" style={{ width: 'auto', padding: '12px 30px', marginTop: '20px' }}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <div className="checkout-header-content">
          <button className="back-btn" onClick={() => navigate('/shop')}>←</button>
          <h1 className="checkout-title">Checkout</h1>
        </div>
      </div>

      <div className="checkout-main">
        <div className="checkout-left">
          <DeliveryAddress
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelectAddress={setSelectedAddress}
            onAddAddress={() => setShowAddressModal(true)}
          />
          <PaymentMethod
            selectedMethod={selectedPayment}
            onSelectMethod={setSelectedPayment}
          />
        </div>

        <OrderSummary
          cart={cart}
          getCartTotal={getCartTotal}
          selectedPayment={selectedPayment}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>

      {showAddressModal && (
        <AddAddressModal
          onClose={() => setShowAddressModal(false)}
          onSave={handleAddAddress}
        />
      )}
    </div>
  );
}

export default Checkout;