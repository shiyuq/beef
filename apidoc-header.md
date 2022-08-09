# ### 

### change log
<details>
<summary>>>示例接口</summary>

|序号|变更内容|变更者|
|:--|:--|:--|
|1|<a href='#api-auth-authLogin'>用户登录</a><p>新增</p>|施雨强|
</details>

### Headers

|字段|描述|
|:--|:--:|
|token|用户标识|
|authorization|认证信息，当有 token 时，优先使用 token 进行身份认证。无 token 时，使用 Authorization 进行身份认证，并在响应头设置 token 信息，登陆信息 rsa 加密|
