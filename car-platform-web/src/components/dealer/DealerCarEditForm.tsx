import type {Car} from '@/types/car';
import DealerVehicleForm from './DealerVehicleForm';
export default function DealerCarEditForm({car}:{car:Car}){return <DealerVehicleForm key={car._id} car={car}/>;}
