import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {signInHref} from '@/lib/auth/returnTo';
export type DealerProfileState={id:string;companyName:string;phone:string;address?:string;status:'pending'|'approved'|'rejected'|'suspended';rejectionReason?:string};
export async function getDealerProfileState(destination='/dealer'):Promise<DealerProfileState|null>{
 const base=process.env.API_INTERNAL_BASE_URL||process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:5050/api';
 const response=await fetch(`${base}/dealers/me`,{headers:{Cookie:(await cookies()).toString()},cache:'no-store'});
 if(response.status===401)redirect(signInHref(destination));
 if(response.status===403)redirect('/account');
 if(response.status===404)return null;
 if(!response.ok)throw new Error('Your dealer application could not be loaded. Please try again.');
 return (await response.json()).data;
}
export async function requireApprovedDealer(destination:string){
 const profile=await getDealerProfileState(destination);
 if(!profile)redirect('/dealer/onboarding');
 if(profile.status!=='approved')redirect('/dealer/pending');
 return profile;
}
