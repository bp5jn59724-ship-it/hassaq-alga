# Portfolio Demos

Пять независимых статических демосайтов: NORI, FORMA HOME, NORTH, LINIA, IMPULSE.

Источник: ветка `portfolio-demos` репозитория `bp5jn59724-ship-it/hassaq-alga`. Основной HASSAQ развёрнут из ветки `main`; здесь его файлы не изменяются.

## Публикация
Создайте Render Static Site для каждой папки `portfolio/<slug>`. Build Command: `node portfolio/verify.mjs`. Publish Directory: `portfolio/<slug>`.

Все бренды, услуги, цены и записи вымышлены. Формы не отправляют данные, оплата отсутствует. Корзины и избранное сохраняются только в localStorage браузера.

Фотографии: Unsplash, источники и лицензии перечислены в ASSETS.md каждого проекта. Товары FORMA представлены оригинальными SVG-визуализациями.

Изменение: HTML/CSS/JS находятся рядом в каждой папке. `build_demos.py` пересоздаёт исходные страницы; не запускать после ручных изменений без синхронизации генератора.
