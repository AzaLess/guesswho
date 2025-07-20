import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'uk' | 'ru' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Переводы
type TranslationKeys = {
  [key: string]: string;
};

type Translations = {
  [K in Language]: TranslationKeys;
};

const translations: Translations = {
  en: {
    // Welcome page
    'welcome.title': '🎯 Guess Who',
    'welcome.subtitle': 'Fun fact guessing game',
    'welcome.host': '👑 Host Game',
    'welcome.join': '🚪 Join Game',
    'welcome.rules': '📋 Rules',
    'welcome.hostName': 'Your name (host):',
    'welcome.namePlaceholder': 'Enter your name',
    'welcome.tokenPlaceholder': 'Enter game code',
    'welcome.startGame': 'Start Game',
    'welcome.joinGame': 'Join Game',
    'welcome.next': 'Next',
    'welcome.back': '← Back',
    'welcome.playerName': 'Your name:',
    'welcome.gameCode': 'Game code:',
    'welcome.enterNameAndCode': 'Enter name and room code!',
    'welcome.joinError': 'Join error. Check the code and try again.',
    
    // Game creation
    'create.title': '⏳ Creating game...',
    'create.error': 'Error creating game',
    
    // Submit facts
    'facts.title': '📝 Enter 3 facts about yourself',
    'facts.placeholder': '💡 Fact',
    'facts.send': '📨 Send',
    'facts.sending': '📤 Sending...',
    'facts.done': '✅ Done!',
    'facts.error': 'Enter at least 3 facts!',
    'facts.submitError': 'Error submitting facts',
    'facts.inspiration': 'Use these examples as inspiration, but write your own unique facts!',
    
    // Waiting room
    'waiting.title': '🏠 Waiting for participants',
    'waiting.code': '🔑 Room code:',
    'waiting.ready': 'Ready',
    'waiting.notReady': 'Filling facts',
    'waiting.you': 'You',
    'waiting.startGame': '🚦 Start Game',
    
    // Game round
    'round.title': 'Guess who wrote:',
    'round.questionsLeft': '📝 Questions left:',
    'round.addFact': '➕ Add fact about yourself',
    'round.addFactTitle': '➕ Add new fact about yourself:',
    'round.addFactPlaceholder': 'Enter an interesting fact about yourself...',
    'round.add': '✅ Add',
    'round.adding': '💾 Adding...',
    'round.cancel': '❌ Cancel',
    'round.whoGuessed': '🎯 Who guessed correctly?',
    'round.selectPlayer': 'Select player',
    'round.wrongAttempts': '❌ How many wrong attempts?',
    'round.saveResult': '✅ Save result',
    'round.saving': '💾 Saving...',
    'round.waitingHost': 'Waiting for host decision...',
    'round.factAdded': 'Fact added! Question count will update for everyone.',
    'round.addFactError': 'Error adding fact',
    'round.enterFact': 'Enter a fact!',
    'round.resultSaved': 'Result saved!',
    'round.resultError': 'Error sending result',
    'round.dataError': 'Error loading game data',
    'round.roundsComplete': '🎉 Rounds complete! 🎉',
    'round.goingToResults': 'Going to results...',
    
    // End screen
    'end.title': '🎉 Game finished! 🎉',
    'end.thanks': '🥳 Thanks for playing! 🥳',
    'end.newGame': '🎮 Start new game',
    'end.loading': 'Loading statistics...',
    'end.miniStats': '🏆 Mini-statistics',
    'end.noStats': 'Statistics will appear after first rounds',
    'end.bestDetective': '🔍 Best detective:',
    'end.hardestFact': '🧩 Hardest fact:',
    'end.mostWrong': '🤔 Most mistakes:',
    'end.mostMysterious': '🎭 Most mysterious:',
    'end.laziest': '😴 Laziest:',
    
    // Rules
    'rules.title': '📋 "Guess Who" Game Rules',
    'rules.goal': '🎯 Goal',
    'rules.goalText': 'Guess which participant wrote each fact about themselves and score maximum points.',
    'rules.participants': '👥 Participants',
    'rules.host': '👑 Host: Creates game, manages rounds, awards points',
    'rules.players': '🧑 Players: Submit facts, try to guess authors',
    'rules.gameplay': '🎮 Gameplay',
    'rules.step1': 'Each participant submits 3 interesting facts about themselves',
    'rules.step2': 'Host reads facts one by one',
    'rules.step3': 'Players try to guess the author',
    'rules.step4': 'Host awards points and moves to next fact',
    'rules.scoring': '🏆 Scoring',
    'rules.correct': '✅ Correct guess: +3 points',
    'rules.author': '📝 Fact author gets points = number of wrong guesses',
    'rules.winner': '🥇 Winner: Player with most points',
    'rules.backToMenu': '🏠 Back to menu',
    
    // Scoreboard
    'scoreboard.title': '🏆 Scoreboard',
    'scoreboard.endGame': '🏁 End game',
    
    // Common
    'common.points': 'points',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.backToMenu': 'Back to Menu',
    
    // Analytics
    'analytics.title': '📊 Game Analytics',
    'analytics.totalGames': 'Total Games Created',
    'analytics.totalPlayers': 'Total Players',
    'analytics.avgPlayersPerGame': 'Average Players per Game',
    'analytics.avgGameDuration': 'Average Game Duration',
    'analytics.mostActiveDay': 'Most Active Day',
    'analytics.gamesThisWeek': 'Games This Week',
    'analytics.gamesThisMonth': 'Games This Month',
    'analytics.noData': 'No analytics data available yet',
  },
  
  uk: {
    // Welcome page
    'welcome.title': '🎯 Вгадай Хто',
    'welcome.subtitle': 'Весела гра на вгадування фактів',
    'welcome.host': '👑 Створити Гру',
    'welcome.join': '🚪 Приєднатися',
    'welcome.rules': '📋 Правила',
    'welcome.hostName': 'Ваше ім\'я (ведучий):',
    'welcome.namePlaceholder': 'Введіть ваше ім\'я',
    'welcome.tokenPlaceholder': 'Введіть код гри',
    'welcome.startGame': 'Почати Гру',
    'welcome.joinGame': 'Приєднатися',
    'welcome.next': 'Далі',
    'welcome.back': '← Назад',
    'welcome.playerName': 'Ваше ім\'я:',
    'welcome.gameCode': 'Код гри:',
    'welcome.enterNameAndCode': 'Введіть ім\'я та код кімнати!',
    'welcome.joinError': 'Помилка входу. Перевірте код і спробуйте знову.',
    
    // Game creation
    'create.title': '⏳ Створення гри...',
    'create.error': 'Помилка створення гри',
    
    // Submit facts
    'facts.title': '📝 Введіть 3 факти про себе',
    'facts.placeholder': '💡 Факт',
    'facts.send': '📨 Відправити',
    'facts.sending': '📤 Відправка...',
    'facts.done': '✅ Готово!',
    'facts.error': 'Введіть мінімум 3 факти!',
    'facts.submitError': 'Помилка відправки фактів',
    'facts.inspiration': 'Використовуйте ці приклади як натхнення, але пишіть власні унікальні факти!',
    
    // Waiting room
    'waiting.title': '🏠 Очікування учасників',
    'waiting.code': '🔑 Код кімнати:',
    'waiting.ready': 'Готовий',
    'waiting.notReady': 'Заповнює факти',
    'waiting.you': 'Ви',
    'waiting.startGame': '🚦 Почати Гру',
    
    // Game round
    'round.title': 'Вгадайте, хто написав:',
    'round.questionsLeft': '📝 Залишилось питань:',
    'round.addFact': '➕ Додати факт про себе',
    'round.addFactTitle': '➕ Додати новий факт про себе:',
    'round.addFactPlaceholder': 'Введіть цікавий факт про себе...',
    'round.add': '✅ Додати',
    'round.adding': '💾 Додаю...',
    'round.cancel': '❌ Скасувати',
    'round.whoGuessed': '🎯 Хто вгадав правильно?',
    'round.selectPlayer': 'Оберіть гравця',
    'round.wrongAttempts': '❌ Скільки було невірних спроб?',
    'round.saveResult': '✅ Зберегти результат',
    'round.saving': '💾 Зберігаю...',
    'round.waitingHost': 'Очікуємо рішення ведучого...',
    'round.factAdded': 'Факт додано! У всіх оновиться кількість питань.',
    'round.addFactError': 'Помилка додавання факту',
    'round.enterFact': 'Введіть факт!',
    'round.resultSaved': 'Результат збережено!',
    'round.resultError': 'Помилка відправки результату',
    'round.dataError': 'Помилка завантаження ігрових даних',
    'round.roundsComplete': '🎉 Раунди завершено! 🎉',
    'round.goingToResults': 'Переходимо до результатів...',
    
    // End screen
    'end.title': '🎉 Гра завершена! 🎉',
    'end.thanks': '🥳 Дякуємо за гру! 🥳',
    'end.newGame': '🎮 Почати нову гру',
    'end.loading': 'Завантажуємо статистику...',
    'end.miniStats': '🏆 Міні-статистика',
    'end.noStats': 'Статистика з\'явиться після перших раундів',
    'end.bestDetective': '🔍 Найкращий детектив:',
    'end.hardestFact': '🧩 Найскладніший факт:',
    'end.mostWrong': '🤔 Найчастіше помилявся:',
    'end.mostMysterious': '🎭 Найзагадковіший:',
    'end.laziest': '😴 Лінивий:',
    
    // Rules
    'rules.title': '📋 Правила гри "Вгадай Хто"',
    'rules.goal': '🎯 Мета',
    'rules.goalText': 'Вгадати, який учасник написав той чи інший факт про себе, і набрати максимальну кількість очок.',
    'rules.participants': '👥 Учасники',
    'rules.host': '👑 Ведучий: Створює гру, керує раундами, нараховує очки',
    'rules.players': '🧑 Гравці: Подають факти, намагаються вгадати авторів',
    'rules.gameplay': '🎮 Геймплей',
    'rules.step1': 'Кожен учасник подає 3 цікаві факти про себе',
    'rules.step2': 'Ведучий зачитує факти по одному',
    'rules.step3': 'Гравці намагаються вгадати автора',
    'rules.step4': 'Ведучий нараховує очки і переходить до наступного факту',
    'rules.scoring': '🏆 Підрахунок очок',
    'rules.correct': '✅ Правильна відповідь: +3 очки',
    'rules.author': '📝 Автор факту отримує очки = кількість невірних здогадок',
    'rules.winner': '🥇 Переможець: Гравець з найбільшою кількістю очок',
    'rules.backToMenu': '🏠 Повернутися в меню',
    
    // Scoreboard
    'scoreboard.title': '🏆 Таблиця очок',
    'scoreboard.endGame': '🏁 Завершити гру',
    
    // Common
    'common.points': 'очок',
    'common.loading': 'Завантаження...',
    'common.error': 'Помилка',
    'common.backToMenu': 'Повернутися в меню',
    
    // Analytics
    'analytics.title': '📊 Аналітика Ігор',
    'analytics.totalGames': 'Всього Створено Ігор',
    'analytics.totalPlayers': 'Всього Гравців',
    'analytics.avgPlayersPerGame': 'Середня Кількість Гравців',
    'analytics.avgGameDuration': 'Середня Тривалість Гри',
    'analytics.mostActiveDay': 'Найактивніший День',
    'analytics.gamesThisWeek': 'Ігор Цього Тижня',
    'analytics.gamesThisMonth': 'Ігор Цього Місяця',
    'analytics.noData': 'Дані аналітики поки недоступні',
  },
  
  ru: {
    // Welcome page
    'welcome.title': '🎯 Угадай Кто',
    'welcome.subtitle': 'Веселая игра на угадывание фактов',
    'welcome.host': '👑 Создать Игру',
    'welcome.join': '🚪 Присоединиться',
    'welcome.rules': '📋 Правила',
    'welcome.hostName': 'Ваше имя (ведущий):',
    'welcome.namePlaceholder': 'Введите ваше имя',
    'welcome.tokenPlaceholder': 'Введите код игры',
    'welcome.startGame': 'Начать Игру',
    'welcome.joinGame': 'Присоединиться',
    'welcome.next': 'Далее',
    'welcome.back': '← Назад',
    'welcome.playerName': 'Ваше имя:',
    'welcome.gameCode': 'Код игры:',
    'welcome.enterNameAndCode': 'Введите имя и код комнаты!',
    'welcome.joinError': 'Ошибка входа. Проверьте код и попробуйте снова.',
    
    // Game creation
    'create.title': '⏳ Создание игры...',
    'create.error': 'Ошибка при создании игры',
    
    // Submit facts
    'facts.title': '📝 Введите 3 факта о себе',
    'facts.placeholder': '💡 Факт',
    'facts.send': '📨 Отправить',
    'facts.sending': '📤 Отправка...',
    'facts.done': '✅ Готово!',
    'facts.error': 'Введите минимум 3 факта!',
    'facts.submitError': 'Ошибка при отправке фактов',
    'facts.inspiration': 'Используйте эти примеры как вдохновение, но пишите свои уникальные факты!',
    
    // Waiting room
    'waiting.title': '🏠 Ожидание участников',
    'waiting.code': '🔑 Код комнаты:',
    'waiting.ready': 'Готов',
    'waiting.notReady': 'Заполняет факты',
    'waiting.you': 'Вы',
    'waiting.startGame': '🚦 Начать Игру',
    
    // Game round
    'round.title': 'Угадайте, кто написал:',
    'round.questionsLeft': '📝 Осталось вопросов:',
    'round.addFact': '➕ Добавить факт о себе',
    'round.addFactTitle': '➕ Добавить новый факт о себе:',
    'round.addFactPlaceholder': 'Введите интересный факт о себе...',
    'round.add': '✅ Добавить',
    'round.adding': '💾 Добавляю...',
    'round.cancel': '❌ Отмена',
    'round.whoGuessed': '🎯 Кто угадал правильно?',
    'round.selectPlayer': 'Выберите игрока',
    'round.wrongAttempts': '❌ Сколько было неверных попыток?',
    'round.saveResult': '✅ Сохранить результат',
    'round.saving': '💾 Сохраняю...',
    'round.waitingHost': 'Ожидаем решения ведущего...',
    'round.factAdded': 'Факт добавлен! У всех обновится количество вопросов.',
    'round.addFactError': 'Ошибка при добавлении факта',
    'round.enterFact': 'Введите факт!',
    'round.resultSaved': 'Результат сохранён!',
    'round.resultError': 'Ошибка отправки результата',
    'round.dataError': 'Ошибка загрузки игровых данных',
    'round.roundsComplete': '🎉 Раунды завершены! 🎉',
    'round.goingToResults': 'Переходим к результатам...',
    
    // End screen
    'end.title': '🎉 Игра завершена! 🎉',
    'end.thanks': '🥳 Спасибо за игру! 🥳',
    'end.newGame': '🎮 Начать новую игру',
    'end.loading': 'Загружаем статистику...',
    'end.miniStats': '🏆 Мини-статистика',
    'end.noStats': 'Статистика появится после первых раундов',
    'end.bestDetective': '🔍 Лучший детектив:',
    'end.hardestFact': '🧩 Самый сложный факт:',
    'end.mostWrong': '🤔 Чаще всех ошибался:',
    'end.mostMysterious': '🎭 Самый загадочный:',
    'end.laziest': '😴 Ленивый:',
    
    // Rules
    'rules.title': '📋 Правила игры "Угадай кто"',
    'rules.goal': '🎯 Цель игры',
    'rules.goalText': 'Угадать, кто из участников написал тот или иной факт о себе, и набрать максимальное количество очков.',
    'rules.participants': '👥 Участники',
    'rules.host': '👑 Ведущий: Создает игру, управляет раундами, начисляет очки',
    'rules.players': '🧑 Игроки: Подают факты, пытаются угадать авторов',
    'rules.gameplay': '🎮 Геймплей',
    'rules.step1': 'Каждый участник подает 3 интересных факта о себе',
    'rules.step2': 'Ведущий зачитывает факты по одному',
    'rules.step3': 'Игроки пытаются угадать автора',
    'rules.step4': 'Ведущий начисляет очки и переходит к следующему факту',
    'rules.scoring': '🏆 Подсчет очков',
    'rules.correct': '✅ Правильный ответ: +3 очка',
    'rules.author': '📝 Автор факта получает очки = количество неверных догадок',
    'rules.winner': '🥇 Победитель: Игрок с наибольшим количеством очков',
    'rules.backToMenu': '🏠 Вернуться в меню',
    
    // Scoreboard
    'scoreboard.title': '🏆 Таблица очков',
    'scoreboard.endGame': '🏁 Завершить игру',
    
    // Common
    'common.points': 'очков',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.backToMenu': 'Вернуться в меню',
    
    // Analytics
    'analytics.title': '📊 Аналитика Игр',
    'analytics.totalGames': 'Всего Создано Игр',
    'analytics.totalPlayers': 'Всего Игроков',
    'analytics.avgPlayersPerGame': 'Среднее Количество Игроков',
    'analytics.avgGameDuration': 'Средняя Длительность Игры',
    'analytics.mostActiveDay': 'Самый Активный День',
    'analytics.gamesThisWeek': 'Игр На Этой Неделе',
    'analytics.gamesThisMonth': 'Игр В Этом Месяце',
    'analytics.noData': 'Данные аналитики пока недоступны',
  },
  
  de: {
    // Welcome page
    'welcome.title': '🎯 Errate Wer',
    'welcome.subtitle': 'Spiel zum Erraten von Fakten',
    'welcome.host': '👑 Spiel erstellen',
    'welcome.join': '🚪 Beitritt',
    'welcome.rules': '📋 Regeln',
    'welcome.hostName': 'Ihr Name (Gastgeber):',
    'welcome.namePlaceholder': 'Geben Sie Ihren Namen ein',
    'welcome.tokenPlaceholder': 'Geben Sie den Spielcode ein',
    'welcome.startGame': 'Spiel starten',
    'welcome.joinGame': 'Beitreten',
    'welcome.next': 'Weiter',
    'welcome.back': '← Zurück',
    'welcome.playerName': 'Ihr Name:',
    'welcome.gameCode': 'Spielcode:',
    'welcome.enterNameAndCode': 'Geben Sie Namen und Spielcode ein!',
    'welcome.joinError': 'Fehler beim Beitritt. Überprüfen Sie den Code und versuchen Sie es erneut.',
    
    // Game creation
    'create.title': '⏳ Spiel erstellen...',
    'create.error': 'Fehler beim Erstellen des Spiels',
    
    // Submit facts
    'facts.title': '📝 Geben Sie 3 Fakten über sich ein',
    'facts.placeholder': '💡 Fakt',
    'facts.send': '📨 Senden',
    'facts.sending': '📤 Senden...',
    'facts.done': '✅ Fertig!',
    'facts.error': 'Geben Sie mindestens 3 Fakten ein!',
    'facts.submitError': 'Fehler beim Senden der Fakten',
    'facts.inspiration': 'Nutzen Sie diese Beispiele als Inspiration, aber schreiben Sie Ihre eigenen einzigartigen Fakten!',
    
    // Waiting room
    'waiting.title': '🏠 Warten auf Teilnehmer',
    'waiting.code': '🔑 Spielcode:',
    'waiting.ready': 'Bereit',
    'waiting.notReady': 'Fakten eintragen',
    'waiting.you': 'Sie',
    'waiting.startGame': '🚦 Spiel starten',
    
    // Game round
    'round.title': 'Erraten Sie, wer geschrieben hat:',
    'round.questionsLeft': '📝 Fragen übrig:',
    'round.addFact': '➕ Fakt über sich hinzufügen',
    'round.addFactTitle': '➕ Neuen Fakt über sich hinzufügen:',
    'round.addFactPlaceholder': 'Geben Sie einen interessanten Fakt über sich ein...',
    'round.add': '✅ Hinzufügen',
    'round.adding': '💾 Hinzufügen...',
    'round.cancel': '❌ Abbrechen',
    'round.whoGuessed': '🎯 Wer hat richtig erraten?',
    'round.selectPlayer': 'Spieler auswählen',
    'round.wrongAttempts': '❌ Wie viele falsche Versuche?',
    'round.saveResult': '✅ Ergebnis speichern',
    'round.saving': '💾 Speichern...',
    'round.waitingHost': 'Warten auf Entscheidung des Gastgebers...',
    'round.factAdded': 'Fakt hinzugefügt! Die Anzahl der Fragen wird für alle aktualisiert.',
    'round.addFactError': 'Fehler beim Hinzufügen des Faktums',
    'round.enterFact': 'Fakt eingeben!',
    'round.resultSaved': 'Ergebnis gespeichert!',
    'round.resultError': 'Fehler beim Senden des Ergebnisses',
    'round.dataError': 'Fehler beim Laden der Spiel-Daten',
    'round.roundsComplete': '🎉 Runden abgeschlossen! 🎉',
    'round.goingToResults': 'Zu den Ergebnissen...',
    
    // End screen
    'end.title': '🎉 Spiel beendet! 🎉',
    'end.thanks': '🥳 Danke für das Spiel! 🥳',
    'end.newGame': '🎮 Neues Spiel starten',
    'end.loading': 'Statistik laden...',
    'end.miniStats': '🏆 Mini-Statistik',
    'end.noStats': 'Statistik wird nach den ersten Runden angezeigt',
    'end.bestDetective': '🔍 Bester Detektiv:',
    'end.hardestFact': '🧩 Schwierigster Fakt:',
    'end.mostWrong': '🤔 Meiste Fehler:',
    'end.mostMysterious': '🎭 Rätselhaftester:',
    'end.laziest': '😴 Faulste:',
    
    // Rules
    'rules.title': '📋 Regeln des Spiels "Errate Wer"',
    'rules.goal': '🎯 Ziel',
    'rules.goalText': 'Erraten Sie, wer von den Teilnehmern welchen Fakt über sich geschrieben hat, und sammeln Sie die meisten Punkte.',
    'rules.participants': '👥 Teilnehmer',
    'rules.host': '👑 Gastgeber: Erstellt das Spiel, verwaltet die Runden, vergibt Punkte',
    'rules.players': '🧑 Spieler: Geben Fakten ein, versuchen die Autoren zu erraten',
    'rules.gameplay': '🎮 Spielablauf',
    'rules.step1': 'Jeder Teilnehmer gibt 3 interessante Fakten über sich ein',
    'rules.step2': 'Der Gastgeber liest die Fakten einzeln vor',
    'rules.step3': 'Die Spieler versuchen die Autoren zu erraten',
    'rules.step4': 'Der Gastgeber vergibt Punkte und geht zur nächsten Frage über',
    'rules.scoring': '🏆 Punktevergabe',
    'rules.correct': '✅ Richtiges Erraten: +3 Punkte',
    'rules.author': '📝 Der Autor des Faktums erhält Punkte = Anzahl der falschen Versuche',
    'rules.winner': '🥇 Gewinner: Spieler mit den meisten Punkten',
    'rules.backToMenu': '🏠 Zurück zum Menü',
    
    // Scoreboard
    'scoreboard.title': '🏆 Punkte-Tabelle',
    'scoreboard.endGame': '🏁 Spiel beenden',
    
    // Common
    'common.points': 'Punkte',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.backToMenu': 'Zurück zum Menü',
    
    // Analytics
    'analytics.title': '📊 Spiel-Analyse',
    'analytics.totalGames': 'Insgesamt erstellte Spiele',
    'analytics.totalPlayers': 'Insgesamt Spieler',
    'analytics.avgPlayersPerGame': 'Durchschnittliche Anzahl Spieler pro Spiel',
    'analytics.avgGameDuration': 'Durchschnittliche Spiel-Dauer',
    'analytics.mostActiveDay': 'Aktivster Tag',
    'analytics.gamesThisWeek': 'Spiele diese Woche',
    'analytics.gamesThisMonth': 'Spiele diesen Monat',
    'analytics.noData': 'Keine Analyse-Daten verfügbar',
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en'); // По умолчанию английский

  useEffect(() => {
    // Загружаем сохраненный язык из localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'uk', 'ru', 'de'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof TranslationKeys] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
