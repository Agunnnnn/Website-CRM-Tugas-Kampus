import express from "express";
import {
  loginOrRegisterMember,
  getMemberById,
  getMemberPointsHistory,
} from "../controllers/memberController.js";

const router = express.Router();

router.post("/login", loginOrRegisterMember);
router.get("/:id", getMemberById);
router.get("/:id/points-history", getMemberPointsHistory);

export default router;

