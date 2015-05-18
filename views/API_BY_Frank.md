# Smart Office Application(SOA) API Design Specification

## Version
* 0.5 @Frank Su (4/15)
* 0.4 @Frank Su
* 0.3 @Frank Su
* 0.2.2 @Jacky Lee
* 0.2 @Frank Su
* 0.1 @Jacky Lee

## Authorization API

### DeviceID
> 傳送機器資訊，以利後續資料傳遞時之用途

### Url
* /device

#### Method
* POST

#### Parameter
* __clientId__ `String` APP註冊碼
* __lang__ `String` 語系(Default為繁體中文)
* __imei__ `String` Mobile上的IMEI
* __serial_id__ `String` Mobile序號
* __device_type__ `String` Mobile的類型
    * 例如: iPhone 5S iPad Android WebOS
* __os__ `String`平台作業OS
* __version__ `String` 平台作業版本

#### HTTP code
* __200__ 表示成功
* __205__ 清除所有系統資料，轉至系統設定畫面
* __400__ 缺少參數，或參數不正確
* __500__ 內部伺服器錯誤

#### Output
* __message__ `String` 若http code不為2XX，將會傳回錯誤訊息。
* __id__ `String` 機器代碼

#### Example
> JSON Format which request GetDeviceID API
>
>		{
>			"clientId": "dQIDAQAB",
>			"imei": "28390938203392",
>			"serial_id": "12xl03ld2001",
>			"device_type": "iPhone 5S",
>			"os": "iOS",
>			"version": "4.2"
>		}
>
> JSON Format which response from GetDeviceID API
>
>		{
>			"id": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvJb60"
>		}

---

### ClientID
> 傳送email、行動電話、帳號與密碼後，取得客戶代碼，以利後續資料傳遞時之用途

### Url
* /account

#### Method
* POST

#### Parameter
* __user__ `String` 使用者帳號(必填)
* __org__ `String` 公司名稱(必填)
* __password__ `String` 密碼(必填，需用md5加密過)
* __device_id__ `String` 機器代碼

#### HTTP code
* __200__ 表示成功
* __205__ 清除所有系統資料，轉至系統設定畫面
* __400__ 缺少參數，或參數不正確
* __401__ 帳號或密碼錯誤
* __500__ 內部伺服器錯誤

#### Output
* __message__ 若http code不為2XX，將會傳回錯誤訊息。
* __client_id__ 客戶代碼
* __client_token__ 客戶密鑰

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
> 傳送email、行動電話
> 尚未完成

### Url
* /account/profile

#### Method
* POST

#### Parameter
* __user__ `String` 客戶代碼
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
* __client_id__ 客戶代碼
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

### GetToken
> 為取得該帳號的Token

#### Url
* /oauth/token

#### Method
* POST

#### Header
* __Authorization__ `String`

#### Parameter
* __app_id__ `String` APP代碼(必填)
* __device_id__ `String` 機器代碼(依需求)
* __client_id__ `String` 客戶代碼(依需求)
* __client_token__ `String` 客戶密鑰(必填)
* __refresh_token__ `String` Refresh Token(依需求)
* __token_type__ `String` Token類型(必填)
	* access_token: 第一次取Token，需app_id，device_id，client_id, client_token
	* refresh_token: 之後取Token，需app_id，client_token，refresh_token
	
#### HTTP code
* __200__ 表示成功
* __205__ 清除所有系統資料，轉至系統設定畫面
* __400__ 缺少參數，或參數不正確
* __500__ 內部伺服器錯誤

#### Output
* __message__ 若http code不為2XX，將會傳回錯誤訊息。
* __accress_token__ Access_Token的ID
* __refresh_token__ Refresh_Token的ID
* __expires__ Access Token有效秒數(例如傳回值為500表示為500秒後會失效)


#### Example
如果第一次要取得Access Token
> JSON Format which request GetToken API
>
>		{
>			"app_id": "dQIDAQAB",
>			"device_id": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvJb60",
>			"client_id": "8506400952701030",
>			"client_token": "MBHUSO3Fcc-722NJVcopeEfnvd112fdCd_i977hbAcxzpoiIYUdeds-rfvds346fDewrfv=",
>			"token_type": "accress_token"
>		}
>
> JSON Format which response from GetToken API
>
>		{
>			"access_token": "3865109663788",
>			"refresh_token": "GSOP6bOCqjGOCa",
>			"expires": 500
>		}

若Access Token過期可使用Refresh Token取得Access Token
> JSON Format which request GetToken API
>
>		{
>			"app_id": "dQIDAQAB",
>			"client_token": "MBHUSO3Fcc-722NJVcopeEfnvd112fdCd_i977hbAcxzpoiIYUdeds-rfvds346fDewrfv=",
>			"refresh_token": "GSOP6bOCqjGOCa",
>			"token_type": "refresh_token"
>		}
>
> JSON Format which response from GetToken API
>
>		{
>			"access_token": "8873669015683",
>			"expires": 500
>		}

---

### ChangePassword
> 變更密碼

#### Url
* /account/changepassword

#### Method
* POST

#### Parameter
* __user__ `String` 客戶代碼(必填)
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
>			"user": "8506400952701030",
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
* __user__ `String` 客戶代碼(必填)

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
>			"user": "8506400952701030"
>		}
> JSON Format which response from ResetPassword API
>
>		{
>			"id": "8506400952701030",
>			"passowrd": "d7cjm9"
>		}

---
