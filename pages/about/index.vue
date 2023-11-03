<template>
	<div class="top-level">
		<h1>计网小助手</h1>
		<p>计网小助手开发团队@2023</p>
	</div>
</template>
  
<script>
export default {}
</script>
  
<style scoped>
.top-level {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0rpx;
	left: 0rpx;
	height: 100vh;
	width: 100vw;
}

h1 {
	font-size: 48rpx;
	text-align: center;
	margin: 0rpx auto 20rpx;
}

p {
	font-size: 32rpx;
	text-align: center;
	color: #666;
}
</style>