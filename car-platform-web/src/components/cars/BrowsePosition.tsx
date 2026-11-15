'use client';
import {useEffect} from 'react';
export default function BrowsePosition({query}:{query:string}){
 useEffect(()=>{
  const key='veltrenne-browse:'+query;
  const remember=(event:MouseEvent)=>{if((event.target as Element)?.closest('a[href^="/cars/"]')){try{sessionStorage.setItem(key,String(window.scrollY));sessionStorage.setItem('veltrenne-restore-browse',key);}catch{}}};
  try{if(sessionStorage.getItem('veltrenne-restore-browse')===key){const y=Number(sessionStorage.getItem(key));sessionStorage.removeItem('veltrenne-restore-browse');requestAnimationFrame(()=>window.scrollTo({top:Number.isFinite(y)?y:0,behavior:'instant'}));}}catch{}
  document.addEventListener('click',remember);return()=>document.removeEventListener('click',remember);
 },[query]);return null;
}
