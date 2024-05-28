import type { MetaTagsProps } from 'svelte-meta-tags';

export function createBaseMetaTags(url: URL): MetaTagsProps {
	const title = 'Budgetarian';
	const description = 'Expense Tracker Visualizer made with SvelteKit';
	const canonicalUrl = new URL(url.pathname, url.origin).href;

	return {
		title: title,
		titleTemplate: '%s | Your Budget Visualized',
		description: description,
		canonical: canonicalUrl,

		keywords: [
			'Expense Tracker',
			'sveltekit',
			'svelte',
			'Data Table',
			'Data Visualization',
			'Budget App',
			'D3'
		],

		openGraph: {
			type: 'website',
			url: canonicalUrl,
			locale: 'en_IE',
			title: title,
			description: description,
			siteName: 'Budgetarian',
			images: [
				{
					url: 'https://www.example.ie/og-image.jpg',
					alt: 'Og Image Alt',
					width: 800,
					height: 600,
					secureUrl: 'https://www.example.ie/og-image.jpg',
					type: 'image/jpeg'
				}
			]
		},

		twitter: {
			handle: '@0xbiscuithammer',
			site: canonicalUrl,
			cardType: 'summary_large_image',
			title: title,
			description: description,
			image: 'https://www.example.ie/twitter-image.jpg',
			imageAlt: 'Twitter image alt'
		},

		additionalLinkTags: [
			{
				rel: 'apple-touch-icon',
				href: '/favicons/apple-touch-icon.png'
			},
			{
				rel: 'icon',
				type: 'image/png',
				href: '/favicon.png'
			},
			{
				rel: 'mask-icon',
				href: '/favicons/mask-icon.svg'
			},
			{
				rel: 'alternate icon',
				type: 'image/png',
				href: '/favicons/favicon-32x32.png'
			},
			{
				rel: 'manifest',
				href: `/site.webmanifest`,
				crossOrigin: 'use-credentials'
			}
		]
	};
}

export function createPageMetaTags(metaTags: MetaTagsProps): MetaTagsProps {
	const title = metaTags.title ?? '';
	const description = metaTags.description ?? '';

	return {
		...metaTags,
		openGraph: {
			title: metaTags.openGraph?.title ?? title,
			description: metaTags.openGraph?.description ?? description
		},
		twitter: {
			title: metaTags.twitter?.title ?? title,
			description: metaTags.twitter?.description ?? description
		}
	};
}
