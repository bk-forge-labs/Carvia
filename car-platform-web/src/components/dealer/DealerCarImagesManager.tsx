'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import type {Car} from '@/types/car';
import VehiclePhoto from '@/components/cars/VehiclePhoto';
import {uploadCarImagesBrowser,deleteCarImageBrowser,setCarMainImageBrowser,reorderCarImagesBrowser} from '@/lib/api/dealerCars.browser';
import shared from './DealerWorkspace.module.css';
import formStyles from './DealerCarCreateForm.module.css';
import styles from './DealerCarImagesManager.module.css';
const origin=process.env.NEXT_PUBLIC_API_ORIGIN||'http://localhost:5050';
const maxPhotos=8;
export default function DealerCarImagesManager({car,onImagesUpdated}:{car:Car;onImagesUpdated?:(car:Car)=>void}){
 const input=useRef<HTMLInputElement>(null);
 const locked=useRef(false);
 const [images,setImages]=useState<string[]>(car.images||[]);
 const [cover,setCover]=useState(car.mainImage||'');
 const [busy,setBusy]=useState('');
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [dragging,setDragging]=useState(false);
 const [removing,setRemoving]=useState('');
 const [published,setPublished]=useState(!!car.isPublished);
 async function mutate(label:string,action:()=>Promise<Car>,message:string){
   if(locked.current)return;
   locked.current=true;setBusy(label);setError('');setNotice('');
   try{const updated=await action();setImages(updated.images||[]);setCover(updated.mainImage||'');setPublished(!!updated.isPublished);setRemoving('');setNotice(message);onImagesUpdated?.(updated);}
   catch(err){setError(err instanceof Error?err.message:'Unable to save your changes. Please try again.');}
   finally{locked.current=false;setBusy('');}
 }
 async function upload(files:FileList|null){
   if(locked.current||!files?.length)return;
   setError('');setNotice('');setRemoving('');
   const selected=Array.from(files);
   if(input.current)input.current.value='';
   if(selected.length+images.length>maxPhotos){setError(`You can add ${maxPhotos-images.length} more photo${maxPhotos-images.length===1?'':'s'}. Each listing supports up to 8.`);return;}
   if(selected.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type))){setError('Choose JPG, PNG or WebP photos.');return;}
   if(selected.some(file=>file.size>5*1024*1024)){setError('Each photo must be 5 MB or smaller.');return;}
   await mutate('Uploading photos…',()=>uploadCarImagesBrowser(car._id,selected),`${selected.length} photo${selected.length===1?'':'s'} added. Changes saved.`);
 }
 function move(index:number,direction:number){
   const ordered=[...images];[ordered[index],ordered[index+direction]]=[ordered[index+direction],ordered[index]];
   void mutate('Saving photo order…',()=>reorderCarImagesBrowser(car._id,ordered),'Photo order saved.');
 }
 return <>
  <ol className={formStyles.steps} aria-label="Listing progress"><li><span>01</span> Vehicle details</li><li aria-current="step"><span>02</span> Photos</li><li><span>03</span> Review & publish</li></ol>
  <div className={styles.layout} aria-busy={!!busy}>
   <div>
    <section className={styles.upload} data-dragging={dragging} onDragOver={e=>{e.preventDefault();if(!busy)setDragging(true);}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setDragging(false);}} onDrop={e=>{e.preventDefault();setDragging(false);void upload(e.dataTransfer.files);}} aria-label="Upload vehicle photos">
      <span className={styles.uploadMark} aria-hidden="true">↥</span><h2>{images.length===maxPhotos?'Your gallery is full.':'A great listing starts with great photos.'}</h2>
      <p>{images.length===maxPhotos?'Remove a photo to make room for another.':'Drop your photos here, or choose them from your device.'}</p>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="Choose vehicle photos" hidden disabled={!!busy||images.length===maxPhotos} onChange={e=>void upload(e.target.files)}/>
      <button className={shared.primary} disabled={!!busy||images.length===maxPhotos} onClick={()=>input.current?.click()}>Choose photos <span aria-hidden="true">＋</span></button>
      <p className={styles.small}>JPG, PNG or WebP · Up to 5 MB each · 8 photos maximum</p>
    </section>
    <div className={styles.messages}><p role="status">{busy||notice}</p>{error&&<p role="alert" className={shared.error}>{error}</p>}</div>
    <div className={styles.galleryHeading}><h2>Your gallery</h2><span>{images.length} / 8 photos</span></div>
    {!images.length?<div className={styles.empty}><h3>The first photo sets the scene.</h3><p>Add a clear exterior view to start. Your first upload becomes the cover; you can change it anytime.</p></div>:<ol className={styles.grid}>
      {images.map((url,index)=><li className={styles.card} key={url} data-cover={cover===url}>
        <div className={styles.photo}><VehiclePhoto src={url.startsWith('/uploads/')?origin+url:url} title={`${car.title} — photo ${index+1}`}/>{cover===url&&<span className={styles.badge}>Cover photo</span>}</div>
        <div className={styles.controls}><div className={styles.position}><span>Photo {String(index+1).padStart(2,'0')}</span><div><button disabled={!!busy||index===0} aria-label={`Move photo ${index+1} earlier`} onClick={()=>move(index,-1)}>←</button><button disabled={!!busy||index===images.length-1} aria-label={`Move photo ${index+1} later`} onClick={()=>move(index,1)}>→</button></div></div>
          <div className={styles.actions}><button className={shared.secondary} disabled={!!busy||cover===url} onClick={()=>void mutate('Updating cover…',()=>setCarMainImageBrowser(car._id,url),'Cover photo saved.')}>{cover===url?'Current cover':'Use as cover'}</button><button className={shared.danger} disabled={!!busy} aria-label={`Remove photo ${index+1}`} onClick={()=>setRemoving(url)}>Remove</button></div>
          {removing===url&&<div className={styles.confirm} role="group" aria-label={`Confirm removal of photo ${index+1}`}><p>Remove this photo from your listing?</p><div><button className={shared.danger} disabled={!!busy} onClick={()=>void mutate('Removing photo…',()=>deleteCarImageBrowser(car._id,url),'Photo removed. Changes saved.')}>Yes, remove</button><button className={shared.secondary} disabled={!!busy} onClick={()=>setRemoving('')}>Keep photo</button></div></div>}
        </div>
      </li>)}
    </ol>}
   </div>
   <aside className={styles.aside}><p className={shared.eyebrow}>STEP 02 / 03</p><h2>Build buyer confidence.</h2><p>Show the vehicle as it is. Clear, recent photos help buyers decide.</p><ul><li>Start with an exterior three-quarter view.</li><li>Show both sides, the front and the rear.</li><li>Include the cabin and dashboard.</li><li>Photograph important details and any damage.</li></ul><div className={styles.note}><strong>{published?'This listing is public.':'Your listing remains a draft.'}</strong><p>{published?'Photo changes update your live listing.':'Adding photos does not publish your vehicle.'} Changes save automatically.</p></div>
   {busy?<button className={shared.primary} disabled>Saving changes…</button>:<Link className={shared.primary} href={`/dealer/cars/${car._id}`}>{published?'Review listing':'Continue to review'} <span aria-hidden="true">→</span></Link>}
   {!images.length&&<p className={styles.small}>Add at least one photo before publishing.</p>}
   </aside>
  </div>
 </>;
}
