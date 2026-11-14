import type {Metadata} from 'next';
import { notFound } from 'next/navigation';
import { ApiError } from '@/lib/api/server';
import { getCarByIdServer } from '@/lib/api/car';
import VehicleDetail from '@/components/cars/VehicleDetail';
export default async function CarDetailsPage({params,searchParams}:{params:Promise<{id:string}>;searchParams?:Promise<Record<string,string|string[]|undefined>>}) {
  const {id}=await params;
  if(!/^[a-f0-9]{24}$/i.test(id))notFound();
  const result=await getCarByIdServer(id).catch(error=>{if(error instanceof ApiError && error.status===404)notFound();throw error;});
  const query=new URLSearchParams();const supplied=await searchParams;
  for(const key of ['brand','model','bodyStyle','minPrice','maxPrice','minYear','maxYear','minMileage','maxMileage','transmission','fuelType','exteriorColor','seats','doors','sort','page']){const value=supplied?.[key];if(typeof value==='string' && value)query.set(key,value);}
  return <VehicleDetail car={result.data} profile={result.dealerProfile} similar={result.similarCars} backHref={supplied?.from === 'collection' ? '/buyer/favorites' : `/cars${query.size?`?${query}`:''}`} />;
}

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata> {
 const {id}=await params;
 if(!/^[a-f0-9]{24}$/i.test(id))return {title:'Vehicle unavailable | Veltrenne',robots:{index:false,follow:false}};
 try {
  const {data:car}=await getCarByIdServer(id);
  const title=`${car.title} | Veltrenne`;
  const description=car.isDemo?'Sample vehicle for exploring Veltrenne. Not an offer for sale.':`${car.title}${car.year?` · ${car.year}`:''}${Number.isFinite(car.mileage)?` · ${car.mileage.toLocaleString('en-GB')} km`:''}. Explore vehicle details and contact the seller on Veltrenne.`;
  const origin=process.env.NEXT_PUBLIC_SITE_URL;
  const canonical=origin?new URL(`/cars/${id}`,origin).href:undefined;
  const raw=car.mainImage;
  const photo=raw?.startsWith('/uploads/')&&process.env.NEXT_PUBLIC_API_ORIGIN?`${process.env.NEXT_PUBLIC_API_ORIGIN}${raw}`:undefined;
  return {title,description,alternates:canonical?{canonical}:undefined,robots:{index:!!origin&&!car.isDemo,follow:true},openGraph:{title,description,...(canonical?{url:canonical}:{}),...(photo?{images:[photo]}:{})}};
 } catch{return {title:'Vehicle unavailable | Veltrenne',robots:{index:false,follow:false}};}
}
