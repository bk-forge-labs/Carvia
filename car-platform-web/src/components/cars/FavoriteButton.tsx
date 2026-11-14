'use client';
import {useRef,useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {api,ApiError} from '@/lib/api/browser';
import {setFavoriteBrowser} from '@/lib/api/favorites';
import {useAuth} from '@/lib/store/auth';
import {signInHref} from '@/lib/auth/returnTo';
import styles from './VehicleDetail.module.css';
import cardStyles from './CarCard.module.css';
type Saved={success:boolean;data:{_id:string}[]};
export default function FavoriteButton({carId,title,compact=false}:{carId:string;title?:string;compact?:boolean}){
 const router=useRouter(),client=useQueryClient();
 const user=useAuth(s=>s.user),hydrated=useAuth(s=>s.hasHydrated);
 const key=['favorites',user?.id];
 const query=useQuery({queryKey:key,enabled:hydrated&&!!user,queryFn:async({signal})=>{const result=await api<Saved>('/favorites/me',{signal});if(!result.success||!Array.isArray(result.data))throw Error('Invalid saved vehicles');return result;},staleTime:15000,retry:false,gcTime:0});
 const saved=!!user&&!!query.data?.data.some(car=>car._id===carId);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const lock=useRef(false);
 const sessionExpired=query.error instanceof ApiError&&query.error.status===401;
 const loadError=!!user&&query.isError&&!sessionExpired;
 const ready=hydrated&&(!user||sessionExpired||query.isSuccess);
 async function toggle(){if(lock.current||!ready)return;if(!user||sessionExpired){router.push(signInHref(window.location.pathname+window.location.search));return;}lock.current=true;setBusy(true);setError('');try{const result=await setFavoriteBrowser(carId,!saved);if(!result.success)throw Error();client.setQueryData<Saved>(key,old=>({success:true,data:result.isFavorite?[...(old?.data||[]).filter(car=>car._id!==carId),{_id:carId}]:(old?.data||[]).filter(car=>car._id!==carId)}));}catch(e){if(e instanceof ApiError&&e.status===401)router.push(signInHref(window.location.pathname+window.location.search));else setError('Could not update your saved vehicles. Please try again.');}finally{lock.current=false;setBusy(false);}}
 return <div className={compact?cardStyles.saveControl:styles.saved}><button type='button' onClick={toggle} disabled={!ready||busy} aria-pressed={saved} aria-label={`${saved?'Remove':'Save'} ${title||'this vehicle'}${saved?' from favourites':' to favourites'}`} className={compact?cardStyles.saveButton:styles.secondary}><span aria-hidden='true'>{saved?'♥':'♡'}</span>{busy?'Updating…':saved?(compact?'Saved':'Saved to your collection'):(compact?'Save vehicle':'Save this vehicle')}</button>{!compact&&saved&&<Link className={styles.back} href='/buyer/favorites'>View your collection →</Link>}{(error||loadError)&&<p className={compact?cardStyles.actionError:undefined} role='alert'>{error||'Saved status is unavailable.'}{loadError&&<button type='button' onClick={()=>{void query.refetch();}}>Retry</button>}</p>}</div>;
}
