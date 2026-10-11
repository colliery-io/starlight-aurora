import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightAurora from 'starlight-aurora';

export default defineConfig({
	integrations: [
		starlight({
			title: 'starlight-aurora',
			plugins: [starlightAurora({ hyper: process.env.AURORA_HYPER === '1' })],
			sidebar: [
				{ label: 'Start here', items: ['index'] },
				{ label: 'Components', items: [{ autogenerate: { directory: 'components' } }] },
			],
		}),
	],
});
