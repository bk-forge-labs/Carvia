import type {Appointment} from '@/components/workspace/shared';
import {addDays,localTime} from './time';

// Display both commitments without changing the underlying record used for edits.
export function calendarEntries(records:Appointment[],zone:string) {
  const grouped=new Map<string,Appointment[]>();
  for(const record of records) {
    const slots:Appointment[]=[{...record,calendarSlot:'primary'}];
    if(record.status==='reschedule-proposed'&&record.reservedStart&&record.reservedEnd) {
      slots.push({...record,start:record.reservedStart,end:record.reservedEnd,calendarSlot:'reserved'});
    }
    for(const item of slots) {
      const lastDay=localTime(new Date(new Date(item.end).getTime()-1).toISOString(),zone).slice(0,10);
      for(let day=localTime(item.start,zone).slice(0,10);day<=lastDay;day=addDays(day,1)) {
        grouped.set(day,[...(grouped.get(day)||[]),item]);
      }
    }
  }
  for(const entries of grouped.values())entries.sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
  return grouped;
}
