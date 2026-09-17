import DealerDirectory from '@/components/admin/DealerDirectory';
export default async function AdminDealerPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DealerDirectory key={id} id={id} />; }
