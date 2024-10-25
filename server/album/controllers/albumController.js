const Album = require('../models/albumModel');

const getAllAlbums = async (req, res) => {
    try {
        const { id } = req.params;
        const albums = await Album.find({ planId: id });
        res.status(200).json({ albums });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateAlbum = async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const { photos } = req.body;

        // Use findOne instead of find to get a single album
        let album = await Album.findOne({ planId: id });

        // If the album exists
        if (album) {
            // Check if the album has photos before accessing the length
            if (album.photos && album.photos.length > 0) {
                album.photos = [...album.photos, ...photos];
            } else {
                album.photos = photos; // If no photos exist yet
            }

            album.planId = id;
            console.log(album.planId);
            await album.save();

            res.status(200).json({ album });
        } else {
            // If no album is found, create a new one
            const newAlbum = new Album({
                photos,
                planId: id,
            });
            await newAlbum.save();

            res.status(200).json({ album: newAlbum });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getAllAlbums,
    updateAlbum
};