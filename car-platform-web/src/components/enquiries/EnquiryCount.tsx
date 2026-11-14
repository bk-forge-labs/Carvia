'use client';
import {useQuery} from '@tanstack/react-query';
import {api} from '@/lib/api/browser';
import {useAuth} from '@/lib/store/auth';
import styles from './EnquiryCount.module.css';
export default function EnquiryCount(){
 const user=useAuth(s=>s.user),hydrated=useAuth(s=>s.hasHydrated);
 const query=useQuery({queryKey:['enquiry-count',user?.id],queryFn:({signal})=>api<{newCount:number}>('/enquiries/summary',{signal}),enabled:hydrated&&user?.role==='dealer',staleTime:15000,refetchInterval:30000,refetchOnWindowFocus:'always',gcTime:0,retry:false});
 if(user?.role!=='dealer'||!query.data||query.isError)return null;
 const count=query.data.newCount;
 if(count===0)return null;
 return <span className={styles.count} title={`${count} new ${count===1?'enquiry':'enquiries'}`} aria-label={`${count} new ${count===1?'enquiry':'enquiries'}`}>{count>99?'99+':count}</span>;
}
