<template>
  <div class="content">
    <div class="blur"></div>
    <div class="header">
      <img src="./static/logo.png" class="logo" />
      <div class="wrap-class">
        <div class="text">
          <p class="title">哄睡宝</p>
          <p class="subTitle">用你的声音，伴孩子入眠</p>
        </div>
        <span class="wrapper">
          <div class="openApp">
            <p class="openAppText">打开App</p>
          </div>
          <wx-open-launch-app
            appid="wx6b824889eeb46917"
            :extinfo="shareInfo"
            @error="launchError"
            @click="openApp"
            style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              overflow: hidden;
              cursor: pointer;
            "
          >
            <script type="text/wxtag-template">
              <div style="height:100px">&nbsp;</span>
            </script>
          </wx-open-launch-app></span
        >
      </div>
    </div>
    <div class="main" v-if="!loading">
      <p class="scriptTitle">{{ result.script.title }}</p>
      <img
        :src="imgBaseUrl + result.script.cover"
        v-if="result.script.cover"
        class="cover"
      />
      <div class="tags">
        <div class="tag" v-for="(item, i) in result.album.tags" :key="i">
          <p class="tagText">{{ item }}</p>
        </div>
      </div>
      <div class="scriptContent">
        <p v-for="(item, i) in result.script_content" :key="i">{{ item }}</p>
      </div>
    </div>
    <div class="bottom">
      <img src="./static/introduce.png" class="introduce" />
      <div class="wrapper_3">
        <div class="openApp_3">
          <p class="openAppText_3">打开App，获取更多精彩故事</p>
        </div>
        <wx-open-launch-app
          appid="wx6b824889eeb46917"
          :extinfo="shareInfo"
          @error="launchError"
          @click="openApp"
          style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            cursor: pointer;
          "
        >
          <script type="text/wxtag-template">
            <div style="height:100px">&nbsp;</span>
          </script>
        </wx-open-launch-app>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import wx from "weixin-js-sdk";
export default {
  data() {
    return {
      baseUrl: "https://test-voice-lite-api.hasmash.com/",
      imgBaseUrl: "https://test-static.hasmash.com/img/download/origin/",
      play: false,
      reverse: false,
      able: true,
      loading: true,
      isClose: true,
      isWeiXinFlag: false,
      msg: "出错啦",
      user: "宝贝听我说用户",
      shareId: "",
      albumId: "",
      result: {
        album: {
          id: "",
          tags: [],
          description: "",
        },
        script: {
          id: "",
          title: "",
          description: "",
          cover: "",
        },
        script_content: [],
      },
    };
  },
  computed: {
    shareInfo() {
      return JSON.stringify({
        albumId: this.result.album.id,
        scriptId: this.result.script.id,
      });
    },
  },
  created() {
    document.addEventListener("WeixinOpenTagsError", function (e) {
      console.error(e.detail.errMsg);
    });
    this.isWeiXinFlag = this.isWeiXin();
    axios({
      url: `${this.baseUrl}v1/share/wechat?url=${
        window.location.href.split("#")[0]
      }`,
    })
      .then((res) => {
        if (res.data.code === "00000") {
          wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印
            appId: "wx07c0bd592efbb4f0", // 必填，公众号的唯一标识
            timestamp: res.data.result.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.data.result.nonceStr, // 必填，生成签名的随机串
            signature: res.data.result.signature, // 必填，签名
            jsApiList: ["updateAppMessageShareData", "updateTimelineShareData"], // 必填，需要使用的JS接口列表
            openTagList: ["wx-open-launch-app"], // 可选，需要使用的开放标签列表，例如['wx-open-launch-app']
          });
          wx.error(() => {});
        }
      })
      .catch(() => {});
    this.shareId = this.getUrlKey("shareId");
    if (this.shareId) {
      this.loading = true;
      axios({
        url: `${this.baseUrl}v1/share/${this.shareId}`,
      })
        .then((res) => {
          if (res.data.code === "00000") {
            this.result = res.data.result;
            document.title = this.result.script.title + " - 哄睡宝";
            this.loading = false;
            wx.ready(() => {
              wx.updateAppMessageShareData({
                title: this.result.script.title, // 分享标题
                desc: this.result.album.description, // 分享描述
                link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: this.imgBaseUrl + this.result.script.cover, // 分享图标
                success: function () {},
              });
              wx.updateTimelineShareData({
                title: this.result.script.title, // 分享标题
                link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号 JS 安全域名一致
                imgUrl: this.imgBaseUrl + this.result.script.cover, // 分享图标
                success: function () {},
              });
            });
          } else {
            this.msg = res.data.message;
            this.able = false;
            this.loading = false;
          }
        })
        .catch(() => {
          this.able = false;
          this.loading = false;
        });
    } else {
      this.able = false;
      this.loading = false;
    }
  },
  methods: {
    openApp() {
      if (!this.isWeiXinFlag) {
        this.useUrl();
      }
    },
    launchError() {
      this.useUrl();
    },
    useUrl() {
      let href = document.createElement("a");
      href.href =
        "voice://share?albumId=" +
        this.result.album.id +
        "&scriptId=" +
        this.result.script.id;
      href.click();
      setTimeout(async () => {
        let hidden =
          window.document.hidden ||
          window.document.mozHidden ||
          window.document.msHidden ||
          window.document.webkitHidden;
        if (typeof hidden == "undefined" || !hidden) {
          let ua = navigator.userAgent;
          let isAndroid =
            ua.indexOf("Android") > -1 || ua.indexOf("Linux") > -1; //android终端
          let isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
          let consignorUrl = "https://www.hasmash.com";
          if (isAndroid) {
            await fetch("https://test-voice-api.hasmash.com/v1/release")
              .then((res) => res.json())
              .then(({ result: { path: res } }) => {
                consignorUrl = res;
              });
          } else if (isIOS) {
            consignorUrl = "https://apps.apple.com/cn/app/id1643376482";
          }
          href.href = consignorUrl;
          href.click();
        }
      }, 2000);
    },
    isWeiXin() {
      let ua = window.navigator.userAgent.toLowerCase();
      if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
      } else {
        return false;
      }
    },
    getUrlKey(name) {
      return (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
        location.href
      ) || ["", ""])[1].replace(/\+/g, "%20");
    },
  },
};
</script>

<style>
@font-face {
  font-family: "Source Han Sans CN";
  src: url("./static/SourceHanSansCN-Normal.otf");
}
p {
  margin: 0;
}
.content {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  background-color: #262d47;
  background-image: url("./static/background.png");
  background-size: 100% auto;
  background-repeat: no-repeat;
  min-height: 100vh;
  overflow: hidden;
}
.header {
  height: 70px;
  width: 100%;
  max-width: 480px;
  background-color: #fcfcfc;
  display: flex;
  text-align: left;
  padding: 0 20px;
  box-sizing: border-box;
  flex-wrap: wrap;
  align-content: center;
  position: fixed;
  top: 0;
  z-index: 99;
}
.bottom {
  position: relative;
  z-index: 2;
}
.logo {
  width: 46px;
  height: 46px;
  display: inline-block;
}
.wrap-class {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: 40px;
  margin-left: 10px;
}
.title {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  letter-spacing: 0.05em;
  color: #2a2a2a;
}
.scriptTitle {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  color: #fcfcfc;
  margin: 16px 0;
}
.subTitle {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 0.05em;
  color: #2a2a2a;
}
.blur {
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  right: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(148, 153, 163, 0.3) 7.48%,
    rgba(148, 153, 163, 0.15) 83.81%,
    rgba(148, 153, 163, 0) 100%
  );
  backdrop-filter: blur(6px);
}
.wrapper {
  position: relative;
  width: 65px;
  height: 30px;
  border-radius: 12px;
}
.openApp {
  width: 65px;
  height: 30px;
  background-color: #6f73c1;
  box-sizing: border-box;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.openAppText {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: #fcfcfc;
}
.error-img {
  width: 163px;
  height: 173px;
  margin: 30px auto;
  margin-top: 0;
}
.background {
  width: 100%;
}
.slogan {
  width: 150px;
  height: 150px;
  margin-top: 44px;
}
.polygon {
  position: absolute;
  right: 70px;
  top: 325px;
  width: 41px;
  height: 52px;
}
.main {
  position: relative;
  width: 100%;
  padding: 30px 20px;
  box-sizing: border-box;
  margin-top: 70px;
  z-index: 80;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
}
.loading {
  position: relative;
  width: 100%;
  margin-top: -270px;
}
.wrapper_2 {
  position: relative;
  width: 233px;
  height: 32px;
  margin: 0 auto;
  border-radius: 12px;
}
.openApp_2 {
  width: 233px;
  height: 32px;
  background-color: #f9be26;
  box-shadow: 2px 4px 12px -3px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
}
.openAppText_2 {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: #ffffff;
}
.introduce {
  width: 320px;
  height: 272px;
  margin-top: 30px;
  z-index: 2;
}
.wrapper_3 {
  position: relative;
  width: 230px;
  height: 30px;
  margin: 36px auto;
  border-radius: 12px;
}
.openApp_3 {
  width: 230px;
  height: 30px;
  background-color: #6f73c1;
  box-sizing: border-box;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin: 36px auto;
}
.openAppText_3 {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: #fcfcfc;
}
.from {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  color: #2a2a2a;
  margin-bottom: 10px;
}
.error {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  color: #a6a6a6;
  margin-bottom: 10px;
}
.user {
  color: #f9be26;
  margin-right: 5px;
}
.cover {
  display: block;
  width: 120px;
  height: 120px;
  margin: 4px auto;
  border-radius: 50% 50%;
}
.pause {
  animation-play-state: paused !important;
}
.rotate {
  animation: rotate 6s linear infinite;
}
.rotate-reverse {
  animation: rotate 6s linear infinite reverse;
}
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
.name {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: #2a2a2a;
}
.tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 70%;
  margin: 10px auto;
}
.tag {
  height: 21px;
  padding: 2px 7px;
  background: #8999d7;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 6px 8px;
}
.tagText {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  color: #fcfcfc;
}
.describe {
  margin-top: 5px;
  margin-bottom: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.describeText {
  font-family: "Source Han Sans CN";
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
  text-align: justify;
  letter-spacing: -0.005em;
  color: #a6a6a6;
  transition: all 1s;
}
.button {
  width: 14px;
  height: 5px;
  margin: 4px auto;
  cursor: pointer;
}
.progress {
  margin: 50px 0;
}
.scriptContent p {
  font-size: 16px;
  color: #fcfcfc;
  text-align: justify;
  letter-spacing: 0.015em;
  margin: 14px 12px;
  line-height: 24px;
}
</style>
