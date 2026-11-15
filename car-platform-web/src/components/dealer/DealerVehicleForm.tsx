'use client';

import {useRef, useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import type {Car} from '@/types/car';
import {createDealerCarBrowser,updateDealerCarBrowser} from '@/lib/api/dealerCars.browser';
import shared from './DealerWorkspace.module.css';
import styles from './DealerCarCreateForm.module.css';

type FormState = {conditionReport:string;disclosedCharges:string;testDriveAvailable:string;exteriorColor:string;seats:string;doors:string;title:string; brand:string; model:string; bodyStyle:string; fuelType:string; transmission:string; location:string; price:string; year:string; mileage:string; owner:'Dealer'|'Private'; condition:''|'Smoker'|'Non-Smoker'; description:string};
type Field = keyof FormState;
const initial:FormState = {conditionReport:'',disclosedCharges:'',testDriveAvailable:'',exteriorColor:'',seats:'',doors:'',title:'',brand:'',model:'',bodyStyle:'',fuelType:'',transmission:'',location:'',price:'',year:'',mileage:'',owner:'Dealer',condition:'',description:''};
const labels:Record<Field,string> = {conditionReport:'Condition report (dealer supplied)',disclosedCharges:'Additional charges (dealer supplied)',testDriveAvailable:'Available for test drives',exteriorColor:'Exterior colour',seats:'Seats',doors:'Doors',title:'Listing title',brand:'Brand',model:'Model / trim',bodyStyle:'Body style',fuelType:'Fuel type',transmission:'Transmission',location:'Vehicle location',price:'Asking price (€)',year:'Model year',mileage:'Mileage (km)',owner:'Seller type',condition:'Smoking history',description:'Description'};
export default function DealerVehicleForm({car}:{car?:Car}){
  const router=useRouter();
  const [form,setForm]=useState<FormState>(()=>car?{conditionReport:car.conditionReport||'',disclosedCharges:car.disclosedCharges||'',testDriveAvailable:car.testDriveAvailable===true?'Yes':car.testDriveAvailable===false?'No':'',exteriorColor:car.exteriorColor||'',seats:car.seats==null?'':String(car.seats),doors:car.doors==null?'':String(car.doors),title:car.title||'',brand:car.brand||'',model:car.model||'',bodyStyle:car.bodyStyle||'',fuelType:car.fuelType||'',transmission:car.transmission||'',location:car.location||'',price:car.price==null?'':String(car.price),year:car.year==null?'':String(car.year),mileage:car.mileage==null?'':String(car.mileage),owner:car.owner==='Private'?'Private':'Dealer',condition:car.condition==='Smoker'||car.condition==='Non-Smoker'?car.condition:'',description:car.description||''}:initial);
  const [errors,setErrors]=useState<Partial<Record<Field,string>>>({});
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const pending=useRef(false);
  const formRef=useRef<HTMLFormElement>(null);
  function update(key:Field,value:string){setForm(current=>({...current,[key]:value}));setErrors(current=>({...current,[key]:undefined}));}
  function validate(){
    const result:Partial<Record<Field,string>>={};
    if(form.title.trim().length<3)result.title='Enter a title of at least 3 characters.';
    if(!form.brand.trim())result.brand='Enter the manufacturer.';
    if(!form.model.trim())result.model='Enter the model or trim.';
    if(!form.price.trim()||!Number.isFinite(Number(form.price))||Number(form.price)<=0)result.price='Enter an asking price greater than zero.';
    if(!form.year.trim()||!Number.isInteger(Number(form.year))||Number(form.year)<1900||Number(form.year)>new Date().getFullYear()+1)result.year=`Enter a year between 1900 and ${new Date().getFullYear()+1}.`;
    if(!form.mileage.trim()||!Number.isInteger(Number(form.mileage))||Number(form.mileage)<0)result.mileage='Enter the mileage in whole kilometres. Zero is valid.';
    if(!form.condition)result.condition='Select the confirmed smoking history.';
    for(const key of ['seats','doors'] as const)if(form[key]&&(!Number.isInteger(Number(form[key]))||Number(form[key])<1||Number(form[key])>(key==='seats'?9:6)))result[key]='Select a valid count or leave unspecified.';
    return result;
  }
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(pending.current)return;
    const issues=validate();setErrors(issues);setError('');
    const first=Object.keys(issues)[0];
    if(first){(formRef.current?.elements.namedItem(first) as HTMLElement|null)?.focus();return;}
    pending.current=true;setLoading(true);
    try{
      const payload={...form,testDriveAvailable:form.testDriveAvailable===''?undefined:form.testDriveAvailable==='Yes',seats:form.seats?Number(form.seats):null,doors:form.doors?Number(form.doors):null,title:form.title.trim(),brand:form.brand.trim(),model:form.model.trim(),description:form.description.trim(),condition:form.condition as 'Smoker'|'Non-Smoker',price:Number(form.price),year:Number(form.year),mileage:Number(form.mileage)};
      if(car){await updateDealerCarBrowser(car._id,payload);router.push(`/dealer/cars/${car._id}`);router.refresh();}
      else{const created=await createDealerCarBrowser(payload);router.push(`/dealer/cars/${created._id}/images`);}
    }catch(err){setError(err instanceof Error?err.message:'Unable to save. Please try again.');pending.current=false;setLoading(false);}
  }
  function field(key:Field,options?:{type?:string;hint?:string;choices?:string[];optional?:boolean;placeholder?:string}){
    const attrs={id:key,name:key,value:form[key],onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>update(key,e.target.value),'aria-invalid':!!errors[key],'aria-describedby':`${key}-hint${errors[key]?` ${key}-error`:''}`,required:!options?.optional};
    return <div className={styles.field} key={key}><label htmlFor={key}>{labels[key]}{options?.optional&&<span>Optional</span>}</label>
      {options?.choices?<select {...attrs}>{options.choices.map(value=><option key={value} value={value}>{value||(key==='condition'?'Select history':'Select if known')}</option>)}</select>:['description','conditionReport','disclosedCharges'].includes(key)?<textarea {...attrs} rows={5} placeholder="Describe its condition, service history, equipment and any known faults."/>:<input {...attrs} type={options?.type||'text'} placeholder={options?.placeholder} step={key==='price'?'0.01':'1'} min={key==='year'?1900:key==='price'?0.01:key==='mileage'?0:undefined} max={key==='year'?new Date().getFullYear()+1:undefined}/>}
      <p id={`${key}-hint`} className={styles.hint}>{options?.hint}</p>{errors[key]&&<p id={`${key}-error`} className={styles.fieldError}>{errors[key]}</p>}
    </div>;
  }
  return <>
    {!car&&<ol className={styles.steps} aria-label="Listing progress"><li aria-current="step"><span>01</span> Vehicle details</li><li><span>02</span> Photos</li><li><span>03</span> Review & publish</li></ol>}
    <form ref={formRef} onSubmit={submit} noValidate className={styles.layout} aria-busy={loading}>
      <div className={styles.sections}>
        <fieldset className={styles.section} disabled={loading}><legend>Vehicle identity</legend><p className={styles.lead}>Help buyers find exactly what they’re looking for.</p>
          {field('title',{placeholder:'e.g. BMW 320i M Sport',hint:'The headline buyers will see on your listing.'})}
          <div className={styles.grid}>{field('brand',{placeholder:'e.g. BMW'})}{field('model',{placeholder:'e.g. 320i M Sport'})}{field('year',{type:'number',placeholder:'e.g. 2021'})}{field('bodyStyle',{optional:true,choices:['','SUV','Sedan','Coupe','Convertible','Hatchback','Estate','Van']})}</div>
        </fieldset>
        <fieldset className={styles.section} disabled={loading}><legend>Price & history</legend><p className={styles.lead}>Accurate information builds confidence from the first view.</p><div className={styles.grid}>
          {field('conditionReport',{optional:true})}{field('disclosedCharges',{optional:true})}{field('testDriveAvailable',{optional:true,choices:['','Yes','No'],hint:'Choose Yes or No before publishing. Leaving this blank does not allow requests. Disabling new requests preserves existing commitments.'})}{field('price',{type:'number',placeholder:'e.g. 28500',hint:'Full asking price in euros.'})}{field('mileage',{type:'number',placeholder:'e.g. 42000',hint:'Odometer reading in kilometres.'})}{field('owner',{choices:['Dealer','Private']})}{field('condition',{choices:['','Non-Smoker','Smoker']})}
        </div></fieldset>
        <fieldset className={styles.section} disabled={loading}><legend>The details that matter</legend><p className={styles.lead}>Give buyers a clear, honest picture of the vehicle.</p><div className={styles.grid}>{field('fuelType',{optional:true,choices:['','Petrol','Diesel','Electric','Hybrid','Plug-in hybrid','LPG','Hydrogen','Other']})}{field('transmission',{optional:true,choices:['','Automatic','Manual','Other']})}{field('exteriorColor',{optional:true,choices:["", "Black", "White", "Grey", "Silver", "Blue", "Red", "Green", "Brown", "Beige", "Yellow", "Orange", "Purple", "Gold", "Other"]})}{field('seats',{optional:true,choices:['','1','2','3','4','5','6','7','8','9']})}{field('doors',{optional:true,choices:['','1','2','3','4','5','6']})}{field('location',{optional:true,placeholder:'City or region',hint:'Where buyers can view this vehicle.'})}</div>{field('description',{optional:true,hint:'Include only details you can confirm. You can edit this later.'})}</fieldset>
      </div>
      <aside className={styles.aside}><p className={shared.eyebrow}>{car?'YOUR LISTING / DETAILS':'STEP 01 / 03'}</p><h2>{car?'Keep every detail accurate.':'A considered first impression.'}</h2><p>{car?'Update the saved information below, then return to your listing to review it.':'Your details become the foundation of your listing.'} All fields are required unless marked optional.</p><div className={styles.note}><span>{car?(car.isPublished?'You’re editing a live listing.':'Your listing is a private draft.'):'Saved as a draft'}</span><p>{car?(car.isPublished?'Saved changes may appear publicly. Changes to a previously reviewed vehicle can return it to a private draft for another review.':'Saving details does not publish this vehicle.'):'Your vehicle stays private until you add photos and choose to publish.'}</p></div>
        {error&&<p role="alert" className={styles.fieldError}>{error}</p>}
        <button className={shared.primary} type="submit" disabled={loading}>{loading?'Saving…':car?'Save & review listing':'Save & continue to photos'}{!loading&&<span aria-hidden="true">→</span>}</button>
        {car?<Link className={shared.back} href={`/dealer/cars/${car._id}`}>Back without saving</Link>:<p className={styles.footnote}>You can return to your draft from inventory.</p>}
      </aside>
    </form>
  </>;
}
