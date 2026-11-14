import type {Metadata} from 'next';
import InformationLayout from '@/components/information/InformationLayout';
import s from '@/components/information/Information.module.css';
export const metadata:Metadata={title:"Legal notice | Veltrenne",robots:{index:false,follow:true}};
export default function Page(){return <InformationLayout active="/legal" eyebrow="Legal notice" title="The details behind Veltrenne." intro="Operator information and the people responsible for this service." draft>{/* Draft content remains noindex until business details and policies are confirmed. */}
<section className={s.section}><h2>Brand and operator</h2><p>Veltrenne is a BK Forge Labs project. The exact legal entity or individual operating the marketplace, their service address and authorised representative have not yet been confirmed for publication.</p></section>
<section className={s.section}><h2>Contact and registration</h2><p>A working public contact email, applicable register details and tax identification information must be confirmed before this notice is finalised. No registration or tax number is asserted here.</p></section>
<section className={s.section}><h2>Marketplace role</h2><p>The current platform helps visitors discover vehicle listings and contact sellers. An enquiry does not complete a vehicle purchase. The operating model and final contractual responsibilities remain subject to confirmation.</p></section>
<section className={s.section}><h2>Publication status</h2><p>This notice is a preparation draft. Launch jurisdiction and applicable operator disclosures must be reviewed before the marketplace opens to customers.</p></section>
<p className={s.meta}>Prepared for owner review · 5 October 2026</p></InformationLayout>}
