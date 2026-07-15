import Department from "../models/department.model.js";

// create a new department
export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // check if department name exists
    const exists = await Department.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "department name already exists",
      });
    }

    const dept = await Department.create({
      name: name.trim(),
      description: description?.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "department created successfully",
      department: dept,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// update department details
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // if name is changing, check uniqueness
    if (name) {
      const exists = await Department.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "department name already exists",
        });
      }
    }

    const updated = await Department.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "department not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "department updated successfully",
      department: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// delete a department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "department not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "department deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
