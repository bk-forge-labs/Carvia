'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import styles from './VehicleDetail.module.css';
function Photo({src,title,large=false,onFailure}:{src:string;title:string;large?:boolean;onFailure?:()=>void}) {const [failed,setFailed]=useState(false);return !failed?<Image src={src} alt={title} width={1600} height={1067} unoptimized className={large?styles.largePhoto:styles.photo} onError={()=>{setFailed(true);onFailure?.();}}/>:<div className={styles.photoFallback}>Photograph unavailable</div>;}
export function CarGallery({title,apiOrigin,mainImage,images}:{title:string;apiOrigin:string;mainImage?:string|null;images?:string[]|null}) {
  const urls=Array.from(new Set([mainImage,...images || []].filter((value):value is string=>typeof value==='string' && !!value.trim()).map(value=>value.trim()).map(value=>value.startsWith('/uploads/')?`${apiOrigin}${value}`:value).filter(value=>/^https?:\/\//.test(value) || (value.startsWith('/')&&!value.startsWith('//')))));
  const [selected,setSelected]=useState(0);const index=Math.min(selected,Math.max(0,urls.length-1));const [failed,setFailed]=useState<string[]>([]);const dialog=useRef<HTMLDialogElement>(null);const opener=useRef<HTMLButtonElement>(null);
  const move=(direction:number)=>setSelected((index+direction+urls.length)%urls.length);
  return <section className={styles.gallery} aria-label={`${title} photographs`}>
    {urls.length?<><button ref={opener} type='button' className={styles.mainPhoto} disabled={failed.includes(urls[index])} aria-label={`Enlarge photograph ${index+1} of ${urls.length}`} onClick={()=>dialog.current?.showModal()}><Photo key={urls[index]} src={urls[index]} title={`${title}, photograph ${index+1}`} onFailure={()=>setFailed(previous=>[...previous,urls[index]])}/>{!failed.includes(urls[index]) && <span className={styles.enlarge}>View full size ↗</span>}</button>
      <div className={styles.galleryBar}><p aria-live='polite'>Photograph {index+1} / {urls.length}</p>{urls.length>1 && <div><button type='button' aria-label='Previous photograph' onClick={()=>move(-1)}>←</button><button type='button' aria-label='Next photograph' onClick={()=>move(1)}>→</button></div>}</div>
      {urls.length>1 && <div className={styles.thumbnails}>{urls.map((src,i)=><button type='button' key={src} aria-label={`Select photograph ${i+1}`} aria-pressed={i===index} onClick={()=>setSelected(i)}><Photo src={src} title=''/></button>)}</div>}
      <dialog ref={dialog} className={styles.lightbox} aria-label={`${title} enlarged photographs`} onClose={()=>opener.current?.focus()} onKeyDown={event=>{if(urls.length>1 && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}}}>
        <div className={styles.lightboxBar}><span>Photograph {index+1} / {urls.length}</span><button type='button' onClick={()=>dialog.current?.close()} aria-label='Close photographs'>Close ×</button></div><Photo key={urls[index]} src={urls[index]} title={`${title}, photograph ${index+1}`} large/>{urls.length>1 && <div className={styles.lightboxBar}><button type='button' onClick={()=>move(-1)}>← Previous</button><button type='button' onClick={()=>move(1)}>Next →</button></div>}
      </dialog></>:<div className={styles.photoFallback}>Photography is not available for this listing.</div>}
  </section>;
}
