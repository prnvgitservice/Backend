import Pincodes from '../models/pincodes.model.js';

export const getCodeAndAreaNamesService = async () => {
  try {
    const result = await Pincodes.aggregate([
      { $unwind: "$areas" },
      { $unwind: "$areas.subAreas" },
      {
        $project: {
          _id: 0,
          code: 1,
          area: "$areas.name",
          subArea: "$areas.subAreas.name"
        }
      }
    ]);
    return result;
  } catch (error) {
    throw error;
  }
};

export const getAllPincodesService = async () => {
    try{
        const result = await Pincodes.find();
        return result;
    } catch (error) {
        throw error;
    }
};


export const createPincodeService = async (pincodeData) => {
  try {
    const existingPincode = await Pincodes.findOne({ code: pincodeData?.code });

    if (!existingPincode) {
      const newPincode = new Pincodes(pincodeData);
      const saved = await newPincode.save();
      return {
        created: true,
        message: `Pincode ${pincodeData.code} created with areas and subareas`,
        data: saved
      };
    }

    let updated = false;

    for (const incomingArea of pincodeData.areas) {
      const existingArea = existingPincode.areas.find(
        area => area.name.trim().toLowerCase() === incomingArea.name.trim().toLowerCase()
      );

      if (!existingArea) {
        existingPincode.areas.push(incomingArea);
        updated = true;
      } else {
        for (const incomingSubArea of incomingArea.subAreas) {
          const subAreaExists = existingArea.subAreas.some(
            sa => sa.name.trim().toLowerCase() === incomingSubArea.name.trim().toLowerCase()
          );

          if (!subAreaExists) {
            existingArea.subAreas.push(incomingSubArea);
            updated = true;
          }
        }
      }
    }

    if (updated) {
      const saved = await existingPincode.save();
      return {
        updated: true,
        message: `Pincode ${pincodeData.code} updated with new area(s) or subarea(s)`,
        data: saved
      };
    } else {
      return {
        alreadyExisted: true,
        message: `Pincode ${pincodeData.code} with same area(s) and subarea(s) already exists`,
        // data: existingPincode
      };
    }

  } catch (error) {
    throw error;
  }
};

export const updatePincodeService = async (pincodeData) => {
  try {
    const existingPincode = await Pincodes.findOne({ code: pincodeData?.code });

    if (!existingPincode) {
      return {
        notFound: true,
        message: `Pincode ${pincodeData.code} not found`
      };
    }
console.log("existingPincode",existingPincode)
    let updated = false;

    if (pincodeData.city && pincodeData.city !== existingPincode.city) {
      existingPincode.city = pincodeData.city;
      updated = true;
    }

    if (pincodeData.state && pincodeData.state !== existingPincode.state) {
      existingPincode.state = pincodeData.state;
      updated = true;
    }
    for (const incomingArea of pincodeData.areas || []) {
      const existingArea = existingPincode.areas.find(
        area => area.name.trim().toLowerCase() === incomingArea.name.trim().toLowerCase()
      );

      if (!existingArea) {
        existingPincode.areas.push(incomingArea);
        updated = true;
      } else {
        for (const incomingSubArea of incomingArea.subAreas || []) {
          const subAreaExists = existingArea.subAreas.some(
            sa => sa.name.trim().toLowerCase() === incomingSubArea.name.trim().toLowerCase()
          );

          if (!subAreaExists) {
            existingArea.subAreas.push(incomingSubArea);
            updated = true;
          }
        }
      }
    }

    if (updated) {
      const saved = await existingPincode.save();
      return {
        updated: true,
        message: `Pincode ${pincodeData.code} updated successfully`,
        data: saved
      };
    } else {
      return {
        noChanges: true,
        message: `No changes were made. All areas and subareas already exist.`,
        data: existingPincode
      };
    }
  } catch (error) {
    throw error;
  }
};


export const deletePincodeService = async (pincodeData) => {
  try {
    const existingPincode = await Pincodes.findOne({ code: pincodeData?.code });

    if (!existingPincode) {
      return { notFound: true, message: `Pincode ${pincodeData?.code} not found.` };
    }

    // NEW FEATURE: Check if pincodeData has a flag to force delete entire pincode
    if (pincodeData.forceDelete) {
      await Pincodes.deleteOne({ code: pincodeData?.code });
      return {
        deleted: true,
        message: `Pincode ${pincodeData.code} and all associated areas/subareas deleted successfully.`,
      };
    }

    // BUG FIX: If no areas are specified in pincodeData, check if pincode has any areas
    if (!pincodeData.areas || pincodeData.areas.length === 0) {
      if (existingPincode.areas.length > 0) {
        return {
          cannotDelete: true,
          message: `Pincode has areas with subareas. Delete areas and subareas first or use forceDelete.`,
          data: existingPincode
        };
      } else {
        await Pincodes.deleteOne({ code: pincodeData?.code });
        return {
          deleted: true,
          message: `Pincode ${pincodeData.code} deleted as it had no areas.`,
        };
      }
    }

    let changesMade = false;
    let areasToRemove = []; // NEW: Track areas that become empty after subarea deletion

    for (const inputArea of pincodeData.areas) {
      const areaIndex = existingPincode.areas.findIndex(
        area => area.name.trim().toLowerCase() === inputArea.name.trim().toLowerCase()
      );

      if (areaIndex === -1) continue;

      const area = existingPincode.areas[areaIndex];

      if (inputArea.subAreas && inputArea.subAreas.length > 0) {
        const originalLength = area.subAreas.length;

        // Remove specified subareas
        area.subAreas = area.subAreas.filter(subArea => {
          return !inputArea.subAreas.some(inputSub =>
            inputSub.name.trim().toLowerCase() === subArea.name.trim().toLowerCase()
          );
        });

        if (area.subAreas.length < originalLength) {
          changesMade = true;
        }

        // BUG FIX: Check if area has no subareas left after deletion
        // If area is empty and no specific subareas were provided (meaning delete all), mark area for removal
        if (area.subAreas.length === 0 && (!inputArea.subAreas || inputArea.subAreas.length === 0)) {
          areasToRemove.push(areaIndex);
        }

      } else {
        // BUG FIX: This condition was too restrictive
        // Only prevent deletion if the area has subareas AND we're trying to delete the area itself
        if (area.subAreas.length > 0) {
          return {
            cannotDelete: true,
            message: `Area "${area.name}" has subareas. Delete subareas first or use forceDelete.`,
            area: area
          };
        } else {
          // Area has no subareas, safe to delete
          existingPincode.areas.splice(areaIndex, 1);
          changesMade = true;
        }
      }
    }

    // BUG FIX: Remove areas that became empty after subarea deletion
    // Sort in descending order to avoid index issues during removal
    areasToRemove.sort((a, b) => b - a).forEach(index => {
      existingPincode.areas.splice(index, 1);
      changesMade = true;
    });

    if (changesMade) {
      // BUG FIX: Check if all areas have been removed, then delete the entire pincode
      if (existingPincode.areas.length === 0) {
        await Pincodes.deleteOne({ code: pincodeData?.code });
        return {
          deleted: true,
          message: `Pincode ${pincodeData.code} deleted as all areas were removed.`,
        };
      } else {
        await existingPincode.save();
        return {
          deleted: true,
          message: `Deletion successful.`,
          data: existingPincode
        };
      }
    } else {
      return {
        noChanges: true,
        message: `No matching areas or subareas found to delete.`,
        data: existingPincode
      };
    }

  } catch (error) {
    throw error;
  }
};

// export const deletePincodeService = async (pincodeData) => {
//   try {
//     const existingPincode = await Pincodes.findOne({ code: pincodeData?.code });

//     if (!existingPincode) {
//       return { notFound: true, message: `Pincode ${pincodeData?.code} not found.` };
//     }

//     if (!pincodeData.areas || pincodeData.areas.length === 0) {
//       if (existingPincode.areas.length > 0) {
//         return {
//           cannotDelete: true,
//           message: `Pincode has areas with subareas. Delete areas and subareas first.`,
//           data: existingPincode
//         };
//       } else {
//         await Pincodes.deleteOne({ code: pincodeData?.code });
//         return {
//           deleted: true,
//           message: `Pincode ${pincodeData.code} deleted as it had no areas.`,
//         };
//       }
//     }

//     let changesMade = false;

//     for (const inputArea of pincodeData.areas) {
//       const areaIndex = existingPincode.areas.findIndex(
//         area => area.name.trim().toLowerCase() === inputArea.name.trim().toLowerCase()
//       );

//       if (areaIndex === -1) continue;

//       const area = existingPincode.areas[areaIndex];

//       if (inputArea.subAreas && inputArea.subAreas.length > 0) {
//         const originalLength = area.subAreas.length;

//         area.subAreas = area.subAreas.filter(subArea => {
//           return !inputArea.subAreas.some(inputSub =>
//             inputSub.name.trim().toLowerCase() === subArea.name.trim().toLowerCase()
//           );
//         });

//         if (area.subAreas.length < originalLength) {
//           changesMade = true;
//         }

//       } else {
//         if (area.subAreas.length > 0) {
//           return {
//             cannotDelete: true,
//             message: `Area "${area.name}" has subareas. Delete subareas first.`,
//             area: area
//           };
//         } else {
//           existingPincode.areas.splice(areaIndex, 1);
//           changesMade = true;
//         }
//       }
//     }

//     if (changesMade) {
//       await existingPincode.save();
//       return {
//         deleted: true,
//         message: `Deletion successful.`,
//         data: existingPincode
//       };
//     } else {
//       return {
//         noChanges: true,
//         message: `No matching areas or subareas found to delete.`,
//         data: existingPincode
//       };
//     }

//   } catch (error) {
//     throw error;
//   }
// };