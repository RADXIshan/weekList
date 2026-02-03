import { useApp } from '../context/AppContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { CheckCircle2, Trophy, Flame, PieChart, Trash2, Calendar, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ElementType, color: string }) => (
  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-20 flex items-center justify-center`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <h3 className="text-neutral-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-neutral-100">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
    const { getWeeklyStats, getMonthlyStats, tasks, dailProgress, getStreak, resetMetrics } = useApp();
    const weeklyStats = getWeeklyStats();
    const monthlyStats = getMonthlyStats();
    
    // Calculate total completed correctly
    const totalCompleted = tasks.filter(t => t.completed).length; 
    const todayProgress = dailProgress(new Date());

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-neutral-100 tracking-tight flex items-center gap-3">
                    <PieChart className="w-8 h-8 text-indigo-500" />
                    Progress Dashboard
                </h2>
                <button 
                    onClick={() => {
                        // Custom modal or simple confirm for now, but styled better?
                        // Since I can't easily add a modal portal without more code, I'll stick to confirm but text was approved.
                        if (confirm('⚠️ DANGER: Are you sure you want to delete ALL tasks and reset metrics?\n\nThis action cannot be undone.')) {
                            resetMetrics();
                        }
                    }}
                    className="text-xs text-red-500/60 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Reset System
                </button>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title="Total Completed" 
                    value={totalCompleted} 
                    icon={CheckCircle2} 
                    color="bg-green-500 text-green-500" 
                />
                 <StatCard 
                    title="Daily Progress" 
                    value={`${todayProgress}%`} 
                    icon={Flame} 
                    color="bg-orange-500 text-orange-500" 
                />
                <StatCard 
                    title="Current Streak" 
                    value={`${getStreak()} Days`} 
                    icon={Trophy} 
                    color="bg-yellow-500 text-yellow-500" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Weekly Chart */}
                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-700 transition-colors">
                    <h3 className="text-lg font-semibold text-neutral-200 mb-6 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-500" />
                        Weekly Activity
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis 
                                    dataKey="dayName" 
                                    stroke="#555" 
                                    tick={{ fill: '#777', fontSize: 12 }} 
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#555" 
                                    tick={{ fill: '#777', fontSize: 12 }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#e5e5e5' }}
                                    cursor={{fill: '#262626'}}
                                />
                                <Bar dataKey="total" fill="#404040" radius={[4, 4, 0, 0]} stackId="a" barSize={32} />
                                <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Chart */}
                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-700 transition-colors">
                     <h3 className="text-lg font-semibold text-neutral-200 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-neutral-500" />
                        Yearly Overview
                     </h3>
                     <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyStats}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#555" 
                                    tick={{ fill: '#777', fontSize: 12 }} 
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#555" 
                                    tick={{ fill: '#777', fontSize: 12 }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#e5e5e5' }}
                                />
                                <Area type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                            </AreaChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
