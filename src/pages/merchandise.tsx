import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import QuickViewModal from '@/components/QuickViewModal';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { addToCart } from '@/store/slices/cartSlice';
import Layout from '../components/Layout';
import MerchandiseCard from '../components/MerchandiseCard';
import CartTab from '../components/CartTab';
import { firebaseMerchService } from '@/services/firebaseMerchService';
import { MerchItem } from '@/models';

const MerchandisePage: React.FC = () => {
  const router = useRouter();
  const user = useAppSelector(s => s.auth.user);
  const [merchandise, setMerchandise] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const loadMerchandise = async () => {
      try {
        // Attempt to fetch from Firestore
        let items = await firebaseMerchService.listMerchItems();

        if (items.length === 0) {
          // Seed if empty
          const mockMerchandise: MerchItem[] = [
            {
              id: '1',
              name: 'University Sports Jersey',
              description: 'Official university sports jersey with moisture-wicking fabric',
              price: 2500,
              images: ['/images/jersey-1.jpg', '/images/jersey-2.jpg', '/images/jersey-3.jpg'],
              category: 'Garments Upper Body',
              inStock: true,
              likes: 45,
              type: 'unil',
              availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
            },
            {
              id: '2',
              name: 'Sports Water Bottle',
              description: 'Insulated water bottle with university logo',
              price: 800,
              images: ['/images/bottle-1.jpg', '/images/bottle-2.jpg'],
              category: 'Gadgets',
              inStock: true,
              likes: 23,
              type: 'unil'
            },
            {
              id: '3',
              name: 'Team Hoodie',
              description: 'Comfortable hoodie perfect for game days',
              price: 3200,
              images: ['/images/hoodie-1.jpg', '/images/hoodie-2.jpg', '/images/hoodie-3.jpg'],
              category: 'Garments Upper Body',
              inStock: false,
              likes: 67,
              type: 'unil',
              availableSizes: ['S', 'M', 'L', 'XL']
            },
            {
              id: '4',
              name: 'Sports Cap',
              description: 'Adjustable cap with embroidered university logo',
              price: 1200,
              images: ['/images/cap-1.jpg', '/images/cap-2.jpg'],
              category: 'Headgear',
              inStock: true,
              likes: 34,
              type: 'unil',
              availableSizes: ['One Size']
            },
            {
              id: '5',
              name: 'Training Shorts',
              description: 'Lightweight training shorts for optimal performance',
              price: 1800,
              images: ['/images/shorts-1.jpg', '/images/shorts-2.jpg'],
              category: 'Garments Lower Body',
              inStock: true,
              likes: 28,
              type: 'unil',
              availableSizes: ['S', 'M', 'L', 'XL']
            },
            {
              id: '6',
              name: 'Sports Backpack',
              description: 'Durable backpack with multiple compartments',
              price: 4500,
              images: ['/images/backpack-1.jpg', '/images/backpack-2.jpg'],
              category: 'Equipment',
              inStock: true,
              likes: 52,
              type: 'unil'
            },
            {
              id: '7',
              name: 'Team Scarf',
              description: 'Show your team spirit with this official scarf',
              price: 900,
              images: ['/images/scarf-1.jpg', '/images/scarf-2.jpg'],
              category: 'Assortment',
              inStock: true,
              likes: 19,
              type: 'unil'
            },
            {
              id: '8',
              name: 'Athletic Socks',
              description: 'Comfortable athletic socks with cushioned sole',
              price: 600,
              images: ['/images/socks-1.jpg', '/images/socks-2.jpg'],
              category: 'Underwear',
              inStock: true,
              likes: 15,
              type: 'unil',
              availableSizes: ['Standard', 'Large']
            }
          ];
          await firebaseMerchService.seedInitialData(mockMerchandise);
          items = mockMerchandise;
        }

        setMerchandise(items);
      } catch (error) {
        console.error('Failed to load merchandise:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMerchandise();
  }, []);

  useEffect(() => {
    if (router.query.checkout === 'true') {
      setShowCheckout(true);
    }
  }, [router.query.checkout]);

  const [selectedQuickViewItem, setSelectedQuickViewItem] = useState<MerchItem | null>(null);

  const handleQuickView = (item: MerchItem) => {
    setSelectedQuickViewItem(item);
  };

  const dispatch = useAppDispatch();

  const handleAddToCart = (item: MerchItem) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.images[0] || '',
      category: item.category,
      selectedSize: item.selectedSize,
      availableSizes: item.availableSizes,
      quantity: 1
    }));
    alert(`Added ${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''} to cart!`);
  };

  const handleToggleWishlist = async (itemId: string, isLiked: boolean) => {
    // TODO: Implement actual wishlist persistence
    console.log(`${isLiked ? 'Added to' : 'Removed from'} wishlist: ${itemId}`);
  };

  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'likes'>('newest');

  const filteredMerchandise = merchandise.filter(item => {
    const matchesFilter = currentFilter === 'all' || item.category === currentFilter;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
    // Newest first (default or fallback)
    return b.id.localeCompare(a.id);
  });

  if (loading) {
    return (
      <Layout title="Merchandise" description="Shop official university sports merchandise">
        <div className="min-h-screen bg-gradient-to-b from-black/30 to-transparent">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unill-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-700">Loading merchandise...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (showCheckout) {
    return (
      <Layout title="Checkout" description="Complete your purchase">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <CartTab />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Merchandise" description="Shop official university sports merchandise">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-black/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            Official Merchandise
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Show your university pride with our exclusive collection of sports merchandise and apparel.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-8">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search merchandise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-unill-yellow-400 focus:border-transparent"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'Garments Upper Body', label: 'Upper' },
                  { id: 'Garments Lower Body', label: 'Lower' },
                  { id: 'Footwear', label: 'Footwear' },
                  { id: 'Headgear', label: 'Headgear' },
                  { id: 'Gadgets', label: 'Gadgets' },
                  { id: 'Equipment', label: 'Equipment' },
                  { id: 'Assortment', label: 'Assort' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    className={`filter-btn px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all text-sm ${currentFilter === filter.id ? 'active' : ''
                      }`}
                    onClick={() => setCurrentFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2 min-w-[180px]">
                <span className="text-gray-700 text-xs font-bold uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-unill-yellow-400"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low</option>
                  <option value="price-high">Price: High</option>
                  <option value="likes">Popular</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merchandise Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredMerchandise.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No items found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredMerchandise.map((item) => (
                <MerchandiseCard
                  key={item.id}
                  item={item}
                  onAddToCart={(itemWithSelectedSize) => handleAddToCart(itemWithSelectedSize as MerchItem)}
                  onToggleWishlist={handleToggleWishlist}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-4xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-4">
                {merchandise.length}+
              </div>
              <div className="text-lg font-semibold mb-2">Products Available</div>
              <div className="text-sm text-gray-700">Official merchandise</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-4xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-4">
                24/7
              </div>
              <div className="text-lg font-semibold mb-2">Online Store</div>
              <div className="text-sm text-gray-700">Shop anytime</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-4xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-4">
                100%
              </div>
              <div className="text-lg font-semibold mb-2">Official</div>
              <div className="text-sm text-gray-700">Authentic products</div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .filter-btn.active {
          background: linear-gradient(135deg, #a855f7, #f59e0b);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
        }
      `}</style>
      {selectedQuickViewItem && (
        <QuickViewModal
          item={selectedQuickViewItem}
          isOpen={!!selectedQuickViewItem}
          onClose={() => setSelectedQuickViewItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </Layout>
  );
};

export default MerchandisePage;