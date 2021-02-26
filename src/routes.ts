import { Router } from "express";
import { UsersController } from "./controllers/UsersController";
import { SurveysController } from "./controllers/SurveysController";
import { SendMailController } from "./controllers/SendMailController";

const router = Router();

const usersController = new UsersController();
const surveysController = new SurveysController();
const sendMailController = new SendMailController();

router.post("/users", usersController.create);
router.post("/surveys", surveysController.create);
router.get("/surveys", surveysController.show);

router.post("/send-mail", sendMailController.execute);

export default router;
