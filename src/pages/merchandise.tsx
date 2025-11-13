import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MerchandiseCard from '../components/MerchandiseCard';

const MerchandisePage: React.FC = () => {
  const [merchandise, setMerchandise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadMerchandise = async () => {
      try {
        // Mock merchandise data - in real app this would come from Firebase
        const mockMerchandise = [
          {
            id: '1',
            name: 'University Sports Jersey',
            description: 'Official university sports jersey with moisture-wicking fabric',
            price: 2500,
            images: ['/images/jersey-1.jpg', '/images/jersey-2.jpg', '/images/jersey-3.jpg'],
            category: 'Apparel',
            inStock: true,
            likes: 45
          },
          {
            id: '2',
            name: 'Sports Water Bottle',
            description: 'Insulated water bottle with university logo',
            price: 800,
            images: ['/images/bottle-1.jpg', '/images/bottle-2.jpg'],
            category: 'Accessories',
            inStock: true,
            likes: 23
          },
          {
            id: '3',
            name: 'Team Hoodie',
            description: 'Comfortable hoodie perfect for game days',
            price: 3200,
            images: ['/images/hoodie-1.jpg', '/images/hoodie-2.jpg', '/images/hoodie-3.jpg'],
            category: 'Apparel',
            inStock: false,
            likes: 67
          },
          {
            id: '4',
            name: 'Sports Cap',
            description: 'Adjustable cap with embroidered university logo',
            price: 1200,
            images: ['/images/cap-1.jpg', '/images/cap-2.jpg'],
            category: 'Accessories',
            inStock: true,
            likes: 34
          },
          {
            id: '5',
            name: 'Training Shorts',
            description: 'Lightweight training shorts for optimal performance',
            price: 1800,
            images: ['/images/shorts-1.jpg', '/images/shorts-2.jpg'],
            category: 'Apparel',
            inStock: true,
            likes: 28
          },
          {
            id: '6',
            name: 'Sports Backpack',
            description: 'Durable backpack with multiple compartments',
            price: 4500,
            images: ['/images/backpack-1.jpg', '/images/backpack-2.jpg'],
            category: 'Accessories',
            inStock: true,
            likes: 52
          },
          {
            id: '7',
            name: 'Team Scarf',
            description: 'Show your team spirit with this official scarf',
            price: 900,
            images: ['/images/scarf-1.jpg', '/images/scarf-2.jpg'],
            category: 'Accessories',
            inStock: true,
            likes: 19
          },
          {
            id: '8',
            name: 'Athletic Socks',
            description: 'Comfortable athletic socks with cushioned sole',
            price: 600,
            images: ['/images/socks-1.jpg', '/images/socks-2.jpg'],
            category: 'Apparel',
            inStock: true,
            likes: 15
          }
        ];
        
        setMerchandise(mockMerchandise);
      } catch (error) {
        console.error('Failed to load merchandise:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMerchandise();
  }, []);

  const handleAddToCart = (item: any) => {
    // TODO: Implement add to cart functionality
    alert(`Added ${item.name} to cart!`);
  };

  const handleToggleWishlist = async (itemId: string, isLiked: boolean) => {
    // TODO: Implement Firebase wishlist functionality
    try {
      console.log(`${isLiked ? 'Added to' : 'Removed from'} wishlist: ${itemId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      throw error;
    }
  };

  const filteredMerchandise = merchandise.filter(item => {
    const matchesFilter = currentFilter === 'all' || item.category.toLowerCase() === currentFilter.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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
            <div className="flex flex-wrap gap-3">
              <button 
                className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                  currentFilter === 'all' ? 'active' : ''
                }`}
                onClick={() => setCurrentFilter('all')}
              >
                All Items
              </button>
              <button 
                className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                  currentFilter === 'apparel' ? 'active' : ''
                }`}
                onClick={() => setCurrentFilter('apparel')}
              >
                Apparel
              </button>
              <button 
                className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                  currentFilter === 'accessories' ? 'active' : ''
                }`}
                onClick={() => setCurrentFilter('accessories')}
              >
                Accessories
              </button>
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
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
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
    </Layout>
  );
};

export default MerchandisePage;