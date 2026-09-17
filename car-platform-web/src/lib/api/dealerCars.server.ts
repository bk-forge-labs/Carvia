import { cookies } from 'next/headers';

const API_URL =
  process.env.API_INTERNAL_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050/api';

export async function getDealerCarsServer() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const res = await fetch(`${API_URL}/dealer/cars/my`, {
    method: 'GET',
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch dealer cars');
  }

  return data;
}

export async function getDealerCarByIdServer(carId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const res = await fetch(`${API_URL}/dealer/cars/my`, {
    method: 'GET',
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch dealer cars');
  }

  const cars = Array.isArray(data.data) ? data.data : [];
  const car = cars.find((item: { _id: string }) => item._id === carId);

  if (!car) {
    throw new Error('Car not found');
  }

  return car;
}

export async function getDealerCarReadinessServer(carId: string): Promise<{ready:boolean;issues:string[]}> {
  try {
    const cookieHeader = (await cookies()).toString();
    const res = await fetch(`${API_URL}/dealer/cars/${carId}/readiness`, {headers:{Cookie:cookieHeader},cache:'no-store'});
    if (!res.ok) throw new Error('Readiness unavailable');
    const body = await res.json();
    return body.data;
  } catch {
    return {ready:false,issues:['Publication checks are unavailable. Refresh this page to try again.']};
  }
}
