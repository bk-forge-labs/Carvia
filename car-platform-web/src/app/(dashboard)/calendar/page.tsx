import {Suspense} from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import Calendar from '@/components/workspace/Calendar';
import WorkspaceLoading from '@/components/layout/WorkspaceLoading';
export const metadata = {title:'Calendar | Veltrenne'};
export default function Page() {
  return <RequireAuth allow={['dealer','admin']}><Suspense fallback={<WorkspaceLoading/>}><Calendar/></Suspense></RequireAuth>;
}
