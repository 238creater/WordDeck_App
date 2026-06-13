const STORAGE_KEY = "word-deck-app:v1";

const modes = [
  { id: "choice-en-ja", label: "4択 英語 → 日本語", type: "choice" },
  { id: "choice-ja-en", label: "4択 日本語 → 英語", type: "choice" },
  { id: "input-ja-en", label: "記述 日本語 → 英語", type: "input" },
  { id: "cloze-choice", label: "4択 穴埋め", type: "choice", deckKind: "cloze" },
  { id: "cloze-input", label: "記述 穴埋め", type: "input", deckKind: "cloze" },
];
const DEFAULT_MODE_ID = "choice-en-ja";
const DEFAULT_CLOZE_MODE_ID = "cloze-choice";
const WEAKNESS_SUMMARY_LIMIT = 10;
const STUDY_HISTORY_PAGE_SIZE = 20;

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

document.body.classList.toggle("standalone-display", isStandaloneDisplay());

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

const sampleClozeDeck = {
  id: "sample-cloze",
  name: "サンプル穴埋め問題",
  kind: "cloze",
  createdAt: new Date().toISOString(),
  words: [
    {
      lesson: "Stage1-前置詞",
      english: "Jackets are required for club members in the main dining room _ casual dress is acceptable in all other areas of the club.",
      japanese: ["クラブの他の場所では普段着が許される一方、主食堂内では、クラブ会員はジャケットが必要である。"],
      choices: ["while", "during", "because", "unless"],
      answer: "while",
      explanation: "空所後には「他の場所では普段着が許される」という内容が続き、空所前の「主食堂ではジャケットが必要」と対比されています。このように前後の内容を比べて「一方で」とつなぐ場合は while が適切です。during は期間を表す名詞の前に置く前置詞なので、この文のように節をつなぐことはできません。",
    },
    {
      lesson: "Stage1-前置詞",
      english: "The completed application form must be submitted to the human resources department _ Friday to be considered for the training program.",
      japanese: ["研修プログラムの対象となるためには、記入済みの申込書を金曜日までに人事部へ提出しなければならない。"],
      choices: ["by", "on", "at", "with"],
      answer: "by",
      explanation: "Friday は提出の期限を表しているため、期限を示す前置詞 by を使います。by Friday は「金曜日までに」という意味で、その時点より前に完了している必要があります。on Friday は単に「金曜日に」という意味なので、締め切りを表すこの文では不自然です。",
    },
    {
      lesson: "Stage1-接続詞",
      english: "The meeting was canceled _ the heavy rain.",
      japanese: ["大雨のため会議は中止された。"],
      choices: ["because of", "despite", "although", "while"],
      answer: "because of",
      explanation: "空所後の the heavy rain は名詞句なので、理由を表す because of が入ります。because は後ろに主語と動詞を含む節を置く語ですが、because of は名詞句を続ける形です。despite は「にもかかわらず」という逆接を表すため、会議が中止された理由を示すこの文には合いません。",
    },
    {
      lesson: "Stage2-句動詞",
      english: "Please fill _ this form before noon.",
      japanese: ["正午までにこの用紙に記入してください。"],
      choices: ["out", "up", "off", "by"],
      answer: "out",
      explanation: "fill out this form で「この用紙に記入する」という意味になります。書類や申込書などの空欄を埋める場合によく使われる表現です。fill up は容器などを満たす意味、fill in も記入する意味で使われますが、この選択肢では out が最も自然です。",
    },
    {
      lesson: "Stage2-句動詞",
      english: "We need to look _ the proposal carefully.",
      japanese: ["私たちはその提案を注意深く調べる必要がある。"],
      choices: ["over", "down", "away", "between"],
      answer: "over",
      explanation: "look over は「ざっと目を通す」「確認する」という意味の句動詞です。proposal の内容を注意深く確認するという文脈なので over が適切です。look down は「見下ろす」「軽蔑する」、look away は「目をそらす」という意味になり、文意に合いません。",
    },
    {
      lesson: "Stage2-接続詞",
      english: "Please contact our support team immediately _ you have any questions about the updated billing procedure.",
      japanese: ["更新された請求手続きについて質問がある場合は、すぐにサポートチームへ連絡してください。"],
      choices: ["if", "unless", "despite", "during"],
      answer: "if",
      explanation: "空所後には you have any questions という節が続いており、「もし質問がある場合は」という条件を表しています。そのため if が適切です。unless は「もし〜でないなら」という否定条件を表すため、この文では意味が逆になります。despite や during は前置詞なので、このような節を直接つなげません。",
    },
    {
      lesson: "Stage3-前置詞",
      english: "The invoice is attached _ this email.",
      japanese: ["請求書はこのメールに添付されています。"],
      choices: ["to", "for", "by", "at"],
      answer: "to",
      explanation: "be attached to ... で「...に添付されている」という意味になります。メールにファイルや請求書が添付されている場合は attached to this email が自然な形です。for は目的、by は行為者や期限、at は場所や時点を表すことが多く、この表現では to を使います。",
    },
    {
      lesson: "Stage3-語法",
      english: "The regional sales manager is responsible _ coordinating the launch schedule with several local distributors.",
      japanese: ["地域営業部長は、複数の現地販売業者と発売スケジュールを調整する責任がある。"],
      choices: ["for", "to", "with", "about"],
      answer: "for",
      explanation: "be responsible for ... は「...に責任がある」「...を担当している」という意味の定型表現です。空所後には coordinating the launch schedule という動名詞句が続いており、担当内容を表しています。responsible to は「誰に対して責任を負うか」を表す場合に使われます。",
    },
    {
      lesson: "Stage3-接続詞",
      english: "The office will remain open _ the renovation.",
      japanese: ["改装中も事務所は営業を続けます。"],
      choices: ["during", "while", "because", "although"],
      answer: "during",
      explanation: "the renovation は期間を表す名詞句なので、前置詞 during を使います。during the renovation で「改装中に」という意味です。while は後ろに主語と動詞を含む節を置く接続詞なので、名詞句だけが続くこの文では使えません。",
    },
    {
      lesson: "Stage4-語法",
      english: "Employees are required _ their ID cards.",
      japanese: ["従業員はIDカードを着用することが求められている。"],
      choices: ["to wear", "wearing", "wear", "worn"],
      answer: "to wear",
      explanation: "be required to do は「...することを求められる」という意味の受動態の表現です。この文では従業員がIDカードを着用することを求められているため、to wear が正解です。required の後ろに動詞を続ける場合は to 不定詞にするのが基本です。",
    },
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
let reviewListSnapshot = null;
let weaknessSummaryView = "category";
let wordListSelectedParent = "";

const screens = {
  decks: document.querySelector("#deck-screen"),
  setup: document.querySelector("#setup-screen"),
  detailSettings: document.querySelector("#detail-settings-screen"),
  learningRecord: document.querySelector("#learning-record-screen"),
  wordList: document.querySelector("#word-list-screen"),
  study: document.querySelector("#study-screen"),
  result: document.querySelector("#result-screen"),
};

const appShell = document.querySelector(".app-shell");
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
const appBottomNav = document.querySelector("#app-bottom-nav");
const bottomWordListButton = document.querySelector("#bottom-word-list-button");
const learningRecordDeckName = document.querySelector("#learning-record-deck-name");
const favoritePresetMenuButton = document.querySelector("#favorite-preset-menu-button");
const favoritePresetDialog = document.querySelector("#favorite-preset-dialog");
const favoritePresetMenu = document.querySelector("#favorite-preset-menu");
const closeFavoritePresetDialogButton = document.querySelector("#close-favorite-preset-dialog-button");
const clozeExplanationDialog = document.querySelector("#cloze-explanation-dialog");
const closeClozeExplanationButton = document.querySelector("#close-cloze-explanation-button");
const clozeExplanationAnswer = document.querySelector("#cloze-explanation-answer");
const clozeExplanationText = document.querySelector("#cloze-explanation-text");
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
const openStudyHistoryButton = document.querySelector("#open-study-history-button");
const studyHistoryDialog = document.querySelector("#study-history-dialog");
const studyHistoryDeckName = document.querySelector("#study-history-deck-name");
const studyHistoryList = document.querySelector("#study-history-list");
const closeStudyHistoryButton = document.querySelector("#close-study-history-button");
const weaknessCategoryTab = document.querySelector("#weakness-category-tab");
const weaknessProblemTab = document.querySelector("#weakness-problem-tab");
const weaknessSummaryList = document.querySelector("#weakness-summary-list");
const resultGoalPanel = document.querySelector("#result-goal-panel");
const resultGoalDetail = document.querySelector("#result-goal-detail");
const resultGoalProgress = document.querySelector("#result-goal-progress");
const wordListScreen = document.querySelector("#word-list-screen");
const wordListDeckName = document.querySelector("#word-list-deck-name");
const wordListSelectToggle = document.querySelector("#word-list-select-toggle");
const wordListSelectionBar = document.querySelector("#word-list-selection-bar");
const wordListSelectionCount = document.querySelector("#word-list-selection-count");
const wordListBulkBookmarkButton = document.querySelector("#word-list-bulk-bookmark-button");
const wordListBulkUnbookmarkButton = document.querySelector("#word-list-bulk-unbookmark-button");
const wordListClearSelectionButton = document.querySelector("#word-list-clear-selection-button");
const wordListFinishSelectionButton = document.querySelector("#word-list-finish-selection-button");
document.body.appendChild(wordListSelectionBar);
const wordSearchInput = document.querySelector("#word-search-input");
const clearWordSearchButton = document.querySelector("#clear-word-search-button");
const closeWordSearchButton = document.querySelector("#close-word-search-button");
const wordSearchFilters = document.querySelector("#word-search-filters");
const wordListContent = document.querySelector("#word-list-content");
const wordSearchResults = document.querySelector("#word-search-results");
const wordDetailPanel = document.querySelector("#word-detail-panel");
const wordDetailDeckName = document.querySelector("#word-detail-deck-name");
const wordDetailRange = document.querySelector("#word-detail-range");
const wordDetailMainLabel = document.querySelector("#word-detail-main-label");
const wordDetailMain = document.querySelector("#word-detail-main");
const wordDetailSubLabel = document.querySelector("#word-detail-sub-label");
const wordDetailSub = document.querySelector("#word-detail-sub");
const wordDetailAnswerBlock = document.querySelector("#word-detail-answer-block");
const wordDetailAnswer = document.querySelector("#word-detail-answer");
const wordDetailBookmarkButton = document.querySelector("#word-detail-bookmark-button");
document.body.appendChild(wordDetailPanel);
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
const resetStudyRecordButton = document.querySelector("#reset-study-record-button");
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
const showClozeJapaneseToggle = document.querySelector("#show-cloze-japanese-toggle");
const clozeInitialHintToggle = document.querySelector("#cloze-initial-hint-toggle");
const startButton = document.querySelector("#start-button");
const startNote = document.querySelector("#start-note");
const startPanel = document.querySelector(".start-panel");
const heroStartButton = document.querySelector("#hero-start-button");
const heroModeTitle = document.querySelector("#hero-mode-title");
const heroStartDetail = document.querySelector("#hero-start-detail");
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
const hintCurrentButton = document.querySelector("#hint-current-button");
const clozeExplanationButton = document.querySelector("#cloze-explanation-button");
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
let wordDetailTouchStartY = 0;
let wordDetailPreviousFocus = null;
let wordListSelectionMode = false;
let wordListSelectedKeys = new Set();
let studyHistoryVisibleCount = STUDY_HISTORY_PAGE_SIZE;
let appNavPointerActive = false;
let appNavLastClientX = 0;
let appNavLastClientY = 0;
let appNavLastMoveAt = 0;
let appNavWobbleTimer = null;
let appNavBounceTimer = null;
let appNavBounceResetTimer = null;
let appNavAtEdge = false;
let suppressNextAppNavClick = false;
let appNavSettleTimer = null;
let appNavTouchFallbackActive = false;
let appNavIgnorePointerUntil = 0;
let appNavFollowFrame = null;
let appNavCurrentX = null;
let appNavTargetX = null;
let appNavIndicatorWidth = 0;
let appNavFollowVelocity = 0;
let appNavButtonMetrics = [];
let appNavEdgePressure = 0;
let appNavLiquidDirection = 1;
let appNavVisualSpeed = 0;

document.addEventListener("click", handleGlobalClick);
document.addEventListener("keydown", handleKeyboard);
window.addEventListener("scroll", scheduleFloatingStartUpdate, { passive: true });
window.addEventListener("resize", scheduleFloatingStartUpdate);
csvInput.addEventListener("change", handleCsvImport);
document.querySelector("#load-sample-button").addEventListener("click", addSampleDeck);
document.querySelector("#load-cloze-sample-button").addEventListener("click", addSampleClozeDeck);
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
weaknessCategoryTab.addEventListener("click", () => {
  weaknessSummaryView = "category";
  const deck = getSelectedDeck();
  if (deck) renderWeaknessSummary(deck);
});
weaknessProblemTab.addEventListener("click", () => {
  weaknessSummaryView = "problem";
  const deck = getSelectedDeck();
  if (deck) renderWeaknessSummary(deck);
});
openRangeDialogButton.addEventListener("click", () => {
  openRangeDialog();
});
appBottomNav.addEventListener("click", (event) => {
  if (isAppNavInteractionBlocked()) return;
  if (suppressNextAppNavClick) {
    suppressNextAppNavClick = false;
    return;
  }
  const button = event.target.closest("[data-nav-screen]");
  if (!button) return;
  navigateAppSection(button.dataset.navScreen);
});
appBottomNav.addEventListener("pointerdown", (event) => {
  if (isAppNavInteractionBlocked()) return;
  if (Date.now() < appNavIgnorePointerUntil) return;
  const button = event.target.closest("[data-nav-screen]");
  if (!button) return;
  event.preventDefault();
  button.blur();
  appNavPointerActive = true;
  beginAppNavDrag(event.clientX, event.clientY);
  appBottomNav.setPointerCapture?.(event.pointerId);
  moveAppNavIndicatorToPoint(event.clientX, event.clientY);
});
appBottomNav.addEventListener("pointermove", (event) => {
  if (isAppNavInteractionBlocked()) return;
  if (Date.now() < appNavIgnorePointerUntil) return;
  if (!appNavPointerActive) return;
  updateAppNavDragMotion(event.clientX, event.clientY);
  moveAppNavIndicatorToPoint(event.clientX, event.clientY);
});
appBottomNav.addEventListener("pointerup", (event) => {
  if (isAppNavInteractionBlocked()) {
    resetAppNavInteraction();
    return;
  }
  if (Date.now() < appNavIgnorePointerUntil) return;
  if (!appNavPointerActive) return;
  appNavPointerActive = false;
  appBottomNav.releasePointerCapture?.(event.pointerId);
  const button = getNearestAppNavButton(event.clientX);
  if (button) {
    suppressNextAppNavClick = true;
    navigateAppSection(button.dataset.navScreen);
  } else {
    updateAppBottomNav();
  }
  settleAppNavDrag();
});
appBottomNav.addEventListener("pointercancel", () => {
  if (Date.now() < appNavIgnorePointerUntil) return;
  appNavPointerActive = false;
  settleAppNavDrag();
  updateAppBottomNav();
});
document.addEventListener("touchstart", handleAppNavTouchStart, { passive: false, capture: true });
document.addEventListener("touchmove", handleAppNavTouchMove, { passive: false, capture: true });
document.addEventListener("touchend", handleAppNavTouchEnd, { passive: false, capture: true });
document.addEventListener("touchcancel", handleAppNavTouchCancel, { passive: true, capture: true });
appBottomNav.addEventListener("pointerleave", () => {
  if (!appNavPointerActive) updateAppBottomNav();
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
wordListContent.addEventListener("click", handleWordListCardClick);
wordSearchResults.addEventListener("click", handleWordListCardClick);
wordListSelectToggle.addEventListener("click", toggleWordListSelectionMode);
wordListBulkBookmarkButton.addEventListener("click", () => bulkSetWordListBookmarks(true));
wordListBulkUnbookmarkButton.addEventListener("click", () => bulkSetWordListBookmarks(false));
wordListClearSelectionButton.addEventListener("click", clearWordListSelection);
wordListFinishSelectionButton.addEventListener("click", () => {
  wordListSelectionMode = false;
  wordListSelectedKeys.clear();
  updateWordListSelectionState();
});
wordDetailBookmarkButton.addEventListener("click", toggleWordDetailBookmark);
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
resetStudyRecordButton.addEventListener("click", confirmResetStudyRecord);
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
showClozeJapaneseToggle.addEventListener("change", () => {
  updateAppSetting("showClozeJapanese", showClozeJapaneseToggle.checked);
  renderSetup();
});
clozeInitialHintToggle.addEventListener("change", () => {
  updateAppSetting("clozeInitialHint", clozeInitialHintToggle.checked);
  renderSetup();
});
challengeToggle.addEventListener("change", () => {
  setup.challenge = challengeToggle.checked;
  if (setup.challenge && setup.count === "endless") setup.count = "10";
  stabilizeChallengeThemeSwitch();
});
startButton.addEventListener("click", startStudy);
if (heroStartButton) heroStartButton.addEventListener("click", startStudy);
floatingStartButton.addEventListener("click", startStudy);
nextButton.addEventListener("click", nextQuestion);
bookmarkCurrentButton.addEventListener("click", toggleCurrentBookmark);
hintCurrentButton.addEventListener("click", showCurrentHint);
toggleWrongBookmarksButton.addEventListener("click", toggleWrongBookmarks);
clearBookmarksButton.addEventListener("click", handleReviewListBulkAction);
closeBookmarkDialogButton.addEventListener("click", closeBookmarkDialog);
openStudyHistoryButton.addEventListener("click", openStudyHistoryDialog);
closeStudyHistoryButton.addEventListener("click", closeStudyHistoryDialog);
closeRangeDialogButton.addEventListener("click", closeRangeDialog);
closeFavoritePresetDialogButton.addEventListener("click", closeFavoritePresetDialog);
closeClozeExplanationButton.addEventListener("click", closeClozeExplanationDialog);
cancelQuitButton.addEventListener("click", closeConfirmDialog);
confirmQuitButton.addEventListener("click", runConfirmDialogAction);
quitDialog.addEventListener("click", (event) => {
  if (event.target === quitDialog) closeConfirmDialog();
});
bookmarkDialog.addEventListener("click", (event) => {
  if (event.target === bookmarkDialog) closeBookmarkDialog();
});
studyHistoryDialog.addEventListener("click", (event) => {
  if (event.target === studyHistoryDialog) closeStudyHistoryDialog();
});
studyHistoryList.addEventListener("click", (event) => {
  if (!event.target.closest("[data-action='show-more-history']")) return;
  studyHistoryVisibleCount += STUDY_HISTORY_PAGE_SIZE;
  renderStudyHistoryDialog();
});
rangeDialog.addEventListener("click", (event) => {
  if (event.target === rangeDialog) closeRangeDialog();
});
favoritePresetDialog.addEventListener("click", (event) => {
  if (event.target === favoritePresetDialog) closeFavoritePresetDialog();
});
clozeExplanationDialog.addEventListener("click", (event) => {
  if (event.target === clozeExplanationDialog) closeClozeExplanationDialog();
});
wordDetailPanel.addEventListener("click", (event) => {
  if (event.target === wordDetailPanel) closeWordDetailPanel();
});
wordDetailPanel.addEventListener("wheel", preventWordDetailBackgroundScroll, { passive: false });
wordDetailPanel.addEventListener("touchstart", (event) => {
  wordDetailTouchStartY = event.touches[0]?.clientY || 0;
}, { passive: true });
wordDetailPanel.addEventListener("touchmove", preventWordDetailBackgroundScroll, { passive: false });
window.addEventListener("pagehide", () => {
  if (session && screens.study.classList.contains("is-active")) saveCurrentStudyProgress();
});
window.addEventListener("resize", () => updateAppBottomNav());

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
      decks: parsed.decks.map((deck) => normalizeDeck(deck)),
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
    showClozeJapanese: true,
    clozeInitialHint: false,
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
  if (name !== "wordList") resetWordListTransientState();
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  document.body.classList.toggle("study-active", name === "study");
  document.body.classList.toggle("app-nav-active", isAppNavScreen(name));
  document.body.classList.toggle("word-list-selecting-active", name === "wordList" && wordListSelectionMode);
  if (name !== "study") {
    document.body.classList.remove("study-input-active", "study-cloze-active", "study-choice-active", "study-writing-active");
  }
  syncChallengeTheme(name);
  updateAppBottomNav(name);
  updateFloatingStartVisibility();
  if (name === "study") {
    forceScrollToTop();
    scrollToTop();
  } else {
    scrollToTop();
  }
}

function navigateAppSection(name) {
  if (isAppNavInteractionBlocked()) return;
  if (!isAppNavScreen(name)) return;
  const deck = getSelectedDeck();
  if (!deck) {
    showScreen("decks");
    return;
  }
  if (name === "setup" || name === "detailSettings") renderSetup();
  if (name === "learningRecord") renderLearningRecordScreen();
  if (name === "wordList") renderWordListScreen();
  showScreen(name);
}

function isAppNavScreen(name) {
  return name === "setup" || name === "detailSettings" || name === "learningRecord" || name === "wordList";
}

function updateAppBottomNav(activeName = getActiveScreenName()) {
  if (!appBottomNav) return;
  const buttons = [...appBottomNav.querySelectorAll("[data-nav-screen]")];
  buttons.forEach((button) => {
    const isSelected = button.dataset.navScreen === activeName;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-current", isSelected ? "page" : "false");
  });
  positionAppNavIndicator(buttons.find((button) => button.dataset.navScreen === activeName) || buttons[0]);
}

function getNearestAppNavButton(clientX) {
  if (!appBottomNav) return null;
  const buttons = [...appBottomNav.querySelectorAll("[data-nav-screen]")];
  return buttons.reduce((nearest, button) => {
    const rect = button.getBoundingClientRect();
    const distance = Math.abs(clientX - (rect.left + rect.width / 2));
    if (!nearest || distance < nearest.distance) return { button, distance };
    return nearest;
  }, null)?.button || null;
}

function getAppNavTouchButton(clientX, clientY) {
  if (!appBottomNav || !document.body.classList.contains("app-nav-active")) return null;
  if (isAppNavInteractionBlocked()) return null;
  const rect = appBottomNav.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const hitSlop = 16;
  const insideX = clientX >= rect.left - hitSlop && clientX <= rect.right + hitSlop;
  const insideY = clientY >= rect.top - hitSlop && clientY <= rect.bottom + hitSlop;
  if (!insideX || !insideY) return null;
  return getNearestAppNavButton(clientX);
}

function handleAppNavTouchStart(event) {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  const button = getAppNavTouchButton(touch.clientX, touch.clientY);
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  appNavIgnorePointerUntil = Date.now() + 650;
  appNavTouchFallbackActive = true;
  appNavPointerActive = false;
  button.blur();
  beginAppNavDrag(touch.clientX, touch.clientY);
  moveAppNavIndicatorToPoint(touch.clientX, touch.clientY);
}

function handleAppNavTouchMove(event) {
  if (!appNavTouchFallbackActive) return;
  if (isAppNavInteractionBlocked()) {
    resetAppNavInteraction();
    return;
  }
  const touch = event.touches[0];
  if (!touch) return;
  event.preventDefault();
  event.stopPropagation();
  updateAppNavDragMotion(touch.clientX, touch.clientY);
  moveAppNavIndicatorToPoint(touch.clientX, touch.clientY);
}

function handleAppNavTouchEnd(event) {
  if (!appNavTouchFallbackActive) return;
  event.preventDefault();
  event.stopPropagation();
  appNavTouchFallbackActive = false;
  if (isAppNavInteractionBlocked()) {
    resetAppNavInteraction();
    return;
  }
  const touch = event.changedTouches[0];
  const button = touch ? getNearestAppNavButton(touch.clientX) : null;
  if (button) {
    suppressNextAppNavClick = true;
    navigateAppSection(button.dataset.navScreen);
  } else {
    updateAppBottomNav();
  }
  settleAppNavDrag();
}

function handleAppNavTouchCancel() {
  if (!appNavTouchFallbackActive) return;
  appNavTouchFallbackActive = false;
  settleAppNavDrag();
  updateAppBottomNav();
}

function isAppNavInteractionBlocked() {
  return document.body.classList.contains("dialog-open")
    || document.body.classList.contains("word-detail-open")
    || document.body.classList.contains("study-active")
    || document.body.classList.contains("word-list-selecting-active");
}

function resetAppNavInteraction() {
  window.clearTimeout(appNavSettleTimer);
  window.clearTimeout(appNavWobbleTimer);
  window.clearTimeout(appNavBounceTimer);
  window.clearTimeout(appNavBounceResetTimer);
  cancelAnimationFrame(appNavFollowFrame);
  appNavFollowFrame = null;
  appNavCurrentX = null;
  appNavTargetX = null;
  appNavFollowVelocity = 0;
  appNavButtonMetrics = [];
  appNavEdgePressure = 0;
  appNavLiquidDirection = 1;
  appNavVisualSpeed = 0;
  appNavPointerActive = false;
  appNavTouchFallbackActive = false;
  appNavAtEdge = false;
  suppressNextAppNavClick = false;
  appBottomNav?.classList.remove("is-dragging", "is-settling");
  appBottomNav?.style.setProperty("--nav-lift", "1");
  appBottomNav?.style.setProperty("--nav-stretch", "1");
  appBottomNav?.style.setProperty("--nav-edge-lift", "1");
  appBottomNav?.style.setProperty("--nav-wobble", "1");
  appBottomNav?.style.setProperty("--nav-liquid-stretch", "1");
  appBottomNav?.style.setProperty("--nav-liquid-squash", "1");
  appBottomNav?.style.setProperty("--nav-liquid-offset", "0px");
  appBottomNav?.style.setProperty("--nav-liquid-front-shift", "0px");
  appBottomNav?.style.setProperty("--nav-liquid-front-scale", "1");
  appBottomNav?.style.setProperty("--nav-edge-pressure", "0");
  appBottomNav?.style.setProperty("--nav-edge-light-x", "0px");
  appBottomNav?.style.setProperty("--nav-edge-shade-x", "0px");
  appBottomNav?.style.setProperty("--nav-edge-light-y", "0px");
  appBottomNav?.style.setProperty("--nav-edge-shade-y", "0px");
  appBottomNav?.style.setProperty("--nav-vertical-stretch", "1");
  appBottomNav?.style.setProperty("--nav-vertical-origin", "center");
  appBottomNav?.classList.remove("is-edge-hit");
  clearAppNavGlassOverlap();
  if (!isAppNavInteractionBlocked()) updateAppBottomNav();
}

function moveAppNavIndicatorToPoint(clientX, clientY = null) {
  if (!appBottomNav) return;
  const mobileNav = isMobileAppNav();
  const button = getNearestAppNavButton(clientX);
  const navRect = appBottomNav.getBoundingClientRect();
  const buttonRect = button?.getBoundingClientRect();
  const buttonWidth = buttonRect?.width || Number.parseFloat(getComputedStyle(appBottomNav).getPropertyValue("--nav-indicator-width")) || 0;
  const width = mobileNav ? buttonWidth * 1.06 : buttonWidth;
  const rawX = clientX - navRect.left - width / 2;
  const overflowLimit = 6;
  const minX = -overflowLimit;
  const maxX = navRect.width - width + overflowLimit;
  const x = Math.min(maxX, Math.max(minX, rawX));
  const edgePull = rawX - x;
  const edgeRatio = Math.min(1, Math.abs(edgePull) / Math.max(width * 0.55, 1));
  const navCenterY = navRect.top + navRect.height / 2;
  const verticalDistance = clientY === null ? 0 : clientY - navCenterY;
  const verticalDeadZone = navRect.height * 0.2;
  const verticalRatio = Math.min(1, Math.max(0, Math.abs(verticalDistance) - verticalDeadZone) / Math.max(navRect.height * 0.38, 1));
  const verticalDirection = verticalDistance < 0 ? -1 : verticalDistance > 0 ? 1 : 0;
  const combinedEdgeRatio = Math.max(edgeRatio, verticalRatio);
  appNavAtEdge = combinedEdgeRatio > 0.02;
  const stretchLimit = mobileNav ? 0.025 : 0.085;
  const stretchPower = mobileNav ? 0.12 : 0.3;
  const stretch = Math.min(stretchLimit, Math.abs(edgePull) / Math.max(width, 1) * stretchPower);
  const verticalStretch = mobileNav ? 0 : Math.min(0.045, stretch * 0.42 + edgeRatio * 0.012);
  const origin = mobileNav ? "center" : edgePull < 0 ? "right center" : edgePull > 0 ? "left center" : "center";
  if (!mobileNav || appNavCurrentX === null) {
    appBottomNav.style.setProperty("--nav-indicator-width", `${width}px`);
  }
  appBottomNav.style.setProperty("--nav-stretch", `${1 + stretch}`);
  appBottomNav.style.setProperty("--nav-edge-lift", `${1 + verticalStretch}`);
  appBottomNav.style.setProperty("--nav-stretch-origin", origin);
  if (mobileNav) {
    appNavEdgePressure = edgeRatio;
    appNavIndicatorWidth = width;
    appNavTargetX = x;
    if (appNavCurrentX === null) appNavCurrentX = x;
    appBottomNav.classList.toggle("is-edge-hit", combinedEdgeRatio > 0.02);
    appBottomNav.style.setProperty("--nav-edge-pressure", combinedEdgeRatio.toFixed(3));
    const edgeDirection = edgePull < 0 ? -1 : edgePull > 0 ? 1 : 0;
    appBottomNav.style.setProperty("--nav-edge-direction", `${edgeDirection}`);
    appBottomNav.style.setProperty("--nav-edge-light-x", `${edgeDirection * edgeRatio * -13}px`);
    appBottomNav.style.setProperty("--nav-edge-shade-x", `${edgeDirection * edgeRatio * 8}px`);
    appBottomNav.style.setProperty("--nav-edge-light-y", `${verticalDirection * verticalRatio * -11}px`);
    appBottomNav.style.setProperty("--nav-edge-shade-y", `${verticalDirection * verticalRatio * 7}px`);
    appBottomNav.style.setProperty("--nav-vertical-stretch", `${1 + verticalRatio * 0.06}`);
    appBottomNav.style.setProperty(
      "--nav-vertical-origin",
      verticalDirection < 0 ? "center bottom" : verticalDirection > 0 ? "center top" : "center"
    );
    startAppNavFollower();
  } else {
    appBottomNav.style.setProperty("--nav-indicator-x", `${x}px`);
  }
  previewAppNavSelection(button);
}

function startAppNavFollower() {
  if (appNavFollowFrame || appNavTargetX === null || appNavCurrentX === null) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const follow = () => {
    if (!appBottomNav || appNavTargetX === null || appNavCurrentX === null) {
      appNavFollowFrame = null;
      return;
    }
    const distance = appNavTargetX - appNavCurrentX;
    const followRate = reduceMotion ? 1 : Math.abs(distance) > appNavIndicatorWidth * 0.65 ? 0.34 : 0.46;
    const step = distance * followRate;
    appNavCurrentX += step;
    appNavFollowVelocity = appNavFollowVelocity * 0.7 + step * 0.3;
    if (Math.abs(distance) < 0.18) {
      appNavCurrentX = appNavTargetX;
      appNavFollowVelocity *= 0.5;
    }
    const rawSpeed = Math.min(1, Math.abs(appNavFollowVelocity) / 10);
    const visualSpeedTarget = rawSpeed < 0.018 ? 0 : rawSpeed;
    appNavVisualSpeed += (visualSpeedTarget - appNavVisualSpeed) * 0.34;
    if (Math.abs(distance) > 0.8 && Math.abs(step) > 0.22) {
      appNavLiquidDirection = distance < 0 ? -1 : 1;
    }
    const speed = appNavVisualSpeed;
    const direction = appNavLiquidDirection;
    const edgeCompression = 1 - appNavEdgePressure * 0.12;
    const lag = appNavTargetX - appNavCurrentX;
    const extension = reduceMotion
      ? 0
      : Math.min(appNavIndicatorWidth * 0.92, Math.abs(lag) * 1.14);
    const visualWidth = appNavIndicatorWidth + extension;
    const visualX = lag < 0 ? appNavCurrentX - extension : appNavCurrentX;
    appBottomNav.style.setProperty("--nav-indicator-x", `${visualX}px`);
    appBottomNav.style.setProperty("--nav-indicator-width", `${visualWidth}px`);
    appBottomNav.style.setProperty("--nav-liquid-stretch", `${1 + speed * 0.018}`);
    appBottomNav.style.setProperty("--nav-liquid-squash", `${edgeCompression - speed * 0.018}`);
    appBottomNav.style.setProperty("--nav-liquid-direction", `${direction}`);
    appBottomNav.style.setProperty("--nav-liquid-offset", "0px");
    appBottomNav.style.setProperty("--nav-liquid-front-shift", `${direction * Math.min(7, extension * 0.09)}px`);
    appBottomNav.style.setProperty("--nav-liquid-front-scale", `${1 + Math.min(0.07, extension / Math.max(appNavIndicatorWidth, 1) * 0.08)}`);
    appBottomNav.style.setProperty("--nav-stretch-origin", "center");
    updateAppNavGlassOverlap(visualX, visualWidth);
    if (Math.abs(appNavTargetX - appNavCurrentX) > 0.18 || Math.abs(appNavFollowVelocity) > 0.08 || appNavVisualSpeed > 0.006) {
      appNavFollowFrame = requestAnimationFrame(follow);
      return;
    }
    appNavFollowFrame = null;
  };
  appNavFollowFrame = requestAnimationFrame(follow);
}

function updateAppNavGlassOverlap(indicatorX, indicatorWidth) {
  if (!appBottomNav || !indicatorWidth) return;
  const indicatorLeft = indicatorX;
  const indicatorRight = indicatorX + indicatorWidth;
  appNavButtonMetrics.forEach(({ button, left, right, width }) => {
    const overlap = Math.max(0, Math.min(right, indicatorRight) - Math.max(left, indicatorLeft));
    const ratio = Math.min(1, overlap / Math.max(width, 1));
    button.style.setProperty("--nav-glass-overlap", ratio.toFixed(3));
    button.style.setProperty("--nav-glass-icon-weight", `${ratio * 82}%`);
    button.style.setProperty("--nav-glass-label-weight", `${ratio * 70}%`);
    button.style.setProperty("--nav-glass-icon-lift", `${ratio * -2.5}px`);
    button.style.setProperty("--nav-glass-label-lift", `${ratio * -1}px`);
    button.style.setProperty("--nav-glass-icon-scale", `${1 + ratio * 0.085}`);
    button.style.setProperty("--nav-glass-brightness", `${1 + ratio * 0.13}`);
    button.style.setProperty("--nav-glass-saturation", `${1 + ratio * 0.16}`);
  });
}

function clearAppNavGlassOverlap() {
  appBottomNav?.querySelectorAll("[data-nav-screen]").forEach((button) => {
    button.style.removeProperty("--nav-glass-overlap");
    button.style.removeProperty("--nav-glass-icon-weight");
    button.style.removeProperty("--nav-glass-label-weight");
    button.style.removeProperty("--nav-glass-icon-lift");
    button.style.removeProperty("--nav-glass-label-lift");
    button.style.removeProperty("--nav-glass-icon-scale");
    button.style.removeProperty("--nav-glass-brightness");
    button.style.removeProperty("--nav-glass-saturation");
  });
}

function beginAppNavDrag(clientX, clientY) {
  window.clearTimeout(appNavSettleTimer);
  window.clearTimeout(appNavWobbleTimer);
  window.clearTimeout(appNavBounceTimer);
  window.clearTimeout(appNavBounceResetTimer);
  cancelAnimationFrame(appNavFollowFrame);
  appNavFollowFrame = null;
  appNavLastClientX = clientX;
  appNavLastClientY = clientY;
  appNavLastMoveAt = performance.now();
  appNavAtEdge = false;
  appNavCurrentX = null;
  appNavTargetX = null;
  appNavFollowVelocity = 0;
  appNavEdgePressure = 0;
  appNavVisualSpeed = 0;
  const navRect = appBottomNav.getBoundingClientRect();
  appNavButtonMetrics = [...appBottomNav.querySelectorAll("[data-nav-screen]")].map((button) => {
    const rect = button.getBoundingClientRect();
    return {
      button,
      left: rect.left - navRect.left,
      right: rect.right - navRect.left,
      width: rect.width,
    };
  });
  appBottomNav.classList.remove("is-settling");
  appBottomNav.classList.add("is-dragging");
  appBottomNav.style.setProperty("--nav-lift", "1.08");
  appBottomNav.style.setProperty("--nav-stretch", "1");
  appBottomNav.style.setProperty("--nav-edge-lift", "1");
  appBottomNav.style.setProperty("--nav-wobble", "1");
  appBottomNav.style.setProperty("--nav-stretch-origin", "center");
}

function updateAppNavDragMotion(clientX, clientY) {
  const mobileNav = isMobileAppNav();
  const now = performance.now();
  const elapsed = Math.max(16, now - appNavLastMoveAt);
  const velocityX = (clientX - appNavLastClientX) / elapsed;
  const velocityY = (clientY - appNavLastClientY) / elapsed;
  const velocity = Math.hypot(velocityX, velocityY);
  if (Math.abs(velocityX) > 0.015) {
    appNavLiquidDirection = velocityX < 0 ? -1 : 1;
  }
  const wobble = appNavAtEdge
    ? 0
    : mobileNav
      ? Math.min(0.008, Math.abs(velocityX) * 0.003)
      : Math.min(0.05, Math.abs(velocity) * 0.02);
  appBottomNav.style.setProperty("--nav-lift", mobileNav ? "1.045" : "1.1");
  appBottomNav.style.setProperty("--nav-wobble", `${1 + wobble}`);
  appNavLastClientX = clientX;
  appNavLastClientY = clientY;
  appNavLastMoveAt = now;
  window.clearTimeout(appNavWobbleTimer);
  appNavWobbleTimer = window.setTimeout(() => {
    if (mobileNav) {
      appBottomNav?.style.setProperty("--nav-wobble", "0.997");
      window.clearTimeout(appNavBounceResetTimer);
      appNavBounceResetTimer = window.setTimeout(() => {
        appBottomNav?.style.setProperty("--nav-wobble", "1");
      }, 70);
      return;
    }
    if (appNavAtEdge) {
      appBottomNav?.style.setProperty("--nav-wobble", "1");
      return;
    }
    appBottomNav?.style.setProperty("--nav-wobble", "0.992");
    window.clearTimeout(appNavBounceResetTimer);
    appNavBounceResetTimer = window.setTimeout(() => {
      appBottomNav?.style.setProperty("--nav-wobble", "1");
    }, 90);
  }, 80);
}

function isMobileAppNav() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function previewAppNavSelection(targetButton) {
  if (!appBottomNav || !targetButton) return;
  appBottomNav.querySelectorAll("[data-nav-screen]").forEach((button) => {
    button.classList.toggle("is-selected", button === targetButton);
  });
}

function settleAppNavDrag() {
  if (!appBottomNav) return;
  window.clearTimeout(appNavWobbleTimer);
  window.clearTimeout(appNavBounceTimer);
  window.clearTimeout(appNavBounceResetTimer);
  appBottomNav.classList.remove("is-dragging");
  appBottomNav.classList.remove("is-edge-hit");
  appBottomNav.style.setProperty("--nav-edge-pressure", "0");
  appBottomNav.style.setProperty("--nav-edge-light-x", "0px");
  appBottomNav.style.setProperty("--nav-edge-shade-x", "0px");
  appBottomNav.style.setProperty("--nav-edge-light-y", "0px");
  appBottomNav.style.setProperty("--nav-edge-shade-y", "0px");
  appBottomNav.style.setProperty("--nav-vertical-stretch", "1");
  appBottomNav.style.setProperty("--nav-vertical-origin", "center");
  appBottomNav.classList.add("is-settling");
  const mobileNav = isMobileAppNav();
  appBottomNav.style.setProperty("--nav-lift", mobileNav ? "1.035" : "1.065");
  appBottomNav.style.setProperty("--nav-stretch", "1");
  appBottomNav.style.setProperty("--nav-edge-lift", mobileNav ? "0.992" : "0.985");
  appBottomNav.style.setProperty("--nav-wobble", mobileNav ? "1.014" : "1.03");
  appBottomNav.style.setProperty("--nav-stretch-origin", "center");
  appBottomNav.style.setProperty("--nav-liquid-stretch", "1");
  appBottomNav.style.setProperty("--nav-liquid-squash", "1");
  appBottomNav.style.setProperty("--nav-liquid-offset", "0px");
  appBottomNav.style.setProperty("--nav-liquid-front-shift", "0px");
  appBottomNav.style.setProperty("--nav-liquid-front-scale", "1");
  if (appNavTargetX !== null && appNavIndicatorWidth) {
    appNavCurrentX = appNavTargetX;
    appBottomNav.style.setProperty("--nav-indicator-x", `${appNavTargetX}px`);
    appBottomNav.style.setProperty("--nav-indicator-width", `${appNavIndicatorWidth}px`);
  }
  clearAppNavGlassOverlap();
  appNavAtEdge = false;
  appNavBounceTimer = window.setTimeout(() => {
    appBottomNav?.style.setProperty("--nav-edge-lift", mobileNav ? "1.008" : "1.018");
    appBottomNav?.style.setProperty("--nav-wobble", mobileNav ? "0.997" : "0.992");
  }, 80);
  appNavBounceResetTimer = window.setTimeout(() => {
    appBottomNav?.style.setProperty("--nav-edge-lift", "1");
    appBottomNav?.style.setProperty("--nav-wobble", "1");
  }, 170);
  window.clearTimeout(appNavSettleTimer);
  appNavSettleTimer = window.setTimeout(() => {
    appBottomNav.classList.remove("is-settling");
    appBottomNav.style.setProperty("--nav-lift", "1");
  }, 260);
}

function positionAppNavIndicator(button) {
  if (!appBottomNav || !button) return;
  const navRect = appBottomNav.getBoundingClientRect();
  const rect = button.getBoundingClientRect();
  cancelAnimationFrame(appNavFollowFrame);
  appNavFollowFrame = null;
  appNavCurrentX = rect.left - navRect.left;
  appNavTargetX = appNavCurrentX;
  appNavIndicatorWidth = rect.width;
  appBottomNav.style.setProperty("--nav-indicator-x", `${rect.left - navRect.left}px`);
  appBottomNav.style.setProperty("--nav-indicator-width", `${rect.width}px`);
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
  screens.setup?.classList.remove("challenge-preview");
  document.body.classList.remove("theme-switching");
  renderSetup();
  syncChallengeTheme();
}

function getActiveScreenName() {
  return Object.entries(screens).find(([, screen]) => screen.classList.contains("is-active"))?.[0] || "decks";
}

function getChallengeThemeState(screenName) {
  if (screenName === "setup") return setup.challenge;
  if (screenName === "study" || screenName === "result") return Boolean(session?.challenge);
  return false;
}

function isStandaloneDisplay() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator?.standalone === true;
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
    session = null;
    showScreen("decks");
  }
  if (action === "back-to-setup") {
    renderSetup();
    showScreen("setup");
  }
  if (action === "close-word-detail") {
    closeWordDetailPanel();
  }
  if (action === "open-cloze-explanation") {
    openClozeExplanationDialog();
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
    if (key) toggleReviewBookmarkByKey(decodeURIComponent(key));
  }
  if (action === "toggle-result-bookmark") {
    const key = event.target.closest("[data-bookmark-key]")?.dataset.bookmarkKey;
    if (key) toggleResultBookmarkByKey(decodeURIComponent(key));
  }
  if (action === "toggle-list-bookmark") {
    const key = event.target.closest("[data-bookmark-key]")?.dataset.bookmarkKey;
    if (key) toggleWordListBookmarkByKey(decodeURIComponent(key));
  }
  if (action === "toggle-review-bookmark") {
    const key = event.target.closest("[data-bookmark-key]")?.dataset.bookmarkKey;
    if (key) toggleReviewSummaryBookmarkByKey(decodeURIComponent(key));
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
  if (!studyHistoryDialog.classList.contains("is-hidden")) {
    if (event.key === "Escape") closeStudyHistoryDialog();
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
  if (!clozeExplanationDialog.classList.contains("is-hidden")) {
    if (event.key === "Escape") closeClozeExplanationDialog();
    return;
  }
  if (!wordDetailPanel.classList.contains("is-hidden")) {
    if (event.key === "Escape") closeWordDetailPanel();
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
  reviewListSnapshot = null;
  bookmarkDialog.classList.remove("is-hidden");
  renderReviewList();
  lockPageScroll();
  closeBookmarkDialogButton.focus();
}

function closeBookmarkDialog() {
  if (!bookmarkDialog.classList.contains("is-hidden")) {
    bookmarkDialog.classList.add("is-hidden");
    reviewListSnapshot = null;
    unlockPageScroll();
  }
}

function openStudyHistoryDialog() {
  const deck = getSelectedDeck();
  if (!deck) return;
  studyHistoryVisibleCount = STUDY_HISTORY_PAGE_SIZE;
  renderStudyHistoryDialog(deck);
  studyHistoryDialog.classList.remove("is-hidden");
  lockPageScroll();
  closeStudyHistoryButton.focus();
}

function closeStudyHistoryDialog() {
  if (!studyHistoryDialog.classList.contains("is-hidden")) {
    studyHistoryDialog.classList.add("is-hidden");
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

function openClozeExplanationDialog() {
  if (!session?.current || session.current.kind !== "cloze") return;
  const explanation = String(session.current.explanation || "").trim();
  if (!explanation) return;
  const answerLabel = session.current.answerLabel || session.current.answer;
  clozeExplanationAnswer.textContent = answerLabel || "";
  clozeExplanationText.textContent = explanation;
  clozeExplanationDialog.classList.remove("is-hidden");
  lockPageScroll();
  closeClozeExplanationButton.focus();
}

function closeClozeExplanationDialog() {
  if (!clozeExplanationDialog.classList.contains("is-hidden")) {
    clozeExplanationDialog.classList.add("is-hidden");
    unlockPageScroll();
  }
}

function lockPageScroll() {
  scrollLockCount += 1;
  if (scrollLockCount === 1) {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.setProperty("--dialog-scroll-offset", `${lockedScrollY}px`);
  }
  document.body.classList.add("dialog-open");
}

function unlockPageScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.classList.remove("dialog-open");
    document.body.style.top = "";
    document.body.style.removeProperty("--dialog-scroll-offset");
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
    normalizeDeck(deck);
    const node = template.content.firstElementChild.cloneNode(true);
    const groups = getStudyGroups(deck.words);
    node.querySelector("h2").textContent = deck.name;
    node.querySelector("p").textContent = getDeckSummary(deck.words, groups, deck);
    node.querySelector('[data-role="study"]').addEventListener("click", () => {
      selectedDeckId = deck.id;
      session = null;
      setup.mode = getDefaultModeId(deck);
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
  normalizeDeck(deck);
  if (!questionOrderOptions.some((option) => option.id === setup.questionOrder)) setup.questionOrder = "random";
  if (!getAvailableModes(deck).some((mode) => mode.id === setup.mode)) setup.mode = getDefaultModeId(deck);
  normalizeReviewSources();

  activeDeckName.textContent = deck.name;
  if (detailDeckName) detailDeckName.textContent = deck.name;
  if (learningRecordDeckName) learningRecordDeckName.textContent = deck.name;
  if (bottomWordListButton) bottomWordListButton.querySelector("strong").textContent = isClozeDeck(deck) ? "問題一覧" : "単語一覧";
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
  const modeIds = new Set(getAvailableModes(deck).map((mode) => mode.id));
  const orderIds = new Set(questionOrderOptions.map((option) => option.id));

  setup.mode = modeIds.has(snapshot.mode) ? snapshot.mode : getDefaultModeId(deck);
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

  renderOptionButtons(modeOptions, getAvailableModes(deck), setup.mode, (id) => {
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
  const deckStats = getDeckStats(deck.id);
  const hasStudyRecord = Object.keys(deckStats.days).length > 0
    || deckStats.histories.length > 0
    || Number(deckStats.streak || 0) > 0;
  resetRecentMistakesButton.disabled = recentCount === 0;
  resetRecentMistakesButton.textContent = recentCount > 0 ? `最近ミスをリセット (${recentCount})` : "最近ミスなし";
  resetStudyRecordButton.disabled = !hasStudyRecord;
  resetStudyRecordButton.textContent = hasStudyRecord ? "学習記録をリセット" : "学習記録なし";
  detailClearBookmarksButton.disabled = bookmarkCountAll === 0;
  detailClearBookmarksButton.textContent = bookmarkCountAll > 0 ? `しおりを一括解除 (${bookmarkCountAll})` : "しおりなし";
}

function renderAppSettingControls() {
  const settings = getAppSettings();
  autoBookmarkWrongToggle.checked = settings.autoBookmarkWrong;
  autoBookmarkChallengeToggle.checked = settings.autoBookmarkChallenge;
  includeTimeoutRecentToggle.checked = settings.includeTimedOutInRecent;
  showClozeJapaneseToggle.checked = settings.showClozeJapanese;
  clozeInitialHintToggle.checked = settings.clozeInitialHint;
  const isCloze = isClozeDeck(getSelectedDeck());
  showClozeJapaneseToggle.closest(".setting-toggle").classList.toggle("is-hidden", !isCloze);
  clozeInitialHintToggle.closest(".setting-toggle").classList.add("is-hidden");
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
  const unit = getDeckUnit(deck);

  rangeToolbar.innerHTML = "";
  rangeToolbar.innerHTML = `
    <div>
      <span>選択中</span>
      <strong>${selectedWordCount}${unit} / ${selectedIds.length}範囲</strong>
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
  const unit = getDeckUnit(deck);

  rangeSummaryTitle.textContent = `${selectedWordCount}${unit} / ${selectedIds.length}範囲`;
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
  const countLabel = bookmarkCount.closest("p");
  if (countLabel) countLabel.lastChild.textContent = ` ${getDeckUnit(deck)}を選択中`;

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
  const itemName = isClozeDeck(deck) ? "問題" : "単語";
  const reviewContext = getReviewContext(deck);
  const currentBookmarks = getBookmarkSet(deck.id);
  const bookmarkedWords = getBookmarkedWords(deck).filter((word) => reviewContext.rangeSet.has(word.lesson));
  const shouldUseBookmarkSnapshot = reviewListTab === "bookmarks";
  if (shouldUseBookmarkSnapshot && (!reviewListSnapshot || reviewListSnapshot.deckId !== deck.id)) {
    reviewListSnapshot = {
      deckId: deck.id,
      keys: bookmarkedWords.map(getWordKey),
    };
  }
  const words = reviewListTab === "recentMistakes"
    ? getRecentMistakeWords(deck, { rangeSet: reviewContext.rangeSet })
    : (reviewListSnapshot?.keys || [])
      .map((key) => deck.words.find((word) => getWordKey(word) === key))
      .filter((word) => word && reviewContext.rangeSet.has(word.lesson));

  bookmarkTabButton.classList.toggle("is-selected", reviewListTab === "bookmarks");
  recentMistakeTabButton.classList.toggle("is-selected", reviewListTab === "recentMistakes");
  updateReviewListBulkButton(deck, words, currentBookmarks);

  bookmarkList.innerHTML = "";
  if (words.length === 0) {
    bookmarkList.innerHTML = reviewListTab === "recentMistakes"
      ? `<div class="empty-state">選択中の範囲に最近間違えた${itemName}はありません。</div>`
      : `<div class="empty-state">選択中の範囲にしおり${itemName}はありません。</div>`;
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
      const key = getWordKey(word);
      const isBookmarked = currentBookmarks.has(key);
      const removeButton = reviewListTab === "bookmarks"
        ? `<button class="secondary-button small" type="button" data-action="remove-bookmark" data-bookmark-key="${encodeURIComponent(key)}">${isBookmarked ? "解除" : "再登録"}</button>`
        : `<button class="secondary-button small bookmark-item-toggle${isBookmarked ? " is-bookmarked" : ""}" type="button" data-action="toggle-review-bookmark" data-bookmark-key="${encodeURIComponent(key)}">${isBookmarked ? "しおり解除" : "しおりに追加"}</button>`;
      const item = document.createElement("div");
      const pendingRemoveClass = reviewListTab === "bookmarks" && !isBookmarked ? " is-pending-remove" : "";
      const bookmarkedClass = reviewListTab === "recentMistakes" && isBookmarked ? " is-bookmarked" : "";
      item.className = `bookmark-item${isClozeDeck(deck) ? " has-answer" : ""}${pendingRemoveClass}${bookmarkedClass}`;
      const answerLine = isClozeDeck(deck) ? `<span class="bookmark-item-answer">正解: ${escapeHtml(word.answer)}</span>` : "";
      item.innerHTML = `
        <div>
          <strong>${escapeHtml(getItemMainLabel(word))}</strong>
          <span>${escapeHtml(getItemSubLabel(word))}</span>
          ${answerLine}
        </div>
        ${removeButton}
      `;
      grid.appendChild(item);
    });
    bookmarkList.appendChild(group);
  });
}

function updateReviewListBulkButton(deck, words, currentBookmarks = getBookmarkSet(deck.id)) {
  if (reviewListTab === "bookmarks") {
    clearBookmarksButton.classList.remove("is-hidden", "secondary-button");
    clearBookmarksButton.classList.add("danger-button");
    clearBookmarksButton.textContent = "一括解除";
    clearBookmarksButton.disabled = getBookmarkedWords(deck).length === 0;
    return;
  }

  clearBookmarksButton.classList.remove("is-hidden");
  const missingCount = words.filter((word) => !currentBookmarks.has(getWordKey(word))).length;
  const shouldAdd = missingCount > 0;
  clearBookmarksButton.classList.toggle("danger-button", !shouldAdd);
  clearBookmarksButton.classList.toggle("secondary-button", shouldAdd);
  clearBookmarksButton.textContent = shouldAdd ? "まとめてしおり" : "一括解除";
  clearBookmarksButton.disabled = words.length === 0;
}

function renderWordListScreen() {
  const deck = getSelectedDeck();
  if (!deck) return;
  const grouped = getGroupedWordsByRange(deck.words);
  resetWordListSelection();
  wordListDeckName.textContent = deck.name;
  document.querySelector("#word-list-title").textContent = isClozeDeck(deck) ? "問題一覧" : "単語一覧";
  wordSearchInput.placeholder = isClozeDeck(deck) ? "英文・日本語・正解で検索" : "英語・日本語で検索";
  wordSearchInput.value = "";
  wordSearchActive = false;
  wordListSelectedParent = grouped[0]?.parent || "";
  closeWordDetailPanel();
  resetWordSearchFilters();
  renderWordListContent(deck, grouped);
  renderWordSearchFilters(deck);
  renderWordSearchResults();
}

function resetWordListSelection() {
  wordListSelectionMode = false;
  wordListSelectedKeys = new Set();
  updateWordListSelectionState();
}

function toggleWordListSelectionMode() {
  wordListSelectionMode = !wordListSelectionMode;
  if (!wordListSelectionMode) wordListSelectedKeys.clear();
  updateWordListSelectionState();
}

function clearWordListSelection() {
  wordListSelectedKeys.clear();
  updateWordListSelectionState();
}

function updateWordListSelectionState() {
  if (!wordListScreen) return;
  const deck = getSelectedDeck();
  const itemName = isClozeDeck(deck) ? "問題" : "単語";
  const count = wordListSelectedKeys.size;
  const selectionVisible = wordListSelectionMode && screens.wordList.classList.contains("is-active");
  wordListScreen.classList.toggle("is-selecting", wordListSelectionMode);
  document.body.classList.toggle("word-list-selecting-active", selectionVisible);
  wordListSelectToggle.classList.toggle("is-selected", wordListSelectionMode);
  wordListSelectToggle.textContent = wordListSelectionMode ? "完了" : "選択";
  wordListSelectionBar.classList.toggle("is-hidden", !selectionVisible);
  wordListSelectionBar.setAttribute("aria-hidden", String(!selectionVisible));
  wordListSelectionCount.textContent = wordListSelectionMode
    ? `${count}${itemName}選択中`
    : `選択するとまとめてしおり登録できます`;
  wordListBulkBookmarkButton.disabled = count === 0;
  wordListBulkUnbookmarkButton.disabled = count === 0;
  wordListClearSelectionButton.disabled = count === 0;
  document.querySelectorAll("#word-list-content .word-list-card, #word-search-results .word-list-card").forEach((card) => {
    const key = card.dataset.wordKey ? decodeURIComponent(card.dataset.wordKey) : "";
    const selected = wordListSelectedKeys.has(key);
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-pressed", String(selected));
    card.setAttribute("aria-label", wordListSelectionMode
      ? `${selected ? "選択解除" : "選択"}`
      : `${isClozeDeck(deck) ? "問題" : "単語"}の詳細を開く`);
  });
}

function toggleWordListCardSelection(key) {
  if (wordListSelectedKeys.has(key)) {
    wordListSelectedKeys.delete(key);
  } else {
    wordListSelectedKeys.add(key);
  }
  updateWordListSelectionState();
}

function bulkSetWordListBookmarks(shouldBookmark) {
  const deck = getSelectedDeck();
  if (!deck || wordListSelectedKeys.size === 0) return;
  const selectedKeys = new Set(wordListSelectedKeys);
  const bookmarks = getBookmarkSet(deck.id);
  let changed = 0;
  selectedKeys.forEach((key) => {
    if (shouldBookmark) {
      if (!bookmarks.has(key)) changed += 1;
      bookmarks.add(key);
    } else {
      if (bookmarks.has(key)) changed += 1;
      bookmarks.delete(key);
    }
  });
  setBookmarkSet(deck.id, bookmarks);
  selectedKeys.forEach((key) => updateWordListBookmarkButtons(key, bookmarks.has(key)));
  renderBookmarkPanel(deck);
  updateWordListSelectionState();
  const itemName = isClozeDeck(deck) ? "問題" : "単語";
  showToast(shouldBookmark
    ? `${changed}${itemName}をしおりに追加しました。`
    : `${changed}${itemName}のしおりを解除しました。`);
}

function renderWordListContent(deck = getSelectedDeck(), grouped = null) {
  if (!deck) return;
  const groups = grouped || getGroupedWordsByRange(deck.words);
  wordListContent.innerHTML = "";

  if (groups.length === 0) {
    wordListContent.innerHTML = `<div class="empty-state">表示できる${isClozeDeck(deck) ? "問題" : "単語"}がありません。</div>`;
    return;
  }

  if (!groups.some((group) => group.parent === wordListSelectedParent)) {
    wordListSelectedParent = groups[0].parent;
  }

  const filter = document.createElement("div");
  filter.className = "word-stage-filter";
  filter.innerHTML = `
    <div>
      <span>大分類</span>
      <strong>${escapeHtml(wordListSelectedParent)}</strong>
    </div>
    <div class="word-stage-filter-buttons"></div>
  `;
  const filterButtons = filter.querySelector(".word-stage-filter-buttons");
  groups.forEach((stage) => {
    const button = document.createElement("button");
    button.className = `word-stage-filter-button${stage.parent === wordListSelectedParent ? " is-selected" : ""}`;
    button.type = "button";
    button.textContent = stage.parent;
    button.addEventListener("click", () => {
      if (wordListSelectedParent === stage.parent) return;
      wordListSelectedParent = stage.parent;
      renderWordListContent(deck);
    });
    filterButtons.appendChild(button);
  });
  wordListContent.appendChild(filter);

  const selectedStage = groups.find((stage) => stage.parent === wordListSelectedParent);
  const partList = document.createElement("div");
  partList.className = "word-part-list";

  selectedStage.children.forEach((part) => {
    const partDetails = document.createElement("article");
    partDetails.className = "word-part";
    partDetails.innerHTML = `
      <button class="word-part-summary" type="button" aria-expanded="false">
        <span>${escapeHtml(part.childLabel)}</span>
        <strong>${part.words.length}${getDeckUnit(deck)}</strong>
      </button>
      <div class="word-card-grid" hidden></div>
    `;
    const grid = partDetails.querySelector(".word-card-grid");
    part.words.forEach((word) => {
      grid.appendChild(createWordCard(word, deck.id));
    });
    prepareSmoothDetails(partDetails);
    partList.appendChild(partDetails);
  });
  wordListContent.appendChild(partList);
  updateWordListSelectionState();
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
      : `<div class="empty-state">${isClozeDeck(deck) ? "英文・日本語・正解" : "英語・日本語"}で検索できます。大分類や小分類はフィルターで絞り込めます。</div>`;
    return;
  }

  const normalizedQuery = normalizeSearchText(query);
  const matchedWords = deck.words.filter((word) => {
    if (!matchesWordSearchFilters(word)) return false;
    if (!normalizedQuery) return true;
    return matchesItemSearch(word, normalizedQuery, deck);
  });

  wordSearchResults.innerHTML = "";
  const resultHead = document.createElement("div");
  resultHead.className = "word-search-head";
  resultHead.innerHTML = `<strong>${matchedWords.length}件</strong><span>${escapeHtml(getWordSearchLabel(query))}</span>`;
  wordSearchResults.appendChild(resultHead);

  if (matchedWords.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = `一致する${isClozeDeck(deck) ? "問題" : "単語"}がありません。`;
    wordSearchResults.appendChild(empty);
    triggerAnimation(wordSearchResults, "is-refreshing", 220);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "word-card-grid word-card-grid-search";
  matchedWords
    .slice()
    .sort((a, b) => getItemSearchScore(a, normalizedQuery, deck) - getItemSearchScore(b, normalizedQuery, deck)
      || a.lesson.localeCompare(b.lesson, "ja", { numeric: true })
      || a.english.localeCompare(b.english, "en", { numeric: true }))
    .forEach((word) => {
      grid.appendChild(createWordCard(word, deck.id, true));
    });
  wordSearchResults.appendChild(grid);
  updateWordListSelectionState();
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

function resetWordListTransientState() {
  window.clearTimeout(wordSearchTimer);
  wordSearchActive = false;
  wordSearchInput.value = "";
  wordSearchInput.blur();
  resetWordSearchFilters();
  wordListScreen.classList.remove("is-searching", "has-search-query", "is-selecting");
  wordListContent.classList.remove("is-hidden");
  wordSearchResults.classList.add("is-hidden");
  wordSearchResults.innerHTML = "";
  wordSearchFilters.classList.add("is-hidden");
  wordListSelectionMode = false;
  wordListSelectedKeys.clear();
  updateWordListSelectionState();
  document.body.classList.remove("word-list-selecting-active");
  wordListSelectionBar.classList.add("is-hidden");
  wordListSelectionBar.setAttribute("aria-hidden", "true");
}

function renderWordSearchFilters(deck = getSelectedDeck()) {
  if (!deck) return;
  const stages = getSearchStageOptions(deck.words);
  reconcileWordSearchPartFilters(deck.words);
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

function matchesItemSearch(word, normalizedQuery, deck = getSelectedDeck()) {
  return Number.isFinite(getItemSearchScore(word, normalizedQuery, deck));
}

function getItemSearchScore(word, normalizedQuery, deck = getSelectedDeck()) {
  const english = normalizeSearchText(word.english);
  const japaneseItems = word.japanese.map((value) => normalizeSearchText(value));
  const scores = [];
  const searchJapanese = isJapaneseSearchQuery(normalizedQuery);

  if (!searchJapanese) {
    if (english === normalizedQuery) scores.push(0);
    else if (english.startsWith(normalizedQuery)) scores.push(1);
    return scores.length > 0 ? Math.min(...scores) : Number.POSITIVE_INFINITY;
  }

  japaneseItems.forEach((japanese) => {
    if (japanese === normalizedQuery) scores.push(0);
    else if (japanese.startsWith(normalizedQuery)) scores.push(1);
    else if (japanese.includes(normalizedQuery)) scores.push(3);
  });

  return scores.length > 0 ? Math.min(...scores) : Number.POSITIVE_INFINITY;
}

function isJapaneseSearchQuery(value) {
  return /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(value);
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
    if (type === "stage") reconcileWordSearchPartFilters(deck.words);
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

  if (type === "stage") reconcileWordSearchPartFilters(deck.words);
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
  const scopedWords = wordSearchStageFilters.size === 0
    ? words
    : words.filter((word) => wordSearchStageFilters.has(getWordRangeMeta(word).parent));
  return [...new Set(scopedWords.map((word) => getWordRangeMeta(word).child))]
    .sort((a, b) => {
      const aIndex = getPartOrderIndex(a);
      const bIndex = getPartOrderIndex(b);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.localeCompare(b, "ja", { numeric: true });
    });
}

function reconcileWordSearchPartFilters(words) {
  const availableParts = new Set(getSearchPartOptions(words));
  wordSearchPartFilters.forEach((part) => {
    if (!availableParts.has(part)) wordSearchPartFilters.delete(part);
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
  }, getDetailsCloseAnimationDuration(details) + 90);
  requestAnimationFrame(() => {
    content.style.height = "0px";
    finish.arm();
  });
}

function closeStageDetails(details, content) {
  const summary = details.querySelector(":scope > .word-stage-summary");
  const startHeight = content.offsetHeight;
  details.classList.add("is-closing");
  content.style.height = `${startHeight}px`;
  content.style.opacity = "1";

  const finish = onceTransitionDone(content, () => {
    closeNestedWordParts(details);
    details.classList.remove("is-open");
    summary?.setAttribute("aria-expanded", "false");
    content.hidden = true;
    content.style.height = "";
    content.style.opacity = "";
    details.classList.remove("is-animating", "is-closing");
  }, getDetailsCloseAnimationDuration(details) + 100, ["height"]);

  requestAnimationFrame(() => {
    content.style.height = "0px";
    finish.arm();
  });
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

function getDetailsCloseAnimationDuration(details) {
  return details.classList.contains("word-stage") ? 320 : 280;
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
  const deck = state.decks.find((item) => item.id === deckId);
  const key = getWordKey(word);
  const selected = wordListSelectedKeys.has(key);
  card.className = `word-list-card${selected ? " is-selected" : ""}`;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.dataset.wordKey = encodeURIComponent(key);
  card.setAttribute("aria-pressed", String(selected));
  card.setAttribute("aria-label", wordListSelectionMode
    ? `${selected ? "選択解除" : "選択"}`
    : `${isClozeDeck(deck) ? "問題" : "単語"}の詳細を開く`);
  const rangeLabel = showRange ? `<span class="word-list-range">${escapeHtml(formatRangeSummaryLabel(word.lesson))}</span>` : "";
  const answerLine = isClozeDeck(deck) ? `<span class="word-list-answer">正解: ${escapeHtml(word.answer)}</span>` : "";
  card.innerHTML = `
    <div class="word-list-card-body">
      ${rangeLabel}
      <strong>${escapeHtml(getItemMainLabel(word))}</strong>
      <span>${escapeHtml(getItemSubLabel(word))}</span>
      ${answerLine}
    </div>
    <button class="secondary-button small word-list-bookmark-button${bookmarked ? " is-bookmarked" : ""}" type="button" data-action="toggle-list-bookmark" data-bookmark-key="${encodeURIComponent(key)}">
      ${bookmarked ? "しおり解除" : "しおりに追加"}
    </button>
  `;
  return card;
}

function handleWordListCardClick(event) {
  if (event.target.closest("button")) return;
  const card = event.target.closest(".word-list-card");
  if (!card?.dataset.wordKey) return;
  const key = decodeURIComponent(card.dataset.wordKey);
  if (wordListSelectionMode) {
    toggleWordListCardSelection(key);
    return;
  }
  openWordDetail(key);
}

function handleWordListCardKeydown(event) {
  if (event.target.closest("button")) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".word-list-card");
  if (!card?.dataset.wordKey) return;
  event.preventDefault();
  const key = decodeURIComponent(card.dataset.wordKey);
  if (wordListSelectionMode) {
    toggleWordListCardSelection(key);
    return;
  }
  openWordDetail(key);
}

wordListContent.addEventListener("keydown", handleWordListCardKeydown);
wordSearchResults.addEventListener("keydown", handleWordListCardKeydown);

function openWordDetail(key) {
  const deck = getSelectedDeck();
  if (!deck) return;
  const word = deck.words.find((item) => getWordKey(item) === key);
  if (!word) return;
  renderWordDetail(deck, word);
  wordDetailPreviousFocus = document.activeElement;
  document.body.classList.add("word-detail-open");
  setWordDetailBackgroundLocked(true);
  resetAppNavInteraction();
  wordDetailPanel.classList.remove("is-hidden");
  wordDetailPanel.querySelector("[data-action='close-word-detail']")?.focus({ preventScroll: true });
}

function closeWordDetailPanel() {
  if (!wordDetailPanel) return;
  wordDetailPanel.classList.add("is-hidden");
  wordDetailBookmarkButton.dataset.bookmarkKey = "";
  document.body.classList.remove("word-detail-open");
  setWordDetailBackgroundLocked(false);
  updateAppBottomNav();
  wordDetailPreviousFocus?.focus?.({ preventScroll: true });
  wordDetailPreviousFocus = null;
}

function setWordDetailBackgroundLocked(locked) {
  appShell.inert = locked;
  wordListSelectionBar.inert = locked;
  appShell.classList.toggle("is-modal-background", locked);
}

function preventWordDetailBackgroundScroll(event) {
  const panel = event.target.closest(".word-detail-panel");
  if (!panel) {
    event.preventDefault();
    return;
  }

  if (event.type === "wheel") {
    if (canScrollElement(panel, event.deltaY)) return;
    event.preventDefault();
    return;
  }

  const currentY = event.touches[0]?.clientY || 0;
  const deltaY = wordDetailTouchStartY - currentY;
  if (canScrollElement(panel, deltaY)) return;
  event.preventDefault();
}

function canScrollElement(element, deltaY) {
  if (!element || element.scrollHeight <= element.clientHeight) return false;
  if (deltaY > 0) return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  if (deltaY < 0) return element.scrollTop > 0;
  return true;
}

function renderWordDetail(deck, word) {
  const isCloze = isClozeDeck(deck);
  const key = getWordKey(word);
  wordDetailDeckName.textContent = deck.name;
  wordDetailRange.textContent = formatRangeSummaryLabel(word.lesson);
  wordDetailMainLabel.textContent = isCloze ? "英文" : "英単語";
  wordDetailMain.textContent = getItemMainLabel(word);
  wordDetailSubLabel.textContent = isCloze ? "日本語訳" : "日本語";
  wordDetailSub.textContent = getItemSubLabel(word);
  wordDetailAnswerBlock.classList.toggle("is-hidden", !isCloze);
  wordDetailAnswer.textContent = isCloze ? word.answer : "";
  wordDetailBookmarkButton.dataset.bookmarkKey = encodeURIComponent(key);
  updateWordDetailBookmarkButton(isBookmarked(word, deck.id));
}

function toggleWordDetailBookmark() {
  const key = wordDetailBookmarkButton.dataset.bookmarkKey;
  if (!key) return;
  toggleWordListBookmarkByKey(decodeURIComponent(key));
  const deck = getSelectedDeck();
  if (!deck) return;
  const word = deck.words.find((item) => getWordKey(item) === decodeURIComponent(key));
  if (!word) return;
  updateWordDetailBookmarkButton(isBookmarked(word, deck.id));
}

function updateWordDetailBookmarkButton(bookmarked) {
  wordDetailBookmarkButton.classList.toggle("is-bookmarked", bookmarked);
  wordDetailBookmarkButton.textContent = bookmarked ? "しおり解除" : "しおりに追加";
}

function getItemMainLabel(word) {
  return word.english;
}

function getItemSubLabel(word) {
  return formatJapanese(word);
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

function toggleReviewSummaryBookmarkByKey(key) {
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
  syncReviewListSnapshotBookmark(deck.id, key, !willRemove);
  renderBookmarkPanel(deck);
  renderDataManagementState(deck);
  updateStartState(deck);
  if (screens.learningRecord.classList.contains("is-active")) renderWeaknessSummary(deck);
  if (session?.current) renderBookmarkButton();
  showToast(willRemove ? "しおりを外しました。" : "しおりを付けました。");
}

function syncReviewListSnapshotBookmark(deckId, key, isBookmarkedNow) {
  if (!reviewListSnapshot || reviewListSnapshot.deckId !== deckId) return;
  const keys = new Set(reviewListSnapshot.keys || []);
  if (isBookmarkedNow) {
    keys.add(key);
  } else {
    keys.delete(key);
  }
  reviewListSnapshot = {
    ...reviewListSnapshot,
    keys: [...keys],
  };
}

function updateWordListBookmarkButtons(key, isBookmarkedNow) {
  document
    .querySelectorAll('[data-action="toggle-list-bookmark"]')
    .forEach((button) => {
      if (button.dataset.bookmarkKey !== encodeURIComponent(key)) return;
      button.classList.toggle("is-bookmarked", isBookmarkedNow);
      button.textContent = isBookmarkedNow ? "しおり解除" : "しおりに追加";
    });
  if (wordDetailBookmarkButton.dataset.bookmarkKey === encodeURIComponent(key)) {
    updateWordDetailBookmarkButton(isBookmarkedNow);
  }
}

function renderStudyHintButton() {
  const canShowHint = Boolean(session?.current?.initialHint && session.mode === "cloze-input" && !session.locked);
  hintCurrentButton.classList.toggle("is-hidden", !canShowHint);
  hintCurrentButton.disabled = !canShowHint;
  hintCurrentButton.classList.toggle("is-active", Boolean(canShowHint && session.current.hint === session.current.initialHint));
  hintCurrentButton.textContent = session.current.hint === session.current.initialHint ? "ヒント非表示" : "ヒント";
}

function showCurrentHint() {
  if (!session?.current?.initialHint || session.locked) return;
  const willHide = session.current.hint === session.current.initialHint;
  session.current.hint = willHide ? "" : session.current.initialHint;
  answerNote.textContent = session.current.hint;
  renderStudyHintButton();
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
    correctStreak: 0,
    answered: 0,
    wrongWords: [],
    wrongItems: [],
    challenge: setup.challenge,
    timeLimit,
    reviewSources: { ...setup.reviewSources },
    startedAt: Date.now(),
    historyRecorded: false,
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
  const unit = getDeckUnit(deck);
  const timeLimit = timeLimitOptions.find((option) => option.id === setup.timeLimit)?.value ?? null;
  const timeText = timeLimit ? ` 制限時間は1問${timeLimit}秒です。` : "";
  const orderText = setup.questionOrder === "smart" ? "おまかせ出題で" : "ランダムに";
  const sourceText = getActiveSourceLabel();

  startButton.disabled = !canStart;
  startButton.classList.toggle("is-disabled", !canStart);
  if (heroStartButton) {
    heroStartButton.disabled = !canStart;
    heroStartButton.classList.toggle("is-disabled", !canStart);
  }
  floatingStartButton.disabled = !canStart;
  floatingStartButton.classList.toggle("is-disabled", !canStart);
  floatingStartTitle.textContent = canStart ? "この設定で開始" : "開始できません";
  floatingStartTitle.classList.toggle("is-warning", !canStart);
  floatingStartDetail.textContent = getFloatingStartDetail(selectedCount, count);
  if (heroModeTitle) heroModeTitle.textContent = "いつもの10問";
  if (heroStartDetail) {
    heroStartDetail.textContent = canStart
      ? `${getFloatingStartDetail(selectedCount, count)}で始めましょう。`
      : "設定を見直すと開始できます。";
  }

  if (selectedCount === 0) {
    startNote.textContent = hasReviewSourceSelected()
      ? `選択中の範囲に復習セットの${unit === "問" ? "問題" : "単語"}がありません。範囲を広げるか、復習セットを切り替えてください。`
      : "出題範囲が未選択です。範囲を変更から選んでください。";
    startNote.className = "start-note is-warning";
  } else if (mode.type === "choice" && mode.id !== "cloze-choice" && selectedCount < 4) {
    startNote.textContent = hasReviewSourceSelected()
      ? `復習セットの4択は4語以上必要です。現在は${selectedCount}語です。`
      : `4択モードは選択範囲に4語以上必要です。現在は${selectedCount}語です。`;
    startNote.className = "start-note is-warning";
  } else if (!choiceReady) {
    startNote.textContent = isClozeDeck(deck)
      ? "4択候補に不備がある問題があります。CSVの choices と answer を確認してください。"
      : "4択を作れる候補が足りません。範囲を広げるか、別のモードを選んでください。";
    startNote.className = "start-note is-warning";
  } else if (count === "endless") {
    startNote.textContent = setup.challenge
      ? `${selectedCount}${unit}を一周ずつ${orderText}出題します。チャレンジモードは間違えたら終了です。${timeText}`
      : `${selectedCount}${unit}を一周ずつ${orderText}出題します。${timeText}`;
    startNote.className = "start-note";
  } else if (count === "all") {
    startNote.textContent = setup.challenge
      ? `${selectedCount}${unit}をすべて${orderText}出題します。チャレンジモードは間違えたら終了です。${timeText}`
      : `${selectedCount}${unit}をすべて${orderText}出題します。${timeText}`;
    startNote.className = "start-note";
  } else if (!canStart) {
    startNote.textContent = hasReviewSourceSelected()
      ? `復習セットは${selectedCount}${unit}です。${count}問にするにはあと${count - selectedCount}${unit}必要です。`
      : `選択範囲は${selectedCount}${unit}です。${count}問にするにはあと${count - selectedCount}${unit}必要です。`;
    startNote.className = "start-note is-warning";
  } else {
    startNote.textContent = setup.challenge
      ? `${sourceText}${selectedCount}${unit}から重複なしで${count}問、${orderText}出題します。チャレンジモードは間違えたら終了です。${timeText}`
      : `${sourceText}${selectedCount}${unit}から重複なしで${count}問、${orderText}出題します。${timeText}`;
    startNote.className = "start-note";
  }
  updateFloatingStartVisibility();
}

function getFloatingStartDetail(selectedCount, count) {
  const unit = getDeckUnit();
  const countLabel = count === "endless"
    ? "エンドレス"
    : count === "all"
      ? "全部"
      : `${count}問`;
  const sourceLabel = hasReviewSourceSelected() ? "復習セット" : "選択範囲";
  const orderLabel = hasReviewSourceSelected()
    ? "復習"
    : setup.questionOrder === "smart" ? "おまかせ" : "ランダム";
  return `${sourceLabel} ${selectedCount}${unit} / ${countLabel} / ${orderLabel}`;
}

function getActiveSourceLabel() {
  return hasReviewSourceSelected() ? "復習セット" : "選択範囲";
}

function canStartStudy(pool, count, mode = getSelectedMode()) {
  if (mode.type === "choice" && mode.id !== "cloze-choice" && pool.length < 4) return false;
  if (mode.type === "choice" && !canBuildChoicesForPool(pool, mode)) return false;
  if (setup.challenge && count === "endless") return false;
  if (count === "endless" || count === "all") return pool.length > 0;
  return pool.length >= count;
}

function canBuildChoicesForPool(pool, mode) {
  if (mode.id === "cloze-choice") {
    return pool.every((word) => Array.isArray(word.choices)
      && word.choices.length === 4
      && new Set(word.choices.map(normalizeEnglish)).size === 4
      && word.choices.some((choice) => normalizeEnglish(choice) === normalizeEnglish(word.answer)));
  }
  const labels = new Set(pool.map((word) => getChoiceLabel(word, mode)));
  return labels.size >= 4;
}

function getChoiceLabel(word, mode) {
  if (mode.id === "cloze-choice") return word.answer;
  return mode.id === "choice-en-ja" ? formatJapanese(word) : word.english;
}

function renderQuestion() {
  stopQuestionTimer({ resetState: true });
  const mode = getAvailableModes(session.deck).find((item) => item.id === session.mode) || getSelectedMode();
  const word = session.count === "endless" ? getEndlessWord() : session.questions[session.index];
  session.current = buildQuestion(word, mode);
  session.locked = false;
  document.body.classList.remove("study-input-active");
  document.body.classList.toggle("study-cloze-active", session.current.kind === "cloze");
  document.body.classList.toggle("study-choice-active", mode.type === "choice");
  document.body.classList.toggle("study-writing-active", mode.type === "input");

  feedback.textContent = "";
  feedback.className = "feedback";
  answerNote.textContent = session.current.hint || "";
  clozeExplanationButton.classList.add("is-hidden");
  nextButton.classList.add("is-hidden");
  if (session.current.kind === "cloze") {
    setClozeQuestion(session.current.prompt, session.current.promptJa);
  } else {
    setQuestionText(session.current.prompt);
  }
  renderBookmarkButton();
  renderStudyHintButton();
  updateStudyStatus();

  if (mode.type === "input") {
    renderInputAnswer();
  } else {
    renderChoiceAnswer();
  }
  startQuestionTimer();
}

function setQuestionText(text) {
  questionText.closest(".question-card")?.classList.remove("is-cloze-question");
  questionText.innerHTML = "";
  const value = String(text);
  questionText.textContent = value;
  questionText.classList.remove(
    "is-single-token",
    "is-japanese",
    "is-long",
    "is-very-long",
    "is-extra-long",
    "is-cloze",
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

function setClozeQuestion(english, japanese) {
  const settings = getAppSettings();
  questionText.closest(".question-card")?.classList.add("is-cloze-question");
  questionText.classList.remove(
    "is-single-token",
    "is-japanese",
    "is-long",
    "is-very-long",
    "is-extra-long",
    "is-cloze",
  );
  questionText.classList.add("is-cloze");
  const englishHtml = escapeHtml(english).replace("_", '<span class="cloze-blank" aria-label="空欄"></span>');
  const englishLengthClass = getClozeTextLengthClass(english);
  const englishClass = `cloze-english${englishLengthClass}`;
  const layoutEnglishClass = getClozeLayoutLengthClass(englishLengthClass);
  const japaneseClass = `cloze-japanese${getClozeJapaneseLengthClass(japanese)}`;
  const hasJapanese = Boolean(settings.showClozeJapanese && japanese);
  const japaneseHtml = hasJapanese
    ? `<div class="cloze-japanese-scroll"><span class="${japaneseClass}">${escapeHtml(japanese)}</span></div>`
    : "";
  questionText.innerHTML = `
    <div class="cloze-layout${hasJapanese ? "" : " without-japanese"}${layoutEnglishClass}">
      <div class="cloze-english-scroll"><span class="${englishClass}">${englishHtml}</span></div>
      ${japaneseHtml}
    </div>
  `;
}

function getClozeLayoutLengthClass(className) {
  return String(className)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => ` has-${name.replace(/^is-/, "")}`)
    .join("");
}

function getClozeTextLengthClass(text) {
  const length = getCompactLength(text);
  const wordCount = getEnglishWordCount(text);
  let className = "";
  if (length >= 120) className += " is-extra-long";
  else if (length >= 92) className += " is-very-long";
  else if (length >= 68) className += " is-long";
  if (wordCount >= 16) className += " is-very-wordy";
  else if (wordCount >= 10) className += " is-wordy";
  return className;
}

function getClozeJapaneseLengthClass(text) {
  const length = getCompactLength(text);
  if (length >= 56) return " is-very-long";
  if (length >= 36) return " is-long";
  return "";
}

function getCompactLength(text) {
  return String(text).replace(/\s+/g, "").length;
}

function getEnglishWordCount(text) {
  return String(text)
    .replace(/_/g, " blank ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
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
    session.correctStreak = Number(session.correctStreak || 0) + 1;
    feedback.textContent = "○";
    feedback.classList.add("correct");
  } else {
    session.correctStreak = 0;
    addWrongWord(session.current.word);
    addWrongItem(session.current, userAnswer);
    feedback.textContent = "×";
    feedback.classList.add("wrong");
  }
  answerNote.textContent = isCorrect ? getCorrectStreakMessage(session.correctStreak) : note;
  renderClozeAnswerSummary(isCorrect, note, userAnswer, options);
  if (session.challenge && !isCorrect) {
    deleteSavedProgress(session.deck.id);
    showResultScreen();
    return;
  }
  nextButton.textContent = isLastQuestion() ? "結果を見る" : "次へ";
  if (session.count === "endless") nextButton.textContent = "次へ";
  if (!options.inlineNext) nextButton.classList.remove("is-hidden");
  renderStudyHintButton();
  updateStudyStatus();
}

function renderClozeAnswerSummary(isCorrect, note, userAnswer = "", options = {}) {
  if (session.current.kind !== "cloze") return;
  const explanation = String(session.current.explanation || "").trim();
  const canShowExplanation = session.mode === "cloze-choice" && Boolean(explanation);
  clozeExplanationButton.classList.toggle("is-hidden", !canShowExplanation);
}

function getCorrectStreakMessage(streak) {
  const count = Number(streak || 0);
  if (count >= 50 && count % 50 === 0) return `${count}連続正解！完全にゾーン入ってる`;
  if (count === 10) return "10連続正解！すごい集中力";
  if (count >= 10) return `${count}連続正解！`;
  if (count === 5) return "5連続正解！いい調子";
  if (count >= 3) return `${count}連続正解！`;
  return "正解！";
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
  recordStudyHistory();
  applyAfterStudyActions();
  renderResult({ prepareAnimation: true });
  showScreen("result");
  playResultAnimations();
}

function recordStudyHistory() {
  if (!session?.deck?.id || session.historyRecorded) return;
  session.historyRecorded = true;
  const deckId = session.deck.id;
  const deckStats = getDeckStats(deckId);
  const entry = {
    id: createId(),
    at: new Date().toISOString(),
    mode: session.mode,
    count: session.count,
    answered: Number(session.answered || 0),
    correct: Number(session.correct || 0),
    wrong: Math.max(0, Number(session.answered || 0) - Number(session.correct || 0)),
    accuracy: getAccuracy(),
    challenge: Boolean(session.challenge),
    timeLimit: session.timeLimit || null,
    questionOrder: session.questionOrder || "random",
    reviewSources: { ...(session.reviewSources || {}) },
    durationMs: session.startedAt ? Date.now() - session.startedAt : 0,
  };
  state.stats = {
    ...(state.stats || {}),
    [deckId]: {
      ...deckStats,
      histories: [entry, ...deckStats.histories].slice(0, 100),
    },
  };
  saveState();
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
  const historyCount = deckStats.histories.length;
  openStudyHistoryButton.disabled = historyCount === 0;
  openStudyHistoryButton.textContent = historyCount > 0 ? `履歴を見る (${historyCount})` : "履歴なし";
  renderRecordGoal(todayStats.answered);
  recordTodayAnswered.textContent = todayStats.answered;
  recordTodayCorrect.textContent = todayStats.correct;
  recordTodayAccuracy.textContent = todayStats.answered > 0
    ? `${Math.round((todayStats.correct / todayStats.answered) * 100)}%`
    : "0%";
  recordStreakDays.textContent = `${getCurrentStreak(deckStats)}日`;

  renderWeaknessSummary(deck);
}

function renderStudyHistoryDialog(deck = getSelectedDeck()) {
  if (!deck) return;
  const histories = getDeckStats(deck.id).histories;
  studyHistoryDeckName.textContent = deck.name;
  studyHistoryList.innerHTML = "";
  if (histories.length === 0) {
    studyHistoryList.innerHTML = '<p class="empty-state compact">まだ学習履歴がありません。学習を完了するとここに残ります。</p>';
    return;
  }

  histories.slice(0, studyHistoryVisibleCount).forEach((entry) => {
    const article = document.createElement("article");
    article.className = "study-history-item";
    const correct = Number(entry.correct || 0);
    const answered = Number(entry.answered || 0);
    const wrong = Number(entry.wrong || Math.max(0, answered - correct));
    const accuracyText = answered > 0 ? `${Math.round((correct / answered) * 100)}%` : "0%";
    const timeText = entry.timeLimit ? `制限 ${entry.timeLimit}秒` : "制限なし";
    const challengeText = entry.challenge ? "チャレンジ" : "通常";
    const sourceText = getHistorySourceLabel(entry);
    article.innerHTML = `
      <div class="study-history-main">
        <div>
          <strong>${escapeHtml(formatHistoryDate(entry.at))}</strong>
          <span>${escapeHtml(getModeLabel(entry.mode))}</span>
        </div>
        <div class="study-history-score">
          <strong>${correct}/${answered}</strong>
          <span>${accuracyText}</span>
        </div>
      </div>
      <p>${escapeHtml(`${challengeText} / ${getQuestionOrderLabel(entry.questionOrder)} / ${timeText}${sourceText}`)}</p>
      <small>不正解 ${wrong}${getDeckUnit(deck)}・学習時間 ${formatDuration(entry.durationMs)}</small>
    `;
    studyHistoryList.appendChild(article);
  });

  if (histories.length > studyHistoryVisibleCount) {
    const moreButton = document.createElement("button");
    moreButton.className = "secondary-button study-history-more-button";
    moreButton.type = "button";
    moreButton.dataset.action = "show-more-history";
    moreButton.textContent = `さらに表示（${Math.min(STUDY_HISTORY_PAGE_SIZE, histories.length - studyHistoryVisibleCount)}件）`;
    studyHistoryList.appendChild(moreButton);
  }
}

function getModeLabel(modeId) {
  return modes.find((mode) => mode.id === modeId)?.label || "学習";
}

function getQuestionOrderLabel(orderId) {
  return questionOrderOptions.find((option) => option.id === orderId)?.label || "ランダム";
}

function getHistorySourceLabel(entry) {
  const sources = entry.reviewSources || {};
  const labels = [];
  if (sources.bookmarks) labels.push("しおり");
  if (sources.recentMistakes) labels.push("最近ミス");
  if (sources.smartWeak) labels.push("苦手のみ");
  return labels.length > 0 ? ` / ${labels.join("+")}` : "";
}

function formatHistoryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日時不明";
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

function formatDuration(durationMs) {
  const totalSeconds = Math.max(0, Math.round(Number(durationMs || 0) / 1000));
  if (totalSeconds < 60) return `${totalSeconds}秒`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分`;
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
  weaknessCategoryTab.classList.toggle("is-selected", weaknessSummaryView === "category");
  weaknessProblemTab.classList.toggle("is-selected", weaknessSummaryView === "problem");
  weaknessCategoryTab.setAttribute("aria-pressed", String(weaknessSummaryView === "category"));
  weaknessProblemTab.setAttribute("aria-pressed", String(weaknessSummaryView === "problem"));
  const summaries = weaknessSummaryView === "problem"
    ? getWeaknessProblemSummaries(deck)
    : getWeaknessSummaries(deck);
  weaknessSummaryList.innerHTML = "";
  if (summaries.length === 0) {
    weaknessSummaryList.innerHTML = '<p class="empty-state compact">まだ弱点データがありません。学習するとここに表示されます。</p>';
    return;
  }

  summaries.forEach((item, index) => {
    const card = document.createElement("div");
    if (weaknessSummaryView === "problem") {
      const bookmarked = isBookmarked(item.word, deck.id);
      const answerLine = isClozeDeck(deck)
        ? `<small>${escapeHtml(item.answerLabel)}</small>`
        : "";
      card.className = `weakness-card weakness-card-problem${bookmarked ? " is-bookmarked" : ""}`;
      card.innerHTML = `
        <div class="weakness-problem-main">
          <span class="weakness-rank">${index + 1}</span>
          <div class="weakness-problem-lines">
            <strong>${escapeHtml(item.label)}</strong>
            <p>${escapeHtml(getItemSubLabel(item.word))}</p>
            ${answerLine}
          </div>
        </div>
        <div class="weakness-problem-side">
          <p><strong>${item.wrong}</strong>ミス ${item.answered}回答 <span class="weakness-rate-inline">ミス率 ${item.rate}%</span></p>
          <small class="weakness-rate-block">ミス率 ${item.rate}%</small>
          <button class="secondary-button small weakness-bookmark-button${bookmarked ? " is-bookmarked" : ""}" type="button" data-action="toggle-review-bookmark" data-bookmark-key="${encodeURIComponent(getWordKey(item.word))}">${bookmarked ? "しおり解除" : "しおりに追加"}</button>
        </div>
      `;
    } else {
      card.className = "weakness-card";
      card.innerHTML = `
        <div>
          <span class="weakness-rank">${index + 1}</span>
          <strong>${escapeHtml(item.label)}</strong>
        </div>
        <p>${item.wrong}ミス / ${item.answered}回答</p>
        <small>ミス率 ${item.rate}%</small>
      `;
    }
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
    .slice(0, WEAKNESS_SUMMARY_LIMIT);
}

function getWeaknessProblemSummaries(deck) {
  const records = state.learning?.[deck.id] || {};
  return deck.words
    .map((word) => {
      const record = records[getWordKey(word)];
      if (!record || !record.wrong) return null;
      const answered = Number(record.seen || 0);
      const wrong = Number(record.wrong || 0);
      return {
        word,
        label: getItemMainLabel(word),
        answerLabel: isClozeDeck(deck) ? `正解: ${word.answer}` : getItemSubLabel(word),
        answered,
        wrong,
        rate: Math.round((wrong / Math.max(1, answered)) * 100),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.wrong - a.wrong || b.rate - a.rate || b.answered - a.answered)
    .slice(0, WEAKNESS_SUMMARY_LIMIT);
}

function renderResult(options = {}) {
  renderResultSummary();
  renderResultGoal({ prepareAnimation: Boolean(options.prepareAnimation) });

  const wrongList = document.querySelector("#wrong-list");
  const itemName = isClozeDeck(session.deck) ? "問題" : "単語";
  document.querySelector(".wrong-section-head h2").textContent = `間違えた${itemName}`;
  document.querySelectorAll('[data-result-action="retry-wrong"]').forEach((button) => {
    button.textContent = `間違えた${itemName}だけ`;
  });
  setRetryButtonsHidden(session.challenge || session.wrongWords.length === 0);
  updateWrongBookmarkBulkButton();
  wrongList.innerHTML = "";
  if (session.wrongWords.length === 0) {
    wrongList.innerHTML = '<p>全問正解です。</p>';
    return;
  }

  const wrongItems = session.wrongItems?.length ? session.wrongItems : session.wrongWords.map((word) => ({
    word,
    prompt: isClozeDeck(session.deck) ? word.english : formatJapanese(word),
    answer: isClozeDeck(session.deck) ? word.answer : word.english,
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
        ${isClozeDeck(session.deck) ? `<span>${escapeHtml(formatJapanese(wrongItem.word))}</span>` : ""}
      </div>
      <div class="wrong-detail">
        <dl>
          ${wrongItem.userAnswer ? `<div><dt>回答</dt><dd>${escapeHtml(wrongItem.userAnswer)}</dd></div>` : ""}
          <div><dt>正解</dt><dd>${escapeHtml(wrongItem.answer)}</dd></div>
        </dl>
        <button class="secondary-button small wrong-bookmark-button${bookmarked ? " is-bookmarked" : ""}" type="button" data-action="toggle-result-bookmark" data-bookmark-key="${encodeURIComponent(wordKey)}">${bookmarked ? "しおり解除" : "しおりに追加"}</button>
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
  summary.classList.remove("is-presenting");
  summary.classList.toggle("is-challenge-result", Boolean(session.challenge));

  if (session.challenge) {
    const failed = session.answered > session.correct;
    document.querySelector("#result-correct").textContent = failed ? "× 失敗" : "○ 成功";
    document.querySelector("#result-correct").parentElement.classList.toggle("is-failed", failed);
    document.querySelector("#result-correct").parentElement.classList.toggle("is-cleared", !failed);
    document.querySelector("#result-correct").nextElementSibling.textContent = "";
    document.querySelector("#result-wrong").textContent = `${session.correct}問`;
    document.querySelector("#result-wrong").nextElementSibling.textContent = "連続正解";
    document.querySelector("#result-accuracy").textContent = "";
    return;
  }

  document.querySelector("#result-correct").parentElement.classList.remove("is-failed", "is-cleared");
  document.querySelector("#result-wrong").parentElement.classList.remove("is-failed", "is-cleared");
  document.querySelector("#result-accuracy").parentElement.classList.remove("is-failed", "is-cleared");
  document.querySelector("#result-correct").textContent = session.correct;
  document.querySelector("#result-correct").nextElementSibling.textContent = "正解";
  document.querySelector("#result-wrong").textContent = session.answered - session.correct;
  document.querySelector("#result-wrong").nextElementSibling.textContent = "不正解";
  document.querySelector("#result-accuracy").textContent = `${getAccuracy()}%`;
  document.querySelector("#result-accuracy").nextElementSibling.textContent = "正答率";
}

function renderResultGoal(options = {}) {
  const goal = Number(getAppSettings().dailyGoal || 0);
  if (!session?.deck || goal <= 0) {
    resultGoalPanel.classList.add("is-hidden");
    resultGoalProgress.dataset.targetWidth = "0%";
    resultGoalProgress.style.width = "0%";
    return;
  }
  const todayStats = getDeckStats(session.deck.id).days?.[getTodayKey()] || createEmptyDayStats();
  resultGoalPanel.classList.remove("is-hidden");
  renderGoalProgress(todayStats.answered, goal, null, resultGoalDetail, resultGoalProgress);
  resultGoalProgress.dataset.targetWidth = resultGoalProgress.style.width || "0%";
  if (options.prepareAnimation) resultGoalProgress.style.width = "0%";
  resultGoalPanel.classList.toggle("is-complete", todayStats.answered >= goal);
}

function playResultAnimations() {
  const summary = document.querySelector(".result-summary");
  summary.classList.remove("is-presenting");
  void summary.offsetWidth;
  summary.classList.add("is-presenting");

  if (resultGoalPanel.classList.contains("is-hidden")) return;
  const targetWidth = resultGoalProgress.dataset.targetWidth || resultGoalProgress.style.width || "0%";
  resultGoalProgress.style.width = "0%";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resultGoalProgress.style.width = targetWidth;
    });
  });
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
    correctStreak: 0,
    answered: 0,
    wrongWords: [],
    wrongItems: [],
    count: wrongWords.length,
    startedAt: Date.now(),
    historyRecorded: false,
    afterStudyActionsApplied: false,
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
  const itemName = isClozeDeck(session.deck) ? "問題" : "単語";
  showToast(allBookmarked ? `間違えた${itemName}のしおりを解除しました。` : `間違えた${itemName}をしおりに追加しました。`);
}

function updateStudyStatus() {
  const currentNumber = session.count === "endless" ? session.answered + 1 : Math.min(session.index + 1, session.questions.length);
  const total = session.count === "endless" ? "∞" : session.questions.length;
  questionCount.textContent = `${currentNumber} / ${total}`;
  accuracy.textContent = `正答率 ${getAccuracy()}%`;
}

function getSelectedMode() {
  const deck = getSelectedDeck();
  return getAvailableModes(deck).find((item) => item.id === setup.mode) || getAvailableModes(deck)[0];
}

function getAvailableModes(deck = getSelectedDeck()) {
  const kind = getDeckKind(deck);
  return modes.filter((mode) => {
    if (kind === "cloze") return mode.deckKind === "cloze";
    return !mode.deckKind;
  });
}

function getDefaultModeId(deck = getSelectedDeck()) {
  return isClozeDeck(deck) ? DEFAULT_CLOZE_MODE_ID : DEFAULT_MODE_ID;
}

function getDeckKind(deck) {
  return deck?.kind === "cloze" ? "cloze" : "word";
}

function isClozeDeck(deck) {
  return getDeckKind(deck) === "cloze";
}

function normalizeDeck(deck) {
  if (!deck) return null;
  if (!deck.kind) deck.kind = "word";
  return deck;
}

function buildQuestion(word, mode) {
  if (mode.id === "cloze-input") {
    return {
      kind: "cloze",
      word,
      prompt: word.english,
      promptJa: formatJapanese(word),
      answer: word.answer,
      explanation: word.explanation || "",
      hint: "",
      initialHint: getInitialAnswerHint(word.answer),
    };
  }

  if (mode.id === "cloze-choice") {
    const answerLabel = word.answer;
    return {
      kind: "cloze",
      word,
      prompt: word.english,
      promptJa: formatJapanese(word),
      answerLabel,
      explanation: word.explanation || "",
      choices: makeClozeChoices(word),
    };
  }

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

function makeClozeChoices(word) {
  const answer = normalizeEnglish(word.answer);
  return shuffle(word.choices).map((choice) => ({
    id: createId(),
    label: choice,
    isCorrect: normalizeEnglish(choice) === answer,
  }));
}

function getInitialAnswerHint(answer) {
  const firstLetter = String(answer || "").trim().charAt(0).toLowerCase();
  return firstLetter ? `ヒント: ${firstLetter} から始まります` : "";
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
    message: `${deck.name} の内部学習データを削除します。しおりやCSVのデータは残ります。`,
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

function confirmResetStudyRecord() {
  const deck = getSelectedDeck();
  if (!deck) return;
  const deckStats = getDeckStats(deck.id);
  const hasRecord = Object.keys(deckStats.days).length > 0
    || deckStats.histories.length > 0
    || Number(deckStats.streak || 0) > 0;
  if (!hasRecord) return;
  openConfirmDialog({
    title: "学習記録をリセットしますか？",
    message: `${deck.name} の回答数・今日の目標進捗・学習履歴を削除します。おまかせデータ、最近ミス、しおりは残ります。`,
    confirmLabel: "リセットする",
    cancelLabel: "やめる",
    onConfirm: () => resetStudyRecord(deck.id),
  });
}

function resetStudyRecord(deckId = selectedDeckId) {
  if (!deckId || !state.stats?.[deckId]) return;
  delete state.stats[deckId];
  saveState();
  const deck = getSelectedDeck();
  if (deck) {
    renderLearningRecordScreen();
    renderDataManagementState(deck);
  }
  showToast("学習記録をリセットしました。");
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
    histories: Array.isArray(current.histories) ? current.histories : [],
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
  const parts = [word.lesson, word.english, formatJapanese(word)];
  if (word.answer) parts.push(word.answer);
  return parts
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

function toggleReviewBookmarkByKey(key, deckId = selectedDeckId) {
  if (!deckId) return;
  const bookmarks = getBookmarkSet(deckId);
  if (bookmarks.has(key)) {
    bookmarks.delete(key);
  } else {
    bookmarks.add(key);
  }
  setBookmarkSet(deckId, bookmarks);
  const deck = getSelectedDeck();
  if (deck) {
    renderBookmarkPanel(deck);
    renderDataManagementState(deck);
    updateStartState(deck);
  }
  if (session?.current) renderBookmarkButton();
}

function handleReviewListBulkAction() {
  if (reviewListTab === "bookmarks") {
    confirmClearBookmarks();
    return;
  }
  toggleRecentMistakeBookmarksBulk();
}

function getVisibleRecentMistakeWords(deck) {
  const reviewContext = getReviewContext(deck);
  return getRecentMistakeWords(deck, { rangeSet: reviewContext.rangeSet });
}

function toggleRecentMistakeBookmarksBulk() {
  const deck = getSelectedDeck();
  if (!deck) return;
  const words = getVisibleRecentMistakeWords(deck);
  if (words.length === 0) return;

  const bookmarks = getBookmarkSet(deck.id);
  const missingWords = words.filter((word) => !bookmarks.has(getWordKey(word)));
  if (missingWords.length > 0) {
    missingWords.forEach((word) => bookmarks.add(getWordKey(word)));
    setBookmarkSet(deck.id, bookmarks);
    missingWords.forEach((word) => syncReviewListSnapshotBookmark(deck.id, getWordKey(word), true));
    renderBookmarkPanel(deck);
    renderDataManagementState(deck);
    updateStartState(deck);
    if (screens.learningRecord.classList.contains("is-active")) renderWeaknessSummary(deck);
    showToast(`最近ミス ${missingWords.length}件をしおりに追加しました。`);
    return;
  }

  openConfirmDialog({
    title: "最近ミスのしおりを解除しますか？",
    message: `表示中の最近ミス ${words.length}件のしおりを解除します。最近ミスの記録自体は残ります。`,
    confirmLabel: "解除する",
    cancelLabel: "やめる",
    onConfirm: () => clearRecentMistakeBookmarks(deck.id, words.map(getWordKey)),
  });
}

function clearRecentMistakeBookmarks(deckId, keys) {
  if (!deckId || keys.length === 0) return;
  const bookmarks = getBookmarkSet(deckId);
  keys.forEach((key) => {
    bookmarks.delete(key);
    syncReviewListSnapshotBookmark(deckId, key, false);
  });
  setBookmarkSet(deckId, bookmarks);
  normalizeReviewSources();
  const deck = getSelectedDeck();
  if (deck) {
    renderBookmarkPanel(deck);
    renderDataManagementState(deck);
    updateStartState(deck);
  }
  if (session?.current) renderBookmarkButton();
  showToast("表示中の最近ミスのしおりを解除しました。");
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
    renderDataManagementState(deck);
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
      weight: getSmartWordWeight(word, deck.id, {
        includeCoverage: false,
        includeRecentSeenPenalty: false,
      }),
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
        // 苦手・未出題・最近ミスを優先しつつ、直近出題は少し下げる重み付き並び替え。
        rank: -Math.log(random) / weight,
      };
    })
    .sort((a, b) => a.rank - b.rank)
    .map((item) => item.word);
}

function getSmartWordWeight(word, deckId, options = {}) {
  const record = getLearningRecord(deckId, word);
  const includeCoverage = options.includeCoverage !== false;
  const includeRecentSeenPenalty = options.includeRecentSeenPenalty !== false;
  const now = Date.now();
  if (!record.seen) return includeCoverage ? 4.8 : 0.7;

  let weight = 1;
  weight += getMistakePriority(record);
  if (includeCoverage) weight += getLowSeenBonus(record);
  weight += getRecentMistakeBonus(record, now);
  weight -= record.correct * 0.12;
  weight -= record.streak * 0.32;
  if (includeRecentSeenPenalty) weight -= getRecentSeenPenalty(record, now);
  weight += getReviewGapBonus(record, now);
  return Math.max(0.45, Math.min(10, weight));
}

function getMistakePriority(record) {
  return (Number(record.wrong || 0) * 1.8) + (Number(record.timedOut || 0) * 2.3);
}

function getLowSeenBonus(record) {
  const seen = Number(record.seen || 0);
  return Math.max(0, 5 - seen) * 0.65;
}

function getRecentMistakeBonus(record, now = Date.now()) {
  let bonus = 0;
  if (record.lastResult === "wrong") bonus += 2.2;
  if (record.lastResult === "timedOut") bonus += 2.6;

  const lastWrongAt = getLastWrongAt(record);
  if (!lastWrongAt) return bonus;
  const days = (now - lastWrongAt) / 86400000;
  if (days <= 1) bonus += 1.2;
  else if (days <= 3) bonus += 0.8;
  else if (days <= 7) bonus += 0.45;
  return bonus;
}

function getRecentSeenPenalty(record, now = Date.now()) {
  if (!record.lastAt) return 0;
  const minutes = (now - record.lastAt) / 60000;
  if (minutes <= 10) return 2.2;
  if (minutes <= 60) return 1.5;
  if (minutes <= 360) return 0.8;
  if (minutes <= 1440) return 0.35;
  return 0;
}

function getReviewGapBonus(record, now = Date.now()) {
  if (!record.lastAt) return 0;
  const days = (now - record.lastAt) / 86400000;
  if (days < 7) return 0;
  return Math.min(1.4, days / 14);
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
      correctStreak: session.correctStreak || 0,
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
    showToast("前回の続きはCSVデータが変わったため破棄しました。", "error");
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
    correctStreak: Number(progress.correctStreak || 0),
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
    reviewSources: { ...setup.reviewSources },
    startedAt: Date.now(),
    historyRecorded: false,
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
    message: "保存されている途中経過を削除します。CSVデータやしおりは残ります。",
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
  const key = getWordKey(word);
  if (!session.wrongWords.some((item) => getWordKey(item) === key)) {
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

function getDeckSummary(words, groups = getStudyGroups(words), deck = getSelectedDeck()) {
  const unit = getDeckUnit(deck);
  const lessonCount = groups.filter((group) => group.type === "lesson").length;
  const specialCount = groups.length - lessonCount;
  const parts = [`${words.length}${unit}`];
  if (lessonCount > 0) parts.push(`${lessonCount} Lesson`);
  if (specialCount > 0) parts.push(`${specialCount} 別枠`);
  return parts.join("・");
}

function getDeckUnit(deck = getSelectedDeck()) {
  return isClozeDeck(deck) ? "問" : "語";
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
    .replace(/\s+/g, "");
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
    const parsed = parseDeckCsv(text);
    const { kind, words } = parsed;
    if (kind === "word" && words.length < 4) {
      showToast("4択を作るため、少なくとも4語以上のCSVを取り込んでください。", "error");
      return;
    }
    const deck = {
      id: createId(),
      name: file.name.replace(/\.csv$/i, ""),
      kind,
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
  normalizeDeck(deck);
  state.decks.unshift(deck);
  saveState();
  renderDecks();
  showToast(`${deck.name} を${deck.words.length}${getDeckUnit(deck)}で取り込みました。`);
}

function replaceDeck(existingDeckId, deck) {
  normalizeDeck(deck);
  state.decks = state.decks.map((item) => (item.id === existingDeckId ? { ...deck, id: existingDeckId } : item));
  if (state.learning) delete state.learning[existingDeckId];
  if (state.progress) delete state.progress[existingDeckId];
  if (state.stats) delete state.stats[existingDeckId];
  if (state.presets) delete state.presets[existingDeckId];
  saveState();
  renderDecks();
  showToast(`${deck.name} を${deck.words.length}${getDeckUnit(deck)}で置き換えました。`);
}

function parseDeckCsv(text) {
  const rows = parseCsv(text.replace(/^\uFEFF/, "")).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) throw new Error("CSVにデータがありません。");

  const headers = rows[0].map((cell) => cell.trim().toLowerCase());
  if (hasHeaders(headers, ["stage", "question_english", "question_japanese", "choices", "answer"])) {
    return { kind: "cloze", words: parseClozeRows(rows, headers) };
  }
  if (hasHeaders(headers, ["lesson", "english", "japanese"])) {
    return { kind: "word", words: parseWordRows(rows, headers) };
  }
  throw new Error("CSVの1行目に lesson, english, japanese または stage, question_english, question_japanese, choices, answer の列名が必要です。穴埋めの explanation は任意です。");
}

function hasHeaders(headers, required) {
  return required.every((name) => headers.includes(name));
}

function parseWordRows(rows, headers) {
  const lessonIndex = headers.indexOf("lesson");
  const englishIndex = headers.indexOf("english");
  const japaneseIndex = headers.indexOf("japanese");

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

function parseClozeRows(rows, headers) {
  const stageIndex = headers.indexOf("stage");
  const englishIndex = headers.indexOf("question_english");
  const japaneseIndex = headers.indexOf("question_japanese");
  const choicesIndex = headers.indexOf("choices");
  const answerIndex = headers.indexOf("answer");
  const explanationIndex = headers.indexOf("explanation");

  return rows.slice(1).map((row, index) => {
    const rowNumber = index + 2;
    const lesson = row[stageIndex]?.trim();
    const english = row[englishIndex]?.trim();
    const japaneseText = row[japaneseIndex]?.trim();
    const choices = row[choicesIndex]
      ?.split("/")
      .map((item) => item.trim())
      .filter(Boolean);
    const answer = row[answerIndex]?.trim();
    const explanation = explanationIndex >= 0 ? row[explanationIndex]?.trim() || "" : "";

    if (!lesson || !english || !japaneseText || !choices?.length || !answer) {
      throw new Error(`${rowNumber}行目に空の項目があります。`);
    }
    const blankCount = (english.match(/_/g) || []).length;
    if (blankCount !== 1) {
      throw new Error(`${rowNumber}行目の question_english には _ を1つだけ入れてください。`);
    }
    if (choices.length !== 4) {
      throw new Error(`${rowNumber}行目の choices は / 区切りで4つにしてください。`);
    }
    const normalizedChoices = choices.map(normalizeEnglish);
    if (new Set(normalizedChoices).size !== choices.length) {
      throw new Error(`${rowNumber}行目の choices に重複があります。`);
    }
    if (!normalizedChoices.includes(normalizeEnglish(answer))) {
      throw new Error(`${rowNumber}行目の answer は choices のいずれかと一致させてください。`);
    }

    return {
      lesson,
      english,
      japanese: [japaneseText],
      choices,
      answer,
      explanation,
      kind: "cloze",
    };
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

function addSampleClozeDeck() {
  if (state.decks.some((deck) => deck.name === sampleClozeDeck.name)) {
    showToast("穴埋めサンプルはすでに追加されています。");
    return;
  }

  const sample = {
    ...sampleClozeDeck,
    id: createId(),
    createdAt: new Date().toISOString(),
  };
  state.decks.unshift(sample);
  saveState();
  renderDecks();
  showToast("穴埋めサンプルを追加しました。");
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
