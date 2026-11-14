import DealerDirectory from '@/components/admin/DealerDirectory';
export default async function Page({searchParams}:{searchParams:Promise<{status?:string}>}){const {status}=await searchParams;return <DealerDirectory initialStatus={status}/>;}
