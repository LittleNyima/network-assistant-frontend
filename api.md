# API

## 异步接口

### 消息发送

- 请求地址 `POST /mpweixin/chatbot/send`

- 请求体：

  | 字段      | 类型   | 说明                                                         | 是否必填 |
  | --------- | ------ | ------------------------------------------------------------ | -------- |
  | sessionId | String | 对话的 id，用于区分不同的对话，每次进入小程序时生成，小程序退出后销毁 | 是       |
  | content   | String | 消息的内容                                                   | 是       |
  | timestamp | String | 消息的发送时间，格式为 yyyy/MM/dd HH:mm:ss                   | 是       |

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
    "content": "请问BGP协议实验ping不通怎么办?",
    "timestamp": "2023/11/03 15:30:00"
  }' \
  https://api.example.com/mpweixin/chatbot/send
  ```

### 消息接收

- 请求地址 `GET /mpweixin/chatbot/receive`

- 请求参数：

  | 字段      | 类型   | 说明                                                         | 是否必填 |
  | --------- | ------ | ------------------------------------------------------------ | -------- |
  | sessionId | String | 对话的 id，用于区分不同的对话，每次进入小程序时生成，小程序退出后销毁 | 是       |
  | timestamp | String | 上一条消息的发送时间，查询的是这条消息后的最新回复，如果不填则默认查询最后一条回复 | 否       |


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
  "https://api.example.com/mpweixin/chatbot/receive?sessionId=80d5a793-0d16-4c15-9246-f6bc87e77ed6&timestamp=2023/11/03%2015:30:00"
  ```

### Session 关闭

- 请求地址 `POST /mpweixin/chatbot/destroy`

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
  https://api.example.com/mpweixin/chatbot/destroy
  ```

## WebSocket 接口