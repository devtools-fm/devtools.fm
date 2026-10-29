import type { APIRoute } from "astro";

import { createHomeOgImage } from "utils/ogImage";

export const prerender = true;

export const GET: APIRoute = () => createHomeOgImage();
