# 🌟 WikiWish

<p align="center">
  <img src="frontend/public/wikiwish.png" alt="WikiWish Logo" width="120" />
</p>

<p align="center">
  <strong>Your Wishes, All in One Place.</strong><br />
  A modern, community-driven platform to discover, track, and support proposals from the Wikimedia Community Wishlist.
</p>

<p align="center">
  <a href="https://wikiwish.toolforge.org"><strong>🌐 Visit WikiWish Live on Toolforge</strong></a>
</p>

---

## 📖 About WikiWish

The **Wikimedia Community Wishlist** receives hundreds of proposals annually across diverse Wikimedia projects, language communities, and technical areas. Following discussions, monitoring proposal progress, and seeing personal contribution history across scattered wiki pages can be challenging for editors and developers.

**WikiWish** provides an intuitive, real-time dashboard and curation interface directly synchronized with **Wikimedia Meta-Wiki**. It allows contributors to track their submissions, explore what other community members are proposing, and participate in wishlist voting through an interface designed for speed and accessibility.

---

## ✨ Key Features

- **⚡ Real-Time Meta-Wiki Synchronization**: Live integration with the MediaWiki Action API (`communityrequests-wishes`). Vote counts, proposal descriptions, tags, and discussions stay in sync with Meta-Wiki in real time.
- **🔒 Genuine Wikimedia OAuth 1.0a**: Authenticate securely using your official Wikimedia account. Zero mock accounts, zero password storage, ensuring verified contributor attribution for all votes.
- **🗳️ Direct In-App Voting & Support**: Support proposals, submit rationale comments, or update your existing votes directly from WikiWish—instantly recorded on Meta-Wiki.
- **👥 Contributor Explorer**: Search any Wikimedia contributor to inspect their submitted proposals, supported wishlist items, and overall community activity.
- **🏷️ Smart Filtering & Tags**: Effortlessly filter proposals by status (*Under Review*, *Draft*, *Completed*, etc.), category, or technical area (e.g., *editing*, *multimedia*, *patrolling*, *mobile*).
- **📱 Fully Responsive Design**: Seamless experience across smartphones, tablets, and ultra-wide desktop screens with native-like mobile navigation.
- **🌓 Dark & Light Modes**: Beautiful themes engineered to match modern web standards and high-contrast accessibility.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **State Management** | TanStack Query (React Query) |
| **Authentication** | Wikimedia OAuth 1.0a (RFC 5849 HMAC-SHA1) |
| **Data Engine** | MediaWiki Action API (`meta.wikimedia.org`) |
| **Icons & Design** | Lucide React |

---

## 📄 License & Attribution

This project is licensed under the **[MIT License](LICENSE)**.

WikiWish is an independent community tool built to empower contributors across the Wikimedia movement. It connects directly to public Wikimedia APIs and is hosted on [Wikimedia Toolforge](https://wikitech.wikimedia.org/wiki/Portal:Toolforge).
