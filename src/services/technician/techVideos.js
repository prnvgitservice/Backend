import mongoose from 'mongoose';
import Technician from '../../models/authModels/technician.js';
import TechnicianVideos from '../../models/technician/techVideos.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const createTechVideos = async ({ technicianId, files }) => {
  if (!technicianId || !mongoose.Types.ObjectId.isValid(technicianId)) {
    throw new Error('Valid Technician ID required.');
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) throw new Error('Technician not found.');

  const existingRecord = await TechnicianVideos.findOne({ technicianId });
  const currentCount = existingRecord?.videoUrls?.length || 0;

  if (currentCount + files.length > 2) {
    throw new Error('Only 2 videos allowed per technician.');
  }

  const uploadedUrls = [];

  for (let file of files) {
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'TechUploadedVideos',
    });
    fs.unlinkSync(file.path);
    uploadedUrls.push(uploadResult.secure_url);
  }

  let savedRecord;
  if (existingRecord) {
    existingRecord.videoUrls.push(...uploadedUrls);
    await existingRecord.save();
    savedRecord = existingRecord;
  } else {
    savedRecord = await TechnicianVideos.create({ technicianId, videoUrls: uploadedUrls });
  }

  return {
    id: savedRecord._id,
    technicianId: savedRecord.technicianId,
    videoUrls: savedRecord.videoUrls,
  };
};

export const getTechVideosByTechId = async (technicianId) => {
  if (!mongoose.Types.ObjectId.isValid(technicianId)) throw new Error('Invalid Technician ID');
  const data = await TechnicianVideos.findOne({ technicianId });
  if (!data) throw new Error('No videos found.');
  return data;
};

export const deleteAllTechnicianVideos = async (technicianId) => {
  const record = await TechnicianVideos.find({ technicianId });
  for (const doc of record) {
    for (const url of doc.videoUrls) {
      const match = url.match(/\/([^/]+)\.[a-z]+$/i);
      const publicId = match ? `TechUploadedVideos/${match[1]}` : null;
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }
  }
  const result = await TechnicianVideos.deleteMany({ technicianId });
  return { deletedCount: result.deletedCount };
};

export const deleteSingleTechnicianVideo = async ({ technicianId, videoUrlToDelete }) => {
  const record = await TechnicianVideos.findOne({ technicianId });
  if (!record || !record.videoUrls.includes(videoUrlToDelete)) {
    throw new Error('Video not found.');
  }
  const match = videoUrlToDelete.match(/\/([^/]+)\.[a-z]+$/i);
  const publicId = match ? `TechUploadedVideos/${match[1]}` : null;
  if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  record.videoUrls = record.videoUrls.filter(url => url !== videoUrlToDelete);
  await record.save();
  return { message: 'Video deleted.', remaining: record.videoUrls };
};