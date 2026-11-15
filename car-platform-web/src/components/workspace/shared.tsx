'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/lib/store/auth';
import {api} from '@/lib/api/browser';
import styles from './Operations.module.css';
export type Appointment={_id:string;__v:number;title:string;type:'meeting'|'test-drive';start:string;end:string;timeZone:string;status:'scheduled'|'cancelled'|'completed';notes:string;outcome:string;vehicle:string|null;enquiry:string|null;customer:string|null};
export type Task={_id:string;__v:number;title:string;dueAt:string;timeZone:string;status:'open'|'in-progress'|'done'|'cancelled';notes:string;vehicle:string|null;enquiry:string|null;appointment:string|null};
export type Mail={_id:string;appointment:string;appointmentVersion:number;recipient:string;messageId?:string;subject:string;text:string;state:'queued'|'sending'|'provider-accepted'|'failed'|'unknown';failure:string;attempts:number;createdAt:string;acceptedAt:string|null};
export type Options={vehicles:{_id:string;title:string}[];enquiries:{_id:string;vehicleTitle:string;buyer:{name:string}|null;car:string}[];appointments:{_id:string;title:string}[];truncated:boolean;mailAvailable:boolean};
export function useWorkspaceOptions() {
  const user=useAuth(s=>s.user);
  return useQuery({queryKey:['workspace-options',user?.id],queryFn:({signal})=>api<Options>('/workspace/options',{signal}),enabled:user?.role==='dealer'||user?.role==='admin',retry:false,gcTime:0});
}
export function ErrorPanel({error,retry}:{error:unknown;retry:()=>void}) {
  return <div role='alert' className={styles.notice}><p>{error instanceof Error?error.message:'This workspace could not load.'}</p><button onClick={retry}>Try again</button></div>;
}
export function Dialog({title,close,children}:{title:string;close:()=>void;children:ReactNode}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const trigger=document.activeElement,dialog=ref.current;
    dialog?.showModal();
    return ()=>{dialog?.close();if(trigger instanceof HTMLElement&&trigger.isConnected)trigger.focus({preventScroll:true});else document.getElementById('workspace-content')?.focus({preventScroll:true});};
  },[]);
  return <dialog ref={ref} className={styles.dialog} aria-label={title} onClose={close}>
    <header className={styles.dialogHeader}><h2>{title}</h2><button type='button' onClick={()=>ref.current?.close()} aria-label='Close editor'>Close</button></header>{children}
  </dialog>;
}
export function Occurrence({name,value,onChange}:{name:string;value:string;onChange:(value:string)=>void}) {
  return <label>{name} clock-change occurrence<select value={value} onChange={event=>onChange(event.target.value)}><option value=''>Ask if this time repeats</option><option value='earlier'>Earlier occurrence</option><option value='later'>Later occurrence</option></select></label>;
}
export function LinkFields({options,vehicle,enquiry,appointment,setVehicle,setEnquiry,setAppointment,disabled=false}:{options:Options;vehicle:string;enquiry:string;appointment?:string;setVehicle:(id:string)=>void;setEnquiry:(id:string)=>void;setAppointment?:(id:string)=>void;disabled?:boolean}) {
  return <>
    <label>Buyer enquiry (optional)<select disabled={disabled} value={enquiry} onChange={event=>{const id=event.target.value;setEnquiry(id);const linked=options.enquiries.find(item=>item._id===id);if(linked)setVehicle(linked.car);}}><option value=''>No linked enquiry</option>{enquiry&&!options.enquiries.some(item=>item._id===enquiry)&&<option value={enquiry}>Linked enquiry — authorization checked on save</option>}{options.enquiries.map(item=><option key={item._id} value={item._id}>{item.buyer?.name||'Customer unavailable'} · {item.vehicleTitle}</option>)}</select></label>
    <label>Vehicle (optional)<select disabled={disabled} value={vehicle} onChange={event=>setVehicle(event.target.value)}><option value=''>No linked vehicle</option>{vehicle&&!options.vehicles.some(item=>item._id===vehicle)&&<option value={vehicle}>Linked vehicle — availability checked on save</option>}{options.vehicles.map(item=><option key={item._id} value={item._id}>{item.title}</option>)}</select></label>
    {setAppointment&&<label>Appointment (optional)<select disabled={disabled} value={appointment||''} onChange={event=>setAppointment(event.target.value)}><option value=''>No linked appointment</option>{appointment&&!options.appointments.some(item=>item._id===appointment)&&<option value={appointment}>Linked appointment</option>}{options.appointments.map(item=><option key={item._id} value={item._id}>{item.title}</option>)}</select></label>}
    {options.truncated&&<p className={styles.muted}>Recent 100 links shown. Open an enquiry or appointment to link its specific record.</p>}
  </>;
}
export const mailLabels:Record<Mail['state'],string>={'queued':'Queued — not sent','sending':'Sending — acceptance not yet confirmed','provider-accepted':'Provider accepted — delivery unconfirmed','failed':'Failed — not accepted','unknown':'Acceptance uncertain — do not resend'};
