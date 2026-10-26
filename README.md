# 教師數獨學習單產生器

Vite + 原生 JavaScript，繁體中文響應式介面，無後端。第二階段提供真正的數獨批次產生；PDF 匯出預留至第三階段，下載按鈕維持停用。

## 雲端開發

Node.js 20.19+ 或 22.12+。在雲端 checkout 執行 `npm ci`、`npm run dev`。若預設 npm 快取不可寫，可加上 `--cache /workspace/shared/npm-cache`。驗證指令為 `npm test` 與 `npm run build`。

## 使用方式

支援 6×6（2×3 宮格）及 9×9（3×3 宮格）。每批輸入 1～20 題。可設定標題、每頁題數與學生欄位，題目採唯讀顯示。輸入相同 Seed、尺寸、難度與數量可重現整批結果；留空 Seed 會產生並顯示新的 Seed。要換一批題目，請清空或更換 Seed。

## 產生與分級

產生完整合法解答，再逐格移除數字；每次保留的移除均通過唯一解與邏輯可解性檢查。批次以八種旋轉／鏡射及首次出現順序的數字正規化排除等價題目。每批最多嘗試「題數 × 100」次，失敗會回報原因。

兩種尺寸目前都使用相同保守標準：只需 Naked Single 為「入門」；需要 Hidden Single 為「簡單」。無法由這兩種技巧完成的題目回傳未分級，不會提供給使用者。中等、困難、專家尚未開放；Locked Candidates 與 Naked Pairs 尚未實作。分級反映此解題器的技巧順序，不代表普遍一致的人類難度。

`src/modules` 包含 sudokuGenerator、sudokuSolver、difficultyGrader 與尚未實作的 pdfExporter。測試涵蓋規則、唯一解、答案對應、Seed、數量限制、等價排除與邏輯技巧。

Vite base path 為 `/sudoku-worksheet/`，本階段不部署 GitHub Pages。
