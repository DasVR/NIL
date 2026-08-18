export const prerender = false;

export function load({ params }) {
  return { space: params.space };
}
