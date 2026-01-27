import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    selectedSize?: string;
    availableSizes?: string[];
    quantity: number;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

// Load cart from localStorage if available
const loadCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('vulai_cart');
    return saved ? JSON.parse(saved) : [];
};

const slice = createSlice({
    name: 'cart',
    initialState: {
        items: loadCart(),
    },
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const { id, selectedSize } = action.payload;
            const existing = state.items.find(
                (item) => item.id === id && item.selectedSize === selectedSize
            );

            if (existing) {
                existing.quantity += action.payload.quantity || 1;
            } else {
                state.items.push(action.payload);
            }
            localStorage.setItem('vulai_cart', JSON.stringify(state.items));
        },
        removeFromCart: (state, action: PayloadAction<{ id: string; selectedSize?: string }>) => {
            state.items = state.items.filter(
                (item) => !(item.id === action.payload.id && item.selectedSize === action.payload.selectedSize)
            );
            localStorage.setItem('vulai_cart', JSON.stringify(state.items));
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; selectedSize?: string; quantity: number }>) => {
            const existing = state.items.find(
                (item) => item.id === action.payload.id && item.selectedSize === action.payload.selectedSize
            );
            if (existing) {
                existing.quantity = action.payload.quantity;
            }
            localStorage.setItem('vulai_cart', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem('vulai_cart');
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = slice.actions;
export default slice.reducer;
