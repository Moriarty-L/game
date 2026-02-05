// 游戏配置
const GAME_CONFIG = {
  // 不同难度对应的棋盘尺寸（长方形）
  difficulties: {
    easy: {
      levels: [
        { size: [3, 6], totalTiles: 18 },
        { size: [4, 6], totalTiles: 24 },
        { size: [4, 8], totalTiles: 32 },
        { size: [5, 8], totalTiles: 40 },
        { size: [5, 10], totalTiles: 50 },
        { size: [6, 10], totalTiles: 60 },
      ],
    },
    normal: {
      levels: [
        { size: [4, 8], totalTiles: 32 },
        { size: [4, 10], totalTiles: 40 },
        { size: [5, 10], totalTiles: 50 },
        { size: [5, 12], totalTiles: 60 },
        { size: [6, 12], totalTiles: 72 },
        { size: [6, 14], totalTiles: 84 },
      ],
    },
  },

  // 图标类型（使用image文件夹中的图片）
  icons: [
    "image/微信图片_20260205175916_34_60.jpg",
    "image/微信图片_20260205175918_35_60.jpg",
    "image/微信图片_20260205175922_37_60.jpg",
    "image/微信图片_20260205175923_38_60.jpg",
    "image/微信图片_20260205175924_39_60.jpg",
    "image/微信图片_20260205175925_40_60.jpg",
    "image/微信图片_20260205175927_41_60.jpg",
    "image/微信图片_20260205175927_42_60.jpg",
    "image/微信图片_20260205180101_43_60.jpg",
    "image/微信图片_20260205180102_44_60.jpg",
    "image/微信图片_20260205180104_45_60.jpg",
    "image/微信图片_20260205180104_46_60.jpg",
    "image/微信图片_20260205180105_47_60.jpg",
    "image/微信图片_20260205180106_48_60.jpg",
    "image/微信图片_20260205180107_49_60.jpg",
    "image/微信图片_20260205180109_50_60.jpg",
    "image/微信图片_20260205180110_51_60.jpg",
    "image/微信图片_20260205180212_52_60.jpg",
    "image/微信图片_20260205180213_53_60.jpg",
    "image/微信图片_20260205180215_54_60.jpg",
    "image/微信图片_20260205180215_55_60.jpg",
    "image/微信图片_20260205180216_56_60.jpg",
  ],

  // 提示次数
  maxHints: 3,
  // 关卡数量
  totalLevels: 6,
};

// 游戏状态
let gameState = {
  currentDifficulty: "easy",
  currentLevel: 0,
  selectedTile: null,
  matchedPairs: 0,
  totalPairs: 0,
  startTime: 0,
  elapsedTime: 0,
  timerInterval: null,
  hintsRemaining: GAME_CONFIG.maxHints,
  gameBoard: [],
  levelProgress: {
    easy: Array(GAME_CONFIG.totalLevels).fill(false),
    normal: Array(GAME_CONFIG.totalLevels).fill(false),
  },
};

// DOM元素
const elements = {
  gameBoard: document.querySelector(".game-board"),
  levelButtons: document.querySelector(".level-buttons"),
  difficultyButtons: document.querySelectorAll(".difficulty-btn"),
  timer: document.querySelector(".timer"),
  hints: document.querySelector(".hints"),
  hintBtn: document.querySelector(".hint-btn"),
  shuffleBtn: document.querySelector(".shuffle-btn"),
  gameOverModal: document.querySelector(".game-over-modal"),
  resultTime: document.querySelector(".result-time"),
  resultPairs: document.querySelector(".result-pairs"),
  nextLevelBtn: document.querySelector(".next-level-btn"),
  restartBtn: document.querySelector(".restart-btn"),
  closeModalBtn: document.querySelector(".close-modal-btn"),
  helpModal: document.querySelector(".help-modal"),
  helpBtn: document.querySelector(".help-btn"),
  closeHelpBtn: document.querySelector(".close-help-btn"),
};

// 初始化游戏
function initGame() {
  loadGameProgress();
  generateLevelButtons();
  setupEventListeners();
  startGame();
}

// 加载游戏进度
function loadGameProgress() {
  const savedProgress = localStorage.getItem("matchThreeProgress");
  if (savedProgress) {
    const parsedProgress = JSON.parse(savedProgress);
    gameState.levelProgress = parsedProgress;
  }
}

// 保存游戏进度
function saveGameProgress() {
  localStorage.setItem(
    "matchThreeProgress",
    JSON.stringify(gameState.levelProgress),
  );
}

// 生成关卡按钮
function generateLevelButtons() {
  elements.levelButtons.innerHTML = "";

  for (let i = 0; i < GAME_CONFIG.totalLevels; i++) {
    const levelBtn = document.createElement("button");
    levelBtn.className = "level-btn";
    levelBtn.textContent = i + 1;
    levelBtn.dataset.level = i;

    // 检查关卡是否解锁
    if (
      i === 0 ||
      gameState.levelProgress[gameState.currentDifficulty][i - 1]
    ) {
      levelBtn.addEventListener("click", () => {
        gameState.currentLevel = i;
        startGame();
      });
    } else {
      levelBtn.classList.add("locked");
    }

    // 当前关卡高亮
    if (i === gameState.currentLevel) {
      levelBtn.classList.add("active");
    }

    elements.levelButtons.appendChild(levelBtn);
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 难度切换
  elements.difficultyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      elements.difficultyButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.currentDifficulty = btn.dataset.difficulty;
      gameState.currentLevel = 0;
      generateLevelButtons();
      startGame();
    });
  });

  // 提示按钮
  elements.hintBtn.addEventListener("click", () => {
    if (gameState.hintsRemaining > 0) {
      showHint();
      gameState.hintsRemaining--;
      elements.hints.textContent = `提示: ${gameState.hintsRemaining}`;
    }
  });

  // 重排按钮
  elements.shuffleBtn.addEventListener("click", shuffleTiles);

  // 游戏结束弹窗按钮
  elements.nextLevelBtn.addEventListener("click", nextLevel);
  elements.restartBtn.addEventListener("click", restartGame);
  elements.closeModalBtn.addEventListener("click", closeModal);

  // 帮助按钮
  elements.helpBtn.addEventListener("click", () => {
    elements.helpModal.classList.add("show");
  });

  elements.closeHelpBtn.addEventListener("click", () => {
    elements.helpModal.classList.remove("show");
  });
}

// 开始游戏
function startGame() {
  // 重置游戏状态
  gameState.selectedTile = null;
  gameState.matchedPairs = 0;
  gameState.hintsRemaining = GAME_CONFIG.maxHints;
  gameState.elapsedTime = 0;

  // 更新UI
  elements.hints.textContent = `提示: ${gameState.hintsRemaining}`;
  elements.timer.textContent = "时间: 00:00";

  // 清除之前的定时器
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  // 生成棋盘
  generateGameBoard();

  // 开始计时
  gameState.startTime = Date.now();
  gameState.timerInterval = setInterval(updateTimer, 1000);
}

// 检查棋盘是否有可消除的对
function hasValidPairs() {
  for (let i = 0; i < gameState.gameBoard.length; i++) {
    for (let j = 0; j < gameState.gameBoard[i].length; j++) {
      const tile1 = gameState.gameBoard[i][j];
      if (!tile1 || tile1.matched) continue;

      for (let k = 0; k < gameState.gameBoard.length; k++) {
        for (let l = 0; l < gameState.gameBoard[k].length; l++) {
          const tile2 = gameState.gameBoard[k][l];
          if (!tile2 || tile2.matched) continue;
          if (i === k && j === l) continue;
          if (tile1.icon === tile2.icon && canConnect(i, j, k, l)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// 生成游戏棋盘
function generateGameBoard() {
  const currentLevel =
    GAME_CONFIG.difficulties[gameState.currentDifficulty].levels[
      gameState.currentLevel
    ];
  const [rows, cols] = currentLevel.size;
  const totalTiles = currentLevel.totalTiles;

  // 设置棋盘网格
  elements.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 75px)`;
  elements.gameBoard.style.gridTemplateRows = `repeat(${rows}, 75px)`;

  let validBoard = false;
  let attempts = 0;
  const maxAttempts = 500; // 增加尝试次数

  while (!validBoard && attempts < maxAttempts) {
    attempts++;

    // 确保总格子数是偶数
    const adjustedTotalTiles =
      totalTiles % 2 === 0 ? totalTiles : totalTiles - 1;
    const adjustedTotalPairs = Math.floor(adjustedTotalTiles / 2);

    // 生成图标序列
    const iconSequence = [];
    for (let i = 0; i < adjustedTotalPairs; i++) {
      // 确保图标种类足够多，避免重复度过高
      const randomIcon =
        GAME_CONFIG.icons[Math.floor(Math.random() * GAME_CONFIG.icons.length)];
      iconSequence.push(randomIcon);
    }

    // 复制图标以确保成对
    const fullIconSequence = [...iconSequence, ...iconSequence];

    // 打乱图标
    shuffleArray(fullIconSequence);

    // 生成棋盘数据结构
    gameState.gameBoard = [];
    let index = 0;

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        if (index < fullIconSequence.length) {
          row.push({
            icon: fullIconSequence[index],
            position: [i, j],
            matched: false,
          });
          index++;
        } else {
          row.push(null); // 处理多余格子的情况
        }
      }
      gameState.gameBoard.push(row);
    }

    // 更新游戏状态中的总对数
    gameState.totalPairs = adjustedTotalPairs;

    // 检查棋盘是否有可消除的对
    if (hasValidPairs()) {
      validBoard = true;
    }
  }

  // 即使达到最大尝试次数，也要确保有一个可玩的棋盘
  if (!validBoard) {
    // 如果没有找到有效棋盘，使用简单的方法生成一个有解的棋盘
    generateSimpleValidBoard(rows, cols, totalTiles);
  }

  // 渲染棋盘
  renderGameBoard();
}

// 渲染游戏棋盘
function renderGameBoard() {
  elements.gameBoard.innerHTML = "";

  gameState.gameBoard.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile && !tile.matched) {
        const tileElement = document.createElement("div");
        tileElement.className = "tile";
        tileElement.dataset.row = rowIndex;
        tileElement.dataset.col = colIndex;
        // 使用背景图片显示图标
        tileElement.style.backgroundImage = `url('${tile.icon}')`;
        tileElement.addEventListener("click", () =>
          selectTile(rowIndex, colIndex),
        );
        elements.gameBoard.appendChild(tileElement);
      } else {
        // 创建空元素占位
        const emptyElement = document.createElement("div");
        emptyElement.style.width = "75px";
        emptyElement.style.height = "75px";
        elements.gameBoard.appendChild(emptyElement);
      }
    });
  });
}

// 选择棋子
function selectTile(row, col) {
  const tile = gameState.gameBoard[row][col];

  if (!tile || tile.matched) return;

  // 如果已经选择了一个棋子，检查是否可以匹配
  if (gameState.selectedTile) {
    const selectedRow = gameState.selectedTile.position[0];
    const selectedCol = gameState.selectedTile.position[1];

    // 检查是否是同一个棋子
    if (row === selectedRow && col === selectedCol) {
      return;
    }

    // 检查图标是否相同
    if (tile.icon === gameState.selectedTile.icon) {
      // 检查是否可以连接
      if (canConnect(selectedRow, selectedCol, row, col)) {
        // 匹配成功
        matchTiles(selectedRow, selectedCol, row, col);
      }
    }

    // 清除选择状态
    clearSelection();
  } else {
    // 选择第一个棋子
    gameState.selectedTile = tile;
    const selectedElement = document.querySelector(
      `.tile[data-row="${row}"][data-col="${col}"]`,
    );
    if (selectedElement) {
      selectedElement.classList.add("selected");
    }
  }
}

// 清除选择状态
function clearSelection() {
  const selectedElements = document.querySelectorAll(".tile.selected");
  selectedElements.forEach((el) => el.classList.remove("selected"));
  gameState.selectedTile = null;
}

// 检查两个棋子是否可以连接
function canConnect(row1, col1, row2, col2) {
  // 检查水平直连
  if (row1 === row2 && isPathClear(row1, col1, row2, col2)) {
    return true;
  }

  // 检查垂直直连
  if (col1 === col2 && isPathClear(row1, col1, row2, col2)) {
    return true;
  }

  // 检查一次拐弯连接
  // 右上角拐点
  if (
    isPathClear(row1, col1, row1, col2) &&
    isPathClear(row1, col2, row2, col2)
  ) {
    return true;
  }

  // 左上角拐点
  if (
    isPathClear(row1, col1, row2, col1) &&
    isPathClear(row2, col1, row2, col2)
  ) {
    return true;
  }

  return false;
}

// 检查路径是否清晰
function isPathClear(row1, col1, row2, col2) {
  // 水平路径
  if (row1 === row2) {
    const startCol = Math.min(col1, col2);
    const endCol = Math.max(col1, col2);

    for (let col = startCol + 1; col < endCol; col++) {
      if (
        gameState.gameBoard[row1][col] &&
        !gameState.gameBoard[row1][col].matched
      ) {
        return false;
      }
    }
  }

  // 垂直路径
  if (col1 === col2) {
    const startRow = Math.min(row1, row2);
    const endRow = Math.max(row1, row2);

    for (let row = startRow + 1; row < endRow; row++) {
      if (
        gameState.gameBoard[row][col1] &&
        !gameState.gameBoard[row][col1].matched
      ) {
        return false;
      }
    }
  }

  return true;
}

// 匹配棋子
function matchTiles(row1, col1, row2, col2) {
  // 更新游戏状态
  gameState.gameBoard[row1][col1].matched = true;
  gameState.gameBoard[row2][col2].matched = true;
  gameState.matchedPairs++;

  // 视觉反馈
  const tile1 = document.querySelector(
    `.tile[data-row="${row1}"][data-col="${col1}"]`,
  );
  const tile2 = document.querySelector(
    `.tile[data-row="${row2}"][data-col="${col2}"]`,
  );

  if (tile1 && tile2) {
    tile1.classList.add("matched");
    tile2.classList.add("matched");
  }

  // 记录被消除图案所在的列
  const affectedCols = new Set();
  affectedCols.add(col1);
  affectedCols.add(col2);

  // 等待匹配动画完成后，执行下落逻辑
  setTimeout(() => {
    // 执行下落逻辑，只处理被消除图案所在的列
    applyGravity(Array.from(affectedCols));

    // 检查游戏是否结束
    if (gameState.matchedPairs === gameState.totalPairs) {
      endGame();
    }
  }, 500);
}

// 应用重力效果，使棋子下落
function applyGravity(affectedCols) {
  const rows = gameState.gameBoard.length;

  // 只处理被消除图案所在的列
  for (const col of affectedCols) {
    let emptyRow = -1;

    // 从下往上查找空位置
    for (let row = rows - 1; row >= 0; row--) {
      if (
        gameState.gameBoard[row][col] &&
        gameState.gameBoard[row][col].matched
      ) {
        // 标记空位置
        if (emptyRow === -1) {
          emptyRow = row;
        }
      } else if (
        gameState.gameBoard[row][col] &&
        !gameState.gameBoard[row][col].matched &&
        emptyRow !== -1
      ) {
        // 将棋子移动到空位置
        gameState.gameBoard[emptyRow][col] = gameState.gameBoard[row][col];
        gameState.gameBoard[emptyRow][col].position = [emptyRow, col];
        gameState.gameBoard[row][col] = {
          icon: null,
          position: [row, col],
          matched: true,
        };

        // 上移空位置标记
        emptyRow--;
      }
    }
  }

  // 重新渲染棋盘并添加下落动画
  renderGameBoardWithAnimation(affectedCols);
}

// 重新渲染棋盘并添加下落动画
function renderGameBoardWithAnimation(affectedCols) {
  elements.gameBoard.innerHTML = "";

  gameState.gameBoard.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile && !tile.matched) {
        const tileElement = document.createElement("div");
        // 只有被影响列的棋子才添加下落动画
        tileElement.className = affectedCols.includes(colIndex)
          ? "tile falling"
          : "tile";
        tileElement.dataset.row = rowIndex;
        tileElement.dataset.col = colIndex;
        // 使用背景图片显示图标
        tileElement.style.backgroundImage = `url('${tile.icon}')`;
        tileElement.addEventListener("click", () =>
          selectTile(rowIndex, colIndex),
        );
        elements.gameBoard.appendChild(tileElement);
      } else {
        // 创建空元素占位
        const emptyElement = document.createElement("div");
        emptyElement.style.width = "75px";
        emptyElement.style.height = "75px";
        elements.gameBoard.appendChild(emptyElement);
      }
    });
  });
}

// 生成一个简单的有解棋盘
function generateSimpleValidBoard(rows, cols, totalTiles) {
  // 确保总格子数是偶数
  const adjustedTotalTiles = totalTiles % 2 === 0 ? totalTiles : totalTiles - 1;
  const adjustedTotalPairs = Math.floor(adjustedTotalTiles / 2);

  // 生成图标序列
  const iconSequence = [];
  for (let i = 0; i < adjustedTotalPairs; i++) {
    const randomIcon =
      GAME_CONFIG.icons[Math.floor(Math.random() * GAME_CONFIG.icons.length)];
    iconSequence.push(randomIcon);
  }

  // 创建一个确保有解的棋盘布局
  gameState.gameBoard = [];
  let index = 0;

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      if (index < adjustedTotalTiles) {
        // 简单布局：确保每对图标相邻，保证有解
        const icon = iconSequence[Math.floor(index / 2)];
        row.push({
          icon: icon,
          position: [i, j],
          matched: false,
        });
        index++;
      } else {
        row.push(null);
      }
    }
    gameState.gameBoard.push(row);
  }

  // 更新游戏状态中的总对数
  gameState.totalPairs = adjustedTotalPairs;

  // 确保棋盘至少有一对可消除的图标
  console.log("Generated simple valid board");
}

// 结束游戏
function endGame() {
  // 清除定时器
  clearInterval(gameState.timerInterval);

  // 计算游戏时间
  const endTime = Date.now();
  gameState.elapsedTime = Math.floor((endTime - gameState.startTime) / 1000);

  // 更新关卡进度
  gameState.levelProgress[gameState.currentDifficulty][gameState.currentLevel] =
    true;
  saveGameProgress();

  // 显示游戏结束弹窗
  const minutes = Math.floor(gameState.elapsedTime / 60);
  const seconds = gameState.elapsedTime % 60;
  elements.resultTime.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  elements.resultPairs.textContent = gameState.matchedPairs;

  elements.gameOverModal.classList.add("show");

  // 检查是否有下一关
  if (gameState.currentLevel >= GAME_CONFIG.totalLevels - 1) {
    elements.nextLevelBtn.disabled = true;
    elements.nextLevelBtn.textContent = "已完成所有关卡";
  } else {
    elements.nextLevelBtn.disabled = false;
    elements.nextLevelBtn.textContent = "下一关";
  }
}

// 下一关
function nextLevel() {
  if (gameState.currentLevel < GAME_CONFIG.totalLevels - 1) {
    gameState.currentLevel++;
    closeModal();
    startGame();
    generateLevelButtons();
  }
}

// 重新开始
function restartGame() {
  closeModal();
  startGame();
}

// 关闭弹窗
function closeModal() {
  elements.gameOverModal.classList.remove("show");
}

// 显示提示
function showHint() {
  // 遍历所有棋子，寻找可以匹配的对
  for (let i = 0; i < gameState.gameBoard.length; i++) {
    for (let j = 0; j < gameState.gameBoard[i].length; j++) {
      const tile1 = gameState.gameBoard[i][j];
      if (!tile1 || tile1.matched) continue;

      for (let k = 0; k < gameState.gameBoard.length; k++) {
        for (let l = 0; l < gameState.gameBoard[k].length; l++) {
          const tile2 = gameState.gameBoard[k][l];
          if (!tile2 || tile2.matched) continue;
          if (i === k && j === l) continue;
          if (tile1.icon === tile2.icon && canConnect(i, j, k, l)) {
            // 高亮提示的棋子
            const tile1Element = document.querySelector(
              `.tile[data-row="${i}"][data-col="${j}"]`,
            );
            const tile2Element = document.querySelector(
              `.tile[data-row="${k}"][data-col="${l}"]`,
            );

            if (tile1Element && tile2Element) {
              tile1Element.classList.add("selected");
              tile2Element.classList.add("selected");

              // 3秒后移除高亮
              setTimeout(() => {
                tile1Element.classList.remove("selected");
                tile2Element.classList.remove("selected");
              }, 3000);
            }

            return;
          }
        }
      }
    }
  }
}

// 重排棋子
function shuffleTiles() {
  // 收集所有未匹配的棋子
  const unmatchedTiles = [];

  gameState.gameBoard.forEach((row) => {
    row.forEach((tile) => {
      if (tile && !tile.matched) {
        unmatchedTiles.push(tile);
      }
    });
  });

  // 打乱棋子
  shuffleArray(unmatchedTiles);

  // 重新填充棋盘
  let index = 0;
  gameState.gameBoard.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile && !tile.matched) {
        gameState.gameBoard[rowIndex][colIndex].icon =
          unmatchedTiles[index].icon;
        index++;
      }
    });
  });

  // 重新渲染棋盘
  renderGameBoard();
}

// 更新计时器
function updateTimer() {
  const currentTime = Date.now();
  const elapsedTime = Math.floor((currentTime - gameState.startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  elements.timer.textContent = `时间: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// 打乱数组
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 初始化游戏
window.addEventListener("DOMContentLoaded", initGame);
