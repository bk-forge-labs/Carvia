import {getDealerDashboardStatsServer} from '@/lib/api/dealerDashboard.server';
import DealerCommandCenter from '@/components/dealer/DealerCommandCenter';
export default async function DealerDashboardPage(){const stats=await getDealerDashboardStatsServer();return <DealerCommandCenter stats={stats}/>;}
