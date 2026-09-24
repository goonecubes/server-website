import { site } from "../site.js";

// Follows site.indexable: blocks crawlers during the closed beta, allows them after launch.
export function GET() {
	const body = site.indexable ? "User-agent: *\nAllow: /\n" : "User-agent: *\nDisallow: /\n";
	return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
