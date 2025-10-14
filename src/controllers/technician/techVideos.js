import * as techVideos from "../../services/technician/techVideos.js";


export const createTechVideoControl = async (req, res, next) => {
    try {
        const { technicianId } = req.body;
        const files = req.files || [];
        const result = await techVideos.createTechVideos({technicianId , files});
        res.status(201).json({ success: true, message: 'Technician videos uploaded.', result });
    } catch (err) {
        next(err);
    }
};


export const getTechVideosByTechIdControl = async (req, res, next) => {
    try {
        const result = await techVideos.getTechVideosByTechId(req.params.technicianId);
        res.status(200).json({ success: true, message: 'Videos fetched.', result });
    } catch (err) {
        next(err);
    }
};


export const deleteAllVideosByTechnId = async (req, res, next) => {
    try {
        const result = await techVideos.deleteAllTechnicianVideos(req.params.technicianId);
        res.status(200).json({ success: true, message: 'All videos deleted.', result });
    } catch (err) {
        next(err);
    }
};


export const deleteSingleTechnicianVideoControl = async (req, res, next) => {
    try {
        const result = await techVideos.deleteSingleTechnicianVideo(req.body);
        res.status(200).json({ success: true, message: 'Single video deleted.', result });
    } catch (err) {
        next(err);
    }
};