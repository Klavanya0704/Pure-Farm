import { syncLiveMarketPrices } from '../src/services/marketPrices';

export default async function handler(req: any, res: any) {
  try {
    const result = await syncLiveMarketPrices();
    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Unhandled server synchronization failure.',
      recordsFetched: 0,
      recordsInserted: 0,
      verificationRecordsRemoved: false,
      error: err?.message || String(err),
    });
  }
}
