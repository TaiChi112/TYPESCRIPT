import { Router } from "express";
import { TodoController } from "../controller/TodoController";

const router = Router();

router.get("/todos", TodoController.getAll);
router.post("/todos", TodoController.create);
router.get("/todos/:id", TodoController.getOne);
router.put("/todos/:id", TodoController.update);
router.delete("/todos/:id", TodoController.delete);

export default router;
