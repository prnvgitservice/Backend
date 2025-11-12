import mongoose from "mongoose";
import Version from "../models/appVersion.js"

export const createVersion = async ({
  name,
  version,
  stagingUrl,
  productionUrl,
  playStoreLink,
}) => {
  if (!name || !version || !productionUrl) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["name , version and production url is requied"];
  }

  const newVersion = new Version({
    name,
    version,
    stagingUrl,
    productionUrl,
    playStoreLink,
  });

  await newVersion.save();

  return {
    id: newVersion._id,
    name: newVersion.name,
    version: newVersion.version,
    stagingUrl: newVersion.stagingUrl,
    productionUrl: newVersion.productionUrl,
    playStoreLink: newVersion.playStoreLink,
  };
};

export const getAllVersions = async () => {
  return await Version.find().sort({ createdAt: -1 });
};

/**
 * Get a version by ID
 */
export const getVersionById = async ({ id }) => {
  return await Version.findById(id);
};

/**
 * Update a version by ID
 */
export const updateVersion = async ({
  id,
  name,
  version,
  stagingUrl,
  productionUrl,
  playStoreLink,
}) => {
  if (!id) {
    const err = new Error("Id is required.");
    err.statusCode = 401;
    err.errors = ["Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid Blog ID format");
    err.statusCode = 400;
    err.errors = ["Provided Blog ID is not valid."];
    throw err;
  }

  const vers = await Version.findById(id);
  if (!version) {
    const err = new Error("app is not found");
    err.statusCode = 404;
    throw err;
  }

  if (name) vers.name = name;
  if (version) vers.version = version;
  if (stagingUrl) vers.stagingUrl = stagingUrl;
  if (productionUrl) vers.productionUrl = productionUrl;
  if (playStoreLink) vers.playStoreLink = playStoreLink;

  await vers.save();

  return {
    id: vers._id,
    name: vers.name,
    version: vers.version,
    stagingUrl: vers.stagingUrl,
    productionUrl: vers.productionUrl,
    playStoreLink: vers.playStoreLink,
  };
};

/**
 * Delete a version by ID
 */
export const deleteVersion = async (id) => {
  return await Version.findByIdAndDelete(id);
};
