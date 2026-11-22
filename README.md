# WikiWish

A web platform to discover, track, and support proposals from the Wikimedia Community Wishlist.

Hosted on Wikimedia Toolforge: [wikiwish.toolforge.org](https://wikiwish.toolforge.org)

## Overview

The Wikimedia Community Wishlist receives hundreds of proposals annually across diverse projects, languages, and technical domains. Tracking proposal lifecycles, discussions, and personal voting records across individual wiki pages can be cumbersome for both contributors and developers.

WikiWish provides an interface synchronized with Wikimedia Meta-Wiki, allowing contributors to search proposals, track wishlist submissions, review supporter activity, and cast verified support votes directly.

## Features

- **Meta-Wiki Synchronization**: Directly queries the MediaWiki Action API (`communityrequests-wishes`). Vote counts, descriptions, tags, and discussions reflect live Meta-Wiki data.
- **Wikimedia OAuth 1.0a**: Authentication handled through official Wikimedia OAuth with RFC 5849 signatures.
- **Direct Voting & Comments**: Cast support votes and submit rationales directly, with updates published immediately to Meta-Wiki.
- **Contributor Explorer**: Look up any Wikimedia username to inspect their submitted proposals, supported wishlist items, and overall activity.
- **Filtering & Search**: Filter wishes by status (*Under Review*, *Draft*, *Completed*, etc.), project tag, or full-text search.
- **Responsive Interface**: Designed for mobile, tablet, and desktop viewports, with both dark and light modes.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| State & Query | TanStack Query |
| Auth | Wikimedia OAuth 1.0a (HMAC-SHA1) |
| Data | MediaWiki Action API (`meta.wikimedia.org`) |

## License

MIT License. See [LICENSE](LICENSE) for details.

*WikiWish is an independent community project and is not an official Wikimedia Foundation service.*
