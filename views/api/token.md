### GetToken
> 為取得該帳號的Token

#### Url
* /oauth/token

#### Method
* POST

#### Header
* __Authorization__ `String` 系統認證，用clientId和clientSecret組成base64編碼的字串，類型為Basic

#### Parameter
* __userId__ `String` 客戶代碼(依需求)
* __password__ `String` 客戶密碼(依需求)
* __refresh_token__ `String` refresh_token ID(依需求)
* __grant_type__ `String` (依需求，如用密碼認證，填password，如用refresh_token認證，填refresh_token)
	
#### HTTP code
* __200__ 表示成功
* __205__ 清除所有系統資料，轉至系統設定畫面
* __400__ 缺少參數，或參數不正確
* __500__ 內部伺服器錯誤

#### Output
* __message__ 若http code不為2XX，將會傳回錯誤訊息。
* __accress_token__ Access_Token的ID
* __refresh_token__ Refresh_Token的ID
* __expires_in__ Access Token有效秒數(例如傳回值為500表示為500秒後會失效)
* __token_type__ Access Token類型，通常回傳Bearer


#### Example

```
POST /oauth/token HTTP/1.1
Host: 10.63.4.28:8008
Authorization: Basic OWI2OTRkNDMxYmZjZmI1ZjUyZWIwNGUxMTk0MTiYzU6MWUyMzU3NTRhYzk4NzhkOTliMTRiZmZlZGJmZDY5Yzc=
Content-Type: application/x-www-form-urlencoded

grant_type=password&userId=f74635d55f387df83ba2aad77f734866&password=12345678

```

如果沒有錯誤，會得到以下的回傳：

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"Bearer",
  "expires_in":3600,
  "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA"
}

```

若Access Token過期可使用Refresh Token取得Access Token

```
POST /oauth/token HTTP/1.1
Host: 10.63.4.28:8008
Authorization: Basic OWI2OTRkNDMxYmZjZmI1ZjUyZWIwNGUxMTk0MTiYzU6MWUyMzU3NTRhYzk4NzhkOTliMTRiZmZlZGJmZDY5Yzc=
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA

```

如果沒有錯誤，會得到以下的回傳：

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"Bearer",
  "expires_in":3600
}

```