import * as VersionService from '../services/appVersion.js'


export const createVersionController = async (req, res) => {
  try {
    const version = await VersionService.createVersion(req.body);
    res.status(201).json({
      success: true,
      message: "Version created successfully",
      data: version,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create version",
    });
  }
};

/**
 * Get all versions
 */
export const getAllVersionsController = async (req, res) => {
  try {
    const versions = await VersionService.getAllVersions();
    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch versions",
    });
  }
};

/**
 * Get version by ID
 */
export const getVersionByIdController = async (req, res) => {
  try {
    const version = await VersionService.getVersionById(req.params.id);
    if (!version) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }
    res.status(200).json({ success: true, data: version });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update version
 */
export const updateVersionController = async (req, res) => {
  try {
    const version = await VersionService.updateVersion(req.body);
    if (!version) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }
    res.status(200).json({
      success: true,
      message: "Version updated successfully",
      data: version,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update version",
    });
  }
};

/**
 * Delete version
 */
export const deleteVersionController = async (req, res) => {
  try {
    const version = await VersionService.deleteVersion(req.params.id);
    if (!version) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }
    res.status(200).json({
      success: true,
      message: "Version deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete version",
    });
  }
};