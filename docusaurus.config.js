// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Weidong Note',
  tagline: '魏东也太帅了吧！',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'http://weidongkl.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'weidongkl', // Usually your GitHub org/user name.
  projectName: 'weidongkl.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['en', 'zh-Hans'],
  },
  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        // 配置选项（同旧版插件）
        indexDocs: true,
        indexBlog: true,
        language: 'zh', // 支持 'zh' 等语言
        hashed: true,   // 提升中文搜索效果
        searchBarShortcut: false,
        searchBarPosition: "left",
      },
    ],
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/weidongkl/weidongkl.github.io/tree/master/',
        },
        blog: {
          showReadingTime: true,
          // 不配置的话，就是recent posts
          blogSidebarTitle: '最近的文章',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/weidongkl.png',
      colorMode: {
        defaultMode: 'light',
        // 隐藏颜色模式切换
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      // 通知可以放这里
      // announcementBar: {
      //   id: 'support_us',
      //   content:
      //       '右边可以x掉的哦，这是我的 ' +
      //       '<a target="_blank" rel="noopener noreferrer" href="https://github.com/weidongkl">github</a>',
      //   // backgroundColor: '#fafbfc',
      //   // textColor: '#091E42',
      //   isCloseable: true,
      // },
      navbar: {
        title: 'weidongkl',
        logo: {
          alt: 'weidongkl',
          src: 'img/logo.svg',
        },
        // 下滑时，隐藏顶部的导航栏，上划自动显示
        //hideOnScroll: true,
        items: [
          // {
          //   type: 'search',
          //   position: 'right', // 'left' 或 'right'（默认）
          //   className: 'custom-search-bar', // (可选) 自定义 CSS 类
          // },
          {
            type: 'docSidebar',
            sidebarId: 'note',
            position: 'right',
            label: '笔记',
          },
          { to: '/blog',
            label: '博客',
            position: 'right'
          },
          //   普通的文档导航
          // {
          //   type: 'docSidebar',
          //   sidebarId: 'note',
          //   position: 'right',
          //   label: '学习笔记',
          // },
          //   带下拉的文档导航
          {
            type: 'dropdown',
            sidebarId: 'note1',
            position: 'right',
            label: '仓库',
            items: [
              // {
              //   type: 'docSidebar',
              //   label: '学习文档',
              //   sidebarId: 'note',
              // },
              {
                label: 'Gitee',
                href: 'https://gitee.com/weidongkl',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/weidongkl',
              },
            ],
          },
          // {
          //   type: 'docSidebar',
          //   sidebarId: 'book',
          //   position: 'left',
          //   label: '读书笔记',
          // },
          // {
          //   href: 'https://github.com/weidongkl',
          //   label: 'GitHub',
          //   position: 'right',
          // },
          // {
          //   type: 'localeDropdown',
          //   position: 'right',
          // },
          {
            type: 'search',
            position: 'right',
          },
        ],
      },
      algolia: false, // 如果之前配置过 Algolia，需关闭
      search: undefined,
      footer: {
        style: 'dark',
        links: [
          // {
          //   title: 'Docs',
          //   items: [
          //     {
          //       label: 'Tutorial',
          //       to: '/docs/intro',
          //     },
          //   ],
          // },
          // {
          //   title: 'Community',
          //   items: [
          //     {
          //       label: 'Stack Overflow',
          //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          //     },
          //     {
          //       label: 'Discord',
          //       href: 'https://discordapp.com/invite/docusaurus',
          //     },
          //     {
          //       label: 'X',
          //       href: 'https://x.com/docusaurus',
          //     },
          //   ],
          // },
          // {
          //   title: 'More',
          //   items: [
          //     {
          //       label: 'Blog',
          //       to: '/blog',
          //     },
          //     {
          //       label: 'GitHub',
          //       href: 'https://github.com/facebook/docusaurus',
          //     },
          //   ],
          // },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} weidongkl, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
