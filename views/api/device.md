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