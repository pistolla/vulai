import React, { useState } from 'react';
import { MerchItem } from '@/models';

interface QuickViewModalProps {
    item: MerchItem;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: MerchItem) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
    item,
    isOpen,
    onClose,
    onAddToCart,
}) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen) return null;

    const handleAddToCart = () => {
        if (item.availableSizes && item.availableSizes.length > 0 && !selectedSize) {
            alert('Please select a size');
            return;
        }
        onAddToCart({ ...item, selectedSize });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left Side: Images */}
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-900 flex flex-col">
                    <div className="relative h-[300px] md:h-full">
                        <img
                            src={item.images[currentImageIndex]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                        {item.images.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                                {item.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'w-6 bg-blue-600' : 'bg-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <div className="mb-6">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{item.category}</span>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 leading-tight">{item.name}</h2>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">KSh {item.price.toLocaleString()}</p>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Description</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                        </div>

                        {/* Sizes */}
                        {item.availableSizes && item.availableSizes.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Select Size</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.availableSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 text-sm font-bold border-2 rounded-xl transition-all ${selectedSize === size
                                                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-600'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700 mt-auto">
                        <button
                            onClick={handleAddToCart}
                            disabled={!item.inStock}
                            className={`w-full py-4 px-6 rounded-xl font-black uppercase tracking-wider transition-all transform active:scale-95 ${item.inStock
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <p className="text-center text-xs text-gray-400 font-medium">
                            Official University Merchandise • Quality Guaranteed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
