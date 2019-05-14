const db = wx.cloud.database();


// miniprogram/pages/design-form/design-form.js
Page({

    /**
     * Page initial data
     */
    data: {
        expireDate: `${(new Date()).getFullYear()}-${(new Date()).getMonth()}-${(new Date()).getDay()}`,
        isFormNamed : false,
        isEditingJSON: false,
        designDoc: [
        ]
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        this.setData({
            userId: options.id,
            isFormNamed: options.docid !== undefined
        });

        if(options.docid){
            db.collection('designDocs').doc(options.docid).get()
                .then(res => {
                    if(res.data.designDoc){
                        this.setData({
                            designDoc: res.data.designDoc,
                            designDocID : res.data._id
                        })
                    }
                })
        }
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

    onCancelName: function(){
        wx.navigateBack({ delta: 1 })
    },

    onSubmitName: function(e){

        let form = e.detail.value;
        db.collection('designDocs').add({
            data: {
                formName: form.formName,
                formDesc: form.formDesc,
                expireDate: this.data.expireDate
            }
        }).then(res => {
            this.setData({
                designDocID: res._id,
                isFormNamed: true
            })
        })
    },

    onSubmitDesign: function(){
        
        db.collection('designDocs')
            .doc(this.data.designDocID).update({
                data: {
                    ownerID: this.data.userId,
                    designDoc: Object.assign({}, this.data.designDoc)
                }
            })
            .then(res => {
                console.log(res);
                wx.navigateBack({ delta: 1 });
            });
    },

    onDateChange: function(e){
        this.setData({
            expireDate: e.detail.value
        })
    },

    onPublish: function(e){
        console.log(this.data);
        db.collection('designDocs')
            .doc(this.data.designDocID).update({
                data: {
                    ownerID: this.data.userId,
                    pageLinkID: this.data.designDocID.slice(0, 16),
                    designDoc: Object.assign({}, this.data.designDoc),
                    isPublished: true
                }
            })
            .then(res => {
                console.log(res);
                wx.navigateBack({ delta: 1 });
            });
    },

    toggleEditing: function(){
        this.setData({
            isEditingJSON : !this.data.isEditingJSON
        })
    },

    saveEditing: function(e){
        console.log("saveEditing", e.detail.value);
        this.setData({
            designDoc: JSON.parse(e.detail.value.element)
        })
    }
})