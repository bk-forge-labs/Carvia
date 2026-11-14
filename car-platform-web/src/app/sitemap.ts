import type {MetadataRoute} from 'next';
import {getCarsServer} from '@/lib/api/car';
export const dynamic = 'force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap> {
 const origin=process.env.NEXT_PUBLIC_SITE_URL;
 if(!origin)return [];
 const entries:MetadataRoute.Sitemap=[{url:new URL('/',origin).href},{url:new URL('/cars',origin).href}];
 let page=1,totalPages=1;
 do {
  const result=await getCarsServer({page});totalPages=result.pagination.totalPages;
  for(const car of result.data)if(!car.isDemo)entries.push({url:new URL(`/cars/${car._id}`,origin).href});
  page++;
 }while(page<=totalPages);
 return entries;
}
