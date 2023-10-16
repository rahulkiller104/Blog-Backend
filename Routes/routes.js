const express = require("express");
const checkAuth = require("../Middleware/auth");
const router = express.Router();

const userController = require("../Controllers/UserController");
const postController = require("../Controllers/PostController");

router.post("/auth" , userController.userAuthentication);

router.use(checkAuth);
router.get("/posts",postController.getAllPosts);

router.post("/subscribe" , userController.subscribe);
router.post("/unsubscribe" , userController.unsubscribe);

// Post routes
router.post("/posts/:postId/comments" , postController.AddComment)
router.patch("/posts/:postId/toggleLike" , postController.toggleLike)
router.delete("/posts/:postId" , postController.DeletePost)
router.post("/posts" , postController.AddPost)
router.get("/posts/:postId",postController.getPostById);

module.exports = router;