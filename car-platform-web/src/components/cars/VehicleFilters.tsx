 'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {api} from '@/lib/api/browser';
import s from './VehicleFilters.module.css';
const advanced=['minYear','maxYear','minMileage','maxMileage','transmission','fuelType','exteriorColor','seats','doors'] as const;
const names:Record<string,string>={brand:'Make',model:'Model',bodyStyle:'Body style',minPrice:'Price from',maxPrice:'Price to',minYear:'Year from',maxYear:'Year to',minMileage:'Mileage from',maxMileage:'Mileage to',transmission:'Transmission',fuelType:'Fuel',exteriorColor:'Colour',seats:'Seats',doors:'Doors'};
const colors:Record<string,string>={Black:'#252525',White:'#eeeae0',Grey:'#858585',Silver:'#bbbfc4',Blue:'#466a9d',Red:'#9e4242',Green:'#536f50',Brown:'#775b43',Beige:'#c1ac8b',Yellow:'#dfc15b',Orange:'#c78542',Purple:'#81638c',Gold:'#ab8b46',Other:'linear-gradient(135deg,#666,#ddd)'};
export default function VehicleFilters({initial={},brands,compact=false}:{initial?:Record<string,string>;brands:string[];compact?:boolean}){
 const [values,setValues]=useState(initial),[models,setModels]=useState<string[]>([]),[modelError,setModelError]=useState(false);
 const [count,setCount]=useState<number|null>(null),[countError,setCountError]=useState(false),[pending,setPending]=useState(true);
 const [countQuery,setCountQuery]=useState<string|null>(null);
 const [error,setError]=useState('');const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);const id=useId(),router=useRouter();
 function update(key:string,value:string){setError('');if(key==='brand'){setModels([]);setModelError(false);}setValues(v=>({...v,[key]:value,...(key==='brand'?{model:''}:{})}));}
 const query=new URLSearchParams(Object.entries(values).filter(([,v])=>v)).toString();
 const brand=values.brand||'';
 useEffect(()=>{const controller=new AbortController();if(!brand)return;api<{data:string[]}>(`/cars/meta/models?brand=${encodeURIComponent(brand)}`,{signal:controller.signal}).then(r=>{setModels(r.data);setModelError(false);}).catch(()=>{if(!controller.signal.aborted){setModels([]);setModelError(true);}});return()=>controller.abort();},[brand]);
 useEffect(()=>{const controller=new AbortController();const timer=setTimeout(()=>{setCountError(false);api<{pagination:{totalCars:number}}>(`/cars?${query}&limit=1`,{signal:controller.signal}).then(r=>{setCountQuery(query);setCount(r.pagination.totalCars);setPending(false);}).catch(()=>{if(!controller.signal.aborted){setCountQuery(query);setCountError(true);setCount(null);setPending(false);}});},300);return()=>{clearTimeout(timer);controller.abort();};},[query]);
 function close(){dialog.current?.close();trigger.current?.focus();if(compact){setValues(initial);}}
 function apply(e:React.FormEvent){e.preventDefault();for(const [min,max,label] of [['minPrice','maxPrice','price'],['minYear','maxYear','year'],['minMileage','maxMileage','mileage']]){if(values[min]&&values[max]&&Number(values[min])>Number(values[max])){setError(`Minimum ${label} must not exceed maximum.`);return;}}close();router.push(`/cars${query?'?'+query:''}`);}
 function select(key:string,options:string[],label=names[key]){return <label>{label}<select value={values[key]||''} onChange={e=>update(key,e.target.value)}><option value=''>Any {label.toLowerCase()}</option>{options.map(v=><option key={v}>{v}</option>)}</select></label>;}
 function number(key:string,min=0,max?:number){return <label>{names[key]}{key.includes('Price')?' (€)':key.includes('Mileage')?' (km)':''}<input type='number' min={min} max={max} step='1' value={values[key]||''} placeholder='No preference' onChange={e=>update(key,e.target.value)}/></label>;}
 const active=advanced.filter(k=>values[k]).length;
 const action=(pending||countQuery!==query)?'Checking matches…':countError?'Show results':`Show ${count??0} ${(count===1)?'vehicle':'vehicles'}`;
 const basicFields=(<div className={s.basics}>
 {select('brand',brands)}<label>Model<input list={`${id}-models`} value={values.model||''} placeholder={brand?'Choose or type a model':'Choose a make first'} disabled={!brand} onChange={e=>update('model',e.target.value)}/><datalist id={`${id}-models`}>{(brand?models:[]).map(m=><option key={m} value={m}/>)}</datalist>{modelError&&brand&&<small>Suggestions unavailable. You can still type a model.</small>}</label>
 {select('bodyStyle',['SUV','Sedan','Coupe','Convertible','Hatchback','Estate','Van'])}{number('minPrice')}{number('maxPrice')}
 <label>Sort by<select value={values.sort||'newest'} onChange={e=>update('sort',e.target.value)}><option value='newest'>Newest arrivals</option><option value='price_asc'>Price: low to high</option><option value='price_desc'>Price: high to low</option><option value='year_desc'>Newest year</option></select></label></div>);
 return <form onSubmit={apply} onInvalidCapture={()=>{if(!dialog.current?.open)dialog.current?.showModal();}} className={`${s.form} ${compact?s.compact:''}`} aria-label='Filter cars'>{!compact&&basicFields}
 <div className={s.actions}><button ref={trigger} className={s.secondary} type='button' aria-haspopup='dialog' onClick={()=>dialog.current?.showModal()}>More options{active?` · ${active}`:''} <span aria-hidden='true'>＋</span></button><button hidden={compact} className={s.primary} type='submit'>{action} <span aria-hidden='true'>↗</span></button></div>
 {!compact&&<div className={s.chips} aria-label='Selected filters'>{Object.entries(values).filter(([k,v])=>v&&k!=='sort'&&names[k]).map(([k,v])=><button type='button' key={k} aria-label={`Remove ${names[k]}: ${v}`} onClick={()=>{const next={...values};delete next[k];if(k==='brand')delete next.model;setValues(next);router.push('/cars?'+new URLSearchParams(Object.entries(next).filter(([,v])=>v)).toString());}}>{names[k]}: {v} ×</button>)}{Object.entries(values).some(([k,v])=>v&&k!=='sort')&&<button type='button' onClick={()=>{setValues({});router.push('/cars');}}>Reset filters</button>}</div>}
 {error&&<p role='alert' className={s.error}>{error}</p>}
 <dialog ref={dialog} className={s.dialog} aria-labelledby={`${id}-title`} onCancel={()=>{trigger.current?.focus();if(compact){setValues(initial);}}}><header><div><p className={s.eyebrow}>Consider every detail</p><h2 id={`${id}-title`}>Find your kind of drive.</h2></div><button type='button' className={s.close} onClick={close} aria-label='Close more options'>×</button></header>
 <div className={s.fields}>{compact&&<fieldset><legend>Your search</legend>{basicFields}</fieldset>}<p className={s.intro}>Choose what matters to you. Unspecified vehicle details do not count as a match.</p>
 <fieldset><legend>Age & mileage</legend><div className={s.pair}>{number('minYear',1900,new Date().getFullYear()+1)}{number('maxYear',1900,new Date().getFullYear()+1)}{number('minMileage')}{number('maxMileage')}</div></fieldset>
 <fieldset><legend>Under the bonnet</legend><div className={s.pair}>{select('transmission',['Automatic','Manual','Other'])}{select('fuelType',['Petrol','Diesel','Electric','Hybrid','Plug-in hybrid','LPG','Hydrogen','Other'])}</div></fieldset>
 <fieldset><legend>Exterior colour</legend><p className={s.intro}>Choose one or more colours.</p><div className={s.colors}>{Object.entries(colors).map(([name,color])=>{const selected=(values.exteriorColor||'').split(',').filter(Boolean);return <label key={name}><input type='checkbox' checked={selected.includes(name)} onChange={()=>update('exteriorColor',(selected.includes(name)?selected.filter(v=>v!==name):[...selected,name]).join(','))}/><span className={s.swatch} style={{background:color}} aria-hidden='true'/><span>{name}</span></label>;})}</div></fieldset>
 <fieldset><legend>Space for your life</legend><div className={s.pair}>{select('seats',['1','2','3','4','5','6','7','8','9'])}{select('doors',['1','2','3','4','5','6'])}</div></fieldset>
 {error&&<p role='alert' className={s.error}>{error}</p>}{countError&&<p role='status'>Live count unavailable. You can still apply your search.</p>}
 </div><footer><button type='button' className={s.secondary} onClick={()=>{setValues(v=>Object.fromEntries(Object.entries(v).filter(([k])=>!advanced.includes(k as typeof advanced[number]))));setError('');}}>Reset extra options</button><button className={s.primary} type='submit'>{action} <span aria-hidden='true'>→</span></button></footer></dialog>
 </form>;
}
