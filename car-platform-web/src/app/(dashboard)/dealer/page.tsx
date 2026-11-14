import {requireApprovedDealer} from '@/lib/api/dealerProfile.server';
import {getDealerDashboardStatsServer} from '@/lib/api/dealerDashboard.server';
import DealerCommandCenter from '@/components/dealer/DealerCommandCenter';
export default async function DealerDashboardPage(){const profile=await requireApprovedDealer('/dealer');const stats=await getDealerDashboardStatsServer();return <DealerCommandCenter stats={stats} companyName={profile.companyName}/>;}
