import { notFound } from 'next/navigation';
import { ApiError } from '@/lib/api/server';
import { getCarByIdServer } from '@/lib/api/car';
import VehicleDetail from '@/components/cars/VehicleDetail';
export default async function CarDetailsPage({params,searchParams}:{params:Promise<{id:string}>;searchParams?:Promise<Record<string,string|string[]|undefined>>}) {
  const {id}=await params;
  if(!/^[a-f0-9]{24}$/i.test(id))notFound();
  const result=await getCarByIdServer(id).catch(error=>{if(error instanceof ApiError && error.status===404)notFound();throw error;});
  const query=new URLSearchParams();const supplied=await searchParams;
  for(const key of ['brand','bodyStyle','minPrice','maxPrice','minYear','maxYear','sort','page']){const value=supplied?.[key];if(typeof value==='string' && value)query.set(key,value);}
  return <VehicleDetail car={result.data} profile={result.dealerProfile} similar={result.similarCars} backHref={supplied?.from === 'collection' ? '/buyer/favorites' : `/cars${query.size?`?${query}`:''}`} />;
}
