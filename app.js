const STORAGE_KEY = "word-deck-app:v1";

const modes = [
  { id: "input-ja-en", label: "日本語 → 英語", type: "input" },
  { id: "choice-en-ja", label: "4択 英語 → 日本語", type: "choice" },
  { id: "choice-ja-en", label: "4択 日本語 → 英語", type: "choice" },
];

const countOptions = [
  { id: "10", label: "10問", value: 10 },
  { id: "30", label: "30問", value: 30 },
  { id: "50", label: "50問", value: 50 },
  { id: "100", label: "100問", value: 100 },
  { id: "all", label: "全部", value: "all" },
  { id: "endless", label: "エンドレス", value: "endless" },
];

const partOrder = ["動詞", "名詞", "形容詞", "副詞・その他"];

const sampleDeck = {
  id: "sample-basic",
  name: "サンプル単語帳",
  createdAt: new Date().toISOString(),
  words: [
    { lesson: "Stage1-動詞", english: "improve", japanese: ["改善する", "上達する"] },
    { lesson: "Stage1-動詞", english: "increase", japanese: ["増える", "増やす"] },
    { lesson: "Stage1-名詞", english: "method", japanese: ["方法"] },
    { lesson: "Stage1-名詞", english: "purpose", japanese: ["目的"] },
    { lesson: "Stage1-名詞", english: "result", japanese: ["結果"] },
    { lesson: "Stage2-動詞", english: "compare", japanese: ["比較する"] },
    { lesson: "Stage2-動詞", english: "decide", japanese: ["決める"] },
    { lesson: "Stage2-動詞", english: "explain", japanese: ["説明する"] },
    { lesson: "Stage2-動詞", english: "include", japanese: ["含む"] },
    { lesson: "多義語", english: "notice", japanese: ["気づく", "通知"] },
  ],
};

let state = loadState();
let selectedDeckId = null;
let setup = {
  mode: modes[0].id,
  groups: [],
  count: "10",
};
let session = null;

const screens = {
  decks: document.querySelector("#deck-screen"),
  setup: document.querySelector("#setup-screen"),
  study: document.querySelector("#study-screen"),
  result: document.querySelector("#result-screen"),
};

const deckList = document.querySelector("#deck-list");
const csvInput = document.querySelector("#csv-input");
const activeDeckName = document.querySelector("#active-deck-name");
const modeOptions = document.querySelector("#mode-options");
const rangeToolbar = document.querySelector("#range-toolbar");
const lessonOptions = document.querySelector("#lesson-options");
const countOptionsEl = document.querySelector("#count-options");
const startButton = document.querySelector("#start-button");
const startNote = document.querySelector("#start-note");
const questionCount = document.querySelector("#question-count");
const accuracy = document.querySelector("#accuracy");
const questionText = document.querySelector("#question-text");
const feedback = document.querySelector("#feedback");
const answerNote = document.querySelector("#answer-note");
const answerArea = document.querySelector("#answer-area");
const nextButton = document.querySelector("#next-button");
const retryButton = document.querySelector("#retry-button");
const quitDialog = document.querySelector("#quit-dialog");
const quitDialogTitle = document.querySelector("#quit-dialog-title");
const quitDialogMessage = document.querySelector("#quit-dialog-message");
const cancelQuitButton = document.querySelector("#cancel-quit-button");
const confirmQuitButton = document.querySelector("#confirm-quit-button");
const toast = document.querySelector("#toast");
let confirmDialogAction = null;
let toastTimer = null;

document.addEventListener("click", handleGlobalClick);
document.addEventListener("keydown", handleKeyboard);
csvInput.addEventListener("change", handleCsvImport);
document.querySelector("#load-sample-button").addEventListener("click", addSampleDeck);
startButton.addEventListener("click", startStudy);
nextButton.addEventListener("click", nextQuestion);
retryButton.addEventListener("click", retryWrongWords);
cancelQuitButton.addEventListener("click", closeConfirmDialog);
confirmQuitButton.addEventListener("click", runConfirmDialogAction);
quitDialog.addEventListener("click", (event) => {
  if (event.target === quitDialog) closeConfirmDialog();
});

renderDecks();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { decks: [] };

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.decks) ? parsed : { decks: [] };
  } catch {
    return { decks: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  document.body.classList.toggle("study-active", name === "study");
  if (name === "study") {
    forceScrollToTop();
    scrollToTop();
  }
}

function forceScrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function scrollToTop() {
  requestAnimationFrame(() => {
    forceScrollToTop();
    requestAnimationFrame(forceScrollToTop);
    window.setTimeout(forceScrollToTop, 120);
  });
}

function handleGlobalClick(event) {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "back-to-decks") {
    showScreen("decks");
  }
  if (action === "back-to-setup") {
    renderSetup();
    showScreen("setup");
  }
  if (action === "quit-study") {
    openConfirmDialog({
      title: "学習を終了しますか？",
      message: "現在の学習結果は保存されず、モード選択に戻ります。",
      confirmLabel: "終了する",
      cancelLabel: "続ける",
      onConfirm: quitStudy,
    });
  }
}

function handleKeyboard(event) {
  if (!quitDialog.classList.contains("is-hidden")) {
    if (event.key === "Escape") closeConfirmDialog();
    return;
  }

  if (!screens.study.classList.contains("is-active") || !session) return;

  const activeTag = document.activeElement?.tagName;
  const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA";
  if (event.key === "Enter" && session.locked) {
    event.preventDefault();
    nextQuestion();
    return;
  }

  if (isTyping || session.locked) return;

  const choiceIndex = Number(event.key) - 1;
  if (choiceIndex >= 0 && choiceIndex <= 3) {
    const choiceButtons = [...answerArea.querySelectorAll(".choice-button")];
    choiceButtons[choiceIndex]?.click();
  }
}

function openConfirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm }) {
  quitDialogTitle.textContent = title;
  quitDialogMessage.textContent = message;
  confirmQuitButton.textContent = confirmLabel;
  cancelQuitButton.textContent = cancelLabel;
  confirmDialogAction = onConfirm;
  quitDialog.classList.remove("is-hidden");
  cancelQuitButton.focus();
}

function closeConfirmDialog() {
  confirmDialogAction = null;
  quitDialog.classList.add("is-hidden");
}

function runConfirmDialogAction() {
  const action = confirmDialogAction;
  closeConfirmDialog();
  if (action) action();
}

function showToast(message, variant = "success") {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast ${variant === "error" ? "is-error" : ""}`;
  toastTimer = window.setTimeout(() => {
    toast.classList.add("is-hidden");
  }, 3200);
}

function quitStudy() {
  session = null;
  renderSetup();
  showScreen("setup");
}

function renderDecks() {
  deckList.innerHTML = "";

  if (state.decks.length === 0) {
    deckList.innerHTML = '<div class="empty-state">CSVを取り込むか、サンプル単語帳を追加してください。</div>';
    return;
  }

  const template = document.querySelector("#deck-card-template");
  state.decks.forEach((deck) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const groups = getStudyGroups(deck.words);
    node.querySelector("h2").textContent = deck.name;
    node.querySelector("p").textContent = getDeckSummary(deck.words, groups);
    node.querySelector('[data-role="study"]').addEventListener("click", () => {
      selectedDeckId = deck.id;
      setup.groups = getStudyGroups(deck.words).map((group) => group.id);
      renderSetup();
      showScreen("setup");
    });
    node.querySelector('[data-role="delete"]').addEventListener("click", () => deleteDeck(deck.id));
    deckList.appendChild(node);
  });
}

function renderSetup() {
  const deck = getSelectedDeck();
  if (!deck) return;

  activeDeckName.textContent = deck.name;
  renderOptionButtons(modeOptions, modes, setup.mode, (id) => {
    setup.mode = id;
    renderSetup();
  });

  renderGroupButtons(deck);

  renderOptionButtons(countOptionsEl, countOptions, setup.count, (id) => {
    setup.count = id;
    renderSetup();
  });

  updateStartState(deck);
}

function renderOptionButtons(container, options, selectedId, onSelect) {
  container.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = `mode-button${option.id === selectedId ? " is-selected" : ""}`;
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => onSelect(option.id));
    container.appendChild(button);
  });
}

function renderGroupButtons(deck) {
  const groups = getStudyGroups(deck.words);
  const selectedIds = getSelectedGroupIds(groups);
  const allSelected = selectedIds.length === groups.length;
  const grouped = getGroupedStudyRanges(groups);

  rangeToolbar.innerHTML = "";
  rangeToolbar.innerHTML = `
    <div>
      <span>選択中</span>
      <strong>${selectedIds.length}/${groups.length}</strong>
    </div>
  `;
  const allButton = document.createElement("button");
  allButton.className = `range-all-button${allSelected ? " is-selected" : ""}`;
  allButton.type = "button";
  allButton.textContent = allSelected ? "すべて解除" : "すべて選択";
  allButton.addEventListener("click", () => {
    setup.groups = allSelected ? [] : groups.map((group) => group.id);
    renderSetup();
  });
  rangeToolbar.appendChild(allButton);

  lessonOptions.innerHTML = "";
  grouped.forEach((range) => {
    const details = document.createElement("details");
    details.className = "range-group";
    details.open = true;

    const summary = document.createElement("summary");
    const rangeSelectedCount = range.children.filter((group) => selectedIds.includes(group.id)).length;
    const rangeAllSelected = rangeSelectedCount === range.children.length;
    const rangePartlySelected = rangeSelectedCount > 0 && !rangeAllSelected;
    summary.innerHTML = `
      <span class="range-title">${escapeHtml(range.parent)}</span>
      <strong class="range-count">${rangeSelectedCount}/${range.children.length}</strong>
    `;
    summary.classList.toggle("is-selected", rangeAllSelected);
    summary.classList.toggle("is-partial", rangePartlySelected);
    summary.addEventListener("click", (event) => {
      if (event.target.closest("[data-role='toggle-range']")) return;
      event.preventDefault();
      toggleRangeGroup(details);
    });
    details.appendChild(summary);

    const toggleButton = document.createElement("button");
    toggleButton.className = `range-toggle${rangeAllSelected ? " is-selected" : ""}`;
    toggleButton.type = "button";
    toggleButton.dataset.role = "toggle-range";
    toggleButton.textContent = rangeAllSelected ? "解除" : "全選択";
    toggleButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const current = new Set(getSelectedGroupIds(groups));
      range.children.forEach((group) => {
        if (rangeAllSelected) {
          current.delete(group.id);
        } else {
          current.add(group.id);
        }
      });
      setup.groups = [...current];
      renderSetup();
    });
    summary.appendChild(toggleButton);

    const childList = document.createElement("div");
    childList.className = "range-options";
    range.children.forEach((group) => {
      const button = createGroupButton(group.childLabel, selectedIds.includes(group.id));
      button.addEventListener("click", () => {
        const current = new Set(getSelectedGroupIds(groups));
        if (current.has(group.id)) {
          current.delete(group.id);
        } else {
          current.add(group.id);
        }
        setup.groups = [...current];
        renderSetup();
      });
      childList.appendChild(button);
    });
    details.appendChild(childList);
    lessonOptions.appendChild(details);
  });
}

function toggleRangeGroup(details) {
  const isOpen = details.open;
  details.classList.add("is-animating");
  if (isOpen) {
    details.classList.add("is-collapsed");
    window.setTimeout(() => {
      details.open = false;
      details.classList.remove("is-animating");
    }, 230);
    return;
  }

  details.open = true;
  details.classList.add("is-collapsed");
  requestAnimationFrame(() => {
    details.classList.remove("is-collapsed");
    window.setTimeout(() => {
      details.classList.remove("is-animating");
    }, 230);
  });
}

function createGroupButton(label, isSelected) {
  const button = document.createElement("button");
  button.className = `mode-button${isSelected ? " is-selected" : ""}`;
  button.type = "button";
  button.textContent = label;
  return button;
}

function startStudy() {
  const deck = getSelectedDeck();
  const pool = getWordPool(deck.words);
  const count = countOptions.find((option) => option.id === setup.count).value;
  const mode = getSelectedMode();
  if (!canStartStudy(pool, count, mode)) {
    updateStartState(deck);
    return;
  }
  const questions = makeQuestionList(pool, count);

  session = {
    deck,
    pool,
    mode: setup.mode,
    count,
    questions,
    index: 0,
    correct: 0,
    answered: 0,
    wrongWords: [],
    wrongItems: [],
    current: null,
    locked: false,
  };

  renderQuestion();
  showScreen("study");
}

function updateStartState(deck) {
  const pool = getWordPool(deck.words);
  const count = countOptions.find((option) => option.id === setup.count).value;
  const mode = getSelectedMode();
  const canStart = canStartStudy(pool, count, mode);
  const selectedCount = pool.length;
  const choiceReady = mode.type !== "choice" || canBuildChoicesForPool(pool, mode);

  startButton.disabled = !canStart;
  startButton.classList.toggle("is-disabled", !canStart);

  if (mode.type === "choice" && selectedCount < 4) {
    startNote.textContent = `4択モードは選択範囲に4語以上必要です。現在は${selectedCount}語です。`;
    startNote.className = "start-note is-warning";
  } else if (!choiceReady) {
    startNote.textContent = "4択を作れる候補が足りません。範囲を広げるか、別のモードを選んでください。";
    startNote.className = "start-note is-warning";
  } else if (count === "endless") {
    startNote.textContent = `${selectedCount}語を一周ずつランダムに出題します。`;
    startNote.className = "start-note";
  } else if (count === "all") {
    startNote.textContent = `${selectedCount}語をすべてランダムに出題します。`;
    startNote.className = "start-note";
  } else if (!canStart) {
    startNote.textContent = `選択範囲は${selectedCount}語です。${count}問にするにはあと${count - selectedCount}語必要です。`;
    startNote.className = "start-note is-warning";
  } else {
    startNote.textContent = `${selectedCount}語から重複なしで${count}問出題します。`;
    startNote.className = "start-note";
  }
}

function canStartStudy(pool, count, mode = getSelectedMode()) {
  if (mode.type === "choice" && pool.length < 4) return false;
  if (mode.type === "choice" && !canBuildChoicesForPool(pool, mode)) return false;
  if (count === "endless" || count === "all") return pool.length > 0;
  return pool.length >= count;
}

function canBuildChoicesForPool(pool, mode) {
  const labels = new Set(pool.map((word) => getChoiceLabel(word, mode)));
  return labels.size >= 4;
}

function getChoiceLabel(word, mode) {
  return mode.id === "choice-en-ja" ? formatJapanese(word) : word.english;
}

function renderQuestion() {
  const mode = modes.find((item) => item.id === session.mode);
  const word = session.count === "endless" ? getEndlessWord() : session.questions[session.index];
  session.current = buildQuestion(word, mode);
  session.locked = false;

  feedback.textContent = "";
  feedback.className = "feedback";
  answerNote.textContent = session.current.hint || "";
  nextButton.classList.add("is-hidden");
  setQuestionText(session.current.prompt);
  updateStudyStatus();

  if (mode.type === "input") {
    renderInputAnswer();
  } else {
    renderChoiceAnswer();
  }
}

function setQuestionText(text) {
  const value = String(text);
  questionText.textContent = value;
  questionText.classList.remove(
    "is-single-token",
    "is-japanese",
    "is-long",
    "is-very-long",
    "is-extra-long",
  );

  const compactLength = value.replace(/\s+/g, "").length;
  const isSingleToken = !/\s/.test(value);
  const isJapanese = hasJapaneseText(value);

  if (isJapanese) {
    questionText.classList.add("is-japanese");
    if (compactLength >= 16) questionText.classList.add("is-long");
    if (compactLength >= 24) questionText.classList.add("is-very-long");
    if (compactLength >= 34) questionText.classList.add("is-extra-long");
    return;
  }

  if (isSingleToken) questionText.classList.add("is-single-token");
  if (compactLength >= 11) questionText.classList.add("is-long");
  if (compactLength >= 14) questionText.classList.add("is-very-long");
  if (compactLength >= 18) questionText.classList.add("is-extra-long");
}

function getCompactLength(text) {
  return String(text).replace(/\s+/g, "").length;
}

function hasJapaneseText(text) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(String(text));
}

function getChoiceTextClass(label) {
  const length = getCompactLength(label);
  if (length >= 34) return " is-extra-long";
  if (length >= 24) return " is-very-long";
  if (length >= 16) return " is-long";
  return "";
}

function renderInputAnswer() {
  answerArea.innerHTML = `
    <form class="input-row" id="answer-form">
      <input class="answer-input" id="answer-input" type="text" inputmode="latin" lang="en" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="英語を入力" />
      <button id="answer-submit-button" class="primary-button" type="button">回答</button>
    </form>
  `;
  const form = document.querySelector("#answer-form");
  const input = document.querySelector("#answer-input");
  const submitButton = document.querySelector("#answer-submit-button");
  let submitPending = false;
  let nextReadyAt = 0;
  const queueSubmit = () => {
    if (submitPending || session.locked) return;
    submitPending = true;
    holdStudyPosition();
    input.blur();
    clearTextSelection();
    window.setTimeout(() => submitInputAnswer(input.value), 120);
  };
  const handleInputButtonPress = () => {
    if (session.locked) {
      if (Date.now() < nextReadyAt) return;
      nextQuestion();
      return;
    }
    queueSubmit();
  };

  if (!isTouchDevice()) input.focus({ preventScroll: true });
  submitButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handleInputButtonPress();
  });
  submitButton.addEventListener("click", handleInputButtonPress);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    queueSubmit();
  });
}

function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches;
}

function renderChoiceAnswer() {
  answerArea.innerHTML = '<div class="choice-grid"></div>';
  const grid = answerArea.querySelector(".choice-grid");
  session.current.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = `choice-button${getChoiceTextClass(choice.label)}`;
    button.type = "button";
    button.dataset.choiceId = choice.id;
    button.textContent = choice.label;
    button.title = choice.label;
    button.addEventListener("click", () => {
      if (!session.locked) submitChoiceAnswer(choice, button);
    });
    grid.appendChild(button);
  });
}

function submitInputAnswer(value) {
  const isCorrect = normalizeEnglish(value) === normalizeEnglish(session.current.answer);
  const form = document.querySelector("#answer-form");
  const input = document.querySelector("#answer-input");
  const submitButton = document.querySelector("#answer-submit-button");
  const shownAnswer = value || "未入力";
  form.classList.add("is-answered");
  moveCaretToEnd(input);
  input.blur();
  clearTextSelection();
  window.setTimeout(clearTextSelection, 0);
  replaceInputWithAnswer(input, shownAnswer, isCorrect);
  submitButton.classList.add("is-next", "is-waiting");
  submitButton.textContent = isLastQuestion() && session.count !== "endless" ? "結果を見る" : "次へ";
  submitButton.setAttribute("aria-disabled", "true");
  nextReadyAt = Date.now() + 450;
  window.setTimeout(() => {
    submitButton.classList.remove("is-waiting");
    submitButton.removeAttribute("aria-disabled");
  }, 450);
  finishAnswer(isCorrect, `正解: ${session.current.answer}`, shownAnswer, { inlineNext: true });
  settleStudyPosition();
}

function holdStudyPosition() {
  if (!screens.study.classList.contains("is-active")) return;
  screens.study.style.minHeight = `${screens.study.offsetHeight}px`;
}

function settleStudyPosition() {
  requestAnimationFrame(() => {
    forceScrollToTop();
    window.setTimeout(() => {
      screens.study.style.minHeight = "";
      forceScrollToTop();
    }, 220);
  });
}

function clearTextSelection() {
  const selection = window.getSelection?.();
  if (selection?.removeAllRanges) selection.removeAllRanges();
}

function moveCaretToEnd(input) {
  try {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  } catch {
    // Some mobile browsers reject selection changes during IME confirmation.
  }
}

function replaceInputWithAnswer(input, value, isCorrect) {
  const display = document.createElement("div");
  display.className = `answer-input answer-display ${isCorrect ? "is-correct" : "is-wrong"}`;
  display.textContent = value;
  display.setAttribute("aria-label", "入力した回答");
  input.replaceWith(display);
}

function submitChoiceAnswer(choice) {
  const isCorrect = choice.isCorrect;
  const buttons = [...answerArea.querySelectorAll(".choice-button")];
  buttons.forEach((button) => {
    button.disabled = true;
    const buttonChoice = session.current.choices.find((item) => item.id === button.dataset.choiceId);
    const isAnswer = buttonChoice?.isCorrect;
    const isSelected = button.dataset.choiceId === choice.id;
    if (isAnswer) button.classList.add("correct");
    if (!isCorrect && isSelected) button.classList.add("wrong");
    if (!isAnswer && !isSelected) button.classList.add("dimmed");
  });
  finishAnswer(isCorrect, isCorrect ? "" : `正解: ${session.current.answerLabel}`, choice.label);
}

function finishAnswer(isCorrect, note, userAnswer = "", options = {}) {
  session.locked = true;
  session.answered += 1;
  if (isCorrect) {
    session.correct += 1;
    feedback.textContent = "○";
    feedback.classList.add("correct");
  } else {
    addWrongWord(session.current.word);
    addWrongItem(session.current, userAnswer);
    feedback.textContent = "×";
    feedback.classList.add("wrong");
  }
  answerNote.textContent = note;
  nextButton.textContent = isLastQuestion() ? "結果を見る" : "次へ";
  if (session.count === "endless") nextButton.textContent = "次へ";
  if (!options.inlineNext) nextButton.classList.remove("is-hidden");
  updateStudyStatus();
}

function nextQuestion() {
  if (session.count !== "endless" && isLastQuestion()) {
    renderResult();
    showScreen("result");
    return;
  }
  session.index += 1;
  renderQuestion();
}

function renderResult() {
  document.querySelector("#result-correct").textContent = session.correct;
  document.querySelector("#result-wrong").textContent = session.answered - session.correct;
  document.querySelector("#result-accuracy").textContent = `${getAccuracy()}%`;

  const wrongList = document.querySelector("#wrong-list");
  wrongList.innerHTML = "";
  if (session.wrongWords.length === 0) {
    wrongList.innerHTML = '<p>全問正解です。</p>';
    retryButton.classList.add("is-hidden");
    return;
  }

  retryButton.classList.remove("is-hidden");
  const wrongItems = session.wrongItems?.length ? session.wrongItems : session.wrongWords.map((word) => ({
    word,
    prompt: formatJapanese(word),
    answer: word.english,
    userAnswer: "",
  }));

  wrongItems.forEach((wrongItem) => {
    const element = document.createElement("div");
    element.className = "wrong-item";
    element.innerHTML = `
      <div>
        <strong>${escapeHtml(wrongItem.word.english)}</strong>
        <span>${escapeHtml(formatJapanese(wrongItem.word))}</span>
      </div>
      <dl>
        <div><dt>問題</dt><dd>${escapeHtml(wrongItem.prompt)}</dd></div>
        ${wrongItem.userAnswer ? `<div><dt>回答</dt><dd>${escapeHtml(wrongItem.userAnswer)}</dd></div>` : ""}
        <div><dt>正解</dt><dd>${escapeHtml(wrongItem.answer)}</dd></div>
      </dl>
    `;
    wrongList.appendChild(element);
  });
}

function retryWrongWords() {
  const wrongWords = [...session.wrongWords];
  session = {
    ...session,
    pool: wrongWords,
    questions: shuffle(wrongWords),
    index: 0,
    correct: 0,
    answered: 0,
    wrongWords: [],
    wrongItems: [],
    count: wrongWords.length,
    current: null,
    locked: false,
  };
  renderQuestion();
  showScreen("study");
}

function updateStudyStatus() {
  const currentNumber = session.count === "endless" ? session.answered + 1 : Math.min(session.index + 1, session.questions.length);
  const total = session.count === "endless" ? "∞" : session.questions.length;
  questionCount.textContent = `${currentNumber} / ${total}`;
  accuracy.textContent = `正答率 ${getAccuracy()}%`;
}

function getSelectedMode() {
  return modes.find((item) => item.id === setup.mode) || modes[0];
}

function buildQuestion(word, mode) {
  if (mode.id === "input-ja-en") {
    const prompt = pickRandom(word.japanese);
    return {
      word,
      prompt,
      answer: word.english,
      hint: getDuplicateJapaneseHint(word, prompt),
    };
  }

  if (mode.id === "choice-en-ja") {
    const answerLabel = formatJapanese(word);
    return {
      word,
      prompt: word.english,
      answerLabel,
      choices: makeChoices(word, (item) => formatJapanese(item), answerLabel),
    };
  }

  const prompt = pickRandom(word.japanese);
  return {
    word,
    prompt,
    answerLabel: word.english,
    choices: makeChoices(word, (item) => item.english, word.english),
  };
}

function getDuplicateJapaneseHint(answerWord, prompt) {
  const normalizedPrompt = normalizeJapaneseMeaning(prompt);
  const hasDuplicate = session.pool.some((word) => {
    if (word === answerWord) return false;
    return word.japanese.some((meaning) => normalizeJapaneseMeaning(meaning) === normalizedPrompt);
  });

  if (!hasDuplicate) return "";
  const firstLetter = answerWord.english.trim().charAt(0).toLowerCase();
  return firstLetter ? `ヒント: ${firstLetter} から始まります` : "";
}

function makeChoices(answerWord, labelForWord, answerLabel) {
  const safeCandidates = shuffle(
    session.pool.filter((word) => word !== answerWord && !hasSharedJapanese(word, answerWord)),
  );
  const fallbackCandidates = shuffle(
    session.pool.filter((word) => word !== answerWord && hasSharedJapanese(word, answerWord)),
  );
  const usedLabels = new Set([answerLabel]);
  const choices = [];

  fillChoicesFromCandidates(choices, safeCandidates, usedLabels, labelForWord);
  if (choices.length < 3) {
    fillChoicesFromCandidates(choices, fallbackCandidates, usedLabels, labelForWord);
  }

  choices.push({ id: createId(), label: answerLabel, isCorrect: true });
  return shuffle(choices);
}

function fillChoicesFromCandidates(choices, candidates, usedLabels, labelForWord) {
  for (const word of candidates) {
    const label = labelForWord(word);
    if (usedLabels.has(label)) continue;
    usedLabels.add(label);
    choices.push({
      id: createId(),
      label,
      isCorrect: false,
    });
    if (choices.length === 3) break;
  }
}

function hasSharedJapanese(wordA, wordB) {
  const meaningsA = new Set(wordA.japanese.map(normalizeJapaneseMeaning));
  return wordB.japanese.some((meaning) => meaningsA.has(normalizeJapaneseMeaning(meaning)));
}

function normalizeJapaneseMeaning(value) {
  return String(value)
    .trim()
    .replace(/[ 　]/g, "")
    .replace(/[。、，,.]/g, "");
}

function getWordPool(words) {
  const selectedGroups = setup.groups.length ? new Set(setup.groups) : new Set(getStudyGroups(words).map((group) => group.id));
  const pool = words.filter((word) => selectedGroups.has(word.lesson));
  return pool.length ? pool : words;
}

function makeQuestionList(pool, count) {
  const shuffled = shuffle(pool);
  if (count === "endless" || count === "all") return shuffled;
  return shuffled.slice(0, count);
}

function getEndlessWord() {
  if (session.index >= session.questions.length) {
    session.questions = shuffle(session.pool);
    session.index = 0;
  }
  return session.questions[session.index];
}

function isLastQuestion() {
  return session.index >= session.questions.length - 1;
}

function getAccuracy() {
  if (!session || session.answered === 0) return 0;
  return Math.round((session.correct / session.answered) * 100);
}

function addWrongWord(word) {
  if (!session.wrongWords.some((item) => item.english === word.english && item.lesson === word.lesson)) {
    session.wrongWords.push(word);
  }
}

function addWrongItem(question, userAnswer) {
  session.wrongItems.push({
    word: question.word,
    prompt: question.prompt,
    answer: question.answer || question.answerLabel,
    userAnswer,
  });
}

function getSelectedDeck() {
  return state.decks.find((deck) => deck.id === selectedDeckId);
}

function getLessons(words) {
  return [...new Set(words.map((word) => word.lesson))].sort((a, b) => String(a).localeCompare(String(b), "ja", { numeric: true }));
}

function getStudyGroups(words) {
  return getLessons(words).map((lesson) => ({
    id: lesson,
    label: isLessonNumber(lesson) ? `Lesson ${lesson}` : lesson,
    type: isLessonNumber(lesson) ? "lesson" : "special",
  }));
}

function getGroupedStudyRanges(groups) {
  const ranges = new Map();

  groups.forEach((group) => {
    const { parent, child } = splitGroupLabel(group.label);
    if (!ranges.has(parent)) ranges.set(parent, []);
    ranges.get(parent).push({
      ...group,
      parentLabel: parent,
      childLabel: child,
    });
  });

  return [...ranges.entries()].map(([parent, children]) => ({
    parent,
    children: sortRangeChildren(children),
  }));
}

function splitGroupLabel(label) {
  const separatorIndex = label.indexOf("-");
  if (separatorIndex === -1) {
    return { parent: "その他", child: label };
  }

  const parent = label.slice(0, separatorIndex).trim();
  const child = normalizePartLabel(label.slice(separatorIndex + 1).trim());
  return {
    parent: parent || "その他",
    child: child || label,
  };
}

function sortRangeChildren(children) {
  return [...children].sort((a, b) => {
    const aIndex = getPartOrderIndex(a.childLabel);
    const bIndex = getPartOrderIndex(b.childLabel);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.childLabel.localeCompare(b.childLabel, "ja", { numeric: true });
  });
}

function getPartOrderIndex(label) {
  const normalized = normalizePartLabel(label);
  const exactIndex = partOrder.indexOf(normalized);
  if (exactIndex !== -1) return exactIndex;
  if (normalized.includes("動詞")) return partOrder.indexOf("動詞");
  if (normalized.includes("名詞")) return partOrder.indexOf("名詞");
  if (normalized.includes("形容詞")) return partOrder.indexOf("形容詞");
  if (normalized.includes("副詞") || normalized.includes("その他")) return partOrder.indexOf("副詞・その他");
  return partOrder.length;
}

function normalizePartLabel(label) {
  const normalized = String(label).trim();
  if (normalized === "副詞" || normalized === "その他") return "副詞・その他";
  return normalized;
}

function getSelectedGroupIds(groups) {
  const availableIds = new Set(groups.map((group) => group.id));
  return setup.groups.filter((id) => availableIds.has(id));
}

function getDeckSummary(words, groups = getStudyGroups(words)) {
  const lessonCount = groups.filter((group) => group.type === "lesson").length;
  const specialCount = groups.length - lessonCount;
  const parts = [`${words.length}語`];
  if (lessonCount > 0) parts.push(`${lessonCount} Lesson`);
  if (specialCount > 0) parts.push(`${specialCount} 別枠`);
  return parts.join("・");
}

function isLessonNumber(value) {
  return /^\d+$/.test(String(value).trim());
}

function formatJapanese(word) {
  return word.japanese.join(" / ");
}

function normalizeEnglish(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"`()[\]{}、。！？・]/g, "")
    .replace(/\s+/g, " ");
}

function shuffle(items) {
  const copied = [...items];
  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[randomIndex]] = [copied[randomIndex], copied[index]];
  }
  return copied;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function handleCsvImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const words = parseWordsCsv(text);
    if (words.length < 4) {
      showToast("4択を作るため、少なくとも4語以上のCSVを取り込んでください。", "error");
      return;
    }
    const deck = {
      id: createId(),
      name: file.name.replace(/\.csv$/i, ""),
      createdAt: new Date().toISOString(),
      words,
    };
    const existingDeck = state.decks.find((item) => item.name === deck.name);
    if (existingDeck) {
      openConfirmDialog({
        title: "同じ名前の単語帳があります",
        message: `${deck.name} を新しいCSVの内容で置き換えますか？`,
        confirmLabel: "置き換える",
        cancelLabel: "追加しない",
        onConfirm: () => replaceDeck(existingDeck.id, deck),
      });
      return;
    }
    addDeck(deck);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    csvInput.value = "";
  }
}

function addDeck(deck) {
  state.decks.unshift(deck);
  saveState();
  renderDecks();
  showToast(`${deck.name} を${deck.words.length}語で取り込みました。`);
}

function replaceDeck(existingDeckId, deck) {
  state.decks = state.decks.map((item) => (item.id === existingDeckId ? { ...deck, id: existingDeckId } : item));
  saveState();
  renderDecks();
  showToast(`${deck.name} を${deck.words.length}語で置き換えました。`);
}

function parseWordsCsv(text) {
  const rows = parseCsv(text.replace(/^\uFEFF/, "")).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) throw new Error("CSVにデータがありません。");

  const headers = rows[0].map((cell) => cell.trim().toLowerCase());
  const lessonIndex = headers.indexOf("lesson");
  const englishIndex = headers.indexOf("english");
  const japaneseIndex = headers.indexOf("japanese");
  if ([lessonIndex, englishIndex, japaneseIndex].some((index) => index === -1)) {
    throw new Error("CSVの1行目に lesson, english, japanese の列名が必要です。");
  }

  return rows.slice(1).map((row, index) => {
    const lesson = row[lessonIndex]?.trim();
    const english = row[englishIndex]?.trim();
    const japanese = row[japaneseIndex]
      ?.split("/")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!lesson || !english || !japanese?.length) {
      throw new Error(`${index + 2}行目に空の項目があります。`);
    }

    return { lesson, english, japanese };
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function addSampleDeck() {
  if (state.decks.some((deck) => deck.name === sampleDeck.name)) {
    showToast("サンプル単語帳はすでに追加されています。");
    return;
  }

  const sample = {
    ...sampleDeck,
    id: createId(),
    createdAt: new Date().toISOString(),
  };
  state.decks.unshift(sample);
  saveState();
  renderDecks();
}

function deleteDeck(id) {
  openConfirmDialog({
    title: "単語帳を削除しますか？",
    message: "この単語帳と保存済みの単語データを削除します。この操作は元に戻せません。",
    confirmLabel: "削除する",
    cancelLabel: "やめる",
    onConfirm: () => {
      state.decks = state.decks.filter((deck) => deck.id !== id);
      saveState();
      renderDecks();
    },
  });
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}
