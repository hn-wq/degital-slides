# Local Bridge デジタル勉強会

大学生向けの生成AI勉強会のスライドサイトです。HTML・CSS・JavaScriptで動きます。第1回の公開対象は前半30分の全15枚です。

## ファイル構成

| パス | 役割 |
| --- | --- |
| `index.html` | 全3回のスライド一覧。公開済みの回へのリンクを掲載 |
| `styles.css` | スライド一覧のスタイル |
| `session-01/index.html` | 第1回のスライド本文、図解、操作画面 |
| `session-01/styles.css` | 第1回の16:9表示、スマホ表示、印刷スタイル |
| `session-01/script.js` | 第1回のページ移動、用途切り替え、費用対効果の試算 |
| `.nojekyll` | GitHub PagesでJekyllの処理をスキップする空ファイル |
| `AGENTS.md` | Codexで編集するときのデザイン原則と実装ルール |

第1回の図解はHTML内のインラインSVGです。回ごとの画像が増えたら、その回の `assets/` に置き、`./assets/ファイル名` で参照します。

## ローカルで確認する

展開したフォルダの `index.html` をブラウザで開き、一覧から第1回へ進みます。第1回を直接開く場合は、`session-01/index.html` を開きます。第1回のCSSとJavaScriptが入ったフォルダごと保持してください。

HTTPでも確認したいときは、Pythonが利用できる環境で、リポジトリのルートから `python3 -m http.server 8000` を実行し、ブラウザで [localhost:8000](http://localhost:8000/) を開けます。開発サーバーの起動や依存パッケージのインストールは任意です。

## GitHub Pagesで公開する

1. ZIPを展開し、`index.html`、`.nojekyll`、`session-01/` などをリポジトリのルートに置きます。展開先のフォルダをもう一段入れ子にせず、先頭の `index.html` がリポジトリのルートにあることを確認します。OSの設定によっては `.nojekyll` が隠れて表示されます。
2. 確認用ブランチで変更し、`main` を対象にプルリクエストを作成します。レビュー後にマージした内容が公開対象になります。公開リポジトリ内のファイルは閲覧できるため、発表者ノートなど公開を意図しない資料は手元で管理します。
3. リポジトリの `Settings` → `Pages` で、`Source` に `Deploy from a branch`、ブランチに `main`、フォルダに `/(root)` を選んで保存します。
4. デプロイ後、Pages画面に出る公開URLを開きます。公開URLの末尾に `session-01/#slide-11` を付けると、第1回の11枚目を直接開けます。

第1回の旧共有URL（一覧のURLに `#slide-1`〜`#slide-15` を付けたもの）は、JavaScriptが有効なブラウザでは移動先の同じスライドを開きます。

[GitHub Pagesの公開元設定](https://docs.github.com/ja/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Codexで第1回を更新する

1. Codexでこのリポジトリを開き、`AGENTS.md` に沿って変更を依頼します。
2. 本文・図は `session-01/index.html`、表示は `session-01/styles.css`、操作と試算は `session-01/script.js` を編集します。一覧のタイトルや説明も変える場合は、ルートの `index.html` を更新します。
3. 差分を見て、対象スライド、操作、スマホ表示を確認します。確認後に `main` へ変更を反映すると、そのブランチを公開元としてPagesが再デプロイします。

## 第2回・第3回を追加する

1. `session-02/` または `session-03/` を作り、その回の入口を `index.html` とします。同じ操作を使いたい場合は `session-01/` の3ファイルを複製して編集できます。
2. 回ごとのCSS・JavaScript・画像は各回のフォルダ内に置き、`./styles.css`、`./script.js`、`./assets/...` のように参照します。ページ番号のリンク先になる `id="slide-1"` などは、新しい回の中で重複しないようにします。枚数を変えたら、初期表示の枚数も更新します。
3. ルートの `index.html` で該当行の「公開予定」を `./session-02/index.html` または `./session-03/index.html` へのリンクに置き換えます。一覧から各回へ移動できることを確認します。
