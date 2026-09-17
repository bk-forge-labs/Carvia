import InventoryReview from '@/components/admin/InventoryReview';
export default async function AdminCarReviewPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <InventoryReview key={id} id={id}/>;}
