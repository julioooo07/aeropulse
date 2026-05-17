const express = require("express");
const { requireAuth, allowRoles } = require("../middleware/auth");
const {
  getSettings,
  updateSettings,
  listAlerts,
  acknowledgeAlert,
} = require("../controllers/inventoryAlertController");

const router = express.Router();

router.use(requireAuth);
router.use(allowRoles("superadmin"));

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

router.get("/alerts", listAlerts);
router.post("/alerts/:id/acknowledge", acknowledgeAlert);

module.exports = router;
