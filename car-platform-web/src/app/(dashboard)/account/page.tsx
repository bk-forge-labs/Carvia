import type {Metadata} from 'next';
import AccountSettings from '@/components/auth/AccountSettings';
export const metadata:Metadata={title:'Your account | Veltrenne',robots:{index:false,follow:false}};
export default function Page(){return <AccountSettings/>;}
