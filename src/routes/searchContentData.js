import express from 'express';
import { addCagegorySearchDetailsCont, deleteCategorySearchDetailsCont, getAllSearchContentsController, getSearchContentByLocationCont, updateCagegorySearchDetailsCont } from '../controllers/searchContentData.js';

const router = express.Router();

router.post('/addCagegorySearchDetails', addCagegorySearchDetailsCont);
router.post('/getSearchContentByLocation', getSearchContentByLocationCont);
router.put('/updateCagegorySearchDetails', updateCagegorySearchDetailsCont);
router.delete('/deleteCategorySearchDetails/:searchContentDataId', deleteCategorySearchDetailsCont);
router.get('/getAllSearchContents', getAllSearchContentsController);

export default router;
