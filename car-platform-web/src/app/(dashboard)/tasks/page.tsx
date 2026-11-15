import {Suspense} from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import Tasks from '@/components/workspace/Tasks';
import WorkspaceLoading from '@/components/layout/WorkspaceLoading';
export const metadata = {title:'Follow-up tasks | Veltrenne'};
export default function Page() {
  return <RequireAuth allow={['dealer','admin']}><Suspense fallback={<WorkspaceLoading/>}><Tasks/></Suspense></RequireAuth>;
}
