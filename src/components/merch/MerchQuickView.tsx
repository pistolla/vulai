import React, { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiShoppingBag } from 'react-icons/fi';

interface MerchQuickViewProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    addToCart: () => void;
    accentColor: string;
}

// Placeholder models for the "Dynamic Avatar"
const MODEL_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=800', // Female model
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=800', // Male model
    'https://images.unsplash.com/photo-1531384441138-2736e62e0519?auto=format&fit=crop&q=80&w=400&h=800', // Walking pose
];

export const MerchQuickView: React.FC<MerchQuickViewProps> = ({ isOpen, onClose, product, addToCart, accentColor }) => {
    const [modelIndex, setModelIndex] = useState(0);

    if (!isOpen || !product) return null;

    const nextModel = () => setModelIndex((prev) => (prev + 1) % MODEL_AVATARS.length);
    const prevModel = () => setModelIndex((prev) => (prev - 1 + MODEL_AVATARS.length) % MODEL_AVATARS.length);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200" style={{ maxHeight: '90vh' }}>

                {/* Left: Avatar Viewer */}
                <div className="w-full md:w-1/2 relative bg-gray-100 dark:bg-gray-800 h-96 md:h-auto group">
                    <img
                        src={MODEL_AVATARS[modelIndex]}
                        alt="Model View"
                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-90 transition-opacity duration-300"
                    />

                    {/* Overlay Product Image (Simulated Compositing) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* In a real implementation, this would be a transparent PNG positioned on top of the model */}
                        <div className="bg-black/20 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md">
                            Viewing on Model {modelIndex + 1}
                        </div>
                    </div>

                    {/* Controls */}
                    <button onClick={prevModel} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                        <FiChevronLeft size={24} />
                    </button>
                    <button onClick={nextModel} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                        <FiChevronRight size={24} />
                    </button>
                </div>

                {/* Right: Product Details */}
                <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <FiX size={24} />
                    </button>

                    <div className="mb-2">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Official Merchandise</span>
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{product.name}</h2>

                    <div className="flex items-center space-x-4 mb-6">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            KSh {product.price}
                        </span>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full">In Stock</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        {product.description || "Experience premium comfort and style with this official team jersey. Made from breathable, moisture-wicking fabric designed for peak performance."}
                    </p>

                    <div className="mt-auto space-y-4">
                        {/* Size Selector Mockup */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Size</label>
                            <div className="flex space-x-3">
                                {['S', 'M', 'L', 'XL'].map(s => (
                                    <button key={s} className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-black dark:hover:border-white font-medium transition-colors">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={addToCart}
                            className="w-full py-4 rounded-xl flex items-center justify-center space-x-3 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            style={{ backgroundColor: accentColor }}
                        >
                            <FiShoppingBag />
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
