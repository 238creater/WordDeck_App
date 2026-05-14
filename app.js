const STORAGE_KEY = "word-deck-app:v1";

const modes = [
  { id: "choice-en-ja", label: "4択 英語 → 日本語", type: "choice" },
  { id: "choice-ja-en", label: "4択 日本語 → 英語", type: "choice" },
  { id: "input-ja-en", label: "記述 日本語 → 英語", type: "input" },
];
const DEFAULT_MODE_ID = "choice-en-ja";

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

const questionOrderOptions = [
  { id: "random", label: "ランダム" },
  { id: "smart", label: "おまかせ" },
];

const partOrder = ["動詞", "名詞", "形容詞", "副詞・その他"];
const goalOptions = [
  { id: "30", label: "30問", value: 30 },
  { id: "50", label: "50問", value: 50 },
  { id: "100", label: "100問", value: 100 },
  { id: "none", label: "なし", value: 0 },
];

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
  mode: DEFAULT_MODE_ID,
  groups: [],
  count: "10",
  questionOrder: "random",
  timeLimit: "none",
  challenge: false,
  bookmarkedOnly: false,
  reviewSources: {
    bookmarks: false,
    recentMistakes: false,
    smartWeak: false,
  },
};
let session = null;

const screens = {
  decks: document.querySelector("#deck-screen"),
  setup: document.querySelector("#setup-screen"),
  detailSettings: document.querySelector("#detail-settings-screen"),
  learningRecord: document.querySelector("#learning-record-screen"),
  wordList: document.querySelector("#word-list-screen"),
  study: document.querySelector("#study-screen"),
  result: document.querySelector("#result-screen"),
};

const deckList = document.querySelector("#deck-list");
const csvInput = document.querySelector("#csv-input");
const activeDeckName = document.querySelector("#active-deck-name");
const detailDeckName = document.querySelector("#detail-deck-name");
const modeOptions = document.querySelector("#mode-options");
const rangeToolbar = document.querySelector("#range-toolbar");
const lessonOptions = document.querySelector("#range-list");
const rangeSummaryTitle = document.querySelector("#range-summary-title");
const rangeSummaryDetail = document.querySelector("#range-summary-detail");
const openRangeDialogButton = document.querySelector("#open-range-dialog-button");
const openDetailSettingsButton = document.querySelector("#open-detail-settings-button");
const openLearningRecordButton = document.querySelector("#open-learning-record-button");
const openWordListButton = document.querySelector("#open-word-list-button");
const learningRecordDeckName = document.querySelector("#learning-record-deck-name");
const favoritePresetMenuButton = document.querySelector("#favorite-preset-menu-button");
const favoritePresetDialog = document.querySelector("#favorite-preset-dialog");
const favoritePresetMenu = document.querySelector("#favorite-preset-menu");
const closeFavoritePresetDialogButton = document.querySelector("#close-favorite-preset-dialog-button");
const favoritePresetName = document.querySelector("#favorite-preset-name");
const saveFavoritePresetButton = document.querySelector("#save-favorite-preset-button");
const favoritePresetList = document.querySelector("#favorite-preset-list");
const goalOptionsEl = document.querySelector("#goal-options");
const recordGoalPanel = document.querySelector("#record-goal-panel");
const recordGoalLabel = document.querySelector("#record-goal-label");
const recordGoalDetail = document.querySelector("#record-goal-detail");
const recordGoalProgress = document.querySelector("#record-goal-progress");
const recordTodayAnswered = document.querySelector("#record-today-answered");
const recordTodayCorrect = document.querySelector("#record-today-correct");
const recordTodayAccuracy = document.querySelector("#record-today-accuracy");
const recordStreakDays = document.querySelector("#record-streak-days");
const weaknessSummaryList = document.querySelector("#weakness-summary-list");
const resultGoalPanel = document.querySelector("#result-goal-panel");
const resultGoalDetail = document.querySelector("#result-goal-detail");
const resultGoalProgress = document.querySelector("#result-goal-progress");
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
const recentMistakeFilterButton = document.querySelector("#recent-mistake-filter-button");
const smartWeakFilterButton = document.querySelector("#smart-weak-filter-button");
const bookmarkListToggle = document.querySelector("#bookmark-list-toggle");
const bookmarkList = document.querySelector("#bookmark-list");
const bookmarkTabButton = document.querySelector("#bookmark-tab-button");
const recentMistakeTabButton = document.querySelector("#recent-mistake-tab-button");
const countOptionsEl = document.querySelector("#count-options");
const questionOrderOptionsEl = document.querySelector("#question-order-options");
const resetLearningButton = document.querySelector("#reset-learning-button");
const resetRecentMistakesButton = document.querySelector("#reset-recent-mistakes-button");
const detailClearBookmarksButton = document.querySelector("#detail-clear-bookmarks-button");
const timeOptionsEl = document.querySelector("#time-options");
const continuePanel = document.querySelector("#continue-panel");
const continueDetail = document.querySelector("#continue-detail");
const continueStudyButton = document.querySelector("#continue-study-button");
const discardProgressButton = document.querySelector("#discard-progress-button");
const challengeToggle = document.querySelector("#challenge-toggle");
const autoBookmarkWrongToggle = document.querySelector("#auto-bookmark-wrong-toggle");
const autoBookmarkChallengeToggle = document.querySelector("#auto-bookmark-challenge-toggle");
const includeTimeoutRecentToggle = document.querySelector("#include-timeout-recent-toggle");
const startButton = document.querySelector("#start-button");
const startNote = document.querySelector("#start-note");
const startPanel = document.querySelector(".start-panel");
const floatingStartBar = document.querySelector("#floating-start-bar");
const floatingStartButton = document.querySelector("#floating-start-button");
const floatingStartTitle = document.querySelector("#floating-start-title");
const floatingStartDetail = document.querySelector("#floating-start-detail");
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
let startPanelVisible = true;
let floatingStartFrame = null;
let wordSearchTimer = null;
let reviewListTab = "bookmarks";

document.addEventListener("click", handleGlobalClick);
document.addEventListener("keydown", handleKeyboard);
window.addEventListener("scroll", scheduleFloatingStartUpdate, { passive: true });
window.addEventListener("resize", scheduleFloatingStartUpdate);
csvInput.addEventListener("change", handleCsvImport);
document.querySelector("#load-sample-button").addEventListener("click", addSampleDeck);
saveFavoritePresetButton.addEventListener("click", saveFavoritePresetFromCurrentSetup);
favoritePresetMenuButton.addEventListener("click", openFavoritePresetDialog);
favoritePresetList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-preset]");
  if (deleteButton) deleteFavoritePreset(deleteButton.dataset.deletePreset);
});
bookmarkFilterButton.addEventListener("click", () => {
  toggleReviewSource("bookmarks");
  renderSetup();
});
recentMistakeFilterButton.addEventListener("click", () => {
  toggleReviewSource("recentMistakes");
  renderSetup();
});
smartWeakFilterButton.addEventListener("click", () => {
  toggleReviewSource("smartWeak");
  renderSetup();
});
bookmarkListToggle.addEventListener("click", () => {
  openBookmarkDialog();
});
bookmarkTabButton.addEventListener("click", () => {
  reviewListTab = "bookmarks";
  renderReviewList();
});
recentMistakeTabButton.addEventListener("click", () => {
  reviewListTab = "recentMistakes";
  renderReviewList();
});
openRangeDialogButton.addEventListener("click", () => {
  openRangeDialog();
});
openDetailSettingsButton.addEventListener("click", () => {
  renderSetup();
  showScreen("detailSettings");
});
openLearningRecordButton.addEventListener("click", () => {
  renderLearningRecordScreen();
  showScreen("learningRecord");
});
openWordListButton.addEventListener("click", () => {
  renderWordListScreen();
  showScreen("wordList");
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-preset]");
  if (button) applyStudyPreset(button.dataset.preset);
});
wordSearchInput.addEventListener("input", scheduleWordSearchResults);
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
  const scrollState = getWordSearchScrollState();
  toggleWordSearchFilter(searchFilter, value);
  renderWordSearchFilters();
  renderWordSearchResults();
  restoreWordSearchScrollState(scrollState);
});
resetLearningButton.addEventListener("click", confirmResetLearning);
resetRecentMistakesButton.addEventListener("click", confirmResetRecentMistakes);
detailClearBookmarksButton.addEventListener("click", confirmClearBookmarks);
continueStudyButton.addEventListener("click", continueSavedStudy);
discardProgressButton.addEventListener("click", confirmDiscardProgress);
autoBookmarkWrongToggle.addEventListener("change", () => {
  updateAppSetting("autoBookmarkWrong", autoBookmarkWrongToggle.checked);
});
autoBookmarkChallengeToggle.addEventListener("change", () => {
  updateAppSetting("autoBookmarkChallenge", autoBookmarkChallengeToggle.checked);
});
includeTimeoutRecentToggle.addEventListener("change", () => {
  updateAppSetting("includeTimedOutInRecent", includeTimeoutRecentToggle.checked);
  renderSetup();
});
challengeToggle.addEventListener("change", () => {
  setup.challenge = challengeToggle.checked;
  if (setup.challenge && setup.count === "endless") setup.count = "10";
  stabilizeChallengeThemeSwitch();
});
startButton.addEventListener("click", startStudy);
floatingStartButton.addEventListener("click", startStudy);
nextButton.addEventListener("click", nextQuestion);
bookmarkCurrentButton.addEventListener("click", toggleCurrentBookmark);
toggleWrongBookmarksButton.addEventListener("click", toggleWrongBookmarks);
clearBookmarksButton.addEventListener("click", confirmClearBookmarks);
closeBookmarkDialogButton.addEventListener("click", closeBookmarkDialog);
closeRangeDialogButton.addEventListener("click", closeRangeDialog);
closeFavoritePresetDialogButton.addEventListener("click", closeFavoritePresetDialog);
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
favoritePresetDialog.addEventListener("click", (event) => {
  if (event.target === favoritePresetDialog) closeFavoritePresetDialog();
});
window.addEventListener("pagehide", () => {
  if (session && screens.study.classList.contains("is-active")) saveCurrentStudyProgress();
});

renderDecks();
scheduleFloatingStartUpdate();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyState();

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.decks)) return createEmptyState();
    return {
      ...parsed,
      bookmarks: parsed.bookmarks && typeof parsed.bookmarks === "object" ? parsed.bookmarks : {},
      learning: parsed.learning && typeof parsed.learning === "object" ? parsed.learning : {},
      progress: parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
      stats: parsed.stats && typeof parsed.stats === "object" ? parsed.stats : {},
      presets: parsed.presets && typeof parsed.presets === "object" ? parsed.presets : {},
      settings: {
        ...createDefaultAppSettings(),
        ...(parsed.settings && typeof parsed.settings === "object" ? parsed.settings : {}),
      },
    };
  } catch {
    return createEmptyState();
  }
}

function createEmptyState() {
  return { decks: [], bookmarks: {}, learning: {}, progress: {}, stats: {}, presets: {}, settings: createDefaultAppSettings() };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createDefaultAppSettings() {
  return {
    autoBookmarkWrong: false,
    autoBookmarkChallenge: false,
    includeTimedOutInRecent: true,
    dailyGoal: 50,
  };
}

function getAppSettings() {
  state.settings = {
    ...createDefaultAppSettings(),
    ...(state.settings || {}),
  };
  return state.settings;
}

function updateAppSetting(key, value) {
  state.settings = {
    ...getAppSettings(),
    [key]: value,
  };
  saveState();
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  document.body.classList.toggle("study-active", name === "study");
  if (name !== "study") document.body.classList.remove("study-input-active");
  syncChallengeTheme(name);
  updateFloatingStartVisibility();
  if (name === "study") {
    forceScrollToTop();
    scrollToTop();
  } else {
    scrollToTop();
  }
}

function scheduleFloatingStartUpdate() {
  if (floatingStartFrame) return;
  floatingStartFrame = requestAnimationFrame(() => {
    floatingStartFrame = null;
    updateFloatingStartVisibility();
  });
}

function measureStartPanelVisibility() {
  if (!startButton) return;
  const rect = startButton.getBoundingClientRect();
  const lowerSafeLine = window.innerHeight - 92;
  startPanelVisible = rect.bottom > 16 && rect.top < lowerSafeLine;
}

function updateFloatingStartVisibility() {
  if (!floatingStartBar) return;
  if (screens.setup.classList.contains("is-active")) {
    measureStartPanelVisibility();
  }
  const shouldShow = screens.setup.classList.contains("is-active")
    && window.matchMedia("(max-width: 720px)").matches
    && !startPanelVisible;
  floatingStartBar.classList.toggle("is-visible", shouldShow);
  floatingStartBar.setAttribute("aria-hidden", String(!shouldShow));
  screens.setup.classList.toggle("has-floating-start", shouldShow);
}

function syncChallengeTheme(screenName = getActiveScreenName()) {
  document.body.classList.toggle("challenge-active", getChallengeThemeState(screenName));
}

function stabilizeChallengeThemeSwitch() {
  syncChallengeTheme();
  renderCountOptions();
  updateStartState(getSelectedDeck());
  requestAnimationFrame(() => {
    updateFloatingStartVisibility();
  });
}

function getActiveScreenName() {
  return Object.entries(screens).find(([, screen]) => screen.classList.contains("is-active"))?.[0] || "decks";
}

function getChallengeThemeState(screenName) {
  if (screenName === "setup" || screenName === "detailSettings") return setup.challenge;
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
    requestAnimationFrame(() => {
      forceScrollToTop();
      updateFloatingStartVisibility();
    });
    window.setTimeout(() => {
      forceScrollToTop();
      updateFloatingStartVisibility();
    }, 120);
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
  if (!favoritePresetDialog.classList.contains("is-hidden")) {
    if (event.key === "Escape") closeFavoritePresetDialog();
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
  renderReviewList();
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

function openFavoritePresetDialog() {
  const deck = getSelectedDeck();
  if (deck) renderFavoritePresetControls(deck);
  favoritePresetDialog.classList.remove("is-hidden");
  lockPageScroll();
  closeFavoritePresetDialogButton.focus();
}

function closeFavoritePresetDialog() {
  if (!favoritePresetDialog.classList.contains("is-hidden")) {
    favoritePresetDialog.classList.add("is-hidden");
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
    requestAnimationFrame(updateFloatingStartVisibility);
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
  saveCurrentStudyProgress();
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
      setup.mode = DEFAULT_MODE_ID;
      setup.groups = getStudyGroups(deck.words).map((group) => group.id);
      setup.questionOrder = "random";
      setup.challenge = false;
      setup.bookmarkedOnly = false;
      setup.reviewSources = createEmptyReviewSources();
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
  if (!questionOrderOptions.some((option) => option.id === setup.questionOrder)) setup.questionOrder = "random";
  normalizeReviewSources();

  activeDeckName.textContent = deck.name;
  if (detailDeckName) detailDeckName.textContent = deck.name;
  if (learningRecordDeckName) learningRecordDeckName.textContent = deck.name;
  refreshSetupControls(deck);
  challengeToggle.checked = setup.challenge;
  renderAppSettingControls();
  renderFavoritePresetControls(deck);
}

function applyStudyPreset(presetId) {
  const deck = getSelectedDeck();
  if (!deck) return;
  normalizeReviewSources();

  if (presetId?.startsWith("favorite:")) {
    const favorite = getFavoritePresets(deck.id).find((item) => item.id === presetId.slice("favorite:".length));
    if (!favorite) return;
    applySetupSnapshot(favorite.setup, deck);
    closeFavoritePresetDialog();
    renderSetup();
    syncChallengeTheme();
    showToast(`${favorite.name} を適用しました。`);
    return;
  }

  if (presetId === "standard") {
    setup.reviewSources = createEmptyReviewSources();
    setup.questionOrder = "random";
    setup.timeLimit = "none";
    setup.challenge = false;
  }
  if (presetId === "speed") {
    setup.reviewSources = createEmptyReviewSources();
    setup.questionOrder = "random";
    setup.timeLimit = setup.timeLimit === "none" ? "10" : setup.timeLimit;
    setup.challenge = false;
    if (setup.count === "endless") setup.count = "30";
  }
  if (presetId === "review") {
    setup.reviewSources = {
      bookmarks: false,
      recentMistakes: true,
      smartWeak: true,
    };
    setup.questionOrder = "random";
    setup.challenge = false;
    if (setup.count === "endless") setup.count = "30";
  }
  renderSetup();
  syncChallengeTheme();
  showToast(getPresetToast(presetId));
}

function getPresetToast(presetId) {
  const labels = {
    standard: "通常練習に切り替えました。",
    speed: "速答練習に切り替えました。",
    review: "苦手復習に切り替えました。",
  };
  return labels[presetId] || "プリセットを適用しました。";
}

function getSetupSnapshot() {
  return {
    mode: setup.mode,
    groups: [...setup.groups],
    count: setup.count,
    questionOrder: setup.questionOrder,
    timeLimit: setup.timeLimit,
    challenge: setup.challenge,
    reviewSources: { ...setup.reviewSources },
  };
}

function applySetupSnapshot(snapshot, deck = getSelectedDeck()) {
  if (!snapshot || !deck) return;
  const availableGroupIds = new Set(getStudyGroups(deck.words).map((group) => group.id));
  const countIds = new Set(countOptions.map((option) => option.id));
  const timeIds = new Set(timeLimitOptions.map((option) => option.id));
  const modeIds = new Set(modes.map((mode) => mode.id));
  const orderIds = new Set(questionOrderOptions.map((option) => option.id));

  setup.mode = modeIds.has(snapshot.mode) ? snapshot.mode : DEFAULT_MODE_ID;
  setup.groups = Array.isArray(snapshot.groups)
    ? snapshot.groups.filter((id) => availableGroupIds.has(id))
    : setup.groups;
  setup.count = countIds.has(snapshot.count) ? snapshot.count : "10";
  setup.questionOrder = orderIds.has(snapshot.questionOrder) ? snapshot.questionOrder : "random";
  setup.timeLimit = timeIds.has(snapshot.timeLimit) ? snapshot.timeLimit : "none";
  setup.challenge = Boolean(snapshot.challenge);
  setup.reviewSources = {
    ...createEmptyReviewSources(),
    ...(snapshot.reviewSources || {}),
  };
  if (setup.challenge && setup.count === "endless") setup.count = "10";
}

function refreshSetupControls(deck = getSelectedDeck()) {
  if (!deck) return;
  normalizeReviewSources();

  renderOptionButtons(modeOptions, modes, setup.mode, (id) => {
    setup.mode = id;
    renderSetup();
  });

  renderGroupButtons(deck);
  renderRangeSummary(deck);
  renderBookmarkPanel(deck);

  renderCountOptions();
  const reviewActive = hasReviewSourceSelected();
  if (reviewActive) setup.questionOrder = "random";
  renderOptionButtons(questionOrderOptionsEl, questionOrderOptions, setup.questionOrder, (id) => {
    setup.questionOrder = id;
    renderSetup();
  }, { disabled: reviewActive });
  renderLearningResetState(deck);
  renderOptionButtons(timeOptionsEl, timeLimitOptions, setup.timeLimit, (id) => {
    setup.timeLimit = id;
    renderSetup();
  });
  renderContinuePanel(deck);
  renderDataManagementState(deck);

  updateStartState(deck);
}

function renderCountOptions() {
  const availableCountOptions = setup.challenge
    ? countOptions.filter((option) => option.id !== "endless")
    : countOptions;
  renderOptionButtons(countOptionsEl, availableCountOptions, setup.count, (id) => {
    setup.count = id;
    renderSetup();
  });
}

function renderOptionButtons(container, options, selectedId, onSelect, config = {}) {
  container.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = `mode-button${option.id === selectedId ? " is-selected" : ""}`;
    button.type = "button";
    button.disabled = Boolean(config.disabled);
    button.textContent = option.label;
    button.addEventListener("click", () => onSelect(option.id));
    container.appendChild(button);
  });
}

function renderLearningResetState(deck) {
  const hasLearning = Object.keys(state.learning?.[deck.id] || {}).length > 0;
  resetLearningButton.disabled = !hasLearning;
  resetLearningButton.textContent = hasLearning ? "おまかせをリセット" : "おまかせデータなし";
}

function renderDataManagementState(deck) {
  const recentCount = getRecentMistakeWords(deck, { ignoreRange: true }).length;
  const bookmarkCountAll = getBookmarkedWords(deck).length;
  resetRecentMistakesButton.disabled = recentCount === 0;
  resetRecentMistakesButton.textContent = recentCount > 0 ? `最近ミスをリセット (${recentCount})` : "最近ミスなし";
  detailClearBookmarksButton.disabled = bookmarkCountAll === 0;
  detailClearBookmarksButton.textContent = bookmarkCountAll > 0 ? `しおりを一括解除 (${bookmarkCountAll})` : "しおりなし";
}

function renderAppSettingControls() {
  const settings = getAppSettings();
  autoBookmarkWrongToggle.checked = settings.autoBookmarkWrong;
  autoBookmarkChallengeToggle.checked = settings.autoBookmarkChallenge;
  includeTimeoutRecentToggle.checked = settings.includeTimedOutInRecent;
  renderGoalOptions();
}

function renderFavoritePresetControls(deck = getSelectedDeck()) {
  if (!deck) return;
  const presets = getFavoritePresets(deck.id);
  favoritePresetMenu.innerHTML = "";
  favoritePresetMenuButton.disabled = presets.length === 0;
  favoritePresetMenuButton.textContent = presets.length > 0 ? `お気に入り ${presets.length}` : "お気に入り";
  if (presets.length === 0) {
    favoritePresetMenu.innerHTML = '<p>保存済みなし</p>';
  } else {
    presets.forEach((preset) => {
      const button = document.createElement("button");
      button.className = "favorite-preset-card";
      button.type = "button";
      button.dataset.preset = `favorite:${preset.id}`;
      button.innerHTML = `
        <strong>${escapeHtml(preset.name)}</strong>
        <span>${escapeHtml(formatPresetSummary(preset.setup))}</span>
      `;
      favoritePresetMenu.appendChild(button);
    });
  }

  favoritePresetList.innerHTML = "";
  if (presets.length === 0) {
    favoritePresetList.innerHTML = '<p class="empty-state compact">保存済みのお気に入りはありません。</p>';
    return;
  }

  presets.forEach((preset) => {
    const item = document.createElement("div");
    item.className = "favorite-preset-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(preset.name)}</strong>
        <span>${escapeHtml(formatPresetSummary(preset.setup))}</span>
      </div>
      <button class="secondary-button small" type="button" data-delete-preset="${escapeAttribute(preset.id)}">削除</button>
    `;
    favoritePresetList.appendChild(item);
  });
}

function saveFavoritePresetFromCurrentSetup() {
  const deck = getSelectedDeck();
  if (!deck) return;
  const name = favoritePresetName.value.trim() || `お気に入り${getFavoritePresets(deck.id).length + 1}`;
  const preset = {
    id: createId(),
    name: name.slice(0, 18),
    setup: getSetupSnapshot(),
    createdAt: new Date().toISOString(),
  };
  const presets = [preset, ...getFavoritePresets(deck.id)].slice(0, 8);
  setFavoritePresets(deck.id, presets);
  favoritePresetName.value = "";
  renderSetup();
  showToast(`${preset.name} を保存しました。`);
}

function deleteFavoritePreset(presetId) {
  const deck = getSelectedDeck();
  if (!deck || !presetId) return;
  setFavoritePresets(deck.id, getFavoritePresets(deck.id).filter((preset) => preset.id !== presetId));
  renderSetup();
  showToast("お気に入りプリセットを削除しました。");
}

function getFavoritePresets(deckId = selectedDeckId) {
  if (!deckId) return [];
  const presets = state.presets?.[deckId];
  return Array.isArray(presets) ? presets : [];
}

function setFavoritePresets(deckId, presets) {
  state.presets = {
    ...(state.presets || {}),
    [deckId]: presets,
  };
  saveState();
}

function formatPresetSummary(snapshot) {
  const mode = modes.find((item) => item.id === snapshot.mode)?.label || "モード";
  const count = countOptions.find((item) => item.id === snapshot.count)?.label || "出題数";
  const time = timeLimitOptions.find((item) => item.id === snapshot.timeLimit)?.label || "なし";
  const source = Object.values(snapshot.reviewSources || {}).some(Boolean) ? "復習セット" : "選択範囲";
  return `${mode} / ${count} / ${time} / ${source}`;
}

function renderContinuePanel(deck) {
  const progress = getSavedProgress(deck.id);
  if (!progress) {
    continuePanel.classList.add("is-hidden");
    return;
  }

  const answered = Number(progress.answered || 0);
  const total = Array.isArray(progress.questions) ? progress.questions.length : 0;
  const modeLabel = modes.find((mode) => mode.id === progress.mode)?.label || "前回のモード";
  const countLabel = progress.count === "all" ? "全部" : `${total}問`;
  continueDetail.textContent = `${modeLabel} / ${countLabel} / ${answered}問回答済み`;
  continuePanel.classList.remove("is-hidden");
}

function createEmptyReviewSources() {
  return {
    bookmarks: false,
    recentMistakes: false,
    smartWeak: false,
  };
}

function normalizeReviewSources() {
  setup.reviewSources = {
    ...createEmptyReviewSources(),
    ...(setup.reviewSources || {}),
  };
  if (setup.bookmarkedOnly) {
    setup.reviewSources.bookmarks = true;
    setup.bookmarkedOnly = false;
  }
}

function toggleReviewSource(source) {
  normalizeReviewSources();
  setup.reviewSources[source] = !setup.reviewSources[source];
}

function hasReviewSourceSelected() {
  normalizeReviewSources();
  return Object.values(setup.reviewSources).some(Boolean);
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
  const reviewContext = getReviewContext(deck);
  const counts = getReviewCounts(deck, reviewContext);
  const selectedCount = getReviewWords(deck, reviewContext).length;
  bookmarkCount.textContent = selectedCount;

  bookmarkFilterButton.classList.toggle("is-selected", setup.reviewSources.bookmarks);
  recentMistakeFilterButton.classList.toggle("is-selected", setup.reviewSources.recentMistakes);
  smartWeakFilterButton.classList.toggle("is-selected", setup.reviewSources.smartWeak);

  bookmarkFilterButton.textContent = `しおり ${counts.bookmarks}`;
  recentMistakeFilterButton.textContent = `最近ミス ${counts.recentMistakes}`;
  smartWeakFilterButton.textContent = `苦手のみ ${counts.smartWeak}`;

  bookmarkFilterButton.disabled = counts.bookmarks === 0 && !setup.reviewSources.bookmarks;
  recentMistakeFilterButton.disabled = counts.recentMistakes === 0 && !setup.reviewSources.recentMistakes;
  smartWeakFilterButton.disabled = counts.smartWeak === 0 && !setup.reviewSources.smartWeak;

  clearBookmarksButton.disabled = getBookmarkedWords(deck).length === 0;
  document.querySelector(".bookmark-panel")?.classList.toggle("is-filtered", hasReviewSourceSelected());
  if (!bookmarkDialog.classList.contains("is-hidden")) renderReviewList();
}

function renderReviewList() {
  const deck = getSelectedDeck();
  if (!deck) return;
  const reviewContext = getReviewContext(deck);
  const words = reviewListTab === "recentMistakes"
    ? getRecentMistakeWords(deck, { rangeSet: reviewContext.rangeSet })
    : getBookmarkedWords(deck).filter((word) => reviewContext.rangeSet.has(word.lesson));

  bookmarkTabButton.classList.toggle("is-selected", reviewListTab === "bookmarks");
  recentMistakeTabButton.classList.toggle("is-selected", reviewListTab === "recentMistakes");
  clearBookmarksButton.classList.toggle("is-hidden", reviewListTab !== "bookmarks");

  bookmarkList.innerHTML = "";
  if (words.length === 0) {
    bookmarkList.innerHTML = reviewListTab === "recentMistakes"
      ? '<div class="empty-state">選択中の範囲に最近間違えた単語はありません。</div>'
      : '<div class="empty-state">選択中の範囲にしおり単語はありません。</div>';
    return;
  }

  groupWordsByLesson(words).forEach(({ lesson, words: groupWords }) => {
    const group = document.createElement("section");
    group.className = "bookmark-group";
    group.innerHTML = `
      <h3>${escapeHtml(lesson)}</h3>
      <div class="bookmark-group-grid"></div>
    `;
    const grid = group.querySelector(".bookmark-group-grid");
    groupWords.forEach((word) => {
      const removeButton = reviewListTab === "bookmarks"
        ? `<button class="secondary-button small" type="button" data-action="remove-bookmark" data-bookmark-key="${encodeURIComponent(getWordKey(word))}">解除</button>`
        : "";
      const item = document.createElement("div");
      item.className = "bookmark-item";
      item.innerHTML = `
        <div>
          <strong>${escapeHtml(word.english)}</strong>
          <span>${escapeHtml(formatJapanese(word))}</span>
        </div>
        ${removeButton}
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
    const stageDetails = document.createElement("article");
    stageDetails.className = "word-stage";
    stageDetails.innerHTML = `
      <button class="word-stage-summary" type="button" aria-expanded="false">
        <span>${escapeHtml(stage.parent)}</span>
        <strong>${stage.wordCount}語</strong>
      </button>
      <div class="word-stage-body" hidden></div>
    `;
    const stageBody = stageDetails.querySelector(".word-stage-body");
    prepareSmoothDetails(stageDetails);

    stage.children.forEach((part) => {
      const partDetails = document.createElement("article");
      partDetails.className = "word-part";
      partDetails.innerHTML = `
        <button class="word-part-summary" type="button" aria-expanded="false">
          <span>${escapeHtml(part.childLabel)}</span>
          <strong>${part.words.length}語</strong>
        </button>
        <div class="word-card-grid" hidden></div>
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
      : '<div class="empty-state">英語・日本語で検索できます。大分類や小分類はフィルターで絞り込めます。</div>';
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
    triggerAnimation(wordSearchResults, "is-refreshing", 220);
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
  if (matchedWords.length <= 60) {
    triggerAnimation(wordSearchResults, "is-refreshing", 220);
  }
}

function scheduleWordSearchResults() {
  window.clearTimeout(wordSearchTimer);
  wordSearchTimer = window.setTimeout(renderWordSearchResults, 70);
}

function closeWordSearch() {
  window.clearTimeout(wordSearchTimer);
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
      <h2>大分類</h2>
      <div class="word-search-filter-options">
        ${renderSearchFilterButton("stage", "all", "すべて", wordSearchStageFilters.size === 0)}
        ${stages.map((stage) => renderSearchFilterButton("stage", stage, stage, wordSearchStageFilters.has(stage))).join("")}
      </div>
    </section>
    <section class="word-search-filter-group">
      <h2>小分類</h2>
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

function getWordSearchScrollState() {
  return {
    pageY: window.scrollY || document.documentElement.scrollTop || 0,
    filterX: [...wordSearchFilters.querySelectorAll(".word-search-filter-options")].map((element) => element.scrollLeft),
  };
}

function restoreWordSearchScrollState(state) {
  if (!state) return;
  const restore = () => {
    wordSearchFilters.querySelectorAll(".word-search-filter-options").forEach((element, index) => {
      element.scrollLeft = state.filterX[index] || 0;
    });
    window.scrollTo(0, state.pageY);
  };
  restore();
  requestAnimationFrame(restore);
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
  labels.push(...getSearchFilterLabelItems("大分類", wordSearchStageFilters));
  labels.push(...getSearchFilterLabelItems("小分類", wordSearchPartFilters));
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
  const summary = details.querySelector(":scope > .word-stage-summary, :scope > .word-part-summary");
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
    details.classList.toggle("is-open");
    return;
  }

  details.classList.add("is-animating");
  const isStage = details.classList.contains("word-stage");
  const isOpen = details.classList.contains("is-open");
  if (isOpen && isStage) {
    closeStageDetails(details, content);
    return;
  }
  if (isOpen) {
    closePartDetails(details, content);
    return;
  }

  openAccordionDetails(details, content);
}

function openAccordionDetails(details, content) {
  const summary = details.querySelector(":scope > .word-stage-summary, :scope > .word-part-summary");
  details.classList.add("is-open");
  summary?.setAttribute("aria-expanded", "true");
  content.hidden = false;
  content.style.height = "0px";
  content.style.opacity = "0";
  const duration = getDetailsAnimationDuration(details);
  requestAnimationFrame(() => {
    content.style.height = `${content.scrollHeight}px`;
    content.style.opacity = "1";
    window.setTimeout(() => {
      content.style.height = "";
      content.style.opacity = "";
      details.classList.remove("is-animating");
    }, duration);
  });
}

function closePartDetails(details, content) {
  const summary = details.querySelector(":scope > .word-stage-summary, :scope > .word-part-summary");
  const startHeight = content.offsetHeight;
  details.classList.add("is-closing");
  content.style.height = `${startHeight}px`;
  content.style.opacity = "1";
  const finish = onceTransitionDone(content, () => {
    details.classList.remove("is-open");
    summary?.setAttribute("aria-expanded", "false");
    content.hidden = true;
    content.style.height = "";
    content.style.opacity = "";
    details.classList.remove("is-animating", "is-closing");
  }, getDetailsAnimationDuration(details) + 80);
  requestAnimationFrame(() => {
    content.style.height = "0px";
    content.style.opacity = "0";
    finish.arm();
  });
}

function closeStageDetails(details, content) {
  const summary = details.querySelector(":scope > .word-stage-summary");
  if (!hasOpenNestedParts(details)) {
    closeCompactStageDetails(details, content, summary);
    return;
  }

  const startHeight = content.offsetHeight;
  details.classList.add("is-closing", "is-stage-closing");
  content.style.height = `${startHeight}px`;
  content.style.opacity = "1";

  const fadeDone = onceTransitionDone(content, () => {
    details.classList.remove("is-stage-fading");
    closeNestedWordParts(details);
    content.style.height = `${startHeight}px`;
    void content.offsetHeight;
    const heightDone = onceTransitionDone(content, () => {
      details.classList.remove("is-open");
      summary?.setAttribute("aria-expanded", "false");
      content.hidden = true;
      content.style.height = "";
      content.style.opacity = "";
      details.classList.remove("is-animating", "is-closing", "is-stage-closing", "is-stage-fading");
    }, 260, ["height"]);
    requestAnimationFrame(() => {
      content.style.height = "0px";
      heightDone.arm();
    });
  }, 150, ["opacity"]);

  requestAnimationFrame(() => {
    details.classList.add("is-stage-fading");
    content.style.opacity = "0";
    fadeDone.arm();
  });
}

function closeCompactStageDetails(details, content, summary) {
  const startHeight = content.offsetHeight;
  details.classList.add("is-closing", "is-stage-compact-closing");
  details.classList.remove("is-open");
  summary?.setAttribute("aria-expanded", "false");
  content.style.height = `${startHeight}px`;
  content.style.opacity = "1";

  const finish = onceTransitionDone(content, () => {
    content.hidden = true;
    content.style.height = "";
    content.style.opacity = "";
    details.classList.remove("is-animating", "is-closing", "is-stage-compact-closing");
  }, 170, ["height"]);

  requestAnimationFrame(() => {
    content.style.height = "0px";
    content.style.opacity = "0";
    finish.arm();
  });
}

function hasOpenNestedParts(stageDetails) {
  return Boolean(stageDetails.querySelector(".word-part.is-open"));
}

function onceTransitionDone(element, callback, fallbackDelay, propertyNames = ["height"]) {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    element.removeEventListener("transitionend", onEnd);
    window.clearTimeout(timer);
    callback();
  };
  const onEnd = (event) => {
    if (event.target !== element) return;
    if (propertyNames.includes(event.propertyName)) finish();
  };
  let timer = null;
  element.addEventListener("transitionend", onEnd);
  return {
    arm() {
      timer = window.setTimeout(finish, fallbackDelay);
    },
  };
}

function getDetailsAnimationDuration(details) {
  return details.classList.contains("word-stage") ? 260 : 220;
}

function closeNestedWordParts(stageDetails) {
  stageDetails.querySelectorAll(".word-part").forEach((part) => {
    part.classList.remove("is-open");
    part.classList.remove("is-animating", "is-closing");
    part.querySelector(":scope > .word-part-summary")?.setAttribute("aria-expanded", "false");
    const grid = part.querySelector(":scope > .word-card-grid");
    if (!grid) return;
    grid.hidden = true;
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
  const questionOrder = setup.questionOrder || "random";
  const questions = makeQuestionList(pool, count, deck.id, questionOrder);
  deleteSavedProgress(deck.id);

  session = {
    deck,
    pool,
    mode: setup.mode,
    count,
    questionOrder,
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
  const orderText = setup.questionOrder === "smart" ? "おまかせ出題で" : "ランダムに";
  const sourceText = getActiveSourceLabel();

  startButton.disabled = !canStart;
  startButton.classList.toggle("is-disabled", !canStart);
  floatingStartButton.disabled = !canStart;
  floatingStartButton.classList.toggle("is-disabled", !canStart);
  floatingStartTitle.textContent = canStart ? "この設定で開始" : "開始できません";
  floatingStartTitle.classList.toggle("is-warning", !canStart);
  floatingStartDetail.textContent = getFloatingStartDetail(selectedCount, count);

  if (selectedCount === 0) {
    startNote.textContent = hasReviewSourceSelected()
      ? "選択中の範囲に復習セットの単語がありません。範囲を広げるか、復習セットを切り替えてください。"
      : "出題範囲が未選択です。範囲を変更から選んでください。";
    startNote.className = "start-note is-warning";
  } else if (mode.type === "choice" && selectedCount < 4) {
    startNote.textContent = hasReviewSourceSelected()
      ? `復習セットの4択は4語以上必要です。現在は${selectedCount}語です。`
      : `4択モードは選択範囲に4語以上必要です。現在は${selectedCount}語です。`;
    startNote.className = "start-note is-warning";
  } else if (!choiceReady) {
    startNote.textContent = "4択を作れる候補が足りません。範囲を広げるか、別のモードを選んでください。";
    startNote.className = "start-note is-warning";
  } else if (count === "endless") {
    startNote.textContent = setup.challenge
      ? `${selectedCount}語を一周ずつ${orderText}出題します。チャレンジモードは間違えたら終了です。${timeText}`
      : `${selectedCount}語を一周ずつ${orderText}出題します。${timeText}`;
    startNote.className = "start-note";
  } else if (count === "all") {
    startNote.textContent = setup.challenge
      ? `${selectedCount}語をすべて${orderText}出題します。チャレンジモードは間違えたら終了です。${timeText}`
      : `${selectedCount}語をすべて${orderText}出題します。${timeText}`;
    startNote.className = "start-note";
  } else if (!canStart) {
    startNote.textContent = hasReviewSourceSelected()
      ? `復習セットは${selectedCount}語です。${count}問にするにはあと${count - selectedCount}語必要です。`
      : `選択範囲は${selectedCount}語です。${count}問にするにはあと${count - selectedCount}語必要です。`;
    startNote.className = "start-note is-warning";
  } else {
    startNote.textContent = setup.challenge
      ? `${sourceText}${selectedCount}語から重複なしで${count}問、${orderText}出題します。チャレンジモードは間違えたら終了です。${timeText}`
      : `${sourceText}${selectedCount}語から重複なしで${count}問、${orderText}出題します。${timeText}`;
    startNote.className = "start-note";
  }
  updateFloatingStartVisibility();
}

function getFloatingStartDetail(selectedCount, count) {
  const countLabel = count === "endless"
    ? "エンドレス"
    : count === "all"
      ? "全部"
      : `${count}問`;
  const sourceLabel = hasReviewSourceSelected() ? "復習セット" : "選択範囲";
  const orderLabel = hasReviewSourceSelected()
    ? "復習"
    : setup.questionOrder === "smart" ? "おまかせ" : "ランダム";
  return `${sourceLabel} ${selectedCount}語 / ${countLabel} / ${orderLabel}`;
}

function getActiveSourceLabel() {
  return hasReviewSourceSelected() ? "復習セット" : "選択範囲";
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
  recordLearningResult(session.current.word, {
    correct: isCorrect,
    timedOut: Boolean(options.timedOut),
  });
  recordDailyStudyResult(session.deck.id, {
    correct: isCorrect,
    timedOut: Boolean(options.timedOut),
  });
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
    deleteSavedProgress(session.deck.id);
    showResultScreen();
    return;
  }
  nextButton.textContent = isLastQuestion() ? "結果を見る" : "次へ";
  if (session.count === "endless") nextButton.textContent = "次へ";
  if (!options.inlineNext) nextButton.classList.remove("is-hidden");
  updateStudyStatus();
}

function nextQuestion() {
  if (session.count !== "endless" && isLastQuestion()) {
    deleteSavedProgress(session.deck.id);
    showResultScreen();
    return;
  }
  session.index += 1;
  renderQuestion();
}

function showResultScreen() {
  applyAfterStudyActions();
  renderResult();
  showScreen("result");
}

function applyAfterStudyActions() {
  if (!session || session.afterStudyActionsApplied) return;
  session.afterStudyActionsApplied = true;
  const settings = getAppSettings();
  const shouldBookmarkWrong = !session.challenge && settings.autoBookmarkWrong;
  const shouldBookmarkChallenge = session.challenge && settings.autoBookmarkChallenge && session.wrongWords.length > 0;
  if (!shouldBookmarkWrong && !shouldBookmarkChallenge) return;
  addWordsToBookmarks(getResultWrongWords(), session.deck.id);
}

function renderLearningRecordScreen() {
  const deck = getSelectedDeck();
  if (!deck) return;
  learningRecordDeckName.textContent = deck.name;

  const today = getTodayKey();
  const deckStats = getDeckStats(deck.id);
  const todayStats = deckStats.days?.[today] || createEmptyDayStats();
  renderRecordGoal(todayStats.answered);
  recordTodayAnswered.textContent = todayStats.answered;
  recordTodayCorrect.textContent = todayStats.correct;
  recordTodayAccuracy.textContent = todayStats.answered > 0
    ? `${Math.round((todayStats.correct / todayStats.answered) * 100)}%`
    : "0%";
  recordStreakDays.textContent = `${getCurrentStreak(deckStats)}日`;

  renderWeaknessSummary(deck);
}

function renderRecordGoal(answered) {
  const goal = Number(getAppSettings().dailyGoal || 0);
  recordGoalPanel.classList.toggle("is-hidden", goal <= 0);
  if (goal <= 0) return;
  renderGoalProgress(answered, goal, recordGoalLabel, recordGoalDetail, recordGoalProgress);
  recordGoalPanel.classList.toggle("is-complete", answered >= goal);
}

function renderGoalProgress(answered, dailyGoal, labelEl, detailEl, progressEl) {
  const goal = Number(dailyGoal || 0);
  if (labelEl) labelEl.textContent = goal > 0 ? `目標 ${goal}問` : "目標なし";
  if (detailEl) detailEl.textContent = goal > 0 ? `${answered}問 / ${goal}問` : `${answered}問 学習済み`;
  const progress = goal > 0 ? Math.min(100, Math.round((answered / goal) * 100)) : 0;
  if (progressEl) progressEl.style.width = `${progress}%`;
}

function renderGoalOptions() {
  const selected = String(getAppSettings().dailyGoal || 0);
  goalOptionsEl.innerHTML = "";
  goalOptions.forEach((option) => {
    const button = document.createElement("button");
    button.className = `mode-button${String(option.value) === selected ? " is-selected" : ""}`;
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      updateAppSetting("dailyGoal", option.value);
      renderGoalOptions();
    });
    goalOptionsEl.appendChild(button);
  });
}

function renderWeaknessSummary(deck) {
  const summaries = getWeaknessSummaries(deck);
  weaknessSummaryList.innerHTML = "";
  if (summaries.length === 0) {
    weaknessSummaryList.innerHTML = '<p class="empty-state compact">まだ弱点データがありません。学習するとここに表示されます。</p>';
    return;
  }

  summaries.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "weakness-card";
    card.innerHTML = `
      <div>
        <span>${index + 1}</span>
        <strong>${escapeHtml(item.label)}</strong>
      </div>
      <p>${item.wrong}ミス / ${item.answered}回答</p>
      <small>ミス率 ${item.rate}%</small>
    `;
    weaknessSummaryList.appendChild(card);
  });
}

function getWeaknessSummaries(deck) {
  const records = state.learning?.[deck.id] || {};
  const groups = new Map();
  deck.words.forEach((word) => {
    const record = records[getWordKey(word)];
    if (!record || !record.seen) return;
    const label = word.lesson || "未分類";
    const current = groups.get(label) || { label, answered: 0, wrong: 0 };
    current.answered += Number(record.seen || 0);
    current.wrong += Number(record.wrong || 0);
    groups.set(label, current);
  });

  return [...groups.values()]
    .filter((item) => item.wrong > 0)
    .map((item) => ({
      ...item,
      rate: Math.round((item.wrong / Math.max(1, item.answered)) * 100),
    }))
    .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong || b.answered - a.answered)
    .slice(0, 5);
}

function renderResult() {
  renderResultSummary();
  renderResultGoal();

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

function renderResultGoal() {
  const goal = Number(getAppSettings().dailyGoal || 0);
  if (!session?.deck || goal <= 0) {
    resultGoalPanel.classList.add("is-hidden");
    return;
  }
  const todayStats = getDeckStats(session.deck.id).days?.[getTodayKey()] || createEmptyDayStats();
  resultGoalPanel.classList.remove("is-hidden");
  renderGoalProgress(todayStats.answered, goal, null, resultGoalDetail, resultGoalProgress);
  resultGoalPanel.classList.toggle("is-complete", todayStats.answered >= goal);
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
  if (session?.deck?.id) deleteSavedProgress(session.deck.id);
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

function getLearningRecord(deckId, word) {
  const key = getWordKey(word);
  return {
    seen: 0,
    correct: 0,
    wrong: 0,
    timedOut: 0,
    streak: 0,
    lastAt: 0,
    lastResult: "",
    ...(state.learning?.[deckId]?.[key] || {}),
  };
}

function confirmResetLearning() {
  const deck = getSelectedDeck();
  if (!deck || Object.keys(state.learning?.[deck.id] || {}).length === 0) return;
  openConfirmDialog({
    title: "おまかせデータをリセットしますか？",
    message: `${deck.name} の内部学習データを削除します。しおりやCSVの単語は残ります。`,
    confirmLabel: "リセットする",
    cancelLabel: "やめる",
    onConfirm: () => resetLearningData(deck.id),
  });
}

function resetLearningData(deckId = selectedDeckId) {
  if (!deckId) return;
  if (state.learning) delete state.learning[deckId];
  saveState();
  const deck = getSelectedDeck();
  if (deck) {
    renderLearningResetState(deck);
    renderDataManagementState(deck);
  }
  showToast("おまかせデータをリセットしました。");
}

function confirmResetRecentMistakes() {
  const deck = getSelectedDeck();
  const count = deck ? getRecentMistakeWords(deck, { ignoreRange: true }).length : 0;
  if (!deck || count === 0) return;
  openConfirmDialog({
    title: "最近ミスをリセットしますか？",
    message: `${deck.name} の最近ミス ${count}語をリストから外します。おまかせ用の苦手データは残ります。`,
    confirmLabel: "リセットする",
    cancelLabel: "やめる",
    onConfirm: () => resetRecentMistakes(deck.id),
  });
}

function resetRecentMistakes(deckId = selectedDeckId) {
  if (!deckId || !state.learning?.[deckId]) return;
  const records = state.learning[deckId];
  Object.keys(records).forEach((key) => {
    const record = { ...records[key] };
    delete record.lastWrongAt;
    delete record.lastWrongType;
    if (record.lastResult === "wrong" || record.lastResult === "timedOut") {
      record.lastResult = "";
    }
    records[key] = record;
  });
  saveState();
  const deck = getSelectedDeck();
  if (deck) {
    renderBookmarkPanel(deck);
    renderDataManagementState(deck);
    updateStartState(deck);
  }
  showToast("最近ミスをリセットしました。");
}

function recordLearningResult(word, result) {
  if (!session?.deck?.id || !word) return;
  const deckId = session.deck.id;
  const key = getWordKey(word);
  const current = getLearningRecord(deckId, word);
  const next = {
    ...current,
    seen: current.seen + 1,
    lastAt: Date.now(),
  };

  if (result.correct) {
    next.correct += 1;
    next.streak += 1;
    next.lastResult = "correct";
  } else {
    next.wrong += 1;
    next.streak = 0;
    next.lastWrongAt = Date.now();
    next.lastWrongType = result.timedOut ? "timedOut" : "wrong";
    next.lastResult = result.timedOut ? "timedOut" : "wrong";
    if (result.timedOut) next.timedOut += 1;
  }

  state.learning = {
    ...(state.learning || {}),
    [deckId]: {
      ...(state.learning?.[deckId] || {}),
      [key]: next,
    },
  };
  saveState();
}

function recordDailyStudyResult(deckId, result) {
  if (!deckId) return;
  const today = getTodayKey();
  const deckStats = getDeckStats(deckId);
  const dayStats = {
    ...createEmptyDayStats(),
    ...(deckStats.days?.[today] || {}),
  };
  dayStats.answered += 1;
  if (result.correct) {
    dayStats.correct += 1;
  } else if (result.timedOut) {
    dayStats.timedOut += 1;
  } else {
    dayStats.wrong += 1;
  }

  const previousDate = deckStats.lastStudyDate || "";
  const streak = previousDate === today
    ? Number(deckStats.streak || 1)
    : isYesterday(previousDate, today)
      ? Number(deckStats.streak || 0) + 1
      : 1;

  state.stats = {
    ...(state.stats || {}),
    [deckId]: {
      ...deckStats,
      lastStudyDate: today,
      streak,
      days: {
        ...(deckStats.days || {}),
        [today]: dayStats,
      },
    },
  };
  saveState();
}

function getDeckStats(deckId = selectedDeckId) {
  const current = state.stats?.[deckId] || {};
  return {
    days: current.days && typeof current.days === "object" ? current.days : {},
    lastStudyDate: current.lastStudyDate || "",
    streak: Number(current.streak || 0),
  };
}

function createEmptyDayStats() {
  return { answered: 0, correct: 0, wrong: 0, timedOut: 0 };
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isYesterday(previousDate, today) {
  if (!previousDate) return false;
  const previous = parseDateKey(previousDate);
  const current = parseDateKey(today);
  if (!previous || !current) return false;
  return current - previous === 86400000;
}

function parseDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
}

function getCurrentStreak(deckStats) {
  return deckStats.lastStudyDate === getTodayKey() ? Number(deckStats.streak || 0) : 0;
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

function addWordsToBookmarks(words, deckId = selectedDeckId) {
  if (!deckId || !words?.length) return 0;
  const bookmarks = getBookmarkSet(deckId);
  const before = bookmarks.size;
  words.forEach((word) => {
    if (word) bookmarks.add(getWordKey(word));
  });
  setBookmarkSet(deckId, bookmarks);
  return bookmarks.size - before;
}

function removeBookmarkByKey(key, deckId = selectedDeckId) {
  if (!deckId) return;
  const bookmarks = getBookmarkSet(deckId);
  bookmarks.delete(key);
  setBookmarkSet(deckId, bookmarks);
  const deck = getSelectedDeck();
  if (deck) {
    renderBookmarkPanel(deck);
    renderDataManagementState(deck);
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
  normalizeReviewSources();
  setup.reviewSources.bookmarks = false;
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

function triggerAnimation(element, className, duration = 720) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

function getBookmarkedWords(deck = getSelectedDeck()) {
  if (!deck) return [];
  const bookmarks = getBookmarkSet(deck.id);
  return deck.words.filter((word) => bookmarks.has(getWordKey(word)));
}

function getSelectedGroupSet(deck = getSelectedDeck()) {
  if (!deck) return new Set();
  return new Set(getSelectedGroupIds(getStudyGroups(deck.words)));
}

function getReviewContext(deck = getSelectedDeck()) {
  const rangeSet = getSelectedGroupSet(deck);
  return {
    rangeSet,
    rangedWords: deck ? deck.words.filter((word) => rangeSet.has(word.lesson)) : [],
  };
}

function isWordInSelectedRange(word, deck = getSelectedDeck(), rangeSet = null) {
  const selected = rangeSet || getSelectedGroupSet(deck);
  return selected.has(word.lesson);
}

function getRangePool(words) {
  const selectedGroups = getSelectedGroupSet({ words });
  return words.filter((word) => selectedGroups.has(word.lesson));
}

function getReviewCounts(deck, context = getReviewContext(deck)) {
  return {
    bookmarks: getBookmarkedWords(deck).filter((word) => context.rangeSet.has(word.lesson)).length,
    recentMistakes: getRecentMistakeWords(deck, { rangeSet: context.rangeSet }).length,
    smartWeak: getSmartWeakWords(deck, { rangeSet: context.rangeSet }).length,
  };
}

function getReviewWords(deck = getSelectedDeck(), context = getReviewContext(deck)) {
  if (!deck || !hasReviewSourceSelected()) return [];
  const wordMap = new Map();
  const addWords = (words) => {
    words.forEach((word) => {
      if (context.rangeSet.has(word.lesson)) wordMap.set(getWordKey(word), word);
    });
  };

  if (setup.reviewSources.bookmarks) addWords(getBookmarkedWords(deck));
  if (setup.reviewSources.recentMistakes) addWords(getRecentMistakeWords(deck, { rangeSet: context.rangeSet }));
  if (setup.reviewSources.smartWeak) addWords(getSmartWeakWords(deck, { rangeSet: context.rangeSet }));
  return [...wordMap.values()];
}

function getRecentMistakeWords(deck = getSelectedDeck(), options = {}) {
  if (!deck) return [];
  const rangeSet = options.ignoreRange ? null : options.rangeSet || null;
  const includeTimedOut = getAppSettings().includeTimedOutInRecent;
  return deck.words
    .filter((word) => !rangeSet || rangeSet.has(word.lesson))
    .map((word) => ({ word, record: getLearningRecord(deck.id, word) }))
    .filter(({ record }) => isRecentMistakeRecord(record, includeTimedOut))
    .sort((a, b) => getLastWrongAt(b.record) - getLastWrongAt(a.record))
    .slice(0, 100)
    .map(({ word }) => word);
}

function isRecentMistakeRecord(record, includeTimedOut) {
  if (includeTimedOut) return Boolean(record.lastWrongAt || record.lastResult === "wrong" || record.lastResult === "timedOut");
  if (record.lastResult === "wrong") return true;
  if (!record.lastWrongAt) return false;
  if (!record.lastWrongType) return record.lastResult !== "timedOut";
  return record.lastWrongType === "wrong";
}

function getSmartWeakWords(deck = getSelectedDeck(), options = {}) {
  if (!deck) return [];
  const rangeSet = options.rangeSet || null;
  return deck.words
    .filter((word) => !rangeSet || rangeSet.has(word.lesson))
    .map((word) => ({
      word,
      record: getLearningRecord(deck.id, word),
      weight: getSmartWordWeight(word, deck.id),
    }))
    .filter(({ record, weight }) => record.seen > 0 && weight >= 3.2)
    .sort((a, b) => b.weight - a.weight || getLastWrongAt(b.record) - getLastWrongAt(a.record))
    .slice(0, 100)
    .map(({ word }) => word);
}

function getLastWrongAt(record) {
  return Number(record.lastWrongAt || (record.lastResult === "wrong" || record.lastResult === "timedOut" ? record.lastAt : 0) || 0);
}

function getWordMap(deck) {
  return new Map(deck.words.map((word) => [getWordKey(word), word]));
}

function getWordPool(words) {
  const rangedPool = getRangePool(words);
  if (!hasReviewSourceSelected()) return rangedPool;
  const deck = getSelectedDeck();
  const reviewKeys = new Set(getReviewWords(deck, { rangeSet: new Set(rangedPool.map((word) => word.lesson)), rangedWords: rangedPool }).map(getWordKey));
  return rangedPool.filter((word) => reviewKeys.has(getWordKey(word)));
}

function makeQuestionList(pool, count, deckId = selectedDeckId, order = "random") {
  const shuffled = order === "smart"
    ? makeSmartQuestionList(pool, deckId)
    : shuffle(pool);
  if (count === "endless" || count === "all") return shuffled;
  return shuffled.slice(0, count);
}

function makeSmartQuestionList(pool, deckId) {
  return pool
    .map((word) => {
      const weight = getSmartWordWeight(word, deckId);
      const random = Math.max(Number.EPSILON, Math.random());
      return {
        word,
        // 重い単語ほど前に来やすい、重複なしの軽量な重み付き並び替え。
        rank: -Math.log(random) / weight,
      };
    })
    .sort((a, b) => a.rank - b.rank)
    .map((item) => item.word);
}

function getSmartWordWeight(word, deckId) {
  const record = getLearningRecord(deckId, word);
  if (!record.seen) return 2.4;

  let weight = 1;
  weight += record.wrong * 1.8;
  weight += record.timedOut * 2.4;
  weight -= record.correct * 0.16;
  weight -= record.streak * 0.35;
  if (record.lastResult === "wrong") weight += 2.1;
  if (record.lastResult === "timedOut") weight += 2.8;
  if (record.lastAt) {
    const days = (Date.now() - record.lastAt) / 86400000;
    if (days >= 7) weight += Math.min(1.5, days / 14);
  }
  return Math.max(0.45, Math.min(9, weight));
}

function getEndlessWord() {
  if (session.index >= session.questions.length) {
    session.questions = makeQuestionList(session.pool, "all", session.deck.id, session.questionOrder);
    session.index = 0;
  }
  return session.questions[session.index];
}

function canSaveStudyProgress() {
  return Boolean(session)
    && !session.challenge
    && session.count !== "endless"
    && Array.isArray(session.questions)
    && session.questions.length > 0;
}

function getProgressIndex() {
  if (!session) return 0;
  const nextIndex = session.locked ? session.index + 1 : session.index;
  return Math.min(nextIndex, session.questions.length);
}

function saveCurrentStudyProgress() {
  if (!canSaveStudyProgress()) return false;
  const index = getProgressIndex();
  if (index <= 0 || index >= session.questions.length) {
    deleteSavedProgress(session.deck.id);
    return false;
  }

  state.progress = {
    ...(state.progress || {}),
    [session.deck.id]: {
      mode: session.mode,
      count: session.count,
      questionOrder: session.questionOrder || "random",
      timeLimit: session.timeLimit,
      groups: [...(setup.groups || [])],
      reviewSources: { ...setup.reviewSources },
      questions: session.questions.map(getWordKey),
      pool: session.pool.map(getWordKey),
      index,
      correct: session.correct,
      answered: session.answered,
      wrongWords: session.wrongWords.map(getWordKey),
      wrongItems: session.wrongItems.map((item) => ({
        key: getWordKey(item.word),
        prompt: item.prompt,
        answer: item.answer,
        userAnswer: item.userAnswer,
      })),
      savedAt: Date.now(),
    },
  };
  saveState();
  return true;
}

function getSavedProgress(deckId = selectedDeckId) {
  if (!deckId) return null;
  const progress = state.progress?.[deckId];
  if (!progress || !Array.isArray(progress.questions) || progress.questions.length === 0) return null;
  return progress;
}

function deleteSavedProgress(deckId = selectedDeckId) {
  if (!deckId || !state.progress?.[deckId]) return;
  delete state.progress[deckId];
  saveState();
}

function continueSavedStudy() {
  const deck = getSelectedDeck();
  const progress = deck ? getSavedProgress(deck.id) : null;
  if (!deck || !progress) return;
  const wordMap = getWordMap(deck);
  const questions = progress.questions.map((key) => wordMap.get(key)).filter(Boolean);
  const pool = progress.pool?.length
    ? progress.pool.map((key) => wordMap.get(key)).filter(Boolean)
    : questions;

  if (questions.length !== progress.questions.length || pool.length === 0) {
    deleteSavedProgress(deck.id);
    renderSetup();
    showToast("前回の続きは単語データが変わったため破棄しました。", "error");
    return;
  }

  const index = Math.min(Number(progress.index || 0), questions.length - 1);
  setup.mode = progress.mode || DEFAULT_MODE_ID;
  setup.count = String(progress.count);
  if (progress.count === "all") setup.count = "all";
  setup.questionOrder = progress.questionOrder || "random";
  setup.timeLimit = timeLimitOptions.find((option) => option.value === progress.timeLimit)?.id || "none";
  setup.groups = Array.isArray(progress.groups) ? progress.groups : getStudyGroups(deck.words).map((group) => group.id);
  setup.reviewSources = {
    ...createEmptyReviewSources(),
    ...(progress.reviewSources || {}),
  };
  if (progress.bookmarkedOnly) setup.reviewSources.bookmarks = true;
  setup.bookmarkedOnly = false;
  setup.challenge = false;

  session = {
    deck,
    pool,
    mode: progress.mode || DEFAULT_MODE_ID,
    count: progress.count,
    questionOrder: progress.questionOrder || "random",
    questions,
    index,
    correct: Number(progress.correct || 0),
    answered: Number(progress.answered || 0),
    wrongWords: (progress.wrongWords || []).map((key) => wordMap.get(key)).filter(Boolean),
    wrongItems: (progress.wrongItems || [])
      .map((item) => ({
        word: wordMap.get(item.key),
        prompt: item.prompt,
        answer: item.answer,
        userAnswer: item.userAnswer,
      }))
      .filter((item) => item.word),
    challenge: false,
    timeLimit: progress.timeLimit ?? null,
    current: null,
    locked: false,
  };

  renderQuestion();
  showScreen("study");
}

function confirmDiscardProgress() {
  const deck = getSelectedDeck();
  if (!deck || !getSavedProgress(deck.id)) return;
  openConfirmDialog({
    title: "前回の続きを破棄しますか？",
    message: "保存されている途中経過を削除します。単語帳やしおりは残ります。",
    confirmLabel: "破棄する",
    cancelLabel: "やめる",
    onConfirm: () => {
      deleteSavedProgress(deck.id);
      renderSetup();
      showToast("前回の続きを破棄しました。");
    },
  });
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
  if (state.learning) delete state.learning[existingDeckId];
  if (state.progress) delete state.progress[existingDeckId];
  if (state.stats) delete state.stats[existingDeckId];
  if (state.presets) delete state.presets[existingDeckId];
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
      if (state.learning) delete state.learning[id];
      if (state.stats) delete state.stats[id];
      if (state.presets) delete state.presets[id];
      if (state.progress) delete state.progress[id];
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
