import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface MarketingCampaign {
  id?: string;
  name: string;
  type: 'Social' | 'Email' | 'Referral';
  status: 'active' | 'paused' | 'completed' | 'pending_approval' | 'approved' | 'rejected';
  message?: string;
  renderUrl?: string;
  reach: number;
  clicks: number;
  conversion: number;
  budget: number;
  spent: number;
  createdAt?: any;
}

export interface MarketingPage {
  id?: string;
  slug: string;
  title: string;
  sections: any[];
  status: 'draft' | 'published' | 'pending_approval' | 'rejected';
  renderUrl?: string;
  updatedAt?: any;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  symbolUrl?: string;
  headingFont: string;
  bodyFont: string;
}

export class MarketerService {
  private campaignsCol = collection(db, 'marketing_campaigns');
  private pagesCol = collection(db, 'marketing_pages');
  private settingsCol = collection(db, 'marketing_settings');

  // --- Campaigns ---
  async getCampaigns(): Promise<MarketingCampaign[]> {
    const snap = await getDocs(query(this.campaignsCol, orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketingCampaign));
  }

  async saveCampaign(campaign: MarketingCampaign): Promise<string> {
    if (campaign.id) {
      await updateDoc(doc(this.campaignsCol, campaign.id), { ...campaign, updatedAt: serverTimestamp() });
      return campaign.id;
    } else {
      const docRef = await addDoc(this.campaignsCol, { ...campaign, createdAt: serverTimestamp() });
      return docRef.id;
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    await deleteDoc(doc(this.campaignsCol, id));
  }

  // --- Pages ---
  async getPages(): Promise<MarketingPage[]> {
    const snap = await getDocs(query(this.pagesCol, orderBy('updatedAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketingPage));
  }

  async savePage(page: MarketingPage): Promise<string> {
    if (page.id) {
      await updateDoc(doc(this.pagesCol, page.id), { ...page, updatedAt: serverTimestamp() });
      return page.id;
    } else {
      const docRef = await addDoc(this.pagesCol, { ...page, updatedAt: serverTimestamp() });
      return docRef.id;
    }
  }

  // --- Branding ---
  async getBranding(): Promise<BrandingSettings> {
    const snap = await getDocs(this.settingsCol);
    if (snap.empty) {
      return {
        primaryColor: '#4F46E5',
        secondaryColor: '#9333EA',
        headingFont: 'Redwing',
        bodyFont: 'Inter'
      };
    }
    return snap.docs[0].data() as BrandingSettings;
  }

  async updateBranding(settings: BrandingSettings): Promise<void> {
    const snap = await getDocs(this.settingsCol);
    if (snap.empty) {
      await addDoc(this.settingsCol, settings);
    } else {
      await updateDoc(doc(this.settingsCol, snap.docs[0].id), settings as any);
    }
  }

  // --- Analytics ---
  async getGrowthData() {
    const usersSnap = await getDocs(collection(db, 'users'));
    const users = usersSnap.docs.map(d => d.data());
    
    // Group by month (mocking actual date grouping for now)
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return d.toLocaleString('default', { month: 'short' });
    }).reverse();

    // In a real app, you'd filter by createdAt
    // For now returning mock data based on actual user count
    const totalUsers = users.length;
    return {
      totalUsers,
      growth: months.map((m, i) => ({
        month: m,
        users: Math.floor(totalUsers * (0.5 + (i * 0.1))) 
      }))
    };
  }
}

export const marketerService = new MarketerService();
