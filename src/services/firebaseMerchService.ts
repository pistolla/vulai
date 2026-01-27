import { db } from './firebase';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    query,
    where,
    orderBy,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { MerchDocument, OrderData, DocumentType, MerchType, MerchItem } from '@/models';

export const firebaseMerchService = {
    // --- Products (Items) ---

    // List all merchandise items
    async listMerchItems(): Promise<MerchItem[]> {
        try {
            const q = query(collection(db, 'merchandise')); // Simple query for now
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MerchItem));
        } catch (error) {
            console.error('Error fetching merchandise items:', error);
            throw error;
        }
    },

    // Seed initial data if collection is empty (helper for development)
    async seedInitialData(items: MerchItem[]): Promise<void> {
        try {
            const snapshot = await getDocs(collection(db, 'merchandise'));
            if (!snapshot.empty) {
                console.log('Merchandise collection already has data. Skipping seed.');
                return;
            }

            console.log('Seeding merchandise data...');
            const batchPromises = items.map(item => {
                // Use setDoc with specific ID if available, or just doc().id
                const ref = doc(db, 'merchandise', item.id);
                return setDoc(ref, item);
            });
            await Promise.all(batchPromises);
            console.log('Merchandise seeding complete.');
        } catch (error) {
            console.error('Error seeding merchandise:', error);
        }
    },

    // --- Orders (MerchDocuments) ---

    // Check for duplicate orders within a short timeframe
    async checkDuplicateOrder(userId: string, orderHash: string): Promise<boolean> {
        if (!orderHash) return false;
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const q = query(
                collection(db, 'merchandise_documents'),
                where('createdBy', '==', userId),
                where('type', '==', 'order'),
                where('status', '==', 'pending_approval'),
                where('data.orderHash', '==', orderHash),
                where('createdAt', '>=', fiveMinutesAgo)
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking duplicate order:', error);
            return false;
        }
    },

    // Create a new order document (triggered by public checkout)
    async createOrder(
        orderData: OrderData,
        userId?: string
    ): Promise<string> {
        try {
            if (userId && orderData.orderHash) {
                const isDuplicate = await this.checkDuplicateOrder(userId, orderData.orderHash);
                if (isDuplicate) {
                    throw new Error('This order seems to be a duplicate. Please wait a few minutes before trying again or check your order history.');
                }
            }

            // Create a MerchDocument of type 'order'
            const docRef = doc(collection(db, 'merchandise_documents'));
            const now = new Date().toISOString();

            const payload: MerchDocument = {
                id: docRef.id,
                type: 'order',
                merchType: 'unil',
                status: 'pending_approval',
                createdBy: userId || 'guest',
                createdAt: now,
                updatedAt: now,
                approvals: [],
                data: orderData
            };

            await setDoc(docRef, payload);
            return docRef.id;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }
};
