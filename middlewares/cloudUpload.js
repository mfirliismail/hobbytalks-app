const multer = require('multer')
const path = require('path')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
    cloud_name: "dwaebjqvi",
    api_key: "865442623764271",
    api_secret: "oU-ZIRwlyCnLTV5Bukj9H-qpm7c",
});
// ============================================================

// Upload Image ke cloudinary dgn folder Character

// ============================================================

module.exports = (namaKolum) => {
    try {
        const storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: (req, file) => {
                return {
                    folder: `hobbytalks/${file.fieldname}s`,
                    resource_type: 'raw',
                    public_id: path.parse(file.originalname).name +
                        ' - ' +
                        new Date().getFullYear() +
                        '-' +
                        new Date().getMonth() +
                        '-' +
                        new Date().getDate() +
                        ' - ' +
                        new Date().getHours() +
                        '-' +
                        new Date().getMinutes() +
                        '-' +
                        new Date().getSeconds() +
                        '-' +
                        new Date().getMilliseconds() +
                        path.extname(file.originalname)
                }
            },
        })

        const upload = multer({
            storage: storage,
        }).single(namaKolum)

        return (req, res, next) => {
            upload(req, res, (err) => {
                return next()
            })
        }

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Internal server error"
        })

    }
}