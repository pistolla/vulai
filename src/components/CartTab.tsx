import { useState, useEffect } from 'react';

// Cart Component
export default function CartTab() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'address' | 'confirm'>('cart');

  // Load cart from sessionStorage
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (items: any[]) => {
    setCartItems(items);
    sessionStorage.setItem('cart', JSON.stringify(items));
  };

  const removeItem = (index: number) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    updateCart(newItems);
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (checkoutStep === 'cart') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Shopping Cart</h3>
        {cartItems.length === 0 ? (
          <p className="text-gray-600">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded">
                  <div className="flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price} x {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-medium">Total: ${total.toFixed(2)}</span>
              <button
                onClick={() => setCheckoutStep('payment')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (checkoutStep === 'payment') {
    return (
      <PaymentStep
        total={total}
        onNext={() => setCheckoutStep('address')}
        onBack={() => setCheckoutStep('cart')}
      />
    );
  }

  if (checkoutStep === 'address') {
    return (
      <AddressStep
        onNext={() => setCheckoutStep('confirm')}
        onBack={() => setCheckoutStep('payment')}
      />
    );
  }

  return (
    <ConfirmStep
      cartItems={cartItems}
      total={total}
      onBack={() => setCheckoutStep('address')}
      onComplete={() => {
        // Clear cart and redirect to orders
        updateCart([]);
        setCheckoutStep('cart');
        alert('Order placed successfully!');
      }}
    />
  );
}

// Payment Step Component
function PaymentStep({ total, onNext, onBack }: { total: number; onNext: () => void; onBack: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'mobile'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
      <div className="space-y-4">
        <div className="flex space-x-4">
          {['card', 'paypal', 'mobile'].map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method as any)}
              className={`px-4 py-2 rounded border ${
                paymentMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              {method.charAt(0).toUpperCase() + method.slice(1)}
            </button>
          ))}
        </div>

        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Number</label>
              <input
                type="text"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry</label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CVV</label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'paypal' && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Connect to PayPal
            </button>
          </div>
        )}

        {paymentMethod === 'mobile' && (
          <div className="space-y-4">
            <p className="text-gray-600">Enter your mobile number for payment</p>
            <input
              type="tel"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1234567890"
            />
            <p className="text-sm text-gray-500">You will receive a payment prompt on your mobile device</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          Back to Cart
        </button>
        <button onClick={onNext} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Continue to Address
        </button>
      </div>
    </div>
  );
}

// Address Step Component
function AddressStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [pickupStation, setPickupStation] = useState('');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Delivery Information</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setDeliveryMethod('delivery')}
              className={`px-4 py-2 rounded border ${
                deliveryMethod === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              Home Delivery
            </button>
            <button
              onClick={() => setDeliveryMethod('pickup')}
              className={`px-4 py-2 rounded border ${
                deliveryMethod === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              Pickup Station
            </button>
          </div>
        </div>

        {deliveryMethod === 'delivery' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Street Address</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  value={address.zipCode}
                  onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={address.country}
                  onChange={(e) => setAddress({...address, country: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {deliveryMethod === 'pickup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Pickup Station</label>
            <select
              value={pickupStation}
              onChange={(e) => setPickupStation(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a pickup station</option>
              <option value="downtown">Nairobi CBD sports Station</option>
              <option value="university">University Campus</option>
              <option value="airport">Nearest town centre</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          Back to Payment
        </button>
        <button onClick={onNext} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Review Order
        </button>
      </div>
    </div>
  );
}

// Confirm Step Component
function ConfirmStep({ cartItems, total, onBack, onComplete }: {
  cartItems: any[];
  total: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Confirm Order</h3>

      <div className="space-y-4">
        <h4 className="font-medium">Order Summary</h4>
        <div className="space-y-2">
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          Back to Address
        </button>
        <button onClick={onComplete} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Place Order
        </button>
      </div>
    </div>
  );
}