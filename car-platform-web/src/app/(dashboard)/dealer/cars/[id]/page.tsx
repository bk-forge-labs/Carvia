import {getDealerCarByIdServer,getDealerCarReadinessServer} from '@/lib/api/dealerCars.server';
import DealerListingReview from '@/components/dealer/DealerListingReview';
export default async function DealerCarDetailsPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const [car,readiness]=await Promise.all([getDealerCarByIdServer(id),getDealerCarReadinessServer(id)]);
 return <DealerListingReview car={car} readiness={readiness}/>;
}
