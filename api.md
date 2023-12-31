# API

## 消息相关

### 消息发送

- 请求地址 `POST /mpweixin/chatbot/message/send`

- 请求体：

  | 字段      | 类型   | 说明                                                         | 是否必填 |
  | --------- | ------ | ------------------------------------------------------------ | -------- |
  | sessionId | String | 对话的 id，用于区分不同的对话，每次进入小程序时生成，小程序退出后销毁 | 是       |
  | messageId | String | 消息的 id，生成规则如下                                      | 是       |
  | content   | String | 消息的内容                                                   | 是       |
  | timestamp | String | 消息的发送时间，格式为 yyyy/MM/dd HH:mm:ss                   | 是       |

- 返回参数：

  | 字段    | 类型   | 说明                             | 是否必填 |
  | ------- | ------ | -------------------------------- | -------- |
  | code    | Number | 接口状态码，定义与HTTP状态码相同 | 是       |
  | message | String | 状态说明信息                     | 是       |
  | data    | Object | 负载信息                         | 是       |

  data：

  | 字段      | 类型   | 说明                                                | 是否必填 |
  | --------- | ------ | --------------------------------------------------- | -------- |
  | messageId | String | 回复消息的 id，格式与生成规则同请求体中的 messageId | 是       |

- `messageId` 的生成规则：

  ```javascript
  // js 实现
  function generateUUID () {
      let d = new Date().getTime()
      let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          let r = (d + Math.random() * 16) % 16 | 0
          d = Math.floor(d / 16)
          return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      })
      return uuid
  }
  
  function generateMessageUUID(sessionId) {
      return `${sessionId}--${generateUUID()}`
  }
  ```
  
  ```python
  # python 实现
  import uuid
  
  def generate_message_uuid(session_id):
      return f'{session_id}--{str(uuid.uuid4())}'
  ```
  
- 示例：

  ```shell
  curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "80d5a793-0d16-4c15-9246-f6bc87e77ed6",
    "messageId": "80d5a793-0d16-4c15-9246-f6bc87e77ed6--6f1f7ae4-981f-408b-ae7c-b7a17503f875",
    "content": "请问BGP协议实验ping不通怎么办?",
    "timestamp": "2023/11/03 15:30:00"
  }' \
  https://api.example.com/mpweixin/chatbot/message/send
  ```

### 消息接收

- 请求地址 `GET /mpweixin/chatbot/message/receive`

- 请求参数：

  | 字段      | 类型   | 说明                                                         | 是否必填 |
  | --------- | ------ | ------------------------------------------------------------ | -------- |
  | sessionId | String | 对话的 id，用于区分不同的对话，每次进入小程序时生成，小程序退出后销毁 | 是       |
  | messageId | String | 要接收的消息的 messageId，如果不填则默认查询最后一条回复     | 否       |


- 返回参数：

  | 字段    | 类型   | 说明                                                         | 是否必填 |
  | ------- | ------ | ------------------------------------------------------------ | -------- |
  | code    | Number | 接口状态码，定义与HTTP状态码相同，特殊说明：如果请求时回复消息尚未生成完毕，状态码应为 100 Continue | 是       |
  | message | String | 状态说明信息                                                 | 是       |
  | data    | Object | 负载数据，如果请求失败则为 {}                                | 是       |

  data：

  | 字段      | 类型   | 说明                                                         | 是否必填 |
  | --------- | ------ | ------------------------------------------------------------ | -------- |
  | sessionId | String | 对话的 id，用于区分不同的对话，每次进入小程序时生成，小程序退出后销毁 | 是       |
  | content   | String | 消息的内容                                                   | 是       |
  | timestamp | String | 消息的发送时间，格式为 yyyy/MM/dd HH:mm:ss                   | 是       |

- 示例：

  ```shell
  curl -X GET \
  -H "Content-Type: application/json" \
  "https://api.example.com/mpweixin/chatbot/message/receive?sessionId=80d5a793-0d16-4c15-9246-f6bc87e77ed6&messageId=80d5a793-0d16-4c15-9246-f6bc87e77ed6--e397061a-9659-40ae-993c-a48d89cb374a"
  ```

### 消息评价

- 请求地址：`POST /mpweixin/chatbot/message/appraise`

- 请求体：

  | 字段      | 类型    | 说明                                                         | 是否必填 |
  | --------- | ------- | ------------------------------------------------------------ | -------- |
  | sessionId | String  | 对话的 id，用于区分不同的对话，每次进入小程序时生成，小程序退出后销毁 | 是       |
  | messageId | String  | 消息的 id，生成规则如下                                      | 是       |
  | like      | Boolean | 是否点赞，true 为点赞，false 为点踩                          | 是       |

- 返回参数：

  | 字段    | 类型   | 说明                             | 是否必填 |
  | ------- | ------ | -------------------------------- | -------- |
  | code    | Number | 接口状态码，定义与HTTP状态码相同 | 是       |
  | message | String | 状态说明信息                     | 是       |

- 示例：

  ```shell
  curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "80d5a793-0d16-4c15-9246-f6bc87e77ed6",
    "messageId": "80d5a793-0d16-4c15-9246-f6bc87e77ed6--e397061a-9659-40ae-993c-a48d89cb374a",
    "like": true
  }' \
  https://api.example.com/mpweixin/chatbot/message/appraise
  ```

## Session 相关

### Session 关闭

- 请求地址 `POST /mpweixin/chatbot/session/destroy`

- 请求体：

  | 字段      | 类型   | 说明                                                         | 是否必填 |
  | --------- | ------ | ------------------------------------------------------------ | -------- |
  | sessionId | String | 对话的 id，用于区分不同的对话，每次进入小程序时生成，小程序退出后销毁 | 是       |

- 返回参数：

  | 字段    | 类型   | 说明                             | 是否必填 |
  | ------- | ------ | -------------------------------- | -------- |
  | code    | Number | 接口状态码，定义与HTTP状态码相同 | 是       |
  | message | String | 状态说明信息                     | 是       |

- 示例：

  ```shell
  curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "80d5a793-0d16-4c15-9246-f6bc87e77ed6"
  }' \
  https://api.example.com/mpweixin/chatbot/session/destroy
  ```

