/**
 * Script to verify orders in Firestore
 * 
 * This script will:
 * 1. Check merchandise_documents collection for orders
 * 2. Check if orders are being saved correctly
 * 3. Display order details
 * 
 * Run with: npx tsx src/scripts/verify-orders.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

// Firebase config from src/services/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyAfueNrXFi1MR5RwbLSYVOwAkW2IfiM9RI",
  authDomain: "unill-20c41.firebaseapp.com",
  projectId: "unill-20c41",
  storageBucket: "unill-20c41.firebasestorage.app",
  messagingSenderId: "775721930353",
  appId: "1:775721930353:web:c9a75b90494363bcee55d0",
  measurementId: "G-F7X1S54R7N"
};

interface MerchDocument {
  id: string;
  type: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  data?: any;
}

async function verifyOrders() {
  console.log('🔍 Starting order verification script...\n');
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  try {
    // 1. Check merchandise_documents collection for orders
    console.log('📋 Checking merchandise_documents collection...');
    const docsSnap = await getDocs(collection(db, 'merchandise_documents'));
    console.log(`   Total documents: ${docsSnap.size}\n`);
    
    // 2. Filter for orders
    const orders: MerchDocument[] = [];
    const nonOrders: MerchDocument[] = [];
    
    docsSnap.forEach((doc: any) => {
      const data = doc.data() as MerchDocument;
      if (data.type === 'order') {
        orders.push({ ...data, id: doc.id });
      } else {
        nonOrders.push({ ...data, id: doc.id });
      }
    });
    
    console.log(`📦 Found ${orders.length} orders:`);
    console.log(`📄 Found ${nonOrders.length} other documents\n`);
    
    if (orders.length > 0) {
      console.log('='.repeat(60));
      
      // Sort orders by creation date (newest first)
      orders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      orders.forEach((order, index) => {
        console.log(`\n📋 Order #${index + 1}:`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Created By: ${order.createdBy}`);
        console.log(`   Created At: ${order.createdAt}`);
        console.log(`   Updated At: ${order.updatedAt}`);
        
        if (order.data) {
          console.log(`   Order Data:`);
          console.log(`   - Items: ${order.data.items?.length || 0}`);
          console.log(`   - Total: ${order.data.total || 'N/A'}`);
          console.log(`   - Shipping: ${order.data.shipping?.name || 'N/A'}`);
          console.log(`   - Payment: ${order.data.paymentMethod || 'N/A'}`);
        }
      });
      
      console.log('\n' + '='.repeat(60));
    } else {
      console.log('⚠️  No orders found in merchandise_documents collection');
      console.log('\n💡 This means either:');
      console.log('   1. No orders have been placed yet');
      console.log('   2. Orders are being saved to a different collection');
      console.log('   3. There may be an issue with order creation');
    }
    
    // 3. Also check for any orders in root orders collection
    console.log('\n📋 Checking for orders in root orders collection...');
    try {
      const rootOrdersSnap = await getDocs(collection(db, 'orders'));
      console.log(`   Found ${rootOrdersSnap.size} documents in orders collection`);
      
      if (rootOrdersSnap.size > 0) {
        rootOrdersSnap.forEach(doc => {
          console.log(`   - ${doc.id}:`, doc.data());
        });
      }
    } catch (e) {
      console.log('   Collection does not exist or is empty');
    }
    
    // 4. Check merchandise collection for items
    console.log('\n📋 Checking merchandise collection...');
    const merchSnap = await getDocs(collection(db, 'merchandise'));
    console.log(`   Found ${merchSnap.size} merchandise items`);
    
    if (merchSnap.size > 0) {
      console.log('\n   Sample items:');
      const items = merchSnap.docs.slice(0, 5);
      items.forEach((doc: any) => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.name} - ${data.price}`);
      });
    }
    
    console.log('\n✅ Order verification complete!');
    
  } catch (error) {
    console.error('\n❌ Error running order verification:', error);
    throw error;
  }
}

// Run the script
verifyOrders()
  .then(() => {
    console.log('\n👋 Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
