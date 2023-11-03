<template>
    <div class="message-wrapper">
        <img :src="isBot ? botAvatar : userAvatar" class="avatar" />
        <div :class="{
            'bot-message': isBot,
            'user-message': !isBot,
            'message-box': true,
            'failed-message': failure
        }">
            {{ content }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        botAvatar: String,
        userAvatar: String,
        content: String,
        isBot: Boolean,
        failure: Boolean
    }
}
</script>

<style scoped>
.message-wrapper {
    display: flex;
}

.avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    margin-top: 16rpx;
    flex-shrink: 0;
}

.message-box {
    margin: 16rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.3);
    width: 560rpx;
    max-width: 560rpx;
    flex-grow: 1;
    word-wrap: break-word;
}

.bot-message {
    text-align: left;
    background-color: #FFF;
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
</style>
