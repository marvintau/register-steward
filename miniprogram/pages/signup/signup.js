import promisify from "../../lib/promise.js";

const db = wx.cloud.database();

let getUserInfo = promisify(wx.getUserInfo),
    getSetting = promisify(wx.getSetting),
    authorize = promisify(wx.authorize),
    login = promisify(wx.login),
    cloudCall = promisify(wx.cloud.callFunction);

Page({

    /**
     * Page initial data
     */
    data: {
        userInfo: { avatarUrl: './user-unlogin.png' },
        logged: false
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (query) {

        const scene = decodeURIComponent(query.scene);

        console.log("signup", scene)
        db.collection("designDocs").where({pageLinkID: scene}).get()
        .then(res => {
            let doc = res.data[0];
            console.log(doc);
            this.setData({
                formName: doc.formName,
                doc: doc.designDoc,
                docid: doc._id,
                desc: doc.formDesc
            });
        }).catch(err =>{
            console.log("signup error", err);
        })

    },

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {
    },

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {

    },

    /**
     * Lifecycle function--Called when page hide
     */
    onHide: function () {

    },

    /**
     * Lifecycle function--Called when page unload
     */
    onUnload: function () {

    },

    /**
     * Page event handler function--Called when user drop down
     */
    onPullDownRefresh: function () {

    },

    /**
     * Called when page reach bottom
     */
    onReachBottom: function () {

    },

    /**
     * Called when user click on the top right corner to share
     */
    onShareAppMessage: function () {

    },

    onReceivedUserInfo: function (res) {
        if (res.detail.errMsg === "getUserInfo:ok") {
            this.setData({ userInfo: JSON.parse(res.detail.rawData) })
            console.log(JSON.parse(res.detail.rawData));
            wx.cloud.callFunction({ name: 'login', data: {} })
            .then(res => {
                let openid = { openid: res.result.openid };
                this.setData({
                    userInfo: Object.assign({}, this.data.userInfo, openid),
                    logged: true
                });

                db.collection('signups').where({
                    signer: res.result.openid,
                    docid: this.data.docid
                }).get().then(res => {
                    console.log(res);
                    if(res.data.length > 0){
                        console.log('dup');
                        this.setData({
                            isDuplicate: true
                        })
                    }
                })
            })
            .catch(err => {
                console.error('[云函数] [login] 调用失败', err)
            })

        }
    },

    onSubmit: function(e){

        let doc = this.data.doc,
            form = e.detail.value;

        console.log(e.detail.value, doc);

        for (let key in doc){
            let item = doc[key];
            if (item.phone && form[item.name].length !== 11) {
                wx.showToast({
                    title: '电话号码格式好像不对',
                    icon: 'none',
                    duration: 1500
                })
                return;
            } else if (item.year && form[item.name].length !== 4) {
                wx.showToast({
                    title: '年份格式好像不对',
                    icon: 'none',
                    duration: 1500
                })
            } else if (item.required && form[item.name].length === 0){

                if (item.required !== "true"){
                    wx.showToast({
                        title: item.required,
                        icon: 'none',
                        duration: 1500
                    })
                } else {
                    wx.showToast({
                        title: `${item.name}麻烦填一下`,
                        icon: 'none',
                        duration: 1500
                    })

                }

                return;
            }
        }

        db.collection('signups').add({
            data: {
                form: e.detail.value,
                timestamp : Date(),
                docid: this.data.docid,
                signer: this.data.userInfo.openid
            }
        }).then(res => {
            this.setData({isSignedUp: true});
        }).catch(error => {
            console.log(error);
        })
    },
})