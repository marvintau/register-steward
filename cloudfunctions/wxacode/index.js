const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
    try {
        console.log("wxacode", event);
        const wxacodeResult = await cloud.openapi.wxacode.getUnlimited({
            page: event.page,
            scene: event.scene
        })

        const uploadResult = await cloud.uploadFile({
            cloudPath: `wxacode-${event.scene.slice(2)}.jpg`,
            fileContent: wxacodeResult.buffer,
        })

        if (!uploadResult.fileID) {
            throw new Error(`upload failed with empty fileID and storage server status code ${uploadResult.statusCode}`)
        }

        return uploadResult

    } catch (err) {
        console.log(err)
        return err
    }
}