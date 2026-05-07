// @ts-nocheck
const tests = [
  { name: 'test-search-params', fn: async () => {
      let res = await fetch('https://xerv2.vercel.app/api/v2/animekai/advanced-search/filter');
      console.log('adv-search/filter', res.status);
      res = await fetch('https://xerv2.vercel.app/api/v2/animekai/search/filter');
      console.log('search/filter', res.status);
  }}
];

async function run() {
  for (const t of tests) {
    try {
      await t.fn();
      console.log('OK: ' + t.name);
    } catch(e: any) {
      console.error('FAIL: ' + t.name, e.message);
    }
  }
}
run();
