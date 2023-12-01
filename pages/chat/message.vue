<template>
    <div class="message-wrapper">
        <div class="message-row">
            <img :src="isBot ? botAvatar : userAvatar" class="avatar" />
            <span>{{ isBot ? '计网小助手' : '你' }}</span>
        </div>
        <div :class="{
            'bot-message': isBot,
            'user-message': !isBot,
            'message-box': true,
            'failed-message': failure
        }">
            <p v-for="(block, index) in displayedContent" :key="index">{{ block }}</p>
        </div>
        <div class="message-row" v-if="isBot && done">
            <button class="flat-button" @tap="onReactionButtonTapped(true)" v-if="like !== false" :disabled="like !== null">
                <uni-icons :type="getButtonIconType(true)" size="22"></uni-icons>
            </button>
            <button class="flat-button" @tap="onReactionButtonTapped(false)" v-if="like !== true" :disabled="like !== null">
                <uni-icons :type="getButtonIconType(false)" size="22"></uni-icons>
            </button>
        </div>
    </div>
</template>

<script>
import config from '@/common/config.js'
export default {
    data () {
        return {
            like: null
        }
    },
    computed: {
        displayedContent () {
            return this.content.trim().split('\n')
        }
    },
    props: {
        botAvatar: String,
        userAvatar: String,
        content: String,
        messageId: String,
        isBot: Boolean,
        failure: Boolean,
        done: Boolean
    },
    methods: {
        onReactionButtonTapped (isLike) {
            let sessionId = this.messageId.split('--')[0]
            new Promise((resolve, reject) => {
                uni.request({
                    url: config.adornUrl('mpweixin/chatbot/message/appraise'),
                    method: 'POST',
                    data: {
                        sessionId: sessionId,
                        messageId: this.messageId,
                        like: isLike
                    },
                    timeout: 1500,
                    success: res => {
                        if (res.statusCode === 200 && res.data.code === 200) {
                            resolve(res)
                        } else {
                            reject(res)
                        }
                    },
                    fail: err => {
                        reject(err)
                    }
                })
            }).then(_ => {
                this.like = isLike
                uni.showToast({
                    title: isLike ? '点赞成功' : '已收到您的反馈',
                    icon: 'none'
                })
            }).catch(_ => {
                uni.showToast({
                    title: '评价失败',
                    icon: 'error'
                })
            })

            this.like = isLike
        },
        getButtonIconType (isLike) {
            if (isLike) {
                return this.like === isLike ? 'hand-up-filled' : 'hand-up'
            } else {
                return this.like === isLike ? 'hand-down-filled' : 'hand-down'
            }
        }
    }
}
</script>

<style scoped>
.message-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 710rpx;
    gap: 0.4em;
    margin-bottom: 1.2em;
}

.message-row {
    display: flex;
    flex-direction: row;
    gap: 0.5em;
    align-items: center;
    justify-content: flex-start;
    color: #555555;
}

.avatar {
    width: 20px;
    height: 20px;
    border-radius: 30%;
    flex-shrink: 0;
}

.message-box {
    margin: 0;
    padding: 20rpx;
    border-radius: 10rpx;
    width: 670rpx;
    max-width: 670rpx;
    word-wrap: break-word;
}

.bot-message {
    text-align: left;
    background-color: #F0F0F0;
}

.user-message {
    text-align: left;
    background-color: #9944FF;
    color: #FFF;
}

.failed-message {
    background-color: #FF4499;
    color: #FFF;
}

.flat-button {
    background-color: transparent;
    color: #000;
    fill: #000;
    padding: 0.6em;
    display: flex;
    flex-direction: row;
    border: solid 1px #E4E7E7;
    gap: 6px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 450;
    border-radius: 50%;
    height: 2em;
    width: 2em;
    margin: 0;
}
</style>
