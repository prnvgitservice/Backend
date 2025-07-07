import * as techProfile from "../../services/authServices/techProfile.js";

export const creatingTechProfile = async (req, res, next) => {
  console.log("Creating Tech Profile");
  console.log("req.body", req.body);

  try {
    const result = await techProfile.createTechProfile(req);
    res.status(201).json({
      success: true,
      message: "Technician Profile Successfully Created.",
      result,
    });
  } catch (err) {
    next(err);
  }
};


export const getTechProfileData = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await techProfile.getTechProfile(userId);
    res.json({
      success: true,
      message: "User profile fetched successfully.",
     result,
    });
  } catch (err) {

    next(err);
  }
};
export const getTechAllProfileData = async (req, res, next) => {
  try {
    const result = await techProfile.getTechAllProfile();
    res.json({
      success: true,
      message: "User profile fetched successfully.",
     result,
    });
  } catch (err) {

    next(err);
  }
};