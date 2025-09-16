// script.js

import WordSifter from './WordSifter.js';

const App = (function () {
    'use strict';

    let sifter;

    const elements = {};

    function updateGuessGrid(wordSifter) {
        elements.guessGrid.innerHTML = ''; // Clear previous entries

        const { guesses, feedbacks } = wordSifter;
        guesses.forEach((guess, index) => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('guess-row');
            guess.forEach((letter, i) => {
                const square = document.createElement('div');
                square.classList.add('grid-square');
                square.textContent = letter;
                const color =
                    feedbacks[index][i] === 'G'
                        ? 'green'
                        : feedbacks[index][i] === 'Y'
                        ? 'yellow'
                        : 'gray';
                square.classList.add(color);
                rowDiv.appendChild(square);
            });
            elements.guessGrid.appendChild(rowDiv);
        });
    }

    function handleUpdate(wordSifter) {
        const guess = elements.guessInput.value;
        const feedback = elements.feedbackInput.value;

        wordSifter.update(guess, feedback);
        updateGuessGrid(wordSifter);

        displayWords(wordSifter.filteredWords);
        elements.guessInput.focus();
    }

    function handleExcludeUsed(wordSifter) {
        wordSifter.excludeUsedWords = elements.excludeUsedCheckbox.checked;
        displayWords(wordSifter.filteredWords);
    }

    function displayWords(words) {
        elements.wordListContainer.style.display = 'block';
        elements.instructionsContainer.style.display = 'none';
        elements.wordCountHeading.textContent = `${words.length} Word${
            words.length != 1 ? 's' : ''
        }:`;

        elements.filteredWords.innerHTML = '';
        words.forEach((word) => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-word');
            listItem.textContent = word;
            elements.filteredWords.appendChild(listItem);
        });
    }

    function resetApp(wordSifter) {
        elements.guessGrid.innerHTML = '';
        elements.guessInput.value = '';
        elements.feedbackInput.value = '';
        elements.updateButton.disabled = true;

        elements.wordListContainer.style.display = 'none';
        elements.instructionsContainer.style.display = 'block';

        wordSifter.reset();
    }

    function validateInputs(guess, feedback) {
        const guessArr = guess.trim().toUpperCase().split('');
        const feedbackArr = feedback.trim().toUpperCase().split('');

        const ASCII_CODE_A = 65;
        const guessAllowed = Array.from({ length: 26 }, (_, i) =>
            String.fromCharCode(ASCII_CODE_A + i)
        );
        const feedbackAllowed = ['B', 'Y', 'G'];

        return (
            guess.length === 5 &&
            feedback.length === 5 &&
            guessArr.every((char) => guessAllowed.includes(char)) &&
            feedbackArr.every((char) => feedbackAllowed.includes(char))
        );
    }

    function setupEventListeners() {
        elements.guessInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') handleUpdate(sifter);
        });
        elements.guessInput.addEventListener('focus', function () {
            this.select();
        });

        elements.feedbackInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') handleUpdate(sifter);
        });
        elements.feedbackInput.addEventListener('focus', function () {
            this.select();
        });

        function validateInputsHandler() {
            const guessValue = elements.guessInput.value.trim();
            const feedbackValue = elements.feedbackInput.value.trim();

            elements.updateButton.disabled = !validateInputs(
                guessValue,
                feedbackValue
            );
        }

        elements.guessInput.addEventListener('input', validateInputsHandler);
        elements.feedbackInput.addEventListener('input', validateInputsHandler);

        elements.updateButton.addEventListener('click', () =>
            handleUpdate(sifter)
        );
        elements.resetButton.addEventListener('click', () => resetApp(sifter));
        elements.excludeUsedCheckbox.addEventListener('change', () =>
            handleExcludeUsed(sifter)
        );

        window.addEventListener('focus', function () {
            elements.guessInput.focus();
        });
    }

    function initializeElements() {
        const elementIds = {
            guessInput: 'guess-input',
            feedbackInput: 'feedback-input',
            updateButton: 'update-button',
            resetButton: 'reset-button',
            excludeUsedCheckbox: 'exclude-used',
            guessGrid: 'guess-grid',
            filteredWords: 'filtered-words',
            wordCountHeading: 'word-count',
            wordListContainer: 'word-list-container',
            instructionsContainer: 'instructions-container',
        };

        for (const [key, id] of Object.entries(elementIds)) {
            elements[key] = document.getElementById(id);
            if (!elements[key]) {
                console.error(
                    `Element with id "${id}" not found. Check your HTML.`
                );
            }
        }
    }

    async function getUsedWords() {
    // Fetch used words from GitHub Gist
        const user = 'ducknoir';
        const gistId = '2e18b28da88f9509e2b712805b541e1d';
        const filename = 'used_words.json'; // exact file name in the gist
        // const gistUrl = `https://api.github.com/gists/${gistId}`;
        const gistUrl = `https://gist.githubusercontent.com/${user}/${gistId}/raw/${filename}`;
        const gistResponse = await fetch(gistUrl);
        const gistData = await gistResponse.json();
        const usedWordsContent = gistData.files['used_words.json'].content;
        const usedWordsData = JSON.parse(usedWordsContent);
        const usedWords = usedWordsData.map((item) => item.w);
        return usedWords;
    }

    async function initializeApp() {
        try {
            initializeElements();

            // Fetch and load the dictionary JSON file
            const dictionaryResponse = await fetch('dictionary.json');
            const dictionaryData = await dictionaryResponse.json();
            const usedWords = await getUsedWords();
            console.log(usedWords);

            sifter = new WordSifter(dictionaryData.words, usedWords);

            setupEventListeners();
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    function init() {
        initializeApp();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
