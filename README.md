# Portfolio with Markdown Blog

A Next.js-based portfolio site with markdown-powered blog functionality.

## Features

- Responsive portfolio website
- Markdown-based blog with:
  - Automatic table of contents
  - Image support
  - Code syntax highlighting
  - Interactive accordions
  - Front matter for metadata

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   bun install
   ```
3. Start the development server:
   ```
   bun run dev
   ```

## Creating Blog Posts

1. Create a new markdown file in the `content/posts` directory
2. Add front matter at the top of the file:
   ```md
   ---
   title: My Blog Post Title
   date: 2024-06-10
   description: Short description of the post
   image: https://example.com/image.jpg (optional)
   ---
   ```
3. Write your markdown content below the front matter

### Markdown Features

- **Table of Contents**: Add `[[TOC]]` anywhere in your post to generate a table of contents
- **Headers**: Use `#` for h1, `##` for h2, etc.
- **Lists**: Use `-` or `*` for unordered lists, and `1.`, `2.`, etc. for ordered lists
- **Code Blocks**: Use triple backticks for code blocks, optionally specifying the language

  ````md
  ```javascript
  const hello = "world";
  ```
  ````

  ```

  ```

- **Accordions**: Use the accordion syntax for expandable sections

  ````md
  ```accordion Accordion Title
  Content inside the accordion
  ```
  ````

  ```

  ```

## Customization

- Edit `src/components/navigation.tsx` to update the navigation links
- Edit `src/app/layout.tsx` to update meta information
- Customize the blog pages in `src/app/writing/`

## Deployment

This project can be deployed on any platform that supports Next.js applications.

## License

MIT
