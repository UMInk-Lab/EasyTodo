<img width="1085" height="595" alt="image" src="https://github.com/user-attachments/assets/d5ff090d-b87c-421f-941d-e53362f16bba" />

# EasyTodo - Simple Personal Todo List

## Table of Contents

- [English](#english)
  - [Quick Start (Docker)](#quick-start-docker)
  - [Local Build and Run](#local-build-and-run)
  - [Environment Variables](#environment-variables)
  - [Authentication (JWT)](#authentication-jwt)
  - [Security Notes (XSS/CSRF)](#security-notes-xsscsrf)
  - [Multi-language Support](#multi-language-support)
  - [Adding a New Language](#adding-a-new-language)
  - [Customizing Translations (Docker)](#customizing-translations-docker)
- [中文](#中文)
  - [快速开始（Docker）](#快速开始docker)
  - [本地构建与运行](#本地构建与运行)
  - [环境变量](#环境变量)
  - [认证方式（JWT）](#认证方式jwt)
  - [安全性说明（XSS/CSRF）](#安全性说明xsscsrf)
  - [多语言支持](#多语言支持)
  - [添加新语言](#添加新语言)
  - [自定义翻译（Docker）](#自定义翻译docker)

---

## English

A lightweight todo application based on Flask + SQLite, ready to use out of the box, with support for dark mode, drag-and-drop sorting, and account data clearing.

### Quick Start (Docker)

- Pull the image:
  
  ```bash
  docker pull ghcr.io/umink-lab/easytodo:latest
  ```

- Prepare local database directory (for persistence):
  
  ```bash
  mkdir -p ./database
  ```

- Run the container (map port, set secret key, and mount database directory):
  
  ```bash
  docker run --name easytodo --rm \
    -p 5000:5000 \
    -e SECRET_KEY=$(openssl rand -hex 32) \
    -e AUTH_COOKIE_SECURE=false \
    -v $(pwd)/database:/app/database \
    ghcr.io/umink-lab/easytodo:latest
  ```

- Open your browser and visit: `http://localhost:5000`

### Local Build and Run

- Build (without cache):

  ```bash
  docker build --no-cache -t easytodo:local .
  ```

- Run:

  ```bash
  mkdir -p ./database
  docker run --name easytodo --rm \
    -p 5000:5000 \
    -e SECRET_KEY=$(openssl rand -hex 32) \
    -e AUTH_COOKIE_SECURE=false \
    -v $(pwd)/database:/app/database \
    easytodo:local
  ```

### Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `SECRET_KEY` | Yes | - | Use a sufficiently random value in production; also used for JWT signing when `JWT_SECRET` is not explicitly set |
| `SESSION_COOKIE_SECURE` | No | `false` | Set to `true` in HTTPS environment; only for Flask session (for CSRF and password recovery challenge) |
| `JWT_SECRET` | No | - | JWT signing key; falls back to `SECRET_KEY` if not set |
| `JWT_TTL_SECONDS` | No | `604800` (7 days) | Access token validity period |
| `AUTH_COOKIE_NAME` | No | `access_token` | Authentication cookie name |
| `AUTH_COOKIE_SECURE` | No | - | Set to `true` to send authentication cookie only through secure channel in HTTPS (recommended for production) |
| `AUTH_COOKIE_SAMESITE` | No | `Strict` | Reduce CSRF risk |
| `AUTH_COOKIE_DOMAIN` | No | - | Domain scope of authentication cookie |

### Authentication (JWT)

- After successful login/registration, the backend issues a JWT and delivers it via `HttpOnly` cookie (default name `access_token`).
- All endpoints requiring identity verification use this cookie, no need to store tokens on the frontend or add `Authorization` header.
- Write operation endpoints also require the `X-CSRF-Token` header, which must match the CSRF token saved in the server session (injected by the frontend from page `<meta name="csrf-token">` and automatically carried).
- Logout clears the JWT cookie and session.

### Security Notes (XSS/CSRF)

- Basic security response headers are enabled (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
- CSRF uses "double submit" style: authentication uses `HttpOnly` cookie, write endpoints must include `X-CSRF-Token` header matching the backend session token.
- Frontend escapes user-controllable content (such as todo text); templates enable Jinja2 auto-escaping by default.
- For production environment:
  - Deploy via HTTPS and set `AUTH_COOKIE_SECURE=true`, `SESSION_COOKIE_SECURE=true`.
  - Set a strong random `SECRET_KEY` (or configure `JWT_SECRET` separately).

### Multi-language Support

EasyTodo supports multiple languages with automatic browser language detection and dynamic locale loading:

- **Supported Languages**: Chinese (Simplified), English, Japanese
- **Default Language**: Chinese (zh-CN)
- **Language Toggle**: Click the language button in the toolbar to switch between languages
- **Persistence**: Language preference is saved in browser localStorage
- **Dynamic Loading**: Language files are automatically loaded at runtime

Language files are located in `/backend/static/js/locales/`:
- `zh-CN.js` - Chinese (Simplified)
- `en.js` - English
- `ja.js` - Japanese
- `index.json` - List of available languages

### Adding a New Language

To add a new language, you only need to create a locale file and update the index:

1. **Create a new locale file** (e.g., `fr.js` for French) in `/backend/static/js/locales/`:
   
   ```javascript
   // fr.js
   window.i18nLocales = window.i18nLocales || {};
   window.i18nLocales['fr'] = {
     // Language display name (shown in language selector)
     languageName: 'Français',
     
     // Optional: Custom font for this language
     // fontFamily: 'Noto Sans',
     // fontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap',
     
     translation: {
       // Common UI elements
       'common.cancel': 'Annuler',
       'common.confirm': 'Confirmer',
       'common.save': 'Enregistrer',
       'common.back': 'Retour',
       'common.close': 'Fermer',
       'common.next': 'Suivant',
       
       // Main page
       'index.title': 'EasyTodo',
       'index.clearCompleted': 'Effacer terminés',
       // ... add all other translation keys
     }
   };
   ```

2. **Update `index.json`** to include the new language code:
   
   ```json
   ["zh-CN", "en", "ja", "fr"]
   ```

3. **Restart the application** - The new language will be automatically loaded and available in the language selector.

**No code changes required!** The i18n system automatically:
- Loads all locale files listed in `index.json`
- Detects available languages
- Shows language names in the dropdown menu
- Applies custom fonts if configured

### Customizing Translations (Docker)

For Docker deployments, mount your custom `locales` directory:

```bash
# Create local locales directory
mkdir -p ./locales

# Copy existing files to customize
cp backend/static/js/locales/*.js ./locales/
cp backend/static/js/locales/index.json ./locales/

# Edit translations or add new languages
# Then run with volume mount:
docker run --name easytodo --rm \
  -p 5000:5000 \
  -e SECRET_KEY=$(openssl rand -hex 32) \
  -e AUTH_COOKIE_SECURE=false \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/locales:/app/static/js/locales \
  ghcr.io/umink-lab/easytodo:latest
```

**Translation Keys Structure:**
- `common.*` - Common UI elements (cancel, confirm, save, etc.)
- `index.*` - Main todo list page
- `login.*` - Login/register page and error messages
- `settings.*` - Settings page and account management

For a complete list of translation keys, refer to any existing locale file in `/backend/static/js/locales/`.

---

## 中文

一个基于 Flask + SQLite 的轻量待办应用，开箱即用，支持暗黑模式、拖拽排序与账号数据清除。

### 快速开始（Docker）

- 拉取镜像：
  
  ```bash
  docker pull ghcr.io/umink-lab/easytodo:latest
  ```

- 准备本地数据库目录（用于持久化）：
  
  ```bash
  mkdir -p ./database
  ```

- 运行容器（映射端口、设置密钥并挂载数据库目录）：
  
  ```bash
  docker run --name easytodo --rm \
    -p 5000:5000 \
    -e SECRET_KEY=$(openssl rand -hex 32) \
    -e AUTH_COOKIE_SECURE=false \
    -v $(pwd)/database:/app/database \
    ghcr.io/umink-lab/easytodo:latest
  ```

- 打开浏览器访问：`http://localhost:5000`

### 本地构建与运行

- 构建（不使用缓存）：

  ```bash
  docker build --no-cache -t easytodo:local .
  ```

- 运行：

  ```bash
  mkdir -p ./database
  docker run --name easytodo --rm \
    -p 5000:5000 \
    -e SECRET_KEY=$(openssl rand -hex 32) \
    -e AUTH_COOKIE_SECURE=false \
    -v $(pwd)/database:/app/database \
    easytodo:local
  ```

### 环境变量

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `SECRET_KEY` | 是 | - | 生产环境请使用足够随机的值；未显式设置 `JWT_SECRET` 时也用于签名 JWT |
| `SESSION_COOKIE_SECURE` | 否 | `false` | 在 HTTPS 环境下设为 `true`；仅用于 Flask 会话（用于 CSRF 与找回密码挑战） |
| `JWT_SECRET` | 否 | - | JWT 签名密钥；未设置时回退到 `SECRET_KEY` |
| `JWT_TTL_SECONDS` | 否 | `604800`（7 天） | 访问令牌有效期 |
| `AUTH_COOKIE_NAME` | 否 | `access_token` | 认证 Cookie 名称 |
| `AUTH_COOKIE_SECURE` | 否 | - | 设置为 `true` 以在 HTTPS 下仅通过安全通道发送认证 Cookie（生产环境推荐开启） |
| `AUTH_COOKIE_SAMESITE` | 否 | `Strict` | 减少 CSRF 风险 |
| `AUTH_COOKIE_DOMAIN` | 否 | - | 认证 Cookie 的作用域域名 |

### 认证方式（JWT）

- 登录/注册成功后，后端签发 JWT 并通过 `HttpOnly` Cookie 下发（默认名 `access_token`）。
- 所有需要身份的接口通过该 Cookie 校验，无需在前端存储令牌或增加 `Authorization` 头。
- 写操作接口同时要求 `X-CSRF-Token` 头，且值需与服务器会话中保存的 CSRF Token 一致（前端由页面 `<meta name="csrf-token">` 注入并自动携带）。
- 退出登录会清除 JWT Cookie 与会话。

### 安全性说明（XSS/CSRF）

- 启用基础安全响应头（CSP、X-Content-Type-Options、X-Frame-Options、Referrer-Policy）。
- CSRF 采用"双提交"风格：认证使用 `HttpOnly` Cookie，写接口必须带 `X-CSRF-Token` 头且与后端会话中的 Token 匹配。
- 前端对用户可控内容（如待办文本）做了转义；模板默认开启 Jinja2 自动转义。
- 生产环境请：
  - 通过 HTTPS 部署并设置 `AUTH_COOKIE_SECURE=true`、`SESSION_COOKIE_SECURE=true`。
  - 设置强随机的 `SECRET_KEY`（或单独配置 `JWT_SECRET`）。

### 多语言支持

EasyTodo 支持多语言，可自动检测浏览器语言，并动态加载语言文件：

- **支持的语言**：简体中文、英语、日语
- **默认语言**：简体中文（zh-CN）
- **语言切换**：点击工具栏中的语言按钮在不同语言之间切换
- **持久化**：语言偏好保存在浏览器 localStorage 中
- **动态加载**：语言文件在运行时自动加载

语言文件位于 `/backend/static/js/locales/`：
- `zh-CN.js` - 简体中文
- `en.js` - 英语
- `ja.js` - 日语
- `index.json` - 可用语言列表

### 添加新语言

添加新语言只需创建语言文件并更新索引：

1. **创建新的语言文件**（例如法语 `fr.js`）在 `/backend/static/js/locales/`：
   
   ```javascript
   // fr.js
   window.i18nLocales = window.i18nLocales || {};
   window.i18nLocales['fr'] = {
     // 语言显示名称（在语言选择器中显示）
     languageName: 'Français',
     
     // 可选：该语言的自定义字体
     // fontFamily: 'Noto Sans',
     // fontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap',
     
     translation: {
       // 通用 UI 元素
       'common.cancel': 'Annuler',
       'common.confirm': 'Confirmer',
       'common.save': 'Enregistrer',
       'common.back': 'Retour',
       'common.close': 'Fermer',
       'common.next': 'Suivant',
       
       // 主页面
       'index.title': 'EasyTodo',
       'index.clearCompleted': 'Effacer terminés',
       // ... 添加所有其他翻译键
     }
   };
   ```

2. **更新 `index.json`** 添加新语言代码：
   
   ```json
   ["zh-CN", "en", "ja", "fr"]
   ```

3. **重启应用** - 新语言将自动加载并在语言选择器中可用。

**无需修改代码！** i18n 系统会自动：
- 加载 `index.json` 中列出的所有语言文件
- 检测可用语言
- 在下拉菜单中显示语言名称
- 应用配置的自定义字体

### 自定义翻译（Docker）

Docker 部署时，挂载自定义的 `locales` 目录：

```bash
# 创建本地 locales 目录
mkdir -p ./locales

# 复制现有文件以自定义
cp backend/static/js/locales/*.js ./locales/
cp backend/static/js/locales/index.json ./locales/

# 编辑翻译或添加新语言
# 然后使用挂载运行：
docker run --name easytodo --rm \
  -p 5000:5000 \
  -e SECRET_KEY=$(openssl rand -hex 32) \
  -e AUTH_COOKIE_SECURE=false \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/locales:/app/static/js/locales \
  ghcr.io/umink-lab/easytodo:latest
```

**翻译键结构：**
- `common.*` - 通用 UI 元素（取消、确认、保存等）
- `index.*` - 主待办列表页面
- `login.*` - 登录/注册页面和错误消息
- `settings.*` - 设置页面和账户管理

完整的翻译键列表，请参考 `/backend/static/js/locales/` 中的任意现有语言文件。
