const express = require("express");
const { requireAuth, allowRoles } = require("../middleware/auth");
const { getSalesReport, getAuditLogs, getInventoryTransactions } = require("../controllers/reportController");

const router = express.Router();

router.get("/sales", requireAuth, allowRoles("admin", "superadmin"), getSalesReport);
router.get("/audit-logs", requireAuth, allowRoles("admin", "superadmin"), getAuditLogs);
router.get("/inventory-transactions", requireAuth, allowRoles("admin", "superadmin"), getInventoryTransactions);

module.exports = router;

