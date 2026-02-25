# ⚖️ GLARE

> **Side-by-side AI model arbitration & comparison tool.**  
> Built with **Svelte 5 Runes**, **TypeScript**, and **Tailwind CSS**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org)

---

## 🧐 What is GLARE?

GLARE is a lightweight, client-side utility designed for **Prompt Engineers** and **AI Researchers**. It allows you to paste responses from multiple LLMs (e.g., Claude, GPT-4, Llama), quote specific evidence, and generate a structured **XML arbitration prompt** to feed into a judge model.

Stop guessing which model performed better. **Arbitrate with evidence.**

## ✨ Key Features

| Feature | Benefit |
| :--- | :--- |
| **🔒 Local Persistence** | Auto-saves sessions to `localStorage`. Refresh safely. |
| **⚡ Svelte 5 Runes** | Built on the latest reactive primitives for maximum performance. |
| **📑 XML Prompting** | Generates structured XML prompts for optimal LLM parsing. |
| **🎨 Auto-Identity** | Models are auto-colored for instant visual differentiation. |
| **📋 Smart Copy** | One-click copy with visual feedback (no annoying alerts). |
| **📱 Responsive** | Horizontal snap-scroll works on desktop and tablet. |

## 🛠 Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev) (Runes)
- **Language:** [TypeScript](https://www.typescriptlang.org) (Strict Mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) + [Typography Plugin](https://tailwindcss.com/docs/typography-plugin)
- **Icons:** [Lucide Svelte](https://lucide.dev)
- **Markdown:** [Marked](https://marked.js.org)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/glare-ai.git
cd glare-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 💡 Usage Guide

1.  **Add Models:** Click the `+` button to add up to 4 model columns.
2.  **Paste Content:** Paste Markdown responses from different AI models into each column.
3.  **Quote Evidence:** Switch to **View Mode**, highlight text, and click **"Add to Evidence"**.
4.  **Arbitrate:** Click the **Gavel Icon** to open the arbitration modal.
5.  **Generate Prompt:** Add your context instructions and copy the generated **XML Prompt**.
6.  **Judge:** Paste the XML prompt into your preferred LLM to get a verdict.
