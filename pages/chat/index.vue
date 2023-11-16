<template>
    <div class="chat-container">
        <scroll-view scroll-with-animation scroll-y :scroll-into-view="scrollIntoView" class="chat-messages-container">
            <message v-for="(message, index) in messages" :key="index" :bot-avatar="config.botAvatar"
                :user-avatar="config.userAvatar" :content.sync="message.text" :is-bot="message.isBot"
                :failure.sync="message.failure" :id.sync="message.id" :message-id.sync="message.id"
                :done.sync="message.done">
            </message>
            <div id="scroll-view-placeholder"></div>
        </scroll-view>
        <footer class="chat-main-footer">
            <div :class="{
                'chat-message-input-container': true,
                'active-message-input-container': textareaFocus
            }">
                <div class="growing-text-area-container">
                    <textarea focus auto-height auto-focus auto-blur disable-default-padding placeholder="在此输入内容"
                        cursor-spacing="33px" confirm-type="send" v-model="inputMessage" :disabled="disableInteract"
                        @focus="onTextareaFocus" @blur="onTextareaBlur" @confirm="sendMessage"
                        class="growing-text-area"></textarea>
                </div>
                <button @click="sendMessage" :disabled="disableInteract" :class="{
                    'chat-send-button': true,
                    'chat-send-button-disabled': disableInteract
                }">
                    <div class="chat-send-button-text">好</div>
                </button>
            </div>
        </footer>
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
            textareaFocus: false
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
                        messageId: message.id,
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
                                    generating = false
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
        },
        onTextareaFocus (_) {
            this.textareaFocus = true
        },
        onTextareaBlur (_) {
            this.textareaFocus = false
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
    padding: 20rpx 20rpx 0;
    width: 710rpx;
    overflow-y: auto;
    background-color: #FFF;
}

#scroll-view-placeholder {
    height: 100px;
}

.chat-main-footer {
    position: sticky;
    bottom: 0;
    background: #FFF;
    padding: 0.5rem 0 1rem;
    width: 100%;
    overflow-anchor: none;
}

.chat-message-input-container {
    width: auto;
    display: flex;
    align-items: flex-end;
    align-content: space-between;
    border: 1px solid #CFD3D3;
    border-radius: 1.5rem;
    gap: 0.5rem;
    margin: 0 0.5rem;
    padding: 4px;
    cursor: text;
    position: relative;
    flex: 1 1;
}

.active-message-input-container {
    border: 2px solid #9944FF;
}

.growing-text-area-container {
    flex: 1 1;
    padding: 10px 0 12px 16px;
    display: block;
}

.growing-text-area {
    width: auto;
    background-color: transparent;
    font-size: 15px;
    line-height: 18px;
    border: none;
    padding: 0;
    margin: 0;
    max-height: 100px;
    overflow-x: hidden;
    grid-area: 1/1/2/2;
    resize: none;
    overflow-y: auto;
}

.chat-send-button {
    font-size: 16px;
    padding: 0.5rem;
    background: #9944FF;
    color: #FFF;
    fill: #FFF;
    display: flex;
    flex-direction: row;
    border: none;
    gap: 6px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 450;
    text-align: center;
    margin: 0;
    border-radius: 1.5rem;
    line-height: 24px;
    min-width: 40px;
}

.chat-send-button-disabled {
    opacity: 0.5;
    cursor: default;
}

.chat-send-button-text {
    height: 24px;
    width: 24px;
    min-width: 24px;
    text-align: center;
}
</style>
