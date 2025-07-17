import express from 'express';
import { addCagegorySearchDetailsCont, deleteCategorySearchDetailsCont, getSearchContentByLocationCont, updateCagegorySearchDetailsCont } from '../controllers/searchContentData.js';

const router = express.Router();

router.post('/addCagegorySearchDetails', addCagegorySearchDetailsCont);
router.post('/getSearchContentByLocation', getSearchContentByLocationCont);
router.put('/updateCagegorySearchDetails', updateCagegorySearchDetailsCont);
router.delete('/deleteCategorySearchDetails/:searchContentDataId', deleteCategorySearchDetailsCont);

export default router;
