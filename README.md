# 教師數獨學習單產生器

Vite + 原生 JavaScript，繁體中文響應式介面，無後端。第二階段提供真正的數獨批次產生；第三階段使用 pdf-lib 在瀏覽器直接匯出 PDF。

## 雲端開發

Node.js 20.19+ 或 22.12+。在雲端 checkout 執行 `npm ci`、`npm run dev`。若預設 npm 快取不可寫，可加上 `--cache /workspace/shared/npm-cache`。驗證指令為 `npm test` 與 `npm run build`。

## 使用方式

支援 6×6（2×3 宮格）及 9×9（3×3 宮格）。每批輸入 1～20 題。可設定標題、每頁題數與學生欄位，題目採唯讀顯示。輸入相同 Seed、尺寸、難度與數量可重現整批結果；留空 Seed 會產生並顯示新的 Seed。要換一批題目，請清空或更換 Seed。

## 產生與分級

產生完整合法解答，再逐格移除數字；每次保留的移除均通過唯一解與邏輯可解性檢查。批次以八種旋轉／鏡射及首次出現順序的數字正規化排除等價題目。每批最多嘗試「題數 × 100」次，失敗會回報原因。

兩種尺寸目前都使用相同保守標準：只需 Naked Single 為「入門」；需要 Hidden Single 為「簡單」。無法由這兩種技巧完成的題目回傳未分級，不會提供給使用者。中等、困難、專家尚未開放；Locked Candidates 與 Naked Pairs 尚未實作。分級反映此解題器的技巧順序，不代表普遍一致的人類難度。

`src/modules` 包含 sudokuGenerator、sudokuSolver、difficultyGrader 與尚未實作的 pdfExporter。測試涵蓋規則、唯一解、答案對應、Seed、數量限制、等價排除與邏輯技巧。

Vite base path 為 `/sudoku-worksheet/`，本階段不部署 GitHub Pages。

## PDF 使用方法

先產生題目，再選擇 A4 每頁 1、2、4 或 6 題，並按「下載題目 PDF」、「下載答案 PDF」或「下載題目＋答案 PDF」。6×6 預設每頁 4 題，9×9 預設每頁 2 題。9×9 每頁 6 題會顯示尺寸提醒。三種下載都使用同一批題目與答案，不會重新產生。下載後可再次下載。檔名包含下載日期、尺寸、難度及類型。

PDF 由瀏覽器產生，無需後端。首次下載會載入約 5.7 MB 的 Noto Sans TC 字型資源；此字型依 SIL Open Font License 1.1 再散布，授權檔位於 `public/fonts/OFL.txt`。PDF 內嵌完整的精簡字型檔，以便在 Windows、Edge、Chrome 與一般 PDF 閱讀器顯示繁體中文。PDF 內容由已產生的題目與目前排版設定決定；下載日期只影響檔名。部分罕用或擴充區文字若字型不支援，匯出會顯示錯誤。

### PDF 字型與視覺回歸測試

Noto Sans TC 約 5.7 MB，僅在首次匯出時載入。匯出的 PDF 會完整嵌入此字型；目前版本的 pdf-lib/fontkit 對此字型使用 PDF 子集時，文字抽取結果正常，但渲染器會漏掉大部分字形，因此不能啟用 PDF 字型子集。完整嵌入使單份 PDF 約增加 3.7 MB，但可正確繪製標題、題號及格內數字。

`npm test` 的 PDF 視覺回歸測試需要 `pdftotext`、`pdftoppm`、Python 3 與 Pillow。測試會將 PDF 轉成圖片，逐格比對實際可見的提示數字，並檢查標題和文字邊界。
