import {redirect} from 'next/navigation';
import {getDealerProfileState} from '@/lib/api/dealerProfile.server';
import DealerApplicationStatus from '@/components/dealer/DealerApplicationStatus';
export default async function DealerPendingPage(){
 const profile=await getDealerProfileState('/dealer/pending');
 if(!profile)redirect('/dealer/onboarding');
 if(profile.status==='approved')redirect('/dealer');
 return <DealerApplicationStatus profile={profile}/>;
}
