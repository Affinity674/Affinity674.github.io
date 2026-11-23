# Affinity674 的个人博客

一个安静、简洁、适合写长句子的个人博客。只用 Markdown 写文章，不需要手写 HTML；由 GitHub Pages 免费托管，自带 HTTPS 和 RSS。

> **第一次使用，请直接看 → [使用指南.md](使用指南.md)**
>
> 它会一步一步带你把这个博客发布到 `https://affinity674.github.io`，再教你写第一篇文章。

## 这个博客有什么

- 首页、文章归档、标签、关于、搜索、404 页面
- 自动适配电脑和手机，支持深色模式
- 文章可以用标题、引用、列表、图片、代码块
- RSS 订阅 `/feed.xml`、站点地图 `/sitemap.xml`
- 无需安装 Node.js、Ruby 或任何建站软件

## 写作只需要记住一件事

在 `_posts/` 文件夹里新建一个 Markdown 文件，文件名这样写：

```text
2026-11-23-wo-de-di-yi-pian.md
```

开头复制这几行：

```yaml
---
title: "文章标题"
date: 2026-11-23 09:00:00 +0800
tags: [随笔]
excerpt: "一两句话的摘要。"
---
```

然后像写普通文档一样写正文，提交到 GitHub，等一两分钟，文章就会出现在网站上。

## 目录

```text
_config.yml              网站的名字、简介、作者信息
_posts/                  你的文章（最常来的地方）
_layouts/                页面模板（不需要改）
_includes/               页头和页脚（不需要改）
assets/css/style.css     字体、颜色、留白
assets/js/               深色模式、搜索等交互
assets/images/           头像、站点图标、文章图片
about.md                 「关于我」页面
index.html               首页
archive.html             归档页
tags.html                标签页
search.html              搜索页
404.html                 404 页面
README.md                这个文件（不会发布到网站）
使用指南.md               零基础教程（不会发布到网站）
写作模板.md               写文章时复制它（不会发布到网站）
```

## 说明

- 这个仓库需要是 **Public（公开）**，免费版 GitHub Pages 才能发布。
- 发布后，文章和图片都是公开的。不要放身份证、住址、电话、私密聊天记录或他人的照片。
- 页面由 [Jekyll](https://jekyllrb.com/) 生成，托管在 [GitHub Pages](https://pages.github.com/)。
- 站内文字版权归 Affinity674 所有；页面模板可以自由修改和使用。
