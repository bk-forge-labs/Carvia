import {redirect} from 'next/navigation';
import {getDealerProfileState} from '@/lib/api/dealerProfile.server';
import DealerOnboardingForm from '@/components/dealer/DealerOnboardingForm';
import styles from '@/components/dealer/DealerWorkspace.module.css';
export default async function DealerOnboardingPage(){
 const profile=await getDealerProfileState('/dealer/onboarding');
 if(profile)redirect(profile.status==='approved'?'/dealer':'/dealer/pending');
 return <main className={styles.page}><div className={styles.inner}><DealerOnboardingForm/></div></main>;
}
