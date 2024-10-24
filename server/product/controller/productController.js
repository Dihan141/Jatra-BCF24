const getProducts = async (req, res) => {
    res.status(201).json({msg: "product info accessed."});
}

module.exports = {
    getProducts
};