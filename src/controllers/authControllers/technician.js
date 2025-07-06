import technician from "../../models/authModels/technician.js";
import { generateToken } from "../../utils/generateToken.js";


const generatedSequrityCodes = new Set();

const generateSequrityCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sequrityCode;
  let numberOfNumbers = 0;
  do {
    sequrityCode = 'PRNV-';
    numberOfNumbers = 0;
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomChar = characters[randomIndex];
      if (/\d/.test(randomChar)) {
        numberOfNumbers++;
      }
      sequrityCode += randomChar;
    }
  } while (generatedSequrityCodes.has(sequrityCode) || numberOfNumbers < 3);
  generatedSequrityCodes.add(sequrityCode);
  return sequrityCode;
};

export const registerTechnicianController = async (req, res, next) => {
  try {
    console.log("req.body", req.body);

    const technicianData = {
      ...req.body,
      userId: generateSequrityCode(),
    };

    const newTechnician = new technician(technicianData);
    await newTechnician.save();

    res.status(201).json(newTechnician);
  } catch (err) {
    next(err);
  }
};

export const loginTechnicianController = async (req, res, next) => {
  const {phoneNumber, password} = req.body
  try {

    const result = await technician.findOne({phoneNumber : phoneNumber});
      if (!result) {
            return res.status(400).json({ message: "User not found" });
        }

         const isPasswordValid = await bcrypt.compare(req.body.password, result.hash_password);
if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        if (result.role !== "Technician") {
            return res.status(400).json({ message: "You do not have Technician privileges" });
        }

         const token = generateToken(result);
     

res.status(200).json({
            token,
            result,
        });
  } catch (err) {
    next(err);
  }
};
