import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchMerch } from '@/store/adminThunk';
import { MerchItem } from '@/models';
import { FiTrendingUp, FiTrendingDown, FiPackage, FiDollarSign, FiShoppingBag, FiTag } from 'react-icons/fi';

/**
 * Team Balance Sheet Component for Correspondents
 * Shows financial overview for team-owned merchandise managed by the current correspondent
 */
interface TeamBalanceSheetProps {
    correspondentId: string;
    correspondentName?: string;
}

export function TeamBalanceSheet({ correspondentId, correspondentName = 'Team' }: TeamBalanceSheetProps) {
    const dispatch = useAppDispatch();
    const allMerchandise = useAppSelector(state => state.merch.items) || [];
    const merchLoading = useAppSelector(state => state.merch.loading);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await dispatch(fetchMerch());
            setLoading(false);
        };
        loadData();
    }, [dispatch]);

    // Filter merchandise for this correspondent's team only
    const teamMerchandise = allMerchandise.filter(
        (item: MerchItem) => item.type === 'team' && item.correspondentId === correspondentId
    );

    // Financial calculations for team merchandise
    const inventoryValue = teamMerchandise.reduce((sum: number, item: MerchItem) => {
        return sum + ((item.stock || 0) * (item.costPrice || item.price * 0.6));
    }, 0);

    const totalStock = teamMerchandise.reduce((sum: number, item: MerchItem) => sum + (item.stock || 0), 0);
    const totalPotentialRevenue = teamMerchandise.reduce((sum: number, item: MerchItem) => {
        return sum + ((item.stock || 0) * item.price);
    }, 0);

    // Calculate estimated profit margin
    const estimatedProfit = totalPotentialRevenue - inventoryValue;
    const profitMargin = totalPotentialRevenue > 0 ? (estimatedProfit / totalPotentialRevenue) * 100 : 0;

    if (loading || merchLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Team Balance Sheet</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Financial overview for {correspondentName}'s merchandise
                    </p>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                    Correspondent View
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStat 
                    icon={<FiShoppingBag className="text-blue-500" />}
                    label="Items"
                    value={teamMerchandise.length.toString()}
                />
                <QuickStat 
                    icon={<FiPackage className="text-purple-500" />}
                    label="Total Stock"
                    value={totalStock.toString()}
                />
                <QuickStat 
                    icon={<FiTag className="text-amber-500" />}
                    label="Avg. Price"
                    value={`KSh ${teamMerchandise.length > 0 
                        ? Math.round(teamMerchandise.reduce((s: number, i: MerchItem) => s + i.price, 0) / teamMerchandise.length).toLocaleString()
                        : 0}`}
                />
                <QuickStat 
                    icon={<FiDollarSign className="text-emerald-500" />}
                    label="Profit Margin"
                    value={`${profitMargin.toFixed(1)}%`}
                />
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
                            <p className="text-xs text-gray-500">Team inventory value</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <BalanceRow 
                            label="Inventory (Cost Value)" 
                            value={inventoryValue} 
                            subtext={`${totalStock} units at cost`}
                        />
                        <BalanceRow 
                            label="Potential Revenue" 
                            value={totalPotentialRevenue} 
                            subtext="At retail price"
                        />

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-600 dark:text-gray-300">Estimated Profit</span>
                                <span className="text-xl font-black text-emerald-500">
                                    KSh {estimatedProfit.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Breakdown */}
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <FiPackage className="text-blue-500 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">INVENTORY</h3>
                            <p className="text-xs text-gray-500">Stock by category</p>
                        </div>
                    </div>

                    {teamMerchandise.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FiShoppingBag className="mx-auto text-4xl mb-3 opacity-50" />
                            <p className="font-medium">No team merchandise yet</p>
                            <p className="text-sm">Add items to see your balance sheet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(
                                teamMerchandise.reduce((acc: Record<string, { count: number; value: number }>, item: MerchItem) => {
                                    const cat = item.category || 'Other';
                                    if (!acc[cat]) acc[cat] = { count: 0, value: 0 };
                                    acc[cat].count += item.stock || 0;
                                    acc[cat].value += (item.stock || 0) * (item.costPrice || item.price * 0.6);
                                    return acc;
                                }, {})
                            ).map(([category, data]) => {
                                const typedData = data as { count: number; value: number };
                                return (
                                <div key={category} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div>
                                        <p className="font-bold text-sm">{category}</p>
                                        <p className="text-xs text-gray-500">{typedData.count} units</p>
                                    </div>
                                    <span className="font-bold text-blue-500">
                                        KSh {typedData.value.toLocaleString()}
                                    </span>
                                </div>
                            );})}
                        </div>
                    )}
                </div>
            </div>

            {/* Merchandise List */}
            {teamMerchandise.length > 0 && (
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <FiShoppingBag className="text-purple-500 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">MERCHANDISE ITEMS</h3>
                            <p className="text-xs text-gray-500">Your team's products</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-700">
                                    <th className="pb-3">Item</th>
                                    <th className="pb-3">Stock</th>
                                    <th className="pb-3">Cost</th>
                                    <th className="pb-3">Price</th>
                                    <th className="pb-3">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {teamMerchandise.map((item: MerchItem) => (
                                    <tr key={item.id} className="text-sm">
                                        <td className="py-3">
                                            <div className="font-bold">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.category}</div>
                                        </td>
                                        <td className="py-3 font-medium">{item.stock || 0}</td>
                                        <td className="py-3">KSh {(item.costPrice || Math.round(item.price * 0.6)).toLocaleString()}</td>
                                        <td className="py-3">KSh {item.price.toLocaleString()}</td>
                                        <td className="py-3 font-bold text-emerald-500">
                                            KSh {((item.stock || 0) * (item.costPrice || item.price * 0.6)).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// Quick Stat Component
function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-xl font-black">{value}</p>
        </div>
    );
}

// Balance Row Component
function BalanceRow({ label, value, subtext }: { label: string; value: number; subtext: string }) {
    return (
        <div className="flex justify-between items-center py-2">
            <div>
                <p className="font-bold text-gray-700 dark:text-gray-200">{label}</p>
                <p className="text-xs text-gray-500">{subtext}</p>
            </div>
            <span className="font-black text-emerald-500">
                KSh {value.toLocaleString()}
            </span>
        </div>
    );
}
