import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightAurora from 'starlight-aurora';
import starlightVersions from 'starlight-versions';

// The Pages workflow sets DOCS_SITE and DOCS_BASE. Locally the site is at /.
export default defineConfig({
	site: process.env.DOCS_SITE,
	base: process.env.DOCS_BASE || '/',
	integrations: [
		mermaid({ theme: 'dark', autoTheme: true }),
		starlight({
			title: 'starlight-aurora',
			description: 'Aurora, the Colliery design system, as a theme for Astro Starlight.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/colliery-io/starlight-aurora' }],
			plugins: [
				starlightAurora({ hyper: true }),
				// The docs of each earlier release stay at /<version>/.
				starlightVersions({ current: { label: 'Latest' }, versions: [{ slug: '0.1', label: 'v0.1' }] }),
			],
			sidebar: [
				{ label: 'Tutorials', items: [{ autogenerate: { directory: 'tutorials' } }] },
				{ label: 'How-to guides', items: [{ autogenerate: { directory: 'how-to' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
				{ label: 'Explanation', items: [{ autogenerate: { directory: 'explanation' } }] },
			],
		}),
	],
});
