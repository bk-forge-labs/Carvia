import DealerInvitation from '@/components/home/DealerInvitation';
import HowCarviaWorks from '@/components/home/HowCarviaWorks';
import DiscoveryExperience from '@/components/home/DiscoveryExperience';
import HomeClosing, { HomeFooter } from '@/components/home/HomeClosing';

export default function HomePage() {
  return (
    <>
    <main id='carvia-home' className='bg-[#050608] text-white'>
      <DiscoveryExperience />

      <HowCarviaWorks />

      <DealerInvitation />

      <HomeClosing />
    </main>
    <HomeFooter />
    </>
  );
}
