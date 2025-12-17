import { makeCanonicalUrl } from './src/utils/seo-generator';

const result = makeCanonicalUrl('https://docs.mplp.io', '/', '/architecture/overview', true);
console.log(`Result: "${result}"`);

if (result === 'https://docs.mplp.io/architecture/overview/') {
    console.log('PASS');
} else {
    console.log('FAIL');
}
