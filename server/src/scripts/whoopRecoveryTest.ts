import 'dotenv/config';
import axios from 'axios';
import chalk from 'chalk';

/** Helper that logs requests & responses for troubleshooting */
async function verboseGet(url: string, token: string, acceptable: number[] = [200]) {
  console.log(chalk.blue(`[HTTP] GET ${url}`));
  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true, // we will handle status manually
    });
    console.log(chalk.gray(`Status: ${res.status}`));
    if (!acceptable.includes(res.status)) {
      console.error(chalk.red('Unexpected status. Response body:'), res.data);
    }
    return res;
  } catch (err: any) {
    console.error(chalk.red('Request error:'), err.message);
    throw err;
  }
}

/**
 * Stand-alone utility to verify WHOOP API access by fetching the latest cycle
 * and then its recovery record. Run with:
 *   WHOOP_ACCESS_TOKEN=yourToken npx ts-node src/scripts/whoopRecoveryTest.ts
 */
async function main() {
  const accessToken = process.env.WHOOP_ACCESS_TOKEN ?? process.env.WHOOP_ACCESS_TOKEN_USER;
  if (!accessToken) {
    console.error('Please provide WHOOP_ACCESS_TOKEN env variable');
    process.exit(1);
  }

  try {
    // 1. Fetch the most recent cycle (limit=1)
    const cycleUrls = [
      'https://api.prod.whoop.com/developer/v2/cycle?limit=1',
      'https://api.prod.whoop.com/developer/v1/cycle?limit=1'
    ];

    let cycles: any[] = [];
    for (const cycleUrl of cycleUrls) {
      const cycleRes = await verboseGet(cycleUrl, accessToken);
      if (cycleRes.status === 200) {
        const data = cycleRes.data as any;
        cycles = (data.records ?? []) as any[];
        if (cycles.length > 0) {
          break; // found cycles
        }
      }
    }
    if (cycles.length === 0) {
      console.log('No cycles available for this user.');
      return;
    }

    const cycle = cycles[0];
    console.log('Latest cycle ID:', cycle.id);

    // 2. Fetch recovery for that cycle
    const recoveryUrl = `https://api.prod.whoop.com/developer/v1/cycle/${cycle.id}/recovery`;
    const recRes = await verboseGet(recoveryUrl, accessToken, [200, 404]);

    if (recRes.status === 404) {
      console.log('No recovery data for this cycle.');
    } else {
      console.log('Recovery data:', JSON.stringify(recRes.data, null, 2));
    }
  } catch (err: any) {
    if (err.response) {
      console.error('Request failed:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message || err);
    }
  }
}

main(); 