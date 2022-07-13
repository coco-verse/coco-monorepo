import { Router } from "express";
import { models } from "../models";

const router = Router();

router.post("/find", async function (req, res) {
	const { filter } = req.body;

	const stakes = await models.Stake.find(filter);
	res.status(200).send({
		success: true,
		response: {
			stakes,
		},
	});
});

export default router;
