const District = require("../models/District");
const Taluk = require("../models/Taluk");
const Hobli = require("../models/Hobli");

// ─── DISTRICTS ────────────────────────────────────────

const getDistricts = async (req, res) => {
  try {
    const items = await District.find().sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDistrict = async (req, res) => {
  try {
    const { name, state } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });

    const exists = await District.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ message: "District already exists" });

    const district = await District.create({ name: name.trim(), state });
    res.status(201).json(district);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDistrict = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) return res.status(404).json({ message: "District not found" });

    const oldName = district.name;
    const newName = (req.body.name || "").trim();

    if (newName && newName !== oldName) {
      const dup = await District.findOne({ name: newName });
      if (dup) return res.status(400).json({ message: "District name already in use" });
      district.name = newName;
      // Cascade rename to taluks/hoblis so dropdowns stay consistent
      await Taluk.updateMany({ district: oldName }, { district: newName });
      await Hobli.updateMany({ district: oldName }, { district: newName });
    }
    if (req.body.state !== undefined) district.state = req.body.state;
    if (req.body.isActive !== undefined) district.isActive = req.body.isActive;

    await district.save();
    res.json(district);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDistrict = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) return res.status(404).json({ message: "District not found" });

    const talukCount = await Taluk.countDocuments({ district: district.name });
    if (talukCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${talukCount} taluk(s) belong to this district. Remove them first.`,
      });
    }

    await district.deleteOne();
    res.json({ message: "District deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── TALUKS ───────────────────────────────────────────

const getTaluks = async (req, res) => {
  try {
    const { district } = req.query;
    const filter = {};
    if (district) filter.district = district;
    const items = await Taluk.find(filter).sort({ district: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTaluk = async (req, res) => {
  try {
    const { name, district } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
    if (!district || !district.trim()) return res.status(400).json({ message: "District is required" });

    const parent = await District.findOne({ name: district.trim() });
    if (!parent) return res.status(400).json({ message: "Parent district does not exist" });

    const exists = await Taluk.findOne({ name: name.trim(), district: district.trim() });
    if (exists) return res.status(400).json({ message: "Taluk already exists in this district" });

    const taluk = await Taluk.create({ name: name.trim(), district: district.trim() });
    res.status(201).json(taluk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTaluk = async (req, res) => {
  try {
    const taluk = await Taluk.findById(req.params.id);
    if (!taluk) return res.status(404).json({ message: "Taluk not found" });

    const oldName = taluk.name;
    const newName = (req.body.name || "").trim();

    if (newName && newName !== oldName) {
      const dup = await Taluk.findOne({ name: newName, district: taluk.district });
      if (dup) return res.status(400).json({ message: "Taluk name already in use in this district" });
      taluk.name = newName;
      await Hobli.updateMany({ taluk: oldName }, { taluk: newName });
    }
    if (req.body.isActive !== undefined) taluk.isActive = req.body.isActive;

    await taluk.save();
    res.json(taluk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTaluk = async (req, res) => {
  try {
    const taluk = await Taluk.findById(req.params.id);
    if (!taluk) return res.status(404).json({ message: "Taluk not found" });

    const hobliCount = await Hobli.countDocuments({ taluk: taluk.name });
    if (hobliCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${hobliCount} hobli(s) belong to this taluk. Remove them first.`,
      });
    }

    await taluk.deleteOne();
    res.json({ message: "Taluk deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HOBLIS ───────────────────────────────────────────

const getHoblis = async (req, res) => {
  try {
    const { taluk } = req.query;
    const filter = {};
    if (taluk) filter.taluk = taluk;
    const items = await Hobli.find(filter).sort({ taluk: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createHobli = async (req, res) => {
  try {
    const { name, taluk } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
    if (!taluk || !taluk.trim()) return res.status(400).json({ message: "Taluk is required" });

    const parent = await Taluk.findOne({ name: taluk.trim() });
    if (!parent) return res.status(400).json({ message: "Parent taluk does not exist" });

    const exists = await Hobli.findOne({ name: name.trim(), taluk: taluk.trim() });
    if (exists) return res.status(400).json({ message: "Hobli already exists in this taluk" });

    const hobli = await Hobli.create({
      name: name.trim(),
      taluk: taluk.trim(),
      district: parent.district,
    });
    res.status(201).json(hobli);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateHobli = async (req, res) => {
  try {
    const hobli = await Hobli.findById(req.params.id);
    if (!hobli) return res.status(404).json({ message: "Hobli not found" });

    const newName = (req.body.name || "").trim();
    if (newName && newName !== hobli.name) {
      const dup = await Hobli.findOne({ name: newName, taluk: hobli.taluk });
      if (dup) return res.status(400).json({ message: "Hobli name already in use in this taluk" });
      hobli.name = newName;
    }
    if (req.body.isActive !== undefined) hobli.isActive = req.body.isActive;

    await hobli.save();
    res.json(hobli);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteHobli = async (req, res) => {
  try {
    const hobli = await Hobli.findByIdAndDelete(req.params.id);
    if (!hobli) return res.status(404).json({ message: "Hobli not found" });
    res.json({ message: "Hobli deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  getTaluks,
  createTaluk,
  updateTaluk,
  deleteTaluk,
  getHoblis,
  createHobli,
  updateHobli,
  deleteHobli,
};
