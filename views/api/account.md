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
* __205__ 清除所有系統資料，轉至系統設定畫面
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
* __205__ 清除所有系統資料，轉至系統設定畫面
* __400__ 缺少參數，或參數不正確
* __500__ 內部伺服器錯誤

#### Output
* __message__ 若http code不為2XX，將會傳回錯誤訊息。
* __id__ 客戶代碼
* __password__ 預設密碼

#### Example
> JSON Format which request GetCustomerID API
>
>		{
>			"user": "802172",
>			"password": "password",
>			"device_id": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvJb60",
>			"app_id": "dQIDAQAB"
>		}
>
> JSON Format which response from GetCustomerID API
>
>		{
>			"client_id": "8506400952701030",
>			"client_token": "MBHUSO3Fcc-722NJVcopeEfnvd112fdCd_i977hbAcxzpoiIYUdeds-rfvds346fDewrfv="
>		}

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
* __205__ 清除所有系統資料，轉至系統設定畫面
* __400__ 缺少參數，或參數不正確
* __401__ 帳號或密碼錯誤
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
* __205__ 清除所有系統資料，轉至系統設定畫面
* __400__ 缺少參數，或參數不正確
* __401__ 帳號或密碼錯誤
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
> JSON Format which request ClientConfig API
>
>		{
>			"id": "8506400952701030",
>			"email": "jacky.lee@foxconn.com",
>			"mobile_phone": "0932000000",
>			"work_phone": "5500000"
>		}
>
> JSON Format which response from ClientConfig API
>
>		{
>			"id": "8506400952701030",
>			"user": "802172",
>			"org": "foxconn",
>			"email": "jacky.lee@foxconn.com",
>			"mobile_phone": "0932000000",
>			"work_phone": "5500000"
>		}

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
> JSON Format which request ChangePassword API
>
>		{
>			"userId": "8506400952701030",
>			"password": "password",
>			"newpassword": "new_password"
>		}
> JSON Format which response from ChangePassword API
>
>		{
>			"id": "8506400952701030"
>		}

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
> JSON Format which request ResetPassword API
>
>		{
>			"userId": "8506400952701030"
>		}
> JSON Format which response from ResetPassword API
>
>		{
>			"id": "8506400952701030",
>			"passowrd": "d7cjm9"
>		}

---