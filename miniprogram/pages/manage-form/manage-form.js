import promisify from "../../lib/promise.js";

const downloadFile = promisify(wx.downloadFile),
      saveImage = promisify(wx.saveImageToPhotosAlbum);

const db = wx.cloud.database();

// miniprogram/pages/manage-form/manage-form.js
Page({

    /**
     * Page initial data
     */
    data: {
        signupAmount: 0,
        isWxaDone: false,
        isTransDone: false,
        isShowCode: false,
        isShowTransCode: false,
        isDownloaded: false,
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        console.log(options);

        db.collection('designDocs').doc(options.docid).get()
        .then(res => {
            this.setData({
                formName : res.data.formName,
                formDesc : res.data.formDesc,
                docid : options.docid,
                pageLink: res.data.pageLinkID
            });

            return db.collection('signups').where({
                docid: options.docid
            }).get().then(res => {
                this.setData({signupAmount: res.data.length})
            })
        });
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

    generateSignupLink: function() {
        if(!this.data.isShowCode){
            this.setData({
                isShowCode: true
            })
            if(!this.data.isWxaDone){
                wx.cloud.callFunction({
                    name: 'wxacode',
                    data : {
                        page: "pages/signup/signup",
                        scene: `${this.data.pageLink}`
                    }
                }).then(res => {
                    return wx.cloud.getTempFileURL({
                        fileList: [res.result.fileID],
                    })
                }).then(res => {
                    console.log(this.data)
                    this.setData({
                        wxacode: res.fileList[0].tempFileURL,
                        isWxaDone: true,
                    });
                })
            } else {
                console.log(this.data)
                this.setData({
                    isShowCode: true
                })
            }
        } else {
            this.setData({
                isShowCode: false
            })
        }
    },

    generateTransferLink: function () {
        if (!this.data.isShowTransCode) {
            this.setData({
                isShowTransCode: true
            })
            if (!this.data.isTransDone) {
                wx.cloud.callFunction({
                    name: 'wxacode',
                    data: {
                        page: "pages/transfer/transfer",
                        scene: `${this.data.pageLink}`
                    }
                }).then(res => {
                    console.log(res);
                    return wx.cloud.getTempFileURL({
                        fileList: [res.result.fileID],
                    })
                }).then(res => {
                    this.setData({
                        transfercode: res.fileList[0].tempFileURL,
                        isTransDone: true,
                    });
                })
            } else {
                this.setData({
                    isShowTransCode: true
                })
            }
        } else {
            this.setData({
                isShowTransCode: false
            })
        }
    },

    viewSignups: function(){
        console.log(this.data)
        wx.navigateTo({
            url: `/pages/view-form/view-form?docid=${this.data.docid}`,
        })
    },

    saveSignupImage: function(){
        downloadFile({
            url: this.data.wxacode
        }).then(res => {
            return saveImage({ filePath: res.tempFilePath})
        }).then(res => {
            wx.showToast({
                title: '保存图片成功！',
            })
        })
    }
})