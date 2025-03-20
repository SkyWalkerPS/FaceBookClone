import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { Post } from "../models/post.model.js"
import { Reactions } from "../models/reaction.model.js"
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Conversation } from "../models/conversation.model.js"
import { Message } from "../models/message.model.js"
import { Comment } from "../models/comment.model.js"

export const register = async (req, res) => {
    try {
        console.log("Register request received:", {
            username: req.body.username,
            email: req.body.email,
            gender: req.body.gender
        });

        const { username, email, password, gender } = req.body

        if (!username || !email || !password || !gender) {
            console.log("Missing registration fields");
            return res.status(404).json({
                message: "Something is missing",
                success: false
            })
        }

        const user = await User.findOne({ email })
        console.log("Existing user found:", user ? "Yes" : "No");

        if (user) {
            return res.status(404).json({
                message: "Try different email.",
                success: false
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        console.log("Password hashed successfully");

        await User.create({
            username,
            email,
            gender,
            password: hashedPassword
        })
        console.log("New user created successfully");

        return res.status(200).json({
            message: "Account created successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const login = async (req, res) => {
    try {
        console.log("Login request received:", req.body);
        const { email, password } = req.body

        if (!email || !password) {
            console.log("Missing credentials");
            return res.status(401).json({
                message: "Something is missing",
                success: false
            })
        }

        let user = await User.findOne({ email })
        console.log("User found:", user ? "Yes" : "No");
        
        if (!user) {
            return res.status(401).json({
                message: "User not registered.",
                success: false
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        console.log("Password match:", isPasswordMatch);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect Password",
                success: false
            })
        }

        const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET)

        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);

                if (post.author.equals(user._id)) {
                    return post
                }
                return null
            })
        )

        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            friends: user.friends,
            posts: populatedPosts
        }

        return res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }).json({
            message: `${user.username} Logged in successfully`,
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
    }
}

export const logout = async (req, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getProfile = async (req, res) => {
    try {
        const myId = req.id;
        const Me = await User.findById(myId)
        const userId = req.params.id;
        let user = await User.findById(userId)

        if (Me.blockedUsers.includes(userId)) {
            return res.status(401).json({
                message: "User blocked",
                success: false
            })
        }
        if (user.blockedUsers.includes(myId)) {
            return res.status(401).json({
                message: "User not found",
                success: false
            })
        }

        await user.populate([
            {
                path: "posts",
                populate: [
                    {
                        path: "author",
                        select: "username profilePicture"
                    },
                    {
                        path: "comments",
                        options: { sort: { createdAt: -1 } },
                        populate: {
                            path: "author",
                            select: "username profilePicture"
                        }
                    },
                    {
                        path: "reactions",
                        options: { sort: { createdAt: -1 } },
                        populate: {
                            path: "author",
                            select: "username profilePicture"
                        }
                    }, {
                        path: "originalPost",
                        populate: [
                            { path: "author", select: "username profilePicture" },
                            {
                                path: "comments",
                                options: { sort: { createdAt: -1 } },
                                populate: { path: "author", select: "username profilePicture" },
                            },
                            {
                                path: "reactions",
                                options: { sort: { createdAt: -1 } },
                                populate: { path: "author", select: "username profilePicture" },
                            },
                        ],
                    },
                ]
            },
            {
                path: "saved",
                populate: [
                    {
                        path: "author",
                        select: "username profilePicture"
                    },
                    {
                        path: "comments",
                        options: { sort: { createdAt: -1 } },
                        populate: {
                            path: "author",
                            select: "username profilePicture"
                        }
                    },
                    {
                        path: "reactions",
                        options: { sort: { createdAt: -1 } },
                        populate: {
                            path: "author",
                            select: "username profilePicture"
                        }
                    }
                ]
            },
            {
                path: "friends",
                select: "username profilePicture"
            }
        ]);

        return res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

// export const editProfile = async (req, res) => {
//     try {
//         const userId = req.id;
//         const user = await User.findById(userId);
//         const { bio, gender, oldPassword } = req.body;
//         let { newPassword } = req.body;

//         const profilePicture = req.files?.profilePicture?.[0]; // Extract first file
//         const coverPhoto = req.files?.coverPhoto?.[0]; // Extract first file

//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         if (bio) {
//             user.bio = bio;
//         }
//         if (gender) {
//             user.gender = gender;
//         }
//         if (profilePicture) {
//             const fileUri = getDataUri(profilePicture)
//             const cloud_response = await cloudinary.uploader.upload(fileUri)
//             user.profilePicture = cloud_response.secure_url;
//         }
//         if (coverPhoto) {
//             const fileUri = getDataUri(coverPhoto)
//             const cloud_response = await cloudinary.uploader.upload(fileUri)
//             user.coverPhoto = cloud_response.secure_url;
//         }

//         if(!oldPassword || !newPassword){
//             return res.status(401).json({
//                 message:"jksfuksfn",
//                 success: false
//             })
//         }
//         if (oldPassword && newPassword) {
//             const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)
//             if (!isPasswordMatch) {
//                 return res.status(401).json({
//                     message: "Password incorrect",
//                     success: false
//                 })
//             }
//         } else {
//             const hashedPassword = await bcrypt.hash(newPassword, 10)
//             user.password = hashedPassword;
//         }
//         await user.save();
//         const updatedUser = await User.findById(user._id).select("-password")
//         return res.status(200).json({
//             message: "profile updated successfully!",
//             success: true,
//             user:updatedUser
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find().select("username profilePicture");
        return res.status(200).json({
            message: 'All User found',
            success: true,
            allUsers
        })
    } catch (error) {
        console.log();
    }
}

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        const { bio, gender, oldPassword } = req.body;
        let { newPassword } = req.body;
        const profilePicture = req.files?.profilePicture?.[0];
        const coverPhoto = req.files?.coverPhoto?.[0];

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (bio) {
            console.log("Updating bio:", bio);
            user.bio = bio;
        }
        if (gender) user.gender = gender;
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture)
            const cloud_response = await cloudinary.uploader.upload(fileUri)
            user.profilePicture = cloud_response.secure_url;
        }
        if (coverPhoto) {
            console.log("Updating cover photo:", coverPhoto);
            const fileUri = getDataUri(coverPhoto);
            const cloud_response = await cloudinary.uploader.upload(fileUri);
            user.coverPhoto = cloud_response.secure_url;
        }

        if (oldPassword && newPassword) {
            const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({
                    message: '!Password doesnot match !!',
                    success: false
                })
            }
            else {
                newPassword = await bcrypt.hash(newPassword, 10)
                user.password = newPassword
            }
        }

        await user.save();
        const updatedUser = await User.findById(user._id).select("-password")
        return res.status(200).json({
            message: "Profile updated successfully!",
            success: true,
            user: updatedUser
        });

    } catch (error) {
        console.log(error)
    }
}

export const SuggestedUser = async (req, res) => {
    try {
        const myId = req.id;
        const user = await User.findById(myId).select("friends blockedUsers")
        const friendsIds = user?.friends || [];
        const blockedIds = user?.blockedUsers || []

        const suggestedUsers = await User.find({
            _id: { $nin: [myId, ...friendsIds, ...blockedIds] } // Exclude myId and friends' IDs
        })
            .select("username profilePicture");

        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
}

export const friendOrUnfriend = async (req, res) => {
    try {
        const userId = req.id;
        const targetUser = req.params.id;
        let targetUserP = await User.findById(targetUser);
        let user = await User.findById(userId);

        if (userId === targetUser) {
            return res.status(401).json({
                msessage: "you cannot friend or unfriend yourself",
                success: false
            })
        }

        const isFriends =  user.friends.includes(targetUser) && targetUserP.friends.includes(userId);

        if (isFriends) {
            await Promise.all([
                User.updateOne({ _id: userId }, { $pull: { friends: targetUser } }),
                User.updateOne({ _id: targetUser }, { $pull: { friends: userId } }),

            ])
            const populatedPosts = (await Promise.all(
                user.posts.map(async (postId) => {
                    const post = await Post.findById(postId);
                    if (post && post.author.equals(user._id)) {
                        return post;
                    }
                    return null;
                })
            )).filter(post => post !== null);


            user = await User.findById(userId)
            user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio,
                friends: user.friends,
                posts: populatedPosts,
            };

            targetUserP = await User.findById(targetUser);
            await targetUserP.populate([
                {
                    path: "posts",
                    populate: [
                        {
                            path: "author",
                            select: "username profilePicture"
                        },
                        {
                            path: "comments",
                            options: { sort: { createdAt: -1 } },
                            populate: {
                                path: "author",
                                select: "username profilePicture"
                            }
                        },
                        {
                            path: "reactions",
                            options: { sort: { createdAt: -1 } },
                            populate: {
                                path: "author",
                                select: "username profilePicture"
                            }
                        },
                        {
                            path: "originalPost",
                            populate: [
                                { path: "author", select: "username profilePicture" },
                                {
                                    path: "comments",
                                    options: { sort: { createdAt: -1 } },
                                    populate: { path: "author", select: "username profilePicture" },
                                },
                                {
                                    path: "reactions",
                                    options: { sort: { createdAt: -1 } },
                                    populate: { path: "author", select: "username profilePicture" },
                                },
                            ],
                        },
                    ]
                },
                {
                    path: "saved",
                    populate: [
                        {
                            path: "author",
                            select: "username profilePicture"
                        },
                        {
                            path: "comments",
                            options: { sort: { createdAt: -1 } },
                            populate: {
                                path: "author",
                                select: "username profilePicture"
                            }
                        },
                        {
                            path: "reactions",
                            options: { sort: { createdAt: -1 } },
                            populate: {
                                path: "author",
                                select: "username profilePicture"
                            }
                        },
                    ]
                },
                {
                    path: "friends",
                    select: "username profilePicture"
                }
            ]);

            return res.status(200).json({
                message: 'user has removed from friendlist',
                success: true,
                user,
                targetUser: targetUserP
            })

        } else if (!isFriends) {
            await Promise.all([
                User.updateOne({ _id: userId }, { $push: { friends: targetUser } }),
                User.updateOne({ _id: targetUser }, { $push: { friends: userId } }),
            ])
            const populatedPosts = (await Promise.all(
                user.posts.map(async (postId) => {
                    const post = await Post.findById(postId);
                    if (post && post.author.equals(user._id)) {
                        return post;
                    }
                    return null;
                })
            )).filter(post => post !== null);
         
           user = await User.findById(userId)
            user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio,
                friends: user.friends,
                posts: populatedPosts,
            };

            targetUserP = await User.findById(targetUser);
            await targetUserP.populate([
                {
                    path: "posts",
                    populate: [
                        {
                            path: "author",
                            select: "username profilePicture"
                        },
                        {
                            path: "comments",
                            options: { sort: { createdAt: -1 } },
                            populate: {
                                path: "author",
                                select: "username profilePicture"
                            }
                        },
                        {
                            path: "reactions",
                            options: { sort: { createdAt: -1 } },
                            populate: {
                                path: "author",
                                select: "username profilePicture"
                            }
                        },
                        {
                            path: "originalPost",
                            populate: [{ path: "author", select: "username profilePicture" },
                                {
                                    path: "comments",
                                    options: { sort: { createdAt: -1 } },
                                    populate: { path: "author", select: "username profilePicture" },
                                },
                                {
                                    path: "reactions",
                                    options: { sort: { createdAt: -1 } },
                                    populate: { path: "author", select: "username profilePicture" },
                                },
                            ],
                        },
                    ]
                },
                {
                    path: "saved",
                    populate: [
                        {
                            path: "author",
                            select: "username profilePicture"
                        },
                        {
                            path: "comments",
                            options: { sort: { createdAt: -1 } },
                            populate: {
                                path: "author",
                                select: "username profilePicture"
                            }
                        },
                        {
                            path: "reactions",
                            options: { sort: { createdAt: -1 } },
                            populate: {
                                path: "author",
                                select: "username profilePicture"
                            }
                        },
                    ]
                },
                {
                    path: "friends",
                    select: "username profilePicture"
                }
            ]);
            return res.status(200).json({
                message: 'user has been added to  friendlist',
                success: true,
                user,
                targetUser: targetUserP
            })
        }


    } catch (error) {
        console.log(error)
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId)

        if (!user) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            })
        }

        const isDeleted = await Promise.all([
            Post.deleteMany({ author: userId }),
            Comment.deleteMany({ author: userId }),
            Reactions.deleteMany({ author: userId }),
            Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
            Conversation.deleteMany({ participants: { $in: [userId] } }),
            User.findByIdAndDelete(userId)
        ])

        if (!isDeleted) {
            return res.status(401).json({
                message: "User not deleted",
                success: false
            })
        }

        return res.status(200).json({
            message: "User deleted",
            success: true
        })

    } catch (error) {

    }
}

export const blockUsers = async (req, res) => {
    try {
        const userId = req.id;
        const targetUserId = req.params.id;

        const user = await User.findById(userId)
        const targetUser = await User.findById(targetUserId)

        if (!user || !targetUser) {
            return res.status(401).json({
                message: "User not found",
                success: false
            })
        }

        const isBlocked = user.blockedUsers.includes(targetUserId)

        if (isBlocked) {
            user.updateOne({ $pull: { blockedUsers: targetUserId } })
            await user.save()
            return res.status(200).json({
                message: "User unblocked",
                success: true,
                user
            })
        }

        if (user.friends.includes(targetUserId)) {
            await Promise.all([
                user.updateOne({ $addToSet: { blockedUsers: targetUserId } }),
                user.updateOne({ $pull: { friends: targetUserId } }),
                await user.save()
            ])
            return res.status(200).json({
                message: "User blocked",
                success: true,
                user
            })
        }

        await Promise.all([
            user.updateOne({ $addToSet: { blockedUsers: targetUserId } }),
            await user.save()
        ])

        return res.status(200).json({
            message: "User blocked",
            success: true,
            user
        })

    } catch (error) {
        console.log(error);
    }
}

export const mutualFriends = async (req, res) => {
    try {


        const myId = req.id;
        const targetUserId = req.params.id;
        const me = await User.findById(myId);
        const targetUser = await User.findById(targetUserId)
        const myFriend = me.friends;
        const targetFriend = targetUser.friends;

        if (!targetUser) {
            return res.status(401).json({
                message: "User not found",
                success: false
            })
        }
        const mutualFriends = myFriend.filter(friend => targetFriend.includes(friend))
        
        const populatedMutualFriends = await User.find({ _id: { $in: [...mutualFriends] } }).select("username profilePicture")

        return res.status(200).json({
            message:"Mutual friends fetched succesfully",
            success: true,
            mutual: populatedMutualFriends
        })

    } catch (error) {
        console.log(error);
    }
}

export const searchUsers = async (req, res) => {
    try {
        const userId = req.id
        const { searchRes } = req.body

        const user = await User.findById(userId)

        if (!user) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            })
        }

        const searchResults = await User.find({
            _id: { $nin: user.blockedUsers },
            username: { $regex: new RegExp(searchRes, "i") },
            blockedUsers: { $nin: [userId] }
        }).select("username profilePicture")

        return res.status(200).json({
            success: true,
            searchResults
        })
    } catch (error) {
        console.log(error);
    }
}

export const getFriends = async (req, res) => {
    try {
        const userId = req.id;
        let user = await User.findById(userId).populate({
            path: 'friends',
            select: 'username profilePicture'
        })

        if (!user) {
            return res.status(400).json({
                message: 'user doesnot exist',
                success: false
            })
        }
        return res.status(200).json({
            message: 'Friends found ',
            friends: user.friends,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const changePassword = async(req,res)=>{
    try {
      const userId = req.id;
      const user = await User.findById(userId);
      const {oldPassword} = req.body;
      let {newPassword} = req.body
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      if(!oldPassword || !newPassword ){
        return res.status(400).json({
          message:'something is missing ',
          success:false
        })
      }
  
      if(oldPassword && newPassword){
        const isPasswordMatch = await bcrypt.compare(oldPassword,user.password);
        if(!isPasswordMatch){
          return res.status(400).json({
            message:'!Password doesnot match !!',
            success:false
          })
        }
        else{
          newPassword = await bcrypt.hash(newPassword, 10)
          user.password = newPassword
        }
      }
  
      await user.save();
  
      return res.status(200).json({
        message:'password changed successfully',
        success:true
      })
      
    } catch (error) {
      console.log(error)
    }
  }
