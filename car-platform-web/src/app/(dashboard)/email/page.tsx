import {Suspense} from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import EmailHistory from '@/components/workspace/EmailHistory';
import WorkspaceLoading from '@/components/layout/WorkspaceLoading';
export const metadata = {title:'Email history | Veltrenne'};
export default function Page() {
  return <RequireAuth allow={['dealer','admin']}><Suspense fallback={<WorkspaceLoading/>}><EmailHistory/></Suspense></RequireAuth>;
}
