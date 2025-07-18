# Update React Projects: Материалы к докладу

Этот репозиторий — сборник полезных ссылок, тулов и скриптов, которые помогут обновить легаси-фронтенд, не переписывая всё с нуля. Основано на моём докладе **«Не переписывай — обнови! Как вдохнуть жизнь в легаси»** на [Яндекс.Субботнике](https://events.yandex.ru/events/ya-subbotnik-2025-07-26).

---

## 📦 Анализ зависимостей

- [depcheck](https://github.com/depcheck/depcheck) — показывает неиспользуемые зависимости
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates) — проверяет последние версии всех пакетов и разбивает на группы (major, minor, patch)
- [npm-deprecated-check](https://github.com/KID-joker/npm-deprecated-check) - выдает warning-и для пакетов, которые отмечены авторами как deprecated

---

## 🧩 Скрипты

### 🔍 Группировка пакетов по обновлению

Скрипт для выявления групп связанных пакетов (например, React + связанная экосистема), которые лучше обновлять вместе.  
_→ см. [scripts/group-packages.js](scripts/group-packages.js)_

---

## 🔄 Статьи

- ✍️ [Моя статья: почему `pnpm` — это хорошо](https://telegra.ph/Pnpm-vs-npm-12-21) (а также [вторая часть](https://telegra.ph/Pnpm-peer-deps-01-18))
- 🧠 [Официальный гайд по переходу с Redux + saga → Redux Toolkit](https://redux.js.org/usage/migrating-to-modern-redux)
- 🌟 [Vite + Express (BFF) интеграция — оф. гайд](https://vite.dev/guide/backend-integration.html)

---

## 📎 Плагины и прокси

- 🌐 [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) — для проксирования ручек во фронтбэке
- 🔌 [Vite плагин для Node API](https://github.com/axe-me/vite-plugin-node)
- 📎 [Vite плагин для работы с process.env](https://github.com/ElMassimo/vite-plugin-environment)
- 🔐 [local-ssl-proxy](https://github.com/cameronhunter/local-ssl-proxy) — прокси для работы с SSL локально (BFF)

---

## 💻 Демо

_Пример минимального проекта с настройками Vite + BFF + мультиязычность_
[→ Демо-проект](https://github.com/startpointforl/vite-multilang-example)

---

## 🤝 Автор

**Настя Котова** — [@startpoint_dev](https://t.me/startpoint_dev)  
Фронтендер с лапками
