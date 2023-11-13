<template>
    <div class="chat-container">
        <scroll-view scroll-with-animation scroll-y :scroll-into-view="scrollIntoView" class="chat-messages-container">
            <message v-for="(message, index) in messages" :key="index" :bot-avatar="config.botAvatar"
                :user-avatar="config.userAvatar" :content.sync="message.text" :is-bot="message.isBot"
                :failure.sync="message.failure" :id.sync="message.id" :message-id.sync="message.id"
                :done.sync="message.done">
            </message>
        </scroll-view>
        <div class="chat-input-container">
            <input v-model="inputMessage" @confirm="sendMessage" placeholder="在此输入内容" :disabled="disableInteract"
                class="chat-input" focus />
            <button @click="sendMessage" :disabled="disableInteract" class="chat-send-button">发送</button>
        </div>
    </div>
</template>
  
<script>
import config from '@/common/config.js'
import Message from './message'
export default {
    components: {
        Message
    },
    data () {
        return {
            config: {
                botAvatar: '../../static/images/bot-avatar.jpg',
                userAvatar: '../../static/images/user-avatar.jpg',
            },
            inputMessage: '',
            messages: [
                { text: '你好，我是计网小助手！', isBot: true, failure: false, id: 'message--initial', done: false },
            ],
            sessionId: null,
            scrollIntoView: '',
            disableInteract: false,
        }
    },
    methods: {
        sendMessage () {
            try {
                this.sendMessageImpl()
            } catch {
                this.disableInteract = false
                uni.showToast({
                    title: '未知错误',
                    icon: 'none'
                })
            }
        },
        sendMessageImpl () {
            if (this.inputMessage.trim() === '') return
            this.disableInteract = true
            let message = { text: this.inputMessage.trim(), isBot: false, failure: false, id: this.generateMessageUUID(), done: true }
            this.messages.push(message)
            this.scrollIntoView = this.messages[this.messages.length - 1].id
            this.inputMessage = ''
            let responseMsg = { text: '', isBot: true, failure: false, id: this.generateMessageUUID(), done: false }
            let timestamp = config.getCurrentDateTime()
            new Promise((resolve, reject) => {
                uni.request({
                    url: config.adornUrl('mpweixin/chatbot/message/send'),
                    method: 'POST',
                    data: {
                        sessionId: this.sessionId,
                        content: message.text,
                        timestamp: timestamp,
                    },
                    timeout: 1500,
                    success: res => {
                        if (res.statusCode === 200 && res.data.code === 200) {
                            responseMsg.id = res.data.data.messageId
                            resolve(res)
                        } else {
                            reject({ type: 'send', error: res })
                        }
                    },
                    reject: error => {
                        reject({ type: 'send', error: error })
                    }
                })
            }).then(_res => {
                return new Promise(async (resolve, reject) => {
                    this.messages.push(responseMsg)
                    let generating = true
                    while (generating) {
                        uni.request({
                            url: config.adornUrl('mpweixin/chatbot/message/receive'),
                            method: 'GET',
                            data: {
                                sessionId: this.sessionId,
                                messageId: responseMsg.id,
                                timestamp: timestamp,
                            },
                            timeout: 1500,
                            success: res => {
                                if (res.statusCode === 200 && res.data.code === 200) {
                                    responseMsg.text += res.data.data.content
                                    responseMsg.done = true
                                    generating = false
                                } else if (res.statusCode === 200 && res.data.code === 100) {
                                    responseMsg.text += res.data.data.content
                                } else {
                                    reject({ type: 'receive', error: res })
                                }
                            },
                            reject: error => {
                                generating = false
                                reject({ type: 'receive', error: error })
                            },
                        })
                        await config.sleep(100)
                    }
                    resolve(true)
                })
            }).then(_res => {
                this.disableInteract = false
            }).catch(reason => {
                let errmsg = ''
                if (reason.type === 'send') {
                    message.failure = true
                    errmsg = '消息发送失败'
                } else if (reason.type === 'receive') {
                    responseMsg.failure = true
                    errmsg = '消息接收失败'
                }
                this.disableInteract = false
                uni.showToast({
                    title: errmsg,
                    icon: 'error'
                })
            })
        },
        generateMessageUUID () {
            return `${this.sessionId}--${config.generateUUID()}`
        }
    },
    created () {
        this.sessionId = config.generateUUID()
    },
    unmounted () {
        uni.request({
            url: config.adornUrl('mpweixin/chatbot/session/destroy'),
            method: 'POST',
            data: {
                sessionId: this.sessionId
            },
            timeout: 3000
        })
    }
}
</script>
  
<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
    font-family: Arial, sans-serif;
    position: fixed;
    left: 0rpx;
    top: 0rpx;
    height: 100vh;
    width: 100vw;
}

.chat-messages-container {
    flex-grow: 1;
    padding: 20rpx;
    width: 710rpx;
    overflow-y: auto;
    background-color: #F9F9F9;
}

.chat-input-container {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    background-color: #FFFFFF;
}

.chat-input {
    flex-grow: 1;
    border: none;
    border-radius: 10rpx;
    margin-right: 20rpx;
}

.chat-send-button {
    background-color: #9944FF;
    color: #FFF;
    border: none;
    border-radius: 10rpx;
    padding: 10rpx 20rpx;
    cursor: pointer;
    line-height: 1;
}
</style>
