import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { firebaseMerchService } from '@/services/firebaseMerchService';
import { OrderData } from '@/models';
import { removeFromCart, updateQuantity, clearCart } from '@/store/slices/cartSlice';

// Cart Component
export default function CartTab() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const cartItems = useAppSelector(state => state.cart.items);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'payment_method' | 'address' | 'confirm'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'pay_on_delivery' | 'pay_on_order'>('pay_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const removeItem = (item: any) => {
    dispatch(removeFromCart({ id: item.id, selectedSize: item.selectedSize }));
  };

  const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  if (checkoutStep === 'cart') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Shopping Cart</h3>
        {cartItems.length === 0 ? (
          <p className="text-gray-600">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded">
                  <div className="flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price} x {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">KSh {(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeItem(item)}
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
                onClick={() => setCheckoutStep('payment_method')}
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
        onNext={() => setCheckoutStep('payment_method')}
        onBack={() => setCheckoutStep('cart')}
      />
    );
  }

  if (checkoutStep === 'payment_method') {
    return (
      <PaymentMethodStep
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onNext={() => setCheckoutStep('address')}
        onBack={() => setCheckoutStep('payment')}
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
      paymentMethod={paymentMethod}
      onBack={() => setCheckoutStep('address')}
      isSubmitting={isSubmitting}
      onComplete={async () => {
        if (!user) {
          alert('Please log in to place an order');
          return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
          // Create Order document via Service
          const orderData: OrderData = {
            customerName: user.displayName || user.email || 'Unknown',
            customerEmail: user.email!,
            customerPhone: user.phoneNumber || '',
            shippingAddress: 'To be confirmed',
            items: cartItems.map((item: any) => ({
              merchId: item.id,
              merchName: item.name,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
              size: item.selectedSize || ''
            })),
            total: total,
            paymentMethod: paymentMethod,
            notes: 'Order placed via online checkout',
            orderHash: cartItems.map((i: any) => `${i.id}-${i.selectedSize || 'no-size'}-${i.quantity}`).join('|')
          };

          await firebaseMerchService.createOrder(orderData, user.uid);

          // Clear cart and redirect to orders
          dispatch(clearCart());
          setCheckoutStep('cart');
          alert('Order placed successfully! It will be reviewed by the university manager.');
        } catch (error: any) {
          console.error('Failed to create order:', error);
          alert(error.message || 'Failed to place order. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
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
              className={`px-4 py-2 rounded border ${paymentMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
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
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CVV</label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
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
              className={`px-4 py-2 rounded border ${deliveryMethod === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
            >
              Home Delivery
            </button>
            <button
              onClick={() => setDeliveryMethod('pickup')}
              className={`px-4 py-2 rounded border ${deliveryMethod === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
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
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
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

// Payment Method Step Component
function PaymentMethodStep({ paymentMethod, onPaymentMethodChange, onNext, onBack }: {
  paymentMethod: 'pay_on_delivery' | 'pay_on_order';
  onPaymentMethodChange: (method: 'pay_on_delivery' | 'pay_on_order') => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
      <div className="space-y-4">
        <div className="space-y-3">
          <div
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'pay_on_delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            onClick={() => onPaymentMethodChange('pay_on_delivery')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                checked={paymentMethod === 'pay_on_delivery'}
                onChange={() => onPaymentMethodChange('pay_on_delivery')}
                className="text-blue-600"
              />
              <div>
                <h4 className="font-medium">Pay on Delivery</h4>
                <p className="text-sm text-gray-600">Pay when you receive your order. Transport costs will be included.</p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'pay_on_order' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            onClick={() => onPaymentMethodChange('pay_on_order')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                checked={paymentMethod === 'pay_on_order'}
                onChange={() => onPaymentMethodChange('pay_on_order')}
                className="text-blue-600"
              />
              <div>
                <h4 className="font-medium">Pay on Order</h4>
                <p className="text-sm text-gray-600">Receive invoice via email and pay before shipping.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          Back to Payment
        </button>
        <button onClick={onNext} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Continue to Address
        </button>
      </div>
    </div>
  );
}

// Confirm Step Component
function ConfirmStep({ cartItems, total, paymentMethod, onBack, onComplete, isSubmitting }: {
  cartItems: any[];
  total: number;
  paymentMethod: 'pay_on_delivery' | 'pay_on_order';
  onBack: () => void;
  onComplete: () => void;
  isSubmitting?: boolean;
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
              <span>KSh {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between font-medium">
            <span>Payment Method</span>
            <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>KSh {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          Back to Address
        </button>
        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded font-medium transition-all ${isSubmitting
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
            }`}
        >
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}