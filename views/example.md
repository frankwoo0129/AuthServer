取得token的方式：

you should POST to /token
You should include your client credentials in the Authorization header ("Basic " + client_id:client_secret base64'd),  
and then grant_type ("password"),  
user and password in the request body.  

Example:

appId = 9b694d431bfcfb5f52eb04e119413bc5  
deviceId = 1e235754ac9878d99b14bffedbfd69c7  
組成  
9b694d431bfcfb5f52eb04e119413bc5:1e235754ac9878d99b14bffedbfd69c7  
再轉成base64的格式成為  
OWI2OTRkNDMxYmZjZmI1ZjUyZWIwNGUxMTk0MTNiYzU6MWUyMzU3NTRhYzk4NzhkOTliMTRiZmZlZGJmZDY5Yzc=  

```
POST /oauth/token HTTP/1.1
Host: 10.63.4.28:8008
Authorization: Basic OWI2OTRkNDMxYmZjZmI1ZjUyZWIwNGUxMTk0MTNiYzU6MWUyMzU3NTRhYzk4NzhkOTliMTRiZmZlZGJmZDY5Yzc=
Content-Type: application/x-www-form-urlencoded

grant_type=password&user=f74635d55f387df83ba2aad77f734866&password=12345678

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


使用token的方式：

當你使用任何web service，都要把access_token加進header裡面。使用如下：

```
GET /profile?user=f74635d55f387df83ba2aad77f734866 HTTP/1.1
Host: 10.63.4.28:8008
Authorization: Bearer 2YotnFZFEjr1zCsicMWpAA
Cache-Control: no-cache

```


如果沒有錯誤，會得到以下的回傳：

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store

{
  "id": "f74635d55f387df83ba2aad77f734866",
  "user": "829774",
  "org": "foxconn",
  "email": "frank.cc.su@foxconn.com",
  "work_phone": "5506217"
}

```


更新token的方式：

```
POST /oauth/token HTTP/1.1
Host: 10.63.4.28:8008
Authorization: Basic OWI2OTRkNDMxYmZjZmI1ZjUyZWIwNGUxMTk0MTNiYzU6MWUyMzU3NTRhYzk4NzhkOTliMTRiZmZlZGJmZDY5Yzc=
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