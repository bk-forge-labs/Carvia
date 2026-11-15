export function localTime(instant: string, timeZone: string) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23',
  }).formatToParts(new Date(instant)).map(part => [part.type,part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
export function occurrenceFor(instant: string, timeZone: string) {
  const value = new Date(instant).getTime(), wall = localTime(instant,timeZone);
  for (let minutes=15; minutes<=180; minutes+=15) {
    if (localTime(new Date(value-minutes*60000).toISOString(),timeZone)===wall) return 'later';
    if (localTime(new Date(value+minutes*60000).toISOString(),timeZone)===wall) return 'earlier';
  }
  return '';
}
export function addDays(day: string, amount: number) {
  const date = new Date(day+'T12:00:00Z'); date.setUTCDate(date.getUTCDate()+amount);
  return date.toISOString().slice(0,10);
}
export function dayLabel(day: string, options: Intl.DateTimeFormatOptions = {dateStyle:'full'}) {
  return new Intl.DateTimeFormat('en-GB',{...options,timeZone:'UTC'}).format(new Date(day+'T12:00Z'));
}
export function clock(instant: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB',{timeZone,hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date(instant));
}
export function calendarDays(anchor: string, view: string) {
  if (view==='day') return [anchor];
  const first=view==='month'?anchor.slice(0,7)+'-01':anchor;
  const weekday=new Date(first+'T12:00Z').getUTCDay();
  const start=addDays(first,-((weekday+6)%7));
  const count=view==='month'?42:7;
  return Array.from({length:count},(_,index)=>addDays(start,index));
}
