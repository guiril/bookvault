# API 文件

記錄 `server/api/` 目前的行為。修改 API 時要同步更新這份文件。

| Method | 路徑                        | 用途                 |
| ------ | --------------------------- | -------------------- |
| GET    | `/api/books/search`         | 搜尋 Google Books    |
| GET    | `/api/user-books`           | 取得書庫所有書       |
| POST   | `/api/user-books`           | 新增一本書           |
| GET    | `/api/user-books/:id`       | 取得一本書和它的筆記 |
| PATCH  | `/api/user-books/:id`       | 更新閱讀狀態         |
| DELETE | `/api/user-books/:id`       | 從書庫移除一本書     |
| GET    | `/api/user-books/:id/notes` | 取得一本書的筆記     |
| GET    | `/api/notes`                | 取得全部筆記         |
| POST   | `/api/notes`                | 新增筆記             |
| GET    | `/api/notes/:id`            | 取得單則筆記         |
| PUT    | `/api/notes/:id`            | 編輯筆記（整筆取代） |
| DELETE | `/api/notes/:id`            | 刪除筆記             |

## 共通規則

- 所有 API 都要登入，未登入回 `401 Unauthorized`。
- 錯誤回應的訊息放在 `statusMessage`。
- 資料不存在、資料屬於別人，或網址裡的 id 不是 UUID 格式，一律回 `404`，避免洩漏資料是否存在。
- 資料表操作失敗回 `500`，訊息依 API 而異，下方不逐一列出。

### 欄位的值

- 文字欄位會去掉前後空白。
- 新增時，選填欄位可以不傳，也可以傳 `null`；只有空白時也當作沒填。
- 更新時，要清空欄位就傳 `null`。

## 資料型別

定義在 `app/types/database.ts`。

```ts
interface BookDetails {
  google_books_id: string | null;
  title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
}

interface UserBook extends BookDetails {
  id: string;
  user_id: string;
  status: 'reading' | 'finished';
  started_at: string | null; // YYYY-MM-DD
  finished_at: string | null; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

interface Note {
  id: string;
  user_id: string;
  user_book_id: string | null; // null 是未分類
  content: string | null; // 舊欄位，只有舊筆記會有值
  excerpt: string | null; // 書中句子，有值就是摘要，沒有就是靈感
  page: number | null;
  thought: string | null;
  created_at: string;
  updated_at: string;
}
```

## 書籍搜尋

### `GET /api/books/search`

透過伺服器查 Google Books，API key 不會傳到瀏覽器。

| Query | 型別   | 必填 | 說明                   |
| ----- | ------ | ---- | ---------------------- |
| `q`   | string | 是   | 搜尋字詞，不能只有空白 |

**回傳：** `BookDetails[]`，最多 8 筆。

| 狀態 | 訊息                   | 情況                 |
| ---- | ---------------------- | -------------------- |
| 400  | `Missing search query` | 沒有 `q`，或只有空白 |

## 書庫

### `GET /api/user-books`

**回傳：** 書的陣列，依 `created_at` 由新到舊。每筆是 `UserBook` 加上 `note_count: number`，沒有筆記時是 `0`。

### `GET /api/user-books/:id`

**回傳：** `UserBook` 加上 `notes: Note[]`，筆記依 `created_at` 由新到舊，沒有筆記時是空陣列。

| 狀態 | 訊息                  | 情況                 |
| ---- | --------------------- | -------------------- |
| 404  | `User book not found` | 書不存在，或屬於別人 |

### `POST /api/user-books`

| 欄位              | 型別           | 必填 | 說明                                  |
| ----------------- | -------------- | ---- | ------------------------------------- |
| `title`           | string         | 是   | 不能只有空白                          |
| `author`          | string \| null | 否   | 沒填時存空字串                        |
| `google_books_id` | string \| null | 否   | 沒填時存 `null`；同一個使用者不能重複 |
| `cover_url`       | string \| null | 否   | 沒填時存 `null`                       |
| `description`     | string \| null | 否   | 沒填時存 `null`                       |

**回傳：** 新增的 `UserBook`。

| 狀態 | 訊息                      | 情況                      |
| ---- | ------------------------- | ------------------------- |
| 400  | `Missing title`           | 沒有 `title`，或只有空白  |
| 400  | `Invalid book fields`     | 選填欄位不是字串或 `null` |
| 409  | `Book already in library` | 這本書已經在書庫裡        |

### `PATCH /api/user-books/:id`

| 欄位          | 型別                      | 必填 | 說明                                            |
| ------------- | ------------------------- | ---- | ----------------------------------------------- |
| `status`      | `'reading' \| 'finished'` | 是   |                                                 |
| `started_at`  | string \| null            | 否   | 沒傳就維持原值                                  |
| `finished_at` | string \| null            | 否   | `finished` 時沒給就用今天；`reading` 時一律清空 |

**回傳：** 更新後的 `UserBook`。

| 狀態 | 訊息                                 | 情況                       |
| ---- | ------------------------------------ | -------------------------- |
| 400  | `Invalid status`                     | `status` 不是允許的值      |
| 400  | `Invalid date`                       | 日期格式錯誤，或日期不存在 |
| 400  | `Finished date is before start date` | 讀完日期早於開始日期       |
| 404  | `User book not found`                | 書不存在，或屬於別人       |

### `DELETE /api/user-books/:id`

書的筆記不會被刪除，會移到未分類（`user_book_id` 變成 `null`）。

**回傳：** `204`，沒有內容。

| 狀態 | 訊息                  | 情況                 |
| ---- | --------------------- | -------------------- |
| 404  | `User book not found` | 書不存在，或屬於別人 |

### `GET /api/user-books/:id/notes`

**回傳：** `Note[]`，依 `created_at` 由新到舊。書沒有筆記時回空陣列。

| 狀態 | 訊息                  | 情況                 |
| ---- | --------------------- | -------------------- |
| 404  | `User book not found` | 書不存在，或屬於別人 |

## 筆記

### 筆記內容規則

新增和編輯共用，定義在 `server/utils/note-fields.ts`。

- `excerpt`、`thought` 至少要有一個有內容。
- `excerpt`、`thought` 會去掉前後空白，只有空白時當作 `null`。
- `page` 是 1 到 99999 的整數，字串不算。
- 有 `page` 時一定要有 `excerpt`。

| 狀態 | 訊息                       | 情況                            |
| ---- | -------------------------- | ------------------------------- |
| 400  | `Invalid note text`        | `excerpt` 或 `thought` 不是字串 |
| 400  | `Missing note content`     | `excerpt`、`thought` 都沒有內容 |
| 400  | `Invalid page`             | `page` 不合法                   |
| 400  | `Page requires an excerpt` | 有 `page`，但沒有 `excerpt`     |

### `GET /api/notes`

**回傳：** 筆記陣列，依 `created_at` 由新到舊。每筆是 `Note` 加上 `user_book`，未分類時 `user_book` 是 `null`。

```ts
user_book: {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
} | null;
```

### `POST /api/notes`

| 欄位           | 型別           | 必填 | 說明                   |
| -------------- | -------------- | ---- | ---------------------- |
| `user_book_id` | string \| null | 否   | 沒傳或 `null` 是未分類 |
| `excerpt`      | string \| null | 否   | 見內容規則             |
| `page`         | number \| null | 否   | 見內容規則             |
| `thought`      | string \| null | 否   | 見內容規則             |

**回傳：** 新增的 `Note`。

除了內容規則的錯誤，還有：

| 狀態 | 訊息                   | 情況                          |
| ---- | ---------------------- | ----------------------------- |
| 400  | `Invalid user book id` | `user_book_id` 不是 UUID 格式 |
| 404  | `User book not found`  | 書不存在，或屬於別人          |

### `GET /api/notes/:id`

**回傳：** `Note` 加上 `user_book`，格式同 `GET /api/notes`。

| 狀態 | 訊息             | 情況                   |
| ---- | ---------------- | ---------------------- |
| 404  | `Note not found` | 筆記不存在，或屬於別人 |

### `PUT /api/notes/:id`

整筆取代，**四個欄位都必填**。要清空欄位時傳 `null`，不能省略。

| 欄位           | 型別           | 必填 | 說明                |
| -------------- | -------------- | ---- | ------------------- |
| `user_book_id` | string \| null | 是   | `null` 是移到未分類 |
| `excerpt`      | string \| null | 是   | 見內容規則          |
| `page`         | number \| null | 是   | 見內容規則          |
| `thought`      | string \| null | 是   | 見內容規則          |

**回傳：** 更新後的 `Note`。

除了內容規則的錯誤，還有：

| 狀態 | 訊息                   | 情況                                  |
| ---- | ---------------------- | ------------------------------------- |
| 400  | `Invalid user book id` | `user_book_id` 沒傳，或不是 UUID 格式 |
| 400  | `Missing note fields`  | `excerpt`、`page`、`thought` 有漏傳   |
| 404  | `Note not found`       | 筆記不存在，或屬於別人                |
| 404  | `User book not found`  | 要換到的書不存在，或屬於別人          |

### `DELETE /api/notes/:id`

**回傳：** `204`，沒有內容。

| 狀態 | 訊息             | 情況                   |
| ---- | ---------------- | ---------------------- |
| 404  | `Note not found` | 筆記不存在，或屬於別人 |
