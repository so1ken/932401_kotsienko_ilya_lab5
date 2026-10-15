// Лабораторная работа №5: DOM и взаимодействие с элементами страницы
// Вариант 10. Тема «Книжный червь и писатель» 

(function () {
    'use strict';

    // getElementById
    const booksSection = document.getElementById('books');

    // querySelector
    const booksContainer = document.querySelector('.books-flex-container');
    const themeToggleBtn = document.querySelector('#themeToggle');
    const addBookBtn     = document.querySelector('#addBookBtn');
    const removeBookBtn  = document.querySelector('#removeBookBtn');
    const toggleBooksBtn = document.querySelector('#toggleBooksBtn');

    // querySelectorAll — все существующие карточки книг
    const initialBookCards = document.querySelectorAll('.book-card');

    function checkExists(el, name) {
        if (!el) {
            console.error('Элемент не найден: ' + name);
            return false;
        }
        return true;
    }

    const LS_KEYS = {
        theme:       'bookworm_theme',         // 'dark' | 'light'
        books:       'bookworm_books',         // JSON-массив книг
        booksHidden: 'bookworm_books_hidden'   // 'true' | 'false'
    };

    function saveTheme(isDark) {
        try {
            localStorage.setItem(LS_KEYS.theme, isDark ? 'dark' : 'light');
        } catch (e) {
            console.error('Не удалось сохранить тему:', e);
        }
    }

    function saveBooksHidden(isHidden) {
        try {
            localStorage.setItem(LS_KEYS.booksHidden, isHidden ? 'true' : 'false');
        } catch (e) {
            console.error('Не удалось сохранить состояние секции:', e);
        }
    }

    function saveBooks() {
        if (!checkExists(booksContainer, '.books-flex-container')) return;
        try {
            const cards = booksContainer.querySelectorAll('.book-card');
            const data = [];
            cards.forEach(function (card) {
                const titleEl  = card.querySelector('h3');
                const authorEl = card.querySelector('p strong');
                const btn      = card.querySelector('.read-btn');

                let author = '';
                if (authorEl && authorEl.parentElement) {
                    author = authorEl.parentElement.textContent
                        .replace('Автор:', '').trim();
                }

                data.push({
                    title:  titleEl ? titleEl.textContent : 'Без названия',
                    author: author || 'Неизвестен',
                    read:   btn ? btn.textContent === 'Прочитано' : false
                });
            });
            localStorage.setItem(LS_KEYS.books, JSON.stringify(data));
        } catch (e) {
            console.error('Не удалось сохранить книги:', e);
        }
    }

    function loadState() {
        // ---- Тема ----
        try {
            if (localStorage.getItem(LS_KEYS.theme) === 'dark') {
                document.body.classList.add('dark-theme');
            }
        } catch (e) { console.error('Ошибка загрузки темы:', e); }

        // ---- Скрытие секции ----
        try {
            if (localStorage.getItem(LS_KEYS.booksHidden) === 'true'
                && checkExists(booksSection, '#books')) {
                booksSection.classList.add('hidden-section');
            }
        } catch (e) { console.error('Ошибка загрузки состояния секции:', e); }

        // ---- Список книг ----
        let savedBooks = null;
        try {
            const raw = localStorage.getItem(LS_KEYS.books);
            if (raw) savedBooks = JSON.parse(raw);
        } catch (e) {
            console.error('Ошибка парсинга книг из localStorage:', e);
        }

        if (Array.isArray(savedBooks) && savedBooks.length > 0
            && checkExists(booksContainer, '.books-flex-container')) {
            // Заменяем содержимое контейнера сохранёнными книгами
            booksContainer.innerHTML = '';
            savedBooks.forEach(function (b) {
                createBookCard(b.title, b.author, b.read);
            });
        } else {
            initialBookCards.forEach(function (card) {
                attachReadButton(card);
            });
            saveBooks();
        }
    }

    let newBookCounter = 0;

    // Создание кнопки «Прочитано» / «Не прочитано»
    function createReadButton(card, isRead) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'read-btn';
        btn.textContent = isRead ? 'Прочитано' : 'Не прочитано';
        if (isRead) card.classList.add('read');

        btn.addEventListener('click', function () {
            const nowRead = btn.textContent !== 'Прочитано';
            btn.textContent = nowRead ? 'Прочитано' : 'Не прочитано';
            card.classList.toggle('read', nowRead);
            saveBooks();
        });
        return btn;
    }

    function attachReadButton(card) {
        if (!card || card.querySelector('.read-btn')) return;

        // Ищем абзац, начинающийся со «Статус»
        let statusPara = null;
        const paragraphs = card.querySelectorAll('p');
        paragraphs.forEach(function (p) {
            if (p.textContent.trim().indexOf('Статус') === 0) {
                statusPara = p;
            }
        });

        const btn = createReadButton(card, true);

        if (statusPara) {
            // Меняем содержимое абзаца: <strong>Статус:</strong> <button>
            statusPara.innerHTML = '';
            const strong = document.createElement('strong');
            strong.textContent = 'Статус:';
            statusPara.appendChild(strong);
            statusPara.appendChild(document.createTextNode(' '));
            statusPara.appendChild(btn);
        } else {
            card.appendChild(btn);
        }
    }

    // Создание новой карточки книги
    function createBookCard(title, author, isRead) {
        if (!checkExists(booksContainer, '.books-flex-container')) return null;

        const card = document.createElement('article');
        card.className = 'book-card';

        // Обложка-заглушка
        const cover = document.createElement('img');
        cover.src = 'assets/images/book1.jpg';
        cover.alt = 'Обложка ' + title;
        cover.className = 'book-cover';

        // Название
        const h3 = document.createElement('h3');
        h3.textContent = title;

        // Автор
        const pAuthor = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = 'Автор:';
        pAuthor.appendChild(strong);
        pAuthor.appendChild(document.createTextNode(' ' + author));

        // Кнопка «Прочитано»
        const btn = createReadButton(card, isRead === true);

        card.appendChild(cover);
        card.appendChild(h3);
        card.appendChild(pAuthor);
        card.appendChild(btn);

        booksContainer.appendChild(card);
        return card;
    }

    // --- Кнопка «Добавить книгу» ---
    if (checkExists(addBookBtn, '#addBookBtn')) {
        addBookBtn.addEventListener('click', function () {
            newBookCounter++;
            createBookCard(
                'Новая книга #' + newBookCounter,
                'Неизвестный автор',
                false
            );
            saveBooks();
        });
    }

    // --- Кнопка «Удалить последнюю» ---
    if (checkExists(removeBookBtn, '#removeBookBtn')
        && checkExists(booksContainer, '.books-flex-container')) {
        removeBookBtn.addEventListener('click', function () {
            const cards = booksContainer.querySelectorAll('.book-card');
            if (cards.length === 0) {
                alert('На полке нет книг для удаления.');
                return;
            }
            cards[cards.length - 1].remove();
            saveBooks();
        });
    }

    // --- Переключение темы ---
    if (checkExists(themeToggleBtn, '#themeToggle')) {
        function updateThemeBtnLabel() {
            themeToggleBtn.textContent =
                document.body.classList.contains('dark-theme')
                    ? 'Светлая тема'
                    : 'Тёмная тема';
        }
        updateThemeBtnLabel();

        themeToggleBtn.addEventListener('click', function () {
            const isDark = document.body.classList.toggle('dark-theme');
            updateThemeBtnLabel();
            saveTheme(isDark);
        });
    }

    // --- Показать / скрыть секцию книг ---
    if (checkExists(toggleBooksBtn, '#toggleBooksBtn')
        && checkExists(booksSection, '#books')) {

        function updateToggleLabel() {
            toggleBooksBtn.textContent =
                booksSection.classList.contains('hidden-section')
                    ? 'Показать книги'
                    : 'Скрыть книги';
        }
        updateToggleLabel();

        toggleBooksBtn.addEventListener('click', function () {
            const isHidden = booksSection.classList.toggle('hidden-section');
            updateToggleLabel();
            saveBooksHidden(isHidden);
        });
    }

    loadState();
    console.log('ЛР №5: скрипт успешно инициализирован.');
})();