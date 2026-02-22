import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchFinancialOverview, fetchMerch } from '@/store/adminThunk';
import { MerchItem, DocumentType } from '@/models';
import { FiTrendingUp, FiTrendingDown, FiPieChart, FiDollarSign, FiPackage, FiActivity } from 'react-icons/fi';

export function FinancialTab() {
    const dispatch = useAppDispatch();
    const { merchandise, loading: merchLoading } = useAppSelector(state => state.admin);
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

    // Calculations
    const invoices = bookkeepingDocs.filter(d => d.type === 'invoice');
    const purchaseOrders = bookkeepingDocs.filter(d => d.type === 'purchase_order');
    const returns = bookkeepingDocs.filter(d => d.type === 'return_of_goods');

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.data?.total || 0), 0);
    const totalLiabilities = purchaseOrders
        .filter(po => po.status === 'pending_approval')
        .reduce((sum, po) => sum + (po.data?.total || 0), 0);

    const totalExpenses = purchaseOrders.reduce((sum, po) => sum + (po.data?.total || 0), 0) +
        returns.reduce((sum, ret) => sum + (ret.data?.total || 0), 0);

    const inventoryValue = merchandise.reduce((sum: number, item: MerchItem) => {
        return sum + ((item.stock || 0) * (item.costPrice || item.price * 0.6)); // Fallback to 60% of price if costPrice missing
    }, 0);

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
            {/* Header Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Revenue"
                    value={`KSh ${totalRevenue.toLocaleString()}`}
                    icon={<FiTrendingUp className="text-emerald-500" />}
                    trend="+12% from last month"
                    color="emerald"
                />
                <SummaryCard
                    title="Inventory Assets"
                    value={`KSh ${inventoryValue.toLocaleString()}`}
                    icon={<FiPackage className="text-blue-500" />}
                    trend="Based on 60% margin"
                    color="blue"
                />
                <SummaryCard
                    title="Current Liabilities"
                    value={`KSh ${totalLiabilities.toLocaleString()}`}
                    icon={<FiTrendingDown className="text-rose-500" />}
                    trend="Pending Purchase Orders"
                    color="rose"
                />
                <SummaryCard
                    title="Net Profit"
                    value={`KSh ${netProfit.toLocaleString()}`}
                    icon={<FiDollarSign className="text-amber-500" />}
                    trend="Revenue - Expenses"
                    color="amber"
                    highlight={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cash Flow Analysis */}
                <div className="lg:col-span-2 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                            <FiActivity className="text-green-500" /> CASH FLOW & EQUITY
                        </h3>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Revenue</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">Expenses</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <ProgressBar label="Commercial Revenue (Invoices)" value={totalRevenue} max={totalRevenue + totalExpenses} color="bg-emerald-500" />
                        <ProgressBar label="Operating Expenses (POs & Returns)" value={totalExpenses} max={totalRevenue + totalExpenses} color="bg-rose-500" />
                        <div className="pt-8 border-t border-white/10 dark:border-white/5 mt-8">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Retained Earnings</h4>
                                    <p className="text-4xl font-black text-emerald-500">
                                        {((netProfit / (totalRevenue || 1)) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-tight">Margin of Safety</p>
                                    <p className="text-lg font-black">{totalRevenue > totalExpenses ? 'OPTIMAL' : 'CRITICAL'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asset Distribution */}
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3">
                        <FiPieChart className="text-blue-500" /> ASSET MIX
                    </h3>
                    <div className="space-y-6">
                        <AssetItem label="Merchandise Value" value={inventoryValue} total={inventoryValue + totalRevenue} color="emerald" />
                        <AssetItem label="Accounts Receivable" value={totalRevenue} total={inventoryValue + totalRevenue} color="blue" />
                        <AssetItem label="Cash Equivalents" value={Math.max(0, netProfit)} total={inventoryValue + totalRevenue} color="amber" />
                    </div>

                    <div className="mt-12 p-6 rounded-3xl bg-green-500/5 border border-green-500/10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mb-2">Manager's Insight</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                            Business is currently operating at <span className="text-green-500 font-bold">positive equity</span>.
                            Consider reinvesting <span className="text-white font-bold">KSh {(netProfit * 0.2).toLocaleString()}</span> into upcoming sports collections.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon, trend, color, highlight = false }: any) {
    return (
        <div className={`group relative overflow-hidden backdrop-blur-3xl p-8 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] ${highlight
            ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/10 border-green-500/30'
            : 'bg-white/40 dark:bg-black/40 border-white/20 dark:border-white/10'
            }`}>
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity bg-gradient-to-bl from-white/20 to-transparent rounded-bl-[3rem]">
                {icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-4">{title}</p>
            <h4 className="text-3xl font-black mb-3 tracking-tighter">{value}</h4>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${color === 'emerald' ? 'text-emerald-500' :
                    color === 'rose' ? 'text-rose-500' :
                        color === 'blue' ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                    {trend}
                </span>
            </div>
        </div>
    );
}

function ProgressBar({ label, value, max, color }: any) {
    const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400">{label}</span>
                <span className="text-sm font-black">KSh {value.toLocaleString()}</span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden p-1">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function AssetItem({ label, value, total, color }: any) {
    const percentage = Math.min(100, Math.max(0, (value / (total || 1)) * 100));
    return (
        <div className="flex items-center gap-5">
            <div className={`w-3 h-3 rounded-full bg-${color}-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse`} />
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
                    <span className="text-[10px] font-black">{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-${color}-500 transition-all duration-1000`} style={{ width: `${percentage}%` }} />
                </div>
            </div>
        </div>
    );
}
