'use client';

import { useParams } from 'next/navigation';
import { OrderDetailsPage } from '../../../src/screens/OrderDetailsPage/OrderDetailsPage';

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  return <OrderDetailsPage orderId={id} />;
}
