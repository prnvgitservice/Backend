import { getCodeAndAreaNamesService } from "../../services/adminPanelServices/pincodes.service.js";

export const getPincodeAreaNames = async (req, res) => {
  try {
    const data = await getCodeAndAreaNamesService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching pincode area names:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

