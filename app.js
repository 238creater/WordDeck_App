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

const timeLimitOptions = [
  { id: "none", label: "なし", value: null },
  { id: "5", label: "5秒", value: 5 },
  { id: "10", label: "10秒", value: 10 },
  { id: "15", label: "15秒", value: 15 },
  { id: "30", label: "30秒", value: 30 },
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
  timeLimit: "none",
  challenge: false,
  bookmarkedOnly: false,
};
let session = null;

const screens = {
  decks: document.querySelector("#deck-screen"),
  setup: document.querySelector("#setup-screen"),
  wordList: document.querySelector("#word-list-screen"),
  study: document.querySelector("#study-screen"),
  result: document.querySelector("#result-screen"),
};

const deckList = document.querySelector("#deck-list");
const csvInput = document.querySelector("#csv-input");
const activeDeckName = document.querySelector("#active-deck-name");
const modeOptions = document.querySelector("#mode-options");
const rangeToolbar = document.querySelector("#range-toolbar");
const lessonOptions = document.querySelector("#range-list");
const rangeSummaryTitle = document.querySelector("#range-summary-title");
const rangeSummaryDetail = document.querySelector("#range-summary-detail");
const openRangeDialogButton = document.querySelector("#open-range-dialog-button");
const openWordListButton = document.querySelector("#open-word-list-button");
const wordListScreen = document.querySelector("#word-list-screen");
const wordListDeckName = document.querySelector("#word-list-deck-name");
const wordSearchInput = document.querySelector("#word-search-input");
const clearWordSearchButton = document.querySelector("#clear-word-search-button");
const closeWordSearchButton = document.querySelector("#close-word-search-button");
const wordSearchFilters = document.querySelector("#word-search-filters");
const wordListContent = document.querySelector("#word-list-content");
const wordSearchResults = document.querySelector("#word-search-results");
const bookmarkCount = document.querySelector("#bookmark-count");
const bookmarkFilterButton = document.querySelector("#bookmark-filter-button");
const bookmarkListToggle = document.querySelector("#bookmark-list-toggle");
const bookmarkList = document.querySelector("#bookmark-list");
const countOptionsEl = document.querySelector("#count-options");
const timeOptionsEl = document.querySelector("#time-options");
const challengeToggle = document.querySelector("#challenge-toggle");
const startButton = document.querySelector("#start-button");
const startNote = document.querySelector("#start-note");
const questionCount = document.querySelector("#question-count");
const accuracy = document.querySelector("#accuracy");
const timeBar = document.querySelector("#time-bar");
const timeBarFill = document.querySelector("#time-bar-fill");
const timeBarText = document.querySelector("#time-bar-text");
const questionText = document.querySelector("#question-text");
const bookmarkCurrentButton = document.querySelector("#bookmark-current-button");
const feedback = document.querySelector("#feedback");
const answerNote = document.querySelector("#answer-note");
const answerArea = document.querySelector("#answer-area");
const nextButton = document.querySelector("#next-button");
const toggleWrongBookmarksButton = document.querySelector("#toggle-wrong-bookmarks-button");
const quitDialog = document.querySelector("#quit-dialog");
const bookmarkDialog = document.querySelector("#bookmark-dialog");
const rangeDialog = document.querySelector("#range-dialog");
const clearBookmarksButton = document.querySelector("#clear-bookmarks-button");
const closeBookmarkDialogButton = document.querySelector("#close-bookmark-dialog-button");
const closeRangeDialogButton = document.querySelector("#close-range-dialog-button");
const quitDialogTitle = document.querySelector("#quit-dialog-title");
const quitDialogMessage = document.querySelector("#quit-dialog-message");
const cancelQuitButton = document.querySelector("#cancel-quit-button");
const confirmQuitButton = document.querySelector("#confirm-quit-button");
const toast = document.querySelector("#toast");
let confirmDialogAction = null;
let toastTimer = null;
let scrollLockCount = 0;
let lockedScrollY = 0;
let wordSearchActive = false;
let wordSearchStageFilters = new Set();
let wordSearchPartFilters = new Set();
let questionTimer = null;
let questionTimerInterval = null;

document.addEventListener("click", handleGlobalClick);
document.addEventListener("keydown", handleKeyboard);
csvInput.addEventListener("change", handleCsvImport);
document.querySelector("#load-sample-button").addEventListener("click", addSampleDeck);
bookmarkFilterButton.addEventListener("click", () => {
  setup.bookmarkedOnly = !setup.bookmarkedOnly;
  renderSetup();
});
bookmarkListToggle.addEventListener("click", () => {
  openBookmarkDialog();
});
openRangeDialogButton.addEventListener("click", () => {
  openRangeDialog();
});
openWordListButton.addEventListener("click", () => {
  renderWordListScreen();
  showScreen("wordList");
});
wordSearchInput.addEventListener("input", renderWordSearchResults);
wordSearchInput.addEventListener("focus", () => {
  wordSearchActive = true;
  renderWordSearchResults();
});
clearWordSearchButton.addEventListener("click", () => {
  wordSearchInput.value = "";
  renderWordSearchResults();
  wordSearchInput.focus({ preventScroll: true });
});
closeWordSearchButton.addEventListener("click", () => {
  closeWordSearch();
});
wordSearchFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-search-filter]");
  if (!button) return;
  const { searchFilter, value } = button.dataset;
  toggleWordSearchFilter(searchFilter, value);
  renderWordSearchFilters();
  renderWordSearchResults();
});
challengeToggle.addEventListener("change", () => {
  setup.challenge = challengeToggle.checked;
  if (setup.challenge && setup.count === "endless") setup.count = "10";
  syncChallengeTheme();
  renderSetup();
});
startButton.addEventListener("click", startStudy);
nextButton.addEventListener("click", nextQuestion);
bookmarkCurrentButton.addEventListener("click", toggleCurrentBookmark);
toggleWrongBookmarksButton.addEventListener("click", toggleWrongBookmarks);
clearBookmarksButton.addEventListener("click", confirmClearBookmarks);
closeBookmarkDialogButton.addEventListener("click", closeBookmarkDialog);
closeRangeDialogButton.addEventListener("click", closeRangeDialog);
cancelQuitButton.addEventListener("click", closeConfirmDialog);
confirmQuitButton.addEventListener("click", runConfirmDialogAction);
quitDialog.addEventListener("click", (event) => {
  if (event.target === quitDialog) closeConfirmDialog();
});
bookmarkDialog.addEventListener("click", (event) => {
  if (event.target === bookmarkDialog) closeBookmarkDialog();
});
rangeDialog.addEventListener("click", (event) => {
  if (event.target === rangeDialog) closeRangeDialog();
});

renderDecks();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { decks: [], bookmarks: {} };

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.decks)) return { decks: [], bookmarks: {} };
    return {
      ...parsed,
      bookmarks: parsed.bookmarks && typeof parsed.bookmarks === "object" ? parsed.bookmarks : {},
    };
  } catch {
    return { decks: [], bookmarks: {} };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  document.body.classList.toggle("study-active", name === "study");
  if (name !== "study") document.body.classList.remove("study-input-active");
  syncChallengeTheme(name);
  if (name === "study") {
    forceScrollToTop();
    scrollToTop();
  } else {
    scrollToTop();
  }
}

function syncChallengeTheme(screenName = getActiveScreenName()) {
  document.body.classList.toggle("challenge-active", getChallengeThemeState(screenName));
}

function getActiveScreenName() {
  return Object.entries(screens).find(([, screen]) => screen.classList.contains("is-active"))?.[0] || "decks";
}

function getChallengeThemeState(screenName) {
  if (screenName === "setup") return setup.challenge;
  if (screenName === "study" || screenName === "result") return Boolean(session?.challenge);
  return false;
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
  if (action === "remove-bookmark") {
    const key = event.target.closest("[data-bookmark-key]")?.dataset.bookmarkKey;
    if (key) removeBookmarkByKey(decodeURIComponent(key));
  }
  if (action === "toggle-result-bookmark") {
    const key = event.target.closest("[data-bookmark-key]")?.dataset.bookmarkKey;
    if (key) toggleResultBookmarkByKey(decodeURIComponent(key));
  }
  if (action === "toggle-list-bookmark") {
    const key = event.target.closest("[data-bookmark-key]")?.dataset.bookmarkKey;
    if (key) toggleWordListBookmarkByKey(decodeURIComponent(key));
  }

  const resultAction = event.target.closest("[data-result-action]")?.dataset.resultAction;
  if (resultAction === "retry-wrong") retryWrongWords();
  if (resultAction === "repeat-same") repeatSameStudy();
}

function handleKeyboard(event) {
  if (!quitDialog.classList.contains("is-hidden")) {
    if (event.key === "Escape") closeConfirmDialog();
    return;
  }
  if (!bookmarkDialog.classList.contains("is-hidden")) {
    if (event.key === "Escape") closeBookmarkDialog();
    return;
  }
  if (!rangeDialog.classList.contains("is-hidden")) {
    if (event.key === "Escape") closeRangeDialog();
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
  lockPageScroll();
  cancelQuitButton.focus();
}

function closeConfirmDialog() {
  confirmDialogAction = null;
  if (!quitDialog.classList.contains("is-hidden")) {
    quitDialog.classList.add("is-hidden");
    unlockPageScroll();
  }
}

function runConfirmDialogAction() {
  const action = confirmDialogAction;
  closeConfirmDialog();
  if (action) action();
}

function openBookmarkDialog() {
  const deck = getSelectedDeck();
  if (deck) renderBookmarkPanel(deck);
  bookmarkDialog.classList.remove("is-hidden");
  lockPageScroll();
  closeBookmarkDialogButton.focus();
}

function closeBookmarkDialog() {
  if (!bookmarkDialog.classList.contains("is-hidden")) {
    bookmarkDialog.classList.add("is-hidden");
    unlockPageScroll();
  }
}

function openRangeDialog() {
  const deck = getSelectedDeck();
  if (deck) renderGroupButtons(deck);
  rangeDialog.classList.remove("is-hidden");
  lockPageScroll();
  closeRangeDialogButton.focus();
}

function closeRangeDialog() {
  if (!rangeDialog.classList.contains("is-hidden")) {
    rangeDialog.classList.add("is-hidden");
    unlockPageScroll();
  }
}

function lockPageScroll() {
  scrollLockCount += 1;
  if (scrollLockCount === 1) {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.top = `-${lockedScrollY}px`;
  }
  document.body.classList.add("dialog-open");
}

function unlockPageScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.classList.remove("dialog-open");
    document.body.style.top = "";
    window.scrollTo(0, lockedScrollY);
    lockedScrollY = 0;
  }
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
  stopQuestionTimer();
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
      session = null;
      setup.groups = getStudyGroups(deck.words).map((group) => group.id);
      setup.challenge = false;
      setup.bookmarkedOnly = false;
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
  renderRangeSummary(deck);
  renderBookmarkPanel(deck);

  const availableCountOptions = setup.challenge
    ? countOptions.filter((option) => option.id !== "endless")
    : countOptions;
  renderOptionButtons(countOptionsEl, availableCountOptions, setup.count, (id) => {
    setup.count = id;
    renderSetup();
  });
  renderOptionButtons(timeOptionsEl, timeLimitOptions, setup.timeLimit, (id) => {
    setup.timeLimit = id;
    renderSetup();
  });

  challengeToggle.checked = setup.challenge;
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
  const selectedWordCount = getRangeWordCount(deck.words, selectedIds);

  rangeToolbar.innerHTML = "";
  rangeToolbar.innerHTML = `
    <div>
      <span>選択中</span>
      <strong>${selectedWordCount}語 / ${selectedIds.length}範囲</strong>
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
    const stageCard = document.createElement("article");
    stageCard.className = "range-stage";

    const stageHead = document.createElement("div");
    stageHead.className = "range-stage-head";
    const rangeSelectedCount = range.children.filter((group) => selectedIds.includes(group.id)).length;
    const rangeAllSelected = rangeSelectedCount === range.children.length;
    const rangePartlySelected = rangeSelectedCount > 0 && !rangeAllSelected;
    stageHead.classList.toggle("is-selected", rangeAllSelected);
    stageHead.classList.toggle("is-partial", rangePartlySelected);
    stageHead.innerHTML = `
      <div>
        <span class="range-title">${escapeHtml(range.parent)}</span>
        <strong class="range-count">${rangeSelectedCount}/${range.children.length}</strong>
      </div>
    `;

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
    stageHead.appendChild(toggleButton);
    stageCard.appendChild(stageHead);

    const childList = document.createElement("div");
    childList.className = "range-stage-options";
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
    stageCard.appendChild(childList);
    lessonOptions.appendChild(stageCard);
  });
}

function renderRangeSummary(deck) {
  const groups = getStudyGroups(deck.words);
  const selectedIds = getSelectedGroupIds(groups);
  const selectedWordCount = getRangeWordCount(deck.words, selectedIds);
  const allSelected = selectedIds.length === groups.length;

  rangeSummaryTitle.textContent = `${selectedWordCount}語 / ${selectedIds.length}範囲`;
  if (selectedIds.length === 0) {
    rangeSummaryDetail.textContent = "出題範囲が未選択です。範囲を変更から選んでください。";
    return;
  }
  if (allSelected) {
    rangeSummaryDetail.textContent = "すべての範囲を出題対象にしています。";
    return;
  }

  const labels = selectedIds.map(formatRangeSummaryLabel);
  const visibleLabels = labels.slice(0, 3).join(" / ");
  const hiddenCount = labels.length - 3;
  rangeSummaryDetail.textContent = hiddenCount > 0 ? `${visibleLabels} ほか${hiddenCount}範囲` : visibleLabels;
}

function getRangeWordCount(words, selectedIds) {
  const selected = new Set(selectedIds);
  return words.filter((word) => selected.has(word.lesson)).length;
}

function formatRangeSummaryLabel(groupId) {
  const { parent, child } = splitGroupLabel(groupId);
  return parent === child ? parent : `${parent} ${child}`;
}

function renderBookmarkPanel(deck) {
  const markedWords = getBookmarkedWords(deck);
  bookmarkCount.textContent = markedWords.length;
  bookmarkFilterButton.classList.toggle("is-selected", setup.bookmarkedOnly);
  bookmarkFilterButton.textContent = setup.bookmarkedOnly ? "しおりのみ出題中" : "しおりのみで出題";
  bookmarkFilterButton.disabled = markedWords.length === 0 && !setup.bookmarkedOnly;
  clearBookmarksButton.disabled = markedWords.length === 0;
  document.querySelector(".bookmark-panel")?.classList.toggle("is-filtered", setup.bookmarkedOnly);

  bookmarkList.innerHTML = "";
  if (markedWords.length === 0) {
    bookmarkList.innerHTML = '<div class="empty-state">学習中にしおりを付けると、ここに単語が残ります。</div>';
    return;
  }

  groupWordsByLesson(markedWords).forEach(({ lesson, words }) => {
    const group = document.createElement("section");
    group.className = "bookmark-group";
    group.innerHTML = `
      <h3>${escapeHtml(lesson)}</h3>
      <div class="bookmark-group-grid"></div>
    `;
    const grid = group.querySelector(".bookmark-group-grid");
    words.forEach((word) => {
      const item = document.createElement("div");
      item.className = "bookmark-item";
      item.innerHTML = `
        <div>
          <strong>${escapeHtml(word.english)}</strong>
          <span>${escapeHtml(formatJapanese(word))}</span>
        </div>
        <button class="secondary-button small" type="button" data-action="remove-bookmark" data-bookmark-key="${encodeURIComponent(getWordKey(word))}">解除</button>
      `;
      grid.appendChild(item);
    });
    bookmarkList.appendChild(group);
  });
}

function renderWordListScreen() {
  const deck = getSelectedDeck();
  if (!deck) return;
  wordListDeckName.textContent = deck.name;
  wordSearchInput.value = "";
  wordSearchActive = false;
  resetWordSearchFilters();
  renderWordListContent(deck);
  renderWordSearchFilters(deck);
  renderWordSearchResults();
}

function renderWordListContent(deck = getSelectedDeck()) {
  if (!deck) return;
  const grouped = getGroupedWordsByRange(deck.words);
  wordListContent.innerHTML = "";

  if (grouped.length === 0) {
    wordListContent.innerHTML = '<div class="empty-state">表示できる単語がありません。</div>';
    return;
  }

  grouped.forEach((stage) => {
    const stageDetails = document.createElement("details");
    stageDetails.className = "word-stage";
    stageDetails.innerHTML = `
      <summary class="word-stage-summary">
        <span>${escapeHtml(stage.parent)}</span>
        <strong>${stage.wordCount}語</strong>
      </summary>
      <div class="word-stage-body"></div>
    `;
    const stageBody = stageDetails.querySelector(".word-stage-body");
    prepareSmoothDetails(stageDetails);

    stage.children.forEach((part) => {
      const partDetails = document.createElement("details");
      partDetails.className = "word-part";
      partDetails.innerHTML = `
        <summary class="word-part-summary">
          <span>${escapeHtml(part.childLabel)}</span>
          <strong>${part.words.length}語</strong>
        </summary>
        <div class="word-card-grid"></div>
      `;
      const grid = partDetails.querySelector(".word-card-grid");
      part.words.forEach((word) => {
        grid.appendChild(createWordCard(word, deck.id));
      });
      prepareSmoothDetails(partDetails);
      stageBody.appendChild(partDetails);
    });

    wordListContent.appendChild(stageDetails);
  });
}

function renderWordSearchResults() {
  const deck = getSelectedDeck();
  if (!deck) return;
  const query = wordSearchInput.value.trim();
  const isSearching = wordSearchActive;
  const hasFilters = hasWordSearchFilters();
  wordListScreen.classList.toggle("is-searching", isSearching);
  wordListScreen.classList.toggle("has-search-query", query.length > 0);
  wordListContent.classList.toggle("is-hidden", isSearching);
  wordSearchResults.classList.toggle("is-hidden", !isSearching);
  wordSearchFilters.classList.toggle("is-hidden", !isSearching);

  if (!isSearching) {
    wordSearchResults.innerHTML = "";
    return;
  }

  if (!query) {
    wordSearchResults.innerHTML = hasFilters
      ? '<div class="empty-state">検索語を入力すると、この条件で絞り込みます。</div>'
      : '<div class="empty-state">英語・日本語で検索できます。Stageや品詞はフィルターで絞り込めます。</div>';
    return;
  }

  const normalizedQuery = normalizeSearchText(query);
  const matchedWords = deck.words.filter((word) => {
    if (!matchesWordSearchFilters(word)) return false;
    if (!normalizedQuery) return true;
    const english = normalizeSearchText(word.english);
    const japanese = normalizeSearchText(formatJapanese(word));
    return english.startsWith(normalizedQuery) || japanese.includes(normalizedQuery);
  });

  wordSearchResults.innerHTML = "";
  const resultHead = document.createElement("div");
  resultHead.className = "word-search-head";
  resultHead.innerHTML = `<strong>${matchedWords.length}件</strong><span>${escapeHtml(getWordSearchLabel(query))}</span>`;
  wordSearchResults.appendChild(resultHead);

  if (matchedWords.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "一致する単語がありません。";
    wordSearchResults.appendChild(empty);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "word-card-grid word-card-grid-search";
  matchedWords
    .slice()
    .sort((a, b) => a.lesson.localeCompare(b.lesson, "ja", { numeric: true }) || a.english.localeCompare(b.english, "en", { numeric: true }))
    .forEach((word) => {
      grid.appendChild(createWordCard(word, deck.id, true));
    });
  wordSearchResults.appendChild(grid);
  triggerAnimation(wordSearchResults, "is-refreshing");
}

function closeWordSearch() {
  wordSearchActive = false;
  wordSearchInput.value = "";
  resetWordSearchFilters();
  wordSearchInput.blur();
  renderWordSearchFilters();
  renderWordSearchResults();
}

function renderWordSearchFilters(deck = getSelectedDeck()) {
  if (!deck) return;
  const stages = getSearchStageOptions(deck.words);
  const parts = getSearchPartOptions(deck.words);
  wordSearchFilters.innerHTML = `
    <section class="word-search-filter-group">
      <h2>Stage</h2>
      <div class="word-search-filter-options">
        ${renderSearchFilterButton("stage", "all", "すべて", wordSearchStageFilters.size === 0)}
        ${stages.map((stage) => renderSearchFilterButton("stage", stage, stage, wordSearchStageFilters.has(stage))).join("")}
      </div>
    </section>
    <section class="word-search-filter-group">
      <h2>品詞</h2>
      <div class="word-search-filter-options">
        ${renderSearchFilterButton("part", "all", "すべて", wordSearchPartFilters.size === 0)}
        ${parts.map((part) => renderSearchFilterButton("part", part, part, wordSearchPartFilters.has(part))).join("")}
      </div>
    </section>
  `;
}

function renderSearchFilterButton(type, value, label, selected) {
  return `<button class="word-search-filter-button${selected ? " is-selected" : ""}" type="button" data-search-filter="${escapeAttribute(type)}" data-value="${escapeAttribute(value)}">${escapeHtml(label)}</button>`;
}

function toggleWordSearchFilter(type, value) {
  const deck = getSelectedDeck();
  if (!deck) return;
  const targetSet = type === "stage" ? wordSearchStageFilters : wordSearchPartFilters;
  const allOptions = type === "stage" ? getSearchStageOptions(deck.words) : getSearchPartOptions(deck.words);

  if (value === "all") {
    targetSet.clear();
    return;
  }

  if (targetSet.has(value)) {
    targetSet.delete(value);
  } else {
    targetSet.add(value);
  }

  if (targetSet.size >= allOptions.length) {
    targetSet.clear();
  }
}

function resetWordSearchFilters() {
  wordSearchStageFilters.clear();
  wordSearchPartFilters.clear();
}

function hasWordSearchFilters() {
  return wordSearchStageFilters.size > 0 || wordSearchPartFilters.size > 0;
}

function matchesWordSearchFilters(word) {
  const { parent, child } = getWordRangeMeta(word);
  return (wordSearchStageFilters.size === 0 || wordSearchStageFilters.has(parent))
    && (wordSearchPartFilters.size === 0 || wordSearchPartFilters.has(child));
}

function getWordSearchLabel(query) {
  const labels = [];
  if (query) labels.push(query);
  labels.push(...getSearchFilterLabelItems("Stage", wordSearchStageFilters));
  labels.push(...getSearchFilterLabelItems("品詞", wordSearchPartFilters));
  return labels.join(" / ") || "すべて";
}

function getSearchFilterLabelItems(prefix, values) {
  if (values.size === 0) return [];
  const labels = [...values];
  if (labels.length <= 2) return [`${prefix}: ${labels.join(", ")}`];
  return [`${prefix}: ${labels.slice(0, 2).join(", ")} ほか${labels.length - 2}`];
}

function getSearchStageOptions(words) {
  return [...new Set(words.map((word) => getWordRangeMeta(word).parent))]
    .sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));
}

function getSearchPartOptions(words) {
  return [...new Set(words.map((word) => getWordRangeMeta(word).child))]
    .sort((a, b) => {
      const aIndex = getPartOrderIndex(a);
      const bIndex = getPartOrderIndex(b);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.localeCompare(b, "ja", { numeric: true });
    });
}

function getWordRangeMeta(word) {
  const group = getStudyGroups([word])[0];
  return splitGroupLabel(group.label);
}

function prepareSmoothDetails(details) {
  const summary = details.querySelector("summary");
  if (!summary) return;
  summary.addEventListener("click", (event) => {
    event.preventDefault();
    toggleSmoothDetails(details);
  });
}

function toggleSmoothDetails(details) {
  if (details.classList.contains("is-animating")) return;
  const content = details.querySelector(":scope > div");
  if (!content) {
    details.open = !details.open;
    return;
  }

  details.classList.add("is-animating");
  if (details.open) {
    closeSmoothDetails(details, content);
    return;
  }

  openSmoothDetails(details, content);
}

function openSmoothDetails(details, content) {
  details.open = true;
  content.style.height = "0px";
  content.style.opacity = "0";
  requestAnimationFrame(() => {
    content.style.height = `${content.scrollHeight}px`;
    content.style.opacity = "1";
    window.setTimeout(() => {
      content.style.height = "";
      content.style.opacity = "";
      details.classList.remove("is-animating");
    }, details.classList.contains("word-stage") ? 360 : 300);
  });
}

function closeSmoothDetails(details, content) {
  const startHeight = content.offsetHeight;
  const isStage = details.classList.contains("word-stage");
  details.classList.add("is-closing");
  content.style.height = `${startHeight}px`;
  content.style.opacity = "1";
  requestAnimationFrame(() => {
    content.style.height = "0px";
    content.style.opacity = "0";
    window.setTimeout(() => {
      const scrollY = window.scrollY;
      details.open = false;
      window.scrollTo(0, scrollY);
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
      content.style.height = "";
      content.style.opacity = "";
      details.classList.remove("is-animating", "is-closing");
      if (isStage) closeNestedWordParts(details);
    }, isStage ? 360 : 300);
  });
}

function closeNestedWordParts(stageDetails) {
  stageDetails.querySelectorAll(".word-part[open]").forEach((part) => {
    part.open = false;
    part.classList.remove("is-animating", "is-closing");
    const grid = part.querySelector(":scope > .word-card-grid");
    if (!grid) return;
    grid.style.height = "";
    grid.style.opacity = "";
  });
}

function createWordCard(word, deckId, showRange = false) {
  const card = document.createElement("article");
  const bookmarked = isBookmarked(word, deckId);
  card.className = "word-list-card";
  const rangeLabel = showRange ? `<span class="word-list-range">${escapeHtml(formatRangeSummaryLabel(word.lesson))}</span>` : "";
  card.innerHTML = `
    <div class="word-list-card-body">
      ${rangeLabel}
      <strong>${escapeHtml(word.english)}</strong>
      <span>${escapeHtml(formatJapanese(word))}</span>
    </div>
    <button class="secondary-button small word-list-bookmark-button${bookmarked ? " is-bookmarked" : ""}" type="button" data-action="toggle-list-bookmark" data-bookmark-key="${encodeURIComponent(getWordKey(word))}">
      ${bookmarked ? "しおり解除" : "しおりに追加"}
    </button>
  `;
  return card;
}

function toggleWordListBookmarkByKey(key) {
  const deck = getSelectedDeck();
  if (!deck) return;
  const word = deck.words.find((item) => getWordKey(item) === key);
  if (!word) return;
  const bookmarks = getBookmarkSet(deck.id);
  const willRemove = bookmarks.has(key);
  if (willRemove) {
    bookmarks.delete(key);
  } else {
    bookmarks.add(key);
  }
  setBookmarkSet(deck.id, bookmarks);
  renderBookmarkPanel(deck);
  updateWordListBookmarkButtons(key, !willRemove);
  showToast(willRemove ? "しおりを外しました。" : "しおりを付けました。");
}

function updateWordListBookmarkButtons(key, isBookmarkedNow) {
  document
    .querySelectorAll('[data-action="toggle-list-bookmark"]')
    .forEach((button) => {
      if (button.dataset.bookmarkKey !== encodeURIComponent(key)) return;
      button.classList.toggle("is-bookmarked", isBookmarkedNow);
      button.textContent = isBookmarkedNow ? "しおり解除" : "しおりに追加";
    });
}

function getGroupedWordsByRange(words) {
  const stages = new Map();
  words.forEach((word) => {
    const group = getStudyGroups([word])[0];
    const { parent, child } = splitGroupLabel(group.label);
    if (!stages.has(parent)) stages.set(parent, new Map());
    const parts = stages.get(parent);
    if (!parts.has(child)) parts.set(child, []);
    parts.get(child).push(word);
  });

  return [...stages.entries()]
    .sort(([stageA], [stageB]) => stageA.localeCompare(stageB, "ja", { numeric: true }))
    .map(([parent, parts]) => {
      const children = [...parts.entries()]
        .map(([childLabel, partWords]) => ({
          childLabel,
          words: [...partWords].sort((a, b) => a.english.localeCompare(b.english, "en", { numeric: true })),
        }))
        .sort((a, b) => {
          const aIndex = getPartOrderIndex(a.childLabel);
          const bIndex = getPartOrderIndex(b.childLabel);
          if (aIndex !== bIndex) return aIndex - bIndex;
          return a.childLabel.localeCompare(b.childLabel, "ja", { numeric: true });
        });

      return {
        parent,
        children,
        wordCount: children.reduce((sum, child) => sum + child.words.length, 0),
      };
    });
}

function normalizeSearchText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "");
}

function groupWordsByLesson(words) {
  const groups = new Map();
  words.forEach((word) => {
    if (!groups.has(word.lesson)) groups.set(word.lesson, []);
    groups.get(word.lesson).push(word);
  });

  return [...groups.entries()]
    .sort(([lessonA], [lessonB]) => lessonA.localeCompare(lessonB, "ja", { numeric: true }))
    .map(([lesson, groupWords]) => ({
      lesson,
      words: [...groupWords].sort((a, b) => a.english.localeCompare(b.english, "en", { numeric: true })),
    }));
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
  const timeLimit = timeLimitOptions.find((option) => option.id === setup.timeLimit)?.value ?? null;
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
    challenge: setup.challenge,
    timeLimit,
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
  const timeLimit = timeLimitOptions.find((option) => option.id === setup.timeLimit)?.value ?? null;
  const timeText = timeLimit ? ` 制限時間は1問${timeLimit}秒です。` : "";

  startButton.disabled = !canStart;
  startButton.classList.toggle("is-disabled", !canStart);

  if (selectedCount === 0) {
    startNote.textContent = setup.bookmarkedOnly
      ? "選択中の範囲にしおり単語がありません。範囲を広げるか、しおりを追加してください。"
      : "出題範囲が未選択です。範囲を変更から選んでください。";
    startNote.className = "start-note is-warning";
  } else if (mode.type === "choice" && selectedCount < 4) {
    startNote.textContent = setup.bookmarkedOnly
      ? `しおり単語のみの4択は4語以上必要です。現在は${selectedCount}語です。`
      : `4択モードは選択範囲に4語以上必要です。現在は${selectedCount}語です。`;
    startNote.className = "start-note is-warning";
  } else if (!choiceReady) {
    startNote.textContent = "4択を作れる候補が足りません。範囲を広げるか、別のモードを選んでください。";
    startNote.className = "start-note is-warning";
  } else if (count === "endless") {
    startNote.textContent = setup.challenge
      ? `${selectedCount}語を一周ずつランダムに出題します。チャレンジモードは間違えたら終了です。${timeText}`
      : `${selectedCount}語を一周ずつランダムに出題します。${timeText}`;
    startNote.className = "start-note";
  } else if (count === "all") {
    startNote.textContent = setup.challenge
      ? `${selectedCount}語をすべてランダムに出題します。チャレンジモードは間違えたら終了です。${timeText}`
      : `${selectedCount}語をすべてランダムに出題します。${timeText}`;
    startNote.className = "start-note";
  } else if (!canStart) {
    startNote.textContent = setup.bookmarkedOnly
      ? `しおり単語は${selectedCount}語です。${count}問にするにはあと${count - selectedCount}語必要です。`
      : `選択範囲は${selectedCount}語です。${count}問にするにはあと${count - selectedCount}語必要です。`;
    startNote.className = "start-note is-warning";
  } else {
    startNote.textContent = setup.challenge
      ? `${setup.bookmarkedOnly ? "しおり単語" : "選択範囲"}${selectedCount}語から重複なしで${count}問出題します。チャレンジモードは間違えたら終了です。${timeText}`
      : `${setup.bookmarkedOnly ? "しおり単語" : "選択範囲"}${selectedCount}語から重複なしで${count}問出題します。${timeText}`;
    startNote.className = "start-note";
  }
}

function canStartStudy(pool, count, mode = getSelectedMode()) {
  if (mode.type === "choice" && pool.length < 4) return false;
  if (mode.type === "choice" && !canBuildChoicesForPool(pool, mode)) return false;
  if (setup.challenge && count === "endless") return false;
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
  stopQuestionTimer({ resetState: true });
  const mode = modes.find((item) => item.id === session.mode);
  const word = session.count === "endless" ? getEndlessWord() : session.questions[session.index];
  session.current = buildQuestion(word, mode);
  session.locked = false;
  document.body.classList.remove("study-input-active");

  feedback.textContent = "";
  feedback.className = "feedback";
  answerNote.textContent = session.current.hint || "";
  nextButton.classList.add("is-hidden");
  setQuestionText(session.current.prompt);
  renderBookmarkButton();
  updateStudyStatus();

  if (mode.type === "input") {
    renderInputAnswer();
  } else {
    renderChoiceAnswer();
  }
  startQuestionTimer();
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
    if (compactLength >= 12) questionText.classList.add("is-long");
    if (compactLength >= 18) questionText.classList.add("is-very-long");
    if (compactLength >= 26) questionText.classList.add("is-extra-long");
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
  const queueSubmit = () => {
    if (submitPending || session.locked) return;
    if (!input.value.trim()) {
      answerNote.textContent = "英語を入力してください。";
      input.focus({ preventScroll: true });
      return;
    }
    submitPending = true;
    holdStudyPosition();
    input.blur();
    clearTextSelection();
    window.setTimeout(() => submitInputAnswer(input.value), 120);
  };

  if (!isTouchDevice()) input.focus({ preventScroll: true });
  input.addEventListener("input", () => {
    if (answerNote.textContent === "英語を入力してください。") {
      answerNote.textContent = session.current.hint || "";
    }
  });
  input.addEventListener("focus", () => {
    document.body.classList.add("study-input-active");
  });
  input.addEventListener("blur", () => {
    document.body.classList.remove("study-input-active");
  });
  submitButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    queueSubmit();
  });
  submitButton.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    queueSubmit();
  });
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
    button.addEventListener("click", () => {
      if (!session.locked) submitChoiceAnswer(choice, button);
    });
    grid.appendChild(button);
  });
}

function startQuestionTimer() {
  stopQuestionTimer({ resetState: true });
  if (!session?.timeLimit) {
    timeBar.classList.add("is-hidden");
    timeBar.setAttribute("aria-hidden", "true");
    return;
  }

  const duration = session.timeLimit * 1000;
  const endAt = Date.now() + duration;
  timeBar.classList.remove("is-hidden", "is-low", "is-critical");
  timeBar.setAttribute("aria-hidden", "false");
  timeBarText.textContent = `${session.timeLimit}s`;
  timeBarFill.style.transition = "none";
  timeBarFill.style.width = "100%";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      timeBarFill.style.transition = `width ${duration}ms linear`;
      timeBarFill.style.width = "0%";
    });
  });

  questionTimerInterval = window.setInterval(() => {
    const remaining = Math.max(0, endAt - Date.now());
    const ratio = remaining / duration;
    timeBarText.textContent = `${Math.ceil(remaining / 1000)}s`;
    timeBar.classList.toggle("is-low", ratio <= 0.45 && ratio > 0.18);
    timeBar.classList.toggle("is-critical", ratio <= 0.18);
  }, 120);

  questionTimer = window.setTimeout(handleTimeUp, duration);
}

function stopQuestionTimer({ freezeProgress = true, resetState = false } = {}) {
  if (freezeProgress && (questionTimer || questionTimerInterval)) {
    const barWidth = timeBar.getBoundingClientRect().width || 1;
    const fillWidth = timeBarFill.getBoundingClientRect().width;
    timeBarFill.style.transition = "none";
    timeBarFill.style.width = `${Math.max(0, Math.min(100, (fillWidth / barWidth) * 100))}%`;
  }
  window.clearTimeout(questionTimer);
  window.clearInterval(questionTimerInterval);
  questionTimer = null;
  questionTimerInterval = null;
  if (resetState) {
    timeBar.classList.remove("is-low", "is-critical");
    timeBarFill.style.transition = "";
  }
}

function handleTimeUp() {
  if (!session || session.locked) return;
  stopQuestionTimer({ freezeProgress: false });
  timeBarText.textContent = "0s";
  timeBar.classList.remove("is-low");
  timeBar.classList.add("is-critical");
  timeBarFill.style.transition = "none";
  timeBarFill.style.width = "0%";
  lockCurrentAnswerAsTimedOut();
  finishAnswer(false, `正解: ${session.current.answerLabel || session.current.answer}`, "時間切れ", { timedOut: true });
}

function lockCurrentAnswerAsTimedOut() {
  const input = document.querySelector("#answer-input");
  const submitButton = document.querySelector("#answer-submit-button");
  if (input) {
    input.blur();
    replaceInputWithAnswer(input, "時間切れ", false);
  }
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "時間切れ";
  }

  answerArea.querySelectorAll(".choice-button").forEach((button) => {
    button.disabled = true;
    const buttonChoice = session.current.choices?.find((item) => item.id === button.dataset.choiceId);
    if (buttonChoice?.isCorrect) {
      button.classList.add("correct");
    } else {
      button.classList.add("dimmed");
    }
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
  submitButton.disabled = true;
  submitButton.textContent = "確認済み";
  finishAnswer(isCorrect, `正解: ${session.current.answer}`, shownAnswer);
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
  stopQuestionTimer();
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
  if (session.challenge && !isCorrect) {
    renderResult();
    showScreen("result");
    return;
  }
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
  renderResultSummary();

  const wrongList = document.querySelector("#wrong-list");
  setRetryButtonsHidden(session.challenge || session.wrongWords.length === 0);
  updateWrongBookmarkBulkButton();
  wrongList.innerHTML = "";
  if (session.wrongWords.length === 0) {
    wrongList.innerHTML = '<p>全問正解です。</p>';
    return;
  }

  const wrongItems = session.wrongItems?.length ? session.wrongItems : session.wrongWords.map((word) => ({
    word,
    prompt: formatJapanese(word),
    answer: word.english,
    userAnswer: "",
  }));

  wrongItems.forEach((wrongItem) => {
    const element = document.createElement("div");
    const wordKey = getWordKey(wrongItem.word);
    const bookmarked = isBookmarked(wrongItem.word, session.deck.id);
    element.className = "wrong-item";
    element.innerHTML = `
      <div>
        <strong>${escapeHtml(wrongItem.prompt)}</strong>
      </div>
      <div class="wrong-detail">
        <dl>
          ${wrongItem.userAnswer ? `<div><dt>回答</dt><dd>${escapeHtml(wrongItem.userAnswer)}</dd></div>` : ""}
          <div><dt>正解</dt><dd>${escapeHtml(wrongItem.answer)}</dd></div>
        </dl>
        <button class="secondary-button small wrong-bookmark-button" type="button" data-action="toggle-result-bookmark" data-bookmark-key="${encodeURIComponent(wordKey)}">${bookmarked ? "しおり解除" : "しおりに追加"}</button>
      </div>
    `;
    wrongList.appendChild(element);
  });
}

function updateWrongBookmarkBulkButton() {
  const wrongWords = getResultWrongWords();
  const isHidden = session.challenge || wrongWords.length === 0;
  toggleWrongBookmarksButton.classList.toggle("is-hidden", isHidden);
  toggleWrongBookmarksButton.disabled = isHidden;
  if (isHidden) return;

  const bookmarks = getBookmarkSet(session.deck.id);
  const allBookmarked = wrongWords.every((word) => bookmarks.has(getWordKey(word)));
  toggleWrongBookmarksButton.textContent = allBookmarked ? "まとめて解除" : "まとめてしおり";
  toggleWrongBookmarksButton.classList.toggle("is-removing", allBookmarked);
}

function getResultWrongWords() {
  if (!session) return [];
  const words = session.wrongItems?.length
    ? session.wrongItems.map((item) => item.word)
    : session.wrongWords;
  const seen = new Set();
  return words.filter((word) => {
    const key = getWordKey(word);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderResultSummary() {
  const summary = document.querySelector(".result-summary");
  summary.classList.toggle("is-challenge-result", Boolean(session.challenge));

  if (session.challenge) {
    const failed = session.answered > session.correct;
    document.querySelector("#result-correct").textContent = failed ? "失敗" : "成功";
    document.querySelector("#result-correct").parentElement.classList.toggle("is-failed", failed);
    document.querySelector("#result-correct").parentElement.classList.toggle("is-cleared", !failed);
    document.querySelector("#result-correct").nextElementSibling.textContent = "";
    document.querySelector("#result-wrong").textContent = `${session.correct}問`;
    document.querySelector("#result-wrong").nextElementSibling.textContent = "連続正解";
    document.querySelector("#result-accuracy").textContent = "";
    return;
  }

  document.querySelector("#result-correct").parentElement.classList.remove("is-failed", "is-cleared");
  document.querySelector("#result-correct").textContent = session.correct;
  document.querySelector("#result-correct").nextElementSibling.textContent = "正解";
  document.querySelector("#result-wrong").textContent = session.answered - session.correct;
  document.querySelector("#result-wrong").nextElementSibling.textContent = "不正解";
  document.querySelector("#result-accuracy").textContent = `${getAccuracy()}%`;
  document.querySelector("#result-accuracy").nextElementSibling.textContent = "正答率";
}

function setRetryButtonsHidden(isHidden) {
  document.querySelectorAll('[data-result-action="retry-wrong"]').forEach((button) => {
    button.classList.toggle("is-placeholder", isHidden);
    button.disabled = isHidden;
    button.setAttribute("aria-hidden", String(isHidden));
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

function repeatSameStudy() {
  startStudy();
}

function toggleResultBookmarkByKey(key) {
  if (!session?.deck) return;
  const word = session.deck.words.find((item) => getWordKey(item) === key);
  if (!word) return;
  const bookmarks = getBookmarkSet(session.deck.id);
  const willRemove = bookmarks.has(key);
  if (willRemove) {
    bookmarks.delete(key);
  } else {
    bookmarks.add(key);
  }
  setBookmarkSet(session.deck.id, bookmarks);
  renderResult();
  showToast(willRemove ? "しおりを外しました。" : "しおりを付けました。");
}

function toggleWrongBookmarks() {
  if (!session?.deck) return;
  const wrongWords = getResultWrongWords();
  if (wrongWords.length === 0) return;

  const bookmarks = getBookmarkSet(session.deck.id);
  const allBookmarked = wrongWords.every((word) => bookmarks.has(getWordKey(word)));
  wrongWords.forEach((word) => {
    const key = getWordKey(word);
    if (allBookmarked) {
      bookmarks.delete(key);
    } else {
      bookmarks.add(key);
    }
  });
  setBookmarkSet(session.deck.id, bookmarks);
  renderResult();
  showToast(allBookmarked ? "間違えた単語のしおりを解除しました。" : "間違えた単語をしおりに追加しました。");
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
  const answerPart = getChoicePartLabel(answerWord);
  const baseCandidates = session.pool.filter((word) => word !== answerWord);
  const samePartSafeCandidates = shuffle(
    baseCandidates.filter((word) => answerPart && getChoicePartLabel(word) === answerPart && !hasSharedJapanese(word, answerWord)),
  );
  const safeCandidates = shuffle(
    baseCandidates.filter((word) => !hasSharedJapanese(word, answerWord)),
  );
  const samePartFallbackCandidates = shuffle(
    baseCandidates.filter((word) => answerPart && getChoicePartLabel(word) === answerPart && hasSharedJapanese(word, answerWord)),
  );
  const fallbackCandidates = shuffle(
    baseCandidates.filter((word) => hasSharedJapanese(word, answerWord)),
  );
  const usedLabels = new Set([answerLabel]);
  const usedWords = new Set([answerWord]);
  const choices = [];

  fillChoicesFromCandidates(choices, samePartSafeCandidates, usedLabels, usedWords, labelForWord);
  fillChoicesFromCandidates(choices, safeCandidates, usedLabels, usedWords, labelForWord);
  if (choices.length < 3) {
    fillChoicesFromCandidates(choices, samePartFallbackCandidates, usedLabels, usedWords, labelForWord);
  }
  if (choices.length < 3) {
    fillChoicesFromCandidates(choices, fallbackCandidates, usedLabels, usedWords, labelForWord);
  }

  choices.push({ id: createId(), label: answerLabel, isCorrect: true });
  return shuffle(choices);
}

function fillChoicesFromCandidates(choices, candidates, usedLabels, usedWords, labelForWord) {
  for (const word of candidates) {
    if (choices.length >= 3) break;
    if (usedWords.has(word)) continue;
    const label = labelForWord(word);
    if (usedLabels.has(label)) continue;
    usedWords.add(word);
    usedLabels.add(label);
    choices.push({
      id: createId(),
      label,
      isCorrect: false,
    });
  }
}

function getChoicePartLabel(word) {
  const { parent, child } = getWordRangeMeta(word);
  return parent === "その他" && child === word.lesson ? "" : child;
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

function getBookmarkSet(deckId = selectedDeckId) {
  if (!deckId) return new Set();
  return new Set(state.bookmarks?.[deckId] || []);
}

function setBookmarkSet(deckId, bookmarkSet) {
  state.bookmarks = {
    ...(state.bookmarks || {}),
    [deckId]: [...bookmarkSet],
  };
  saveState();
}

function getWordKey(word) {
  return [word.lesson, word.english, formatJapanese(word)]
    .map((value) => String(value).trim().toLowerCase())
    .join("::");
}

function isBookmarked(word, deckId = selectedDeckId) {
  return getBookmarkSet(deckId).has(getWordKey(word));
}

function addBookmark(word, deckId = selectedDeckId) {
  if (!deckId || !word) return false;
  const bookmarks = getBookmarkSet(deckId);
  const before = bookmarks.size;
  bookmarks.add(getWordKey(word));
  setBookmarkSet(deckId, bookmarks);
  return bookmarks.size > before;
}

function removeBookmarkByKey(key, deckId = selectedDeckId) {
  if (!deckId) return;
  const bookmarks = getBookmarkSet(deckId);
  bookmarks.delete(key);
  setBookmarkSet(deckId, bookmarks);
  const deck = getSelectedDeck();
  if (deck) {
    renderBookmarkPanel(deck);
    updateStartState(deck);
  }
  if (session?.current) renderBookmarkButton();
}

function confirmClearBookmarks() {
  const deck = getSelectedDeck();
  if (!deck) return;
  const count = getBookmarkedWords(deck).length;
  if (count === 0) return;

  openConfirmDialog({
    title: "しおりをすべて解除しますか？",
    message: `${deck.name} のしおり ${count}語をすべて解除します。この操作は元に戻せません。`,
    confirmLabel: "解除する",
    cancelLabel: "やめる",
    onConfirm: () => clearBookmarks(deck.id),
  });
}

function clearBookmarks(deckId = selectedDeckId) {
  if (!deckId) return;
  setBookmarkSet(deckId, new Set());
  if (setup.bookmarkedOnly) setup.bookmarkedOnly = false;
  const deck = getSelectedDeck();
  if (deck) {
    renderBookmarkPanel(deck);
    updateStartState(deck);
  }
  if (session?.current) renderBookmarkButton();
  showToast("しおりをすべて解除しました。");
}

function toggleCurrentBookmark() {
  if (!session?.current?.word) return;
  const deckId = session.deck.id;
  const word = session.current.word;
  const bookmarks = getBookmarkSet(deckId);
  const key = getWordKey(word);
  const willMark = !bookmarks.has(key);
  if (willMark) {
    bookmarks.add(key);
  } else {
    bookmarks.delete(key);
  }
  setBookmarkSet(deckId, bookmarks);
  renderBookmarkButton();
  triggerAnimation(bookmarkCurrentButton, "is-bouncing");
  showToast(willMark ? "しおりを付けました。" : "しおりを外しました。");
}

function renderBookmarkButton() {
  if (!session?.current?.word) return;
  const marked = isBookmarked(session.current.word, session.deck.id);
  bookmarkCurrentButton.classList.toggle("is-bookmarked", marked);
  bookmarkCurrentButton.innerHTML = "<span></span>しおり";
  bookmarkCurrentButton.removeAttribute("title");
  bookmarkCurrentButton.setAttribute("aria-label", marked ? "しおりを外す" : "しおりを付ける");
}

function triggerAnimation(element, className) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => {
    element.classList.remove(className);
  }, 720);
}

function getBookmarkedWords(deck = getSelectedDeck()) {
  if (!deck) return [];
  const bookmarks = getBookmarkSet(deck.id);
  return deck.words.filter((word) => bookmarks.has(getWordKey(word)));
}

function getWordPool(words) {
  const selectedGroups = new Set(getSelectedGroupIds(getStudyGroups(words)));
  const rangedPool = words.filter((word) => selectedGroups.has(word.lesson));
  if (!setup.bookmarkedOnly) return rangedPool;
  return rangedPool.filter((word) => isBookmarked(word));
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
  showToast("サンプル単語帳を追加しました。");
}

function deleteDeck(id) {
  openConfirmDialog({
    title: "単語帳を削除しますか？",
    message: "この単語帳と保存済みの単語データを削除します。この操作は元に戻せません。",
    confirmLabel: "削除する",
    cancelLabel: "やめる",
    onConfirm: () => {
      state.decks = state.decks.filter((deck) => deck.id !== id);
      if (state.bookmarks) delete state.bookmarks[id];
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

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
