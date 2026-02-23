import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchFinancialOverview, fetchMerch } from '@/store/adminThunk';
import { MerchItem } from '@/models';
import { FiTrendingUp, FiTrendingDown, FiPackage, FiDollarSign, FiUsers, FiShoppingBag } from 'react-icons/fi';

/**
 * Admin Balance Sheet Component
 * Shows financial overview for UNIL-owned merchandise only
 * Team merchandise is managed separately by correspondents
 */
export function FinancialTab() {
    const dispatch = useAppDispatch();
    const allMerchandise = useAppSelector(state => state.merch.items) || [];
    const merchLoading = useAppSelector(state => state.merch.loading);
    const [bookkeepingDocs, setBookkeepingDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const action = await dispatch(fetchFinancialOverview());
            if (fetchFinancialOverview.fulfilled.match(action)) {
                setBookkeepingDocs(action.payload);
            }
            await dispatch(fetchMerch());
            setLoading(false);
        };
        loadData();
    }, [dispatch]);

    // Filter only UNIL-owned merchandise for admin balance sheet
    const unilMerchandise = allMerchandise.filter((item: MerchItem) => item.type === 'unil' || !item.type);
    const teamMerchandise = allMerchandise.filter((item: MerchItem) => item.type === 'team');

    // Group team merchandise by correspondent
    const teamMerchByCorrespondent = teamMerchandise.reduce((acc: Record<string, MerchItem[]>, item: MerchItem) => {
        const key = item.correspondentId || 'unassigned';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    // Financial calculations for UNIL merchandise only
    const invoices = bookkeepingDocs.filter(d => d.type === 'invoice');
    const purchaseOrders = bookkeepingDocs.filter(d => d.type === 'purchase_order');
    const returns = bookkeepingDocs.filter(d => d.type === 'return_of_goods');

    // Assets
    const unilInventoryValue = unilMerchandise.reduce((sum: number, item: MerchItem) => {
        return sum + ((item.stock || 0) * (item.costPrice || item.price * 0.6));
    }, 0);

    const teamInventoryValue = teamMerchandise.reduce((sum: number, item: MerchItem) => {
        return sum + ((item.stock || 0) * (item.costPrice || item.price * 0.6));
    }, 0);

    // Revenue & Income
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.data?.total || 0), 0);

    // Liabilities
    const totalLiabilities = purchaseOrders
        .filter(po => po.status === 'pending_approval')
        .reduce((sum, po) => sum + (po.data?.total || 0), 0);

    // Expenditures
    const totalExpenses = purchaseOrders.reduce((sum, po) => sum + (po.data?.total || 0), 0) +
        returns.reduce((sum, ret) => sum + (ret.data?.total || 0), 0);

    // Net Profit
    const netProfit = totalRevenue - totalExpenses;

    if (loading || merchLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">UNIL Balance Sheet</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Financial overview for university-owned merchandise</p>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                    Admin Overview
                </div>
            </div>

            {/* Main Balance Sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets Section */}
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <FiTrendingUp className="text-emerald-500 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">ASSETS</h3>
                            <p className="text-xs text-gray-500">Resources owned by UNIL</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <BalanceRow 
                            label="UNIL Inventory" 
                            value={unilInventoryValue} 
                            subtext={`${unilMerchandise.length} items`}
                        />
                        <BalanceRow 
                            label="Accounts Receivable" 
                            value={totalRevenue} 
                            subtext="Pending payments"
                        />
                        <BalanceRow 
                            label="Cash & Equivalents" 
                            value={Math.max(0, netProfit)} 
                            subtext="Available funds"
                        />

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-600 dark:text-gray-300">Total Assets</span>
                                <span className="text-xl font-black text-emerald-500">
                                    KSh {(unilInventoryValue + totalRevenue + Math.max(0, netProfit)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liabilities & Equity Section */}
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-rose-500/10 rounded-xl">
                            <FiTrendingDown className="text-rose-500 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">LIABILITIES & EQUITY</h3>
                            <p className="text-xs text-gray-500">Obligations and ownership</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <BalanceRow 
                            label="Accounts Payable" 
                            value={totalLiabilities} 
                            subtext="Pending purchase orders"
                            isLiability
                        />
                        <BalanceRow 
                            label="Operating Expenses" 
                            value={totalExpenses} 
                            subtext="POs & Returns"
                            isLiability
                        />

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-600 dark:text-gray-300">Total Liabilities</span>
                                <span className="text-xl font-black text-rose-500">
                                    KSh {(totalLiabilities + totalExpenses).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profit & Expenditure Summary */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 backdrop-blur-xl border border-green-500/20 rounded-[2rem] p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                        <FiDollarSign className="text-green-500 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black">PROFIT & EXPENDITURE</h3>
                        <p className="text-xs text-gray-500">Income and spending overview</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white/50 dark:bg-black/30 rounded-2xl">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Revenue</p>
                        <p className="text-2xl font-black text-emerald-500">KSh {totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-white/50 dark:bg-black/30 rounded-2xl">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expenditure</p>
                        <p className="text-2xl font-black text-rose-500">KSh {totalExpenses.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-white/50 dark:bg-black/30 rounded-2xl">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Net Profit</p>
                        <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            KSh {netProfit.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Team Merchandise Summary (Managed by Correspondents) */}
            {teamMerchandise.length > 0 && (
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <FiUsers className="text-blue-500 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">TEAM MERCHANDISE</h3>
                            <p className="text-xs text-gray-500">Managed by correspondents (not included in UNIL balance)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(teamMerchByCorrespondent).map(([correspondentId, items]) => {
                            const typedItems = items as MerchItem[];
                            const correspondentName = typedItems[0]?.correspondentName || 'Unassigned';
                            const inventoryValue = typedItems.reduce((sum, item) => 
                                sum + ((item.stock || 0) * (item.costPrice || item.price * 0.6)), 0
                            );
                            
                            return (
                                <div key={correspondentId} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiShoppingBag className="text-blue-500" />
                                        <span className="font-bold text-sm">{correspondentName}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{typedItems.length} items</p>
                                    <p className="text-lg font-black text-blue-500">
                                        KSh {inventoryValue.toLocaleString()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-600 dark:text-gray-300">Total Team Inventory Value</span>
                            <span className="text-xl font-black text-blue-500">
                                KSh {teamInventoryValue.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simplified Balance Row Component
function BalanceRow({ label, value, subtext, isLiability = false }: { 
    label: string; 
    value: number; 
    subtext: string;
    isLiability?: boolean;
}) {
    return (
        <div className="flex justify-between items-center py-2">
            <div>
                <p className="font-bold text-gray-700 dark:text-gray-200">{label}</p>
                <p className="text-xs text-gray-500">{subtext}</p>
            </div>
            <span className={`font-black ${isLiability ? 'text-rose-500' : 'text-emerald-500'}`}>
                KSh {value.toLocaleString()}
            </span>
        </div>
    );
}
