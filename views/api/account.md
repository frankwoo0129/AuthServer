### Account
> GET:  取得客戶代碼
> POST: 新增帳號

### Url
* /account

#### Method
* GET

#### Parameter
* __user__ `String` 使用者帳號(必填)
* __org__ `String` 公司名稱(必填)

#### HTTP code
* __200__ 表示成功
* __400__ 缺少參數，或參數不正確
* __500__ 內部伺服器錯誤

#### Output
* __message__ 若http code不為2XX，將會傳回錯誤訊息。
* __id__ 客戶代碼
* __user__ `String` 使用者帳號
* __org__ `String` 公司名稱

#### Method
* POST

#### Parameter
* __user__ `String` 使用者帳號(必填)
* __org__ `String` 公司名稱(必填)

#### HTTP code
* __200__ 表示成功
* __400__ 缺少參數，或參數不正確
* __500__ 內部伺服器錯誤

#### Output
* __message__ 若http code不為2XX，將會傳回錯誤訊息。
* __id__ 客戶代碼
* __user__ 客戶名稱(通常是工號)
* __org__ 公司名稱
* __password__ 預設密碼

---

### Profile
> GET:  取得email、行動電話
> POST: 編輯email、行動電話

### Url
* /account/profile

#### Method
* GET

#### Parameter
* __userId__ `String` 客戶代碼

#### HTTP code
* __200__ 表示成功
* __400__ 缺少參數，或參數不正確
* __401__ 認證錯誤
* __500__ 內部伺服器錯誤

#### Output
* __message__ 若http code不為2XX，將會傳回錯誤訊息。
* __id__ 客戶代碼
* __user__ 客戶名稱
* __org__ 客戶公司
* __email__ 公司電子郵件信箱
* __mobile_phone__ 行動電話
* __work_phone__ 辦公室分機

#### Method
* POST

#### Parameter
* __userId__ `String` 客戶代碼
* __email__ `String` 公司電子郵件信箱
* __mobile_phone__ `String` 行動電話
* __work_phone__ `String` 辦公室分機

#### HTTP code
* __200__ 表示成功
* __400__ 缺少參數，或參數不正確
* __401__ 認證錯誤
* __500__ 內部伺服器錯誤

#### Output
* __message__ 若http code不為2XX，將會傳回錯誤訊息。
* __id__ 客戶代碼
* __user__ 客戶名稱
* __org__ 客戶公司
* __email__ 公司電子郵件信箱
* __mobile_phone__ 行動電話
* __work_phone__ 辦公室分機

#### Example

```
POST /account/profile HTTP/1.1
Host: 10.63.4.28:8008
Authorization: Basic OWI2OTRkNDMxYmZjZmI1ZjUyZWIwNGUxMTk0MTiYzU6MWUyMzU3NTRhYzk4NzhkOTliMTRiZmZlZGJmZDY5Yzc=
Content-Type: application/x-www-form-urlencoded

userId=2d71cafc3a42a461b2bf367685353cee&email=frank.cc.su@foxconn.com

```

會得到以下的回傳：

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "id" : "2d71cafc3a42a461b2bf367685353cee",
  "org" : "foxconn",
  "user" : "829774",
  "work_phone" : "5506217",
  "email" : "frank.cc.su@foxconn.com"
}

```

---

### ChangePassword
> 變更密碼

#### Url
* /account/changepassword

#### Method
* POST

#### Parameter
* __userId__ `String` 客戶代碼(必填)
* __password__ `String` 原先密碼(必填，需用md5加密過)
* __newpassword__ `String` 新密碼(必填，需用md5加密過)

#### HTTP code
* __200__ 表示成功
* __205__ 清除所有系統資料，轉至系統設定畫面
* __400__ 缺少參數，或參數不正確
* __401__ 帳號或密碼錯誤
* __500__ 內部伺服器錯誤

#### Output
* __id__ 客戶代碼
* __message__ 若http code不為2XX，將會傳回錯誤訊息。

#### Example

```
POST /account/profile HTTP/1.1
Host: 10.63.4.28:8008
Authorization: Basic OWI2OTRkNDMxYmZjZmI1ZjUyZWIwNGUxMTk0MTiYzU6MWUyMzU3NTRhYzk4NzhkOTliMTRiZmZlZGJmZDY5Yzc=
Content-Type: application/x-www-form-urlencoded

userId=2d71cafc3a42a461b2bf367685353cee&password=password&newpassword=new_password

```

會得到以下的回傳：

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "id" : "2d71cafc3a42a461b2bf367685353cee"
}

```

---

### ResetPassword
> 重置密碼

#### Url
* /account/resetpassword

#### Method
* POST

#### Parameter
* __userId__ `String` 客戶代碼(必填)

#### HTTP code
* __200__ 表示成功
* __400__ 缺少參數，或參數不正確
* __404__ 無此帳號
* __500__ 內部伺服器錯誤

#### Output
* __id__ 客戶代碼
* __password__ 預設密碼
* __message__ 若http code不為2XX，將會傳回錯誤訊息。

#### Example

```
POST /account/profile HTTP/1.1
Host: 10.63.4.28:8008
Authorization: Basic OWI2OTRkNDMxYmZjZmI1ZjUyZWIwNGUxMTk0MTiYzU6MWUyMzU3NTRhYzk4NzhkOTliMTRiZmZlZGJmZDY5Yzc=
Content-Type: application/x-www-form-urlencoded

userId=2d71cafc3a42a461b2bf367685353cee

```

會得到以下的回傳：

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "id" : "2d71cafc3a42a461b2bf367685353cee",
  "password" : "d7cjm9"
}

```

---