# 數獨學習單產生器

專為教師規劃的數獨 PDF 學習單網站。目前為第一階段：提供繁體中文的響應式設定介面及空白版面示意，尚未產生數獨題目或 PDF。

## 開始開發

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

執行 `npm run build` 建立靜態網站；`npm run preview` 可在本機檢查建置結果。Vite 的 `base` 已設定為 `/sudoku-worksheet/`，供日後部署至 GitHub Pages 使用。本階段不包含部署設定或正式發布。

## 目前介面

- 數獨尺寸：4×4、6×6、9×9；難度會依尺寸調整。
- 題數：5、10、20、50、100；A4 每頁 1、2、4、6 題。
- 自訂標題，以及班級、姓名、日期欄位的顯示選項。
- 空白版面示意、進度及錯誤訊息區。

「產生題目」及 PDF 下載按鈕目前停用；示意棋盤不是已產生的題目。

## 後續整合位置

`src/modules/` 預留 `sudokuGenerator`、`sudokuSolver`、`difficultyGrader` 和 `pdfExporter`。這些模組目前只會明確回報未實作。專案已加入 `pdf-lib` 依賴，後續可在 `pdfExporter` 使用它建立題目和解答 PDF。
