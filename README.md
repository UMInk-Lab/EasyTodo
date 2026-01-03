<img width="1085" height="595" alt="image" src="https://github.com/user-attachments/assets/d5ff090d-b87c-421f-941d-e53362f16bba" />

# EasyTodo

A lightweight Flask + SQLite todo application with dark mode, drag-and-drop sorting, and multi-language support.

## 🚀 Quick Start (Docker)

```bash
# Pull and run
docker run -d --name easytodo \
  -p 5000:5000 \
  -e SECRET_KEY=$(openssl rand -hex 32) \
  -e AUTH_COOKIE_SECURE=false \
  -v $(pwd)/database:/app/database \
  ghcr.io/umink-lab/easytodo:latest
```

Visit `http://localhost:5000`

## 🌍 Custom Language Support

### Add a New Language

1. **Create locale file** in `/backend/static/js/locales/` (e.g., `fr.js`):
```javascript
window.i18nLocales = window.i18nLocales || {};
window.i18nLocales['fr'] = {
  languageName: 'Français',
  translation: {
    'common.cancel': 'Annuler',
    'index.title': 'EasyTodo',
    // ... copy all keys from en.js and translate
  }
};
```

2. **Update `index.json`**:
```json
["zh-CN", "en", "ja", "fr"]
```

### Docker Custom Translations

Mount your custom `locales` directory:

```bash
docker run -d --name easytodo \
  -p 5000:5000 \
  -e SECRET_KEY=$(openssl rand -hex 32) \
  -e AUTH_COOKIE_SECURE=false \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/locales:/app/static/js/locales \
  ghcr.io/umink-lab/easytodo:latest
```

## 🔒 Production Configuration

For HTTPS deployment, set secure cookies:

```bash
docker run -d --name easytodo \
  -p 5000:5000 \
  -e SECRET_KEY=$(openssl rand -hex 32) \
  -e AUTH_COOKIE_SECURE=true \
  -e SESSION_COOKIE_SECURE=true \
  -v $(pwd)/database:/app/database \
  ghcr.io/umink-lab/easytodo:latest
```

## 📝 Key Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | - | **Required**. JWT signing key |
| `AUTH_COOKIE_SECURE` | `false` | Set `true` for HTTPS |
| `SESSION_COOKIE_SECURE` | `false` | Set `true` for HTTPS |
| `JWT_TTL_SECONDS` | `604800` | Token validity (7 days) |

---

## 中文说明

轻量级 Flask + SQLite 待办应用，支持暗黑模式、拖拽排序和多语言。

## 🚀 一键部署（Docker）

```bash
# 拉取并运行
docker run -d --name easytodo \
  -p 5000:5000 \
  -e SECRET_KEY=$(openssl rand -hex 32) \
  -e AUTH_COOKIE_SECURE=false \
  -v $(pwd)/database:/app/database \
  ghcr.io/umink-lab/easytodo:latest
```

访问 `http://localhost:5000`

## 🌍 自定义语言

### 添加新语言

1. **创建语言文件** 于 `/backend/static/js/locales/`（如 `fr.js`）：
```javascript
window.i18nLocales = window.i18nLocales || {};
window.i18nLocales['fr'] = {
  languageName: 'Français',
  translation: {
    'common.cancel': 'Annuler',
    'index.title': 'EasyTodo',
    // ... 复制 en.js 所有键并翻译
  }
};
```

2. **更新 `index.json`**：
```json
["zh-CN", "en", "ja", "fr"]
```

### Docker 自定义翻译

挂载自定义 `locales` 目录：

```bash
docker run -d --name easytodo \
  -p 5000:5000 \
  -e SECRET_KEY=$(openssl rand -hex 32) \
  -e AUTH_COOKIE_SECURE=false \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/locales:/app/static/js/locales \
  ghcr.io/umink-lab/easytodo:latest
```

## 🔒 生产环境配置

HTTPS 部署时启用安全 Cookie：

```bash
docker run -d --name easytodo \
  -p 5000:5000 \
  -e SECRET_KEY=$(openssl rand -hex 32) \
  -e AUTH_COOKIE_SECURE=true \
  -e SESSION_COOKIE_SECURE=true \
  -v $(pwd)/database:/app/database \
  ghcr.io/umink-lab/easytodo:latest
```

## 📝 主要环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SECRET_KEY` | - | **必填**。JWT 签名密钥 |
| `AUTH_COOKIE_SECURE` | `false` | HTTPS 部署时设为 `true` |
| `SESSION_COOKIE_SECURE` | `false` | HTTPS 部署时设为 `true` |
| `JWT_TTL_SECONDS` | `604800` | Token 有效期（7 天）|
