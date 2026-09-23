import { getLatestPricesData, getNewsData } from '@/lib/api-services';
import { DashboardShell } from '@/components/dashboard-shell';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const latestResponse = await getLatestPricesData();
  const initialNews = await getNewsData(1, 6);

  return (
    <DashboardShell
      prices={latestResponse.data}
      initialNews={initialNews}
      updatedAt={latestResponse.updatedAt}
    />
  );
}
