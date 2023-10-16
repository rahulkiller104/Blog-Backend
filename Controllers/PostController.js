const { BlogPost } = require( "../Models/BlogSchema");
const { User } = require("../Models/UserSchema");


const AddPost = async (req, res , next) => {

    try {
        const { title, content, isPremium } = req.body.post;
        const blogPost = new BlogPost({ title, content, isPremium,author:req.userData.userId });
        await blogPost.save();
        res.json(blogPost);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the blog post.' });
      }
}


const DeletePost = async (req, res) => {
    try {
      const postId = req.params.postId;
      await BlogPost.findByIdAndRemove(postId);
      res.json({ message: 'Blog post deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while deleting the blog post.' });
    }
  };


  const toggleLike = async (req, res) => {
    try {
      const postId = req.params.postId;
      const userId = req.userData.userId; // Assuming you have authentication in place
      const blogPost = await BlogPost.findById(postId);
  
      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found.' });
      }
      console.log("toggle like is called");
      const userIndex = blogPost.likes.indexOf(userId);
  
      if (userIndex === -1) {
        // User hasn't liked the post, so add the like
        blogPost.likes.push(userId);
      } else {
        // User has liked the post, so remove the like
        blogPost.likes.splice(userIndex, 1);
      }
  
      await blogPost.save();
      
      res.json(blogPost);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while toggling the like status.' });
    }
  };
  
  
const AddComment = async (req, res) => {
  console.log("add comments is called...")
    try {
      const postId = req.params.postId;
      const userId = req.userData.userId; // Assuming you have authentication in place
      const text = req.body.text;

      console.log("data-->" , postId , userId ,text)
      
      const blogPost = await BlogPost.findById(postId);
  
      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found.' });
      }
  
      const newComment = {
        text,
        author: userId,
      };
  
      blogPost.comments.push(newComment);
      await blogPost.save();
  
      const resPost = await BlogPost.findById(postId)
      .populate('author', 'username') // Populate the author field with user's username
      .populate({
        path: 'comments',
        select: 'text', // Select only the comment text
        populate: {
          path: 'author',
          select: 'username', // Populate comment authors with user's username
        },
      })

      res.json(resPost);
   
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while adding a comment.' });
    }
  }


  const getAllPosts = async (req, res) => {
    console.log("get all posts");
    const userId = req.userData.userId;
    const user = await User.findById(userId);
    let posts;
   
    console.log(user);

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    let isSubscribed = false;

    if (user.subscribedDate && user.subscribedDate !== 0) {
        const currentDate = new Date();
        const subscriptionDate = new Date(user.subscribedDate);
        const threeDaysAgo = new Date(currentDate);
        threeDaysAgo.setDate(currentDate.getDate() - 3);
      
        if (subscriptionDate >= threeDaysAgo) {
         isSubscribed = true;
        } 

     } 


     try{

     if(isSubscribed){
        posts = await BlogPost.find({})
        .populate('author', 'username email') // Populate the author field with specific user fields
        .exec();;
     }else{
        posts =  await BlogPost.find({
          $or: [
            { isPremium: false },
            { author: userId }
          ]
        })
        .populate('author', 'username email') // Populate the author field with specific user fields
        .exec();

       
     }
    
     res.status(200).json({ posts:posts });
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching posts.' });
     }

  }
  
  const getPostById = async (req, res , next) => {
    console.log("get post by id...");
    const postId = req.params.postId;
    try {
        const post = await BlogPost.findById(postId)
          .populate('author', 'username') // Populate the author field with user's username
          .populate({
            path: 'comments',
            select: 'text', // Select only the comment text
            populate: {
              path: 'author',
              select: 'username', // Populate comment authors with user's username
            },
          })
          .exec();
        //  console.log("post-->",post)
        res.json({ post});
      } catch (error) {
         next(new Error('Error fetching post:', error)); 
      }
  };
  
  
  exports.AddComment = AddComment;
  exports.toggleLike = toggleLike;
  exports.AddPost = AddPost;
  exports.DeletePost = DeletePost;
  exports.getAllPosts=getAllPosts;
  exports.getPostById = getPostById;