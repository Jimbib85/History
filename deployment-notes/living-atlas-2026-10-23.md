# Living Atlas production deployment

This commit triggers the Cloudflare Workers Git build for the integrated Living Atlas release on the `main` branch. Build command: `npm test`. Deployment command: `npx wrangler deploy`. Worker: `history`. Production hostname: `history.bibbybots.ai`.

The actual release was merged as commit `500761fd69091c435fe9bb29484c87f9b490472d` (PR #24). This file contains no application code.
