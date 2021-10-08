const Categories = require('../models/Categories');
module.exports = {
    create: async (req, res) => {
        const body = req.body;
        try{
            const categories = await Categories.create(body);
            return res.status(200).json({
                status: "succes",
                massage: "Database succesfully",
                data:categories,
            });
        }catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                massage: "something wrong error"
            });
        }
    },
    readAll: async (req, res) => {
        try{
            const categories = await Categories.find()
            return res.status(200).json({
                status: "succes",
                massage: "data succesfully",
                data: categories,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "server Error",
            });
        }

    },
    update: async (req, res) => {
        const body = req.body
        const id = req.params.Categories
        try {
            console.log(id)
            console.log(body)
            const Categories = await Categories.findById(Id)
            Categories.name = body.name
            Categories.Id = body.Id
            await Categories.save

            return res.status(200).json({
                status : "succses",
                data : Categories
            })
        } catch (error){
            console.log(error)
        }
    },
    delete: async (req, res) => {
        const id = req.params.id
        try {
            await Categories.deleteOne({_id : id})

            return res.status(200).json({
                status : "succses",
                message : "Data deleted succsesfully"
            })
        } catch (error) {
            console.log(error)
        }
    }
};


